import { json } from '@sveltejs/kit';
import { obterTodosOsVotos, salvarVoto, limparVotos } from '$lib/server/db.js';
import { CANDIDATOS, realizarApuracaoCompleta } from '$lib/server/calculos.js';

// Siglas UFs e Ids Candidatos para validações rápidas
const UFS = new Set([
	'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
	'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
	'SP', 'SE', 'TO'
]);
const CANDIDATO_IDS = new Set(CANDIDATOS.map(c => c.id));

/**
 * Validação estrita do payload do voto para prevenir dados corrompidos na apuração
 * @param {any} payload 
 * @returns {string|null} mensagem de erro se inválido, null se válido
 */
function validarVoto(payload) {
	if (!payload || typeof payload !== 'object') {
		return 'Corpo da requisição vazio ou inválido.';
	}

	const { uf, voto_simples, voto_aprovacao, voto_rank, voto_nota } = payload;

	// 1. Validar Estado (UF)
	if (!uf || !UFS.has(uf)) {
		return 'Estado (UF) inválido ou não selecionado.';
	}

	// 2. Validar Voto Simples
	if (!voto_simples || !CANDIDATO_IDS.has(voto_simples)) {
		return 'Candidato selecionado no voto simples é inválido.';
	}

	// 3. Validar Voto de Aprovação (tamanho 0 a 12, sem duplicatas)
	if (!voto_aprovacao || !Array.isArray(voto_aprovacao) || voto_aprovacao.length > 12) {
		return 'Voto de aprovação deve ser um array de até 12 candidatos.';
	}
	const aprovacaoSet = new Set();
	for (const cid of voto_aprovacao) {
		if (!CANDIDATO_IDS.has(cid)) {
			return `Candidato de aprovação inexistente: ${cid}`;
		}
		if (aprovacaoSet.has(cid)) {
			return `Candidato duplicado no voto por aprovação: ${cid}`;
		}
		aprovacaoSet.add(cid);
	}

	// 4. Validar Voto de Rank (tamanho 0 a 5, posições de 1 a 12, sem duplicatas de ID ou posição)
	if (!voto_rank || !Array.isArray(voto_rank) || voto_rank.length > 5) {
		return 'Rankeamento inválido. Deve ordenar de 0 a 5 candidatos.';
	}
	const rankCands = new Set();
	const rankPosicoes = new Set();
	for (const item of voto_rank) {
		if (!item || typeof item !== 'object') {
			return 'Item do rankeamento inválido.';
		}
		const { id_candidato, posicao } = item;
		if (!id_candidato || !CANDIDATO_IDS.has(id_candidato)) {
			return `Candidato inválido no rankeamento: ${id_candidato}`;
		}
		if (posicao === undefined || typeof posicao !== 'number' || posicao < 1 || posicao > 12 || !Number.isInteger(posicao)) {
			return `Posição inválida para ${id_candidato}: ${posicao} (deve ser inteiro de 1 a 12).`;
		}
		if (rankCands.has(id_candidato)) {
			return `Candidato duplicado no rankeamento: ${id_candidato}`;
		}
		if (rankPosicoes.has(posicao)) {
			return `Posição duplicada no rankeamento: ${posicao}`;
		}
		rankCands.add(id_candidato);
		rankPosicoes.add(posicao);
	}

	// 5. Validar Voto por Nota (tamanho 0 a 12, notas de 0 a 5 inteiras, sem duplicatas)
	if (!voto_nota || !Array.isArray(voto_nota) || voto_nota.length > 12) {
		return 'Notas inválidas. Deve ser um array de até 12 objetos de nota.';
	}
	const notaCands = new Set();
	for (const item of voto_nota) {
		if (!item || typeof item !== 'object') {
			return 'Item de notas inválido.';
		}
		const { id_candidato, nota } = item;
		if (!id_candidato || !CANDIDATO_IDS.has(id_candidato)) {
			return `Candidato inválido na nota: ${id_candidato}`;
		}
		if (nota === undefined || typeof nota !== 'number' || nota < 0 || nota > 5 || !Number.isInteger(nota)) {
			return `Nota inválida para ${id_candidato}: ${nota} (deve ser inteiro de 0 a 5).`;
		}
		if (notaCands.has(id_candidato)) {
			return `Candidato duplicado na avaliação de notas: ${id_candidato}`;
		}
		notaCands.add(id_candidato);
	}

	return null;
}

/**
 * Endpoint POST: Registra o voto com rate limiting (cookies) e validação manual estrita
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, cookies }) {
	// 1. Proteção Básica Contra Spam (Rate Limiting por Cookie HTTP-only)
	const jaVotou = cookies.get('voted');
	if (jaVotou === 'true') {
		return json({ erro: 'Voto bloqueado. Você já registrou uma cédula nesta eleição.' }, { status: 403 });
	}

	try {
		const payload = await request.json();

		// 2. Validação estrita do payload
		const erroValidacao = validarVoto(payload);
		if (erroValidacao) {
			return json({ erro: erroValidacao }, { status: 400 });
		}

		// 3. Salvar no banco JSON (db.js)
		const totalVotos = salvarVoto(payload);

		// 4. Definir Cookie HTTP-only de segurança (expiração de 1 ano)
		cookies.set('voted', 'true', {
			path: '/',
			httpOnly: true,
			maxAge: 31536000, // 365 dias
			sameSite: 'strict',
			secure: false // local dev (localhost)
		});

		return json({ sucesso: true, totalVotos });
	} catch (err) {
		return json({ erro: 'Erro ao processar submissão: ' + err.message }, { status: 500 });
	}
}

/**
 * Endpoint GET: Processa os votos persistidos em arquivo e mede latência de apuração
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
	// 1. Ler todos os votos (Apenas uma leitura por requisição para evitar gargalos)
	const votosList = obterTodosOsVotos();
	const totalVotos = votosList.length;

	// 2. Medir tempo de processamento computacional com console.time
	console.time('Tempo de Apuração (7 Sistemas)');
	const resultados = realizarApuracaoCompleta(votosList);
	console.timeEnd('Tempo de Apuração (7 Sistemas)');

	return json({
		candidatos: CANDIDATOS,
		totalVotos,
		resultados
	});
}

/**
 * Endpoint DELETE: Limpa todos os votos do JSON e apaga o cookie do cliente
 * @type {import('./$types').RequestHandler}
 */
export async function DELETE({ cookies }) {
	limparVotos();
	cookies.delete('voted', { path: '/' });
	return json({ sucesso: true, mensagem: 'Todos os votos foram limpos e cookie expirado.' });
}

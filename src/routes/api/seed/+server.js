import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { salvarVotosEmMassa } from '$lib/server/db.js';
import { CANDIDATOS } from '$lib/server/calculos.js';

const UFS = [
	'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
	'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
	'SP', 'SE', 'TO'
];
const CANDIDATE_IDS = CANDIDATOS.map(c => c.id);

// Função para embaralhar um array (Fisher-Yates) para garantir aleatoriedade sem duplicatas
function shuffle(array) {
	const copy = array.slice();
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/**
 * Endpoint POST /api/seed: Gera 5.000 votos simulados aleatórios e salva-os em massa.
 * Apenas acessível em modo de desenvolvimento local.
 * @type {import('./$types').RequestHandler}
 */
export async function POST() {
	// Bloqueia execução fora de ambiente local de desenvolvimento
	if (!dev) {
		return json({ erro: 'Acesso Proibido. Simulação em massa apenas permitida em desenvolvimento.' }, { status: 403 });
	}

	try {
		const novosVotos = [];

		for (let i = 0; i < 5000; i++) {
			// 1. UF Aleatória
			const randomUf = UFS[Math.floor(Math.random() * UFS.length)];

			// 2. Voto Simples Aleatório
			const randomVotoSimples = CANDIDATE_IDS[Math.floor(Math.random() * CANDIDATE_IDS.length)];

			// 3. Voto por Aprovação (1 a 5 candidatos aleatórios)
			const numAprovacoes = Math.floor(Math.random() * 5) + 1; // 1 a 5
			const aprovacoesShuffled = shuffle(CANDIDATE_IDS);
			const randomVotoAprovacao = aprovacoesShuffled.slice(0, numAprovacoes);

			// 4. Voto Ranqueado (5 candidatos aleatórios em formato estruturado)
			const rankShuffled = shuffle(CANDIDATE_IDS);
			const randomVotoRank = rankShuffled.slice(0, 5).map((id, index) => ({
				id_candidato: id,
				posicao: index + 1
			}));

			// 5. Voto por Nota (12 candidatos com nota de 0 a 5)
			const randomVotoNota = CANDIDATE_IDS.map(id => ({
				id_candidato: id,
				nota: Math.floor(Math.random() * 6) // notas de 0 a 5
			}));

			novosVotos.push({
				uf: randomUf,
				voto_simples: randomVotoSimples,
				voto_aprovacao: randomVotoAprovacao,
				voto_rank: randomVotoRank,
				voto_nota: randomVotoNota,
				device_hash: 'seed_device_' + Math.random().toString(36).substring(2) + '_' + i
			});
		}

		// Gravação otimizada em lote no Supabase
		await salvarVotosEmMassa(novosVotos);

		return json({
			sucesso: true,
			mensagem: 'Seeding concluído! 5.000 votos adicionados.',
			votosAdicionados: 5000
		});
	} catch (err) {
		return json({ erro: 'Falha ao executar rotina de seed: ' + err.message }, { status: 500 });
	}
}

import fs from 'fs';
import path from 'path';

// Resolve o caminho do arquivo votos.json dentro da pasta do servidor
const filePath = path.resolve('src/lib/server/votos.json');

/**
 * Garante a criação do diretório e do arquivo JSON de votos se não existirem
 */
function inicializarDb() {
	try {
		if (!fs.existsSync(filePath)) {
			const dirPath = path.dirname(filePath);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
			fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
		}
	} catch (err) {
		console.error('Falha ao inicializar o arquivo de banco de dados:', err);
	}
}

// Inicialização imediata
inicializarDb();

/**
 * Retorna todos os votos registrados no arquivo JSON
 * @returns {Array<any>}
 */
export function obterTodosOsVotos() {
	try {
		inicializarDb();
		const data = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(data || '[]');
	} catch (err) {
		console.error('Erro ao ler votos do arquivo JSON:', err);
		return [];
	}
}

/**
 * Salva um novo voto no arquivo JSON
 * @param {any} voto 
 * @returns {number} quantidade total de votos
 */
export function salvarVoto(voto) {
	try {
		inicializarDb();
		const votosAtuais = obterTodosOsVotos();
		votosAtuais.push(voto);
		fs.writeFileSync(filePath, JSON.stringify(votosAtuais, null, 2), 'utf-8');
		return votosAtuais.length;
	} catch (err) {
		console.error('Erro ao persistir voto no arquivo JSON:', err);
		throw err;
	}
}

/**
 * Salva múltiplos votos em lote (otimização de I/O para seeding/simulação)
 * @param {Array<any>} novosVotos 
 * @returns {number} quantidade total de votos
 */
export function salvarVotosEmMassa(novosVotos) {
	try {
		inicializarDb();
		const votosAtuais = obterTodosOsVotos();
		const votosAtualizados = votosAtuais.concat(novosVotos);
		fs.writeFileSync(filePath, JSON.stringify(votosAtualizados, null, 2), 'utf-8');
		return votosAtualizados.length;
	} catch (err) {
		console.error('Erro ao persistir votos em massa no arquivo JSON:', err);
		throw err;
	}
}

/**
 * Limpa todos os votos salvos (reseta o banco de dados)
 * @returns {boolean}
 */
export function limparVotos() {
	try {
		fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
		return true;
	} catch (err) {
		console.error('Erro ao resetar arquivo JSON:', err);
		throw err;
	}
}

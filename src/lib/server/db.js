import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SECRET_KEY } from '$env/static/private';

// Inicializa o cliente do Supabase com credenciais privadas de servidor
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

/**
 * Retorna todos os votos registrados no Supabase (coluna JSONB 'payload')
 * @returns {Promise<Array<any>>}
 */
export async function obterTodosOsVotos() {
	try {
		let todosVotos = [];
		let hasMore = true;
		let from = 0;
		const step = 1000;

		while (hasMore) {
			const { data, error } = await supabase
				.from('votos')
				.select('payload')
				.range(from, from + step - 1);

			if (error) {
				console.error('Erro ao obter votos do Supabase:', error);
				return todosVotos;
			}

			if (data && data.length > 0) {
				todosVotos = todosVotos.concat(data.map(row => row.payload));
				from += step;
				if (data.length < step) {
					hasMore = false;
				}
			} else {
				hasMore = false;
			}
		}
		return todosVotos;
	} catch (err) {
		console.error('Erro de conexão ao consultar o Supabase:', err);
		return [];
	}
}

/**
 * Salva um novo voto no Supabase
 * @param {any} voto 
 * @returns {Promise<boolean>}
 */
export async function salvarVoto(voto) {
	try {
		const { error } = await supabase.from('votos').insert([{ payload: voto }]);
		if (error) {
			console.error('Erro ao persistir voto no Supabase:', error);
			throw error;
		}
		return true;
	} catch (err) {
		console.error('Erro ao salvar voto no Supabase:', err);
		throw err;
	}
}

/**
 * Salva múltiplos votos em lote (otimização de inserção em lote para simulações)
 * @param {Array<any>} novosVotos 
 * @returns {Promise<boolean>}
 */
export async function salvarVotosEmMassa(novosVotos) {
	try {
		const registros = novosVotos.map(voto => ({ payload: voto }));
		const { error } = await supabase.from('votos').insert(registros);
		if (error) {
			console.error('Erro ao inserir votos em massa no Supabase:', error);
			throw error;
		}
		return true;
	} catch (err) {
		console.error('Erro ao salvar lote de votos no Supabase:', err);
		throw err;
	}
}

/**
 * Deleta todos os registros de votos da tabela do Supabase
 * @returns {Promise<boolean>}
 */
export async function limparVotos() {
	try {
		// Executa um delete incondicional baseando-se no campo payload diferente de nulo
		const { error } = await supabase.from('votos').delete().neq('payload', null);
		if (error) {
			console.error('Erro ao limpar votos no Supabase:', error);
			throw error;
		}
		return true;
	} catch (err) {
		console.error('Erro ao resetar votos no Supabase:', err);
		throw err;
	}
}

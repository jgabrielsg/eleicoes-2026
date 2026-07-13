// Lista oficial de Candidatos compartilhada
export const CANDIDATOS = [
	{ id: 'lula', nome: 'Luiz Inácio Lula da Silva', partido: 'PT', corHexadecimal: '#ef4444', imagem: 'lula_da_silva.jpg' },
	{ id: 'aldo', nome: 'Aldo Rebelo', partido: 'DC', corHexadecimal: '#1e3a8a', imagem: 'aldo_rebelo.jpg' },
	{ id: 'cury', nome: 'Augusto Cury', partido: 'Avante', corHexadecimal: '#f97316', imagem: 'Augusto_Cury.jpg' },
	{ id: 'daciolo', nome: 'Cabo Daciolo', partido: 'Mobiliza', corHexadecimal: '#ef4444', imagem: 'cabo_daciolo.jpg' },
	{ id: 'edmilson', nome: 'Edmilson Costa', partido: 'PCB', corHexadecimal: '#eab308', imagem: 'Edmilson_Costa.jpg' },
	{ id: 'flavio', nome: 'Flávio Bolsonaro', partido: 'PL', corHexadecimal: '#38bdf8', imagem: 'flávio_bolsonaro.jpg' },
	{ id: 'hertz', nome: 'Hertz Dias', partido: 'PSTU', corHexadecimal: '#ef4444', imagem: 'Hertz_Dias.jpg' },
	{ id: 'renan', nome: 'Renan Santos', partido: 'Missão', corHexadecimal: '#ffffff', imagem: 'Renan_santos.jpg' },
	{ id: 'zema', nome: 'Romeu Zema', partido: 'Novo', corHexadecimal: '#f97316', imagem: 'Romeu_Zema.jpg' },
	{ id: 'caiado', nome: 'Ronaldo Caiado', partido: 'PSD', corHexadecimal: '#22c55e', imagem: 'Ronaldo_Caiado.jpg' },
	{ id: 'rui', nome: 'Rui Costa Pimenta', partido: 'PCO', corHexadecimal: '#ef4444', imagem: 'Rui_Costa_Pimenta.jpg' },
	{ id: 'samara', nome: 'Samara Martins', partido: 'UP', corHexadecimal: '#000000', imagem: 'samara_martins.jpg' }
];

// Pesos das Unidades Federativas do Brasil
const PESOS_UFS = {
	SP: 73, MG: 56, RJ: 49, BA: 42, RS: 34, PR: 33, PE: 28, CE: 25, MA: 21,
	GO: 20, PA: 20, SC: 19, PB: 15, ES: 13, PI: 13, AL: 12, AM: 11, RN: 11,
	MT: 11, MS: 11, SE: 11, RO: 11, TO: 11, AC: 11, AP: 11, RR: 11, DF: 11
};

/**
 * Converte a estrutura de voto estrita (recebida do payload de produção) em
 * estruturas simples de arrays e dicionários, adequadas para os algoritmos de cálculo.
 * @param {Array<any>} listaVotos 
 * @returns {Array<any>}
 */
function prepararVotosParaCalculo(listaVotos) {
	return listaVotos.map(v => {
		// Converte array de objetos { id_candidato, posicao } para um array ordenado de IDs de candidatos
		const votoRankIds = (v.voto_rank || [])
			.slice()
			.sort((a, b) => a.posicao - b.posicao)
			.map(item => item.id_candidato);

		// Converte array de objetos { id_candidato, nota } para um dicionário mapeado { candidatoId: nota }
		const votoNotaMap = {};
		if (v.voto_nota && Array.isArray(v.voto_nota)) {
			v.voto_nota.forEach(item => {
				votoNotaMap[item.id_candidato] = item.nota;
			});
		}

		return {
			uf: v.uf,
			voto_simples: v.voto_simples,
			voto_aprovacao: v.voto_aprovacao || [],
			voto_rank: votoRankIds,
			voto_nota: votoNotaMap
		};
	});
}

/**
 * Apura os votos registrados sob 7 regras eleitorais concorrentes.
 * @param {Array<any>} votosBrutos 
 * @returns {any}
 */
export function realizarApuracaoCompleta(votosBrutos) {
	const votosMapeados = prepararVotosParaCalculo(votosBrutos);

	return {
		maioriaSimples: calcularMaioriaSimples(votosMapeados),
		aprovacao: calcularAprovacao(votosMapeados),
		votoAlternativo: calcularVotoAlternativo(votosMapeados),
		condorcet: calcularCondorcet(votosMapeados),
		score: calcularScore(votosMapeados),
		star: calcularStar(votosMapeados),
		colegio: calcularColegioEleitoral(votosMapeados)
	};
}

/* ========================================================
   FUNÇÕES MATEMÁTICAS DE APURAÇÃO (COMENTADAS PASSO A PASSO)
   ======================================================== */

/**
 * 1. MAIORIA SIMPLES COM RUNOFF (PLURALITY + RUNOFF QUALIFICATION)
 * Lógica: Conta apenas a 1ª opção de voto simples dos eleitores.
 * Se o líder obtiver > 50% dos votos totais, ele é o vencedor.
 * Caso contrário, os dois candidatos mais votados se classificam para um segundo turno.
 */
function calcularMaioriaSimples(listaVotos) {
	const contagem = {};
	CANDIDATOS.forEach(c => contagem[c.id] = 0);

	if (listaVotos.length === 0) {
		return { contagem, vencedorId: null, vencedor: null, precisaSegundoTurno: false, finalistas: [] };
	}

	listaVotos.forEach(voto => {
		const cid = voto.voto_simples;
		if (contagem[cid] !== undefined) {
			contagem[cid]++;
		}
	});

	const ordenados = [...CANDIDATOS].sort((a, b) => (contagem[b.id] || 0) - (contagem[a.id] || 0));
	const lider = ordenados[0];
	const votosLider = contagem[lider.id];

	const metadeMaisUm = listaVotos.length / 2;
	const precisaSegundoTurno = votosLider <= metadeMaisUm;

	let vencedorId = null;
	let vencedor = null;
	let finalistas = [];

	if (!precisaSegundoTurno) {
		vencedorId = lider.id;
		vencedor = lider;
	} else {
		finalistas = [ordenados[0].id, ordenados[1].id];
		vencedorId = lider.id;
		vencedor = lider;
	}

	return {
		contagem,
		vencedorId,
		vencedor,
		precisaSegundoTurno,
		finalistas
	};
}

/**
 * 2. VOTO POR APROVAÇÃO (APPROVAL VOTING)
 * Lógica: Conta quantas aprovações cada candidato recebeu em todas as cédulas.
 * Vence quem tiver mais aprovações totais.
 */
function calcularAprovacao(listaVotos) {
	const contagem = {};
	CANDIDATOS.forEach(c => contagem[c.id] = 0);

	if (listaVotos.length === 0) {
		return { contagem, vencedorId: null, vencedor: null };
	}

	listaVotos.forEach(voto => {
		if (voto.voto_aprovacao && Array.isArray(voto.voto_aprovacao)) {
			voto.voto_aprovacao.forEach(cid => {
				if (contagem[cid] !== undefined) {
					contagem[cid]++;
				}
			});
		}
	});

	let vencedorId = null;
	let maxAprovacoes = -1;
	CANDIDATOS.forEach(c => {
		if (contagem[c.id] > maxAprovacoes) {
			maxAprovacoes = contagem[c.id];
			vencedorId = c.id;
		}
	});

	const vencedor = CANDIDATOS.find(c => c.id === vencedorId);

	return {
		contagem,
		vencedorId,
		vencedor
	};
}

/**
 * 3. VOTO ALTERNATIVO (INSTANT-RUNOFF VOTING - IRV)
 * Lógica: Conta as primeiras opções nos ranks. Elimina o candidato com menor pontuação e
 * redistribui os votos para as escolhas seguintes ativas da cédula. Repete até maioria > 50%.
 */
function calcularVotoAlternativo(listaVotos) {
	if (listaVotos.length === 0) {
		return { rodadas: [], vencedorId: null, vencedor: null };
	}

	const rodadas = [];
	const candidatosAtivos = new Set(CANDIDATOS.map(c => c.id));
	let vencedorId = null;

	for (let r = 1; r <= CANDIDATOS.length; r++) {
		const contagemRodada = {};
		candidatosAtivos.forEach(id => contagemRodada[id] = 0);

		listaVotos.forEach(voto => {
			const favoritoAtivo = voto.voto_rank.find(id => candidatosAtivos.has(id));
			if (favoritoAtivo) {
				contagemRodada[favoritoAtivo]++;
			}
		});

		let totalAtivos = 0;
		candidatosAtivos.forEach(id => {
			totalAtivos += contagemRodada[id];
		});

		if (totalAtivos === 0) break;

		let liderId = null;
		let maxVotos = -1;
		let lanternaId = null;
		let minVotos = Infinity;

		candidatosAtivos.forEach(id => {
			const v = contagemRodada[id];
			if (v > maxVotos) {
				maxVotos = v;
				liderId = id;
			}
			if (v < minVotos) {
				minVotos = v;
				lanternaId = id;
			}
		});

		rodadas.push({
			numero: r,
			contagem: { ...contagemRodada },
			eliminadoId: null,
			liderId,
			totalVotosAtivos: totalAtivos
		});

		if (maxVotos > totalAtivos / 2) {
			vencedorId = liderId;
			break;
		}

		if (candidatosAtivos.size <= 2) {
			vencedorId = liderId;
			break;
		}

		const paraEliminar = lanternaId;
		candidatosAtivos.delete(paraEliminar);
		rodadas[rodadas.length - 1].eliminadoId = paraEliminar;
	}

	if (!vencedorId && rodadas.length > 0) {
		vencedorId = rodadas[rodadas.length - 1].liderId;
	}

	const vencedor = CANDIDATOS.find(c => c.id === vencedorId);

	return {
		rodadas,
		vencedorId,
		vencedor
	};
}

/**
 * 4. MÉTODO DE CONDORCET (RANK TRUNCADO)
 * Lógica: Duelos 1x1. Candidatos ranqueados têm preferência sobre não-ranqueados.
 * Candidatos em branco são tratados como empatados em último (índice 99).
 */
function calcularCondorcet(listaVotos) {
	const confrontos = {};
	CANDIDATOS.forEach(c1 => {
		confrontos[c1.id] = {};
		CANDIDATOS.forEach(c2 => {
			confrontos[c1.id][c2.id] = 0;
		});
	});

	const duelosVencidos = {};
	CANDIDATOS.forEach(c => duelosVencidos[c.id] = 0);

	if (listaVotos.length === 0) {
		return { confrontos, duelosVencidos, vencedorId: null, vencedor: null, paradoxo: false };
	}

	listaVotos.forEach(voto => {
		const rank = voto.voto_rank;
		
		for (let i = 0; i < CANDIDATOS.length; i++) {
			for (let j = 0; j < CANDIDATOS.length; j++) {
				if (i === j) continue;
				const c1 = CANDIDATOS[i].id;
				const c2 = CANDIDATOS[j].id;

				const indexC1 = rank.indexOf(c1) !== -1 ? rank.indexOf(c1) : 99;
				const indexC2 = rank.indexOf(c2) !== -1 ? rank.indexOf(c2) : 99;

				if (indexC1 < indexC2) {
					confrontos[c1][c2]++;
				}
			}
		}
	});

	for (let i = 0; i < CANDIDATOS.length; i++) {
		for (let j = i + 1; j < CANDIDATOS.length; j++) {
			const c1 = CANDIDATOS[i].id;
			const c2 = CANDIDATOS[j].id;

			const votosC1SobreC2 = confrontos[c1][c2];
			const votosC2SobreC1 = confrontos[c2][c1];

			if (votosC1SobreC2 > votosC2SobreC1) {
				duelosVencidos[c1]++;
			} else if (votosC2SobreC1 > votosC1SobreC2) {
				duelosVencidos[c2]++;
			}
		}
	}

	let vencedorId = null;
	let paradoxo = true;
	
	CANDIDATOS.forEach(c => {
		if (duelosVencidos[c.id] === CANDIDATOS.length - 1) {
			vencedorId = c.id;
			paradoxo = false;
		}
	});

	const vencedor = vencedorId ? CANDIDATOS.find(c => c.id === vencedorId) : null;

	return {
		confrontos,
		duelosVencidos,
		vencedorId,
		vencedor,
		paradoxo
	};
}

/**
 * 5. VOTO POR NOTA (SCORE VOTING)
 * Lógica: Soma as pontuações (de 0 a 5) dadas a cada candidato.
 */
function calcularScore(listaVotos) {
	const contagem = {};
	CANDIDATOS.forEach(c => contagem[c.id] = 0);

	if (listaVotos.length === 0) {
		return { contagem, vencedorId: null, vencedor: null };
	}

	listaVotos.forEach(voto => {
		const notas = voto.voto_nota || {};
		CANDIDATOS.forEach(c => {
			const nota = Number(notas[c.id]) || 0;
			contagem[c.id] += nota;
		});
	});

	let vencedorId = null;
	let maxPontuacao = -1;
	CANDIDATOS.forEach(c => {
		if (contagem[c.id] > maxPontuacao) {
			maxPontuacao = contagem[c.id];
			vencedorId = c.id;
		}
	});

	const vencedor = CANDIDATOS.find(c => c.id === vencedorId);

	return {
		contagem,
		vencedorId,
		vencedor
	};
}

/**
 * 6. STAR VOTING (SCORE THEN AUTOMATIC RUNOFF)
 * Lógica: Qualifica os 2 maiores scores médios e faz um runoff automático baseado
 * em qual finalista recebeu maior nota de cada eleitor na cédula.
 */
function calcularStar(listaVotos) {
	const scoreResult = calcularScore(listaVotos);
	const contagemScore = scoreResult.contagem;

	if (listaVotos.length === 0) {
		return {
			contagemScore,
			finalistas: [],
			runoff: {},
			vencedorId: null,
			vencedor: null
		};
	}

	const ordenadosPorScore = [...CANDIDATOS].sort((a, b) => (contagemScore[b.id] || 0) - (contagemScore[a.id] || 0));
	const f1Id = ordenadosPorScore[0].id;
	const f2Id = ordenadosPorScore[1].id;

	const runoff = {
		[f1Id]: 0,
		[f2Id]: 0,
		empates: 0
	};

	listaVotos.forEach(voto => {
		const notas = voto.voto_nota || {};
		const notaF1 = Number(notas[f1Id]) || 0;
		const notaF2 = Number(notas[f2Id]) || 0;

		if (notaF1 > notaF2) {
			runoff[f1Id]++;
		} else if (notaF2 > notaF1) {
			runoff[f2Id]++;
		} else {
			runoff.empates++;
		}
	});

	const vencedorId = runoff[f1Id] >= runoff[f2Id] ? f1Id : f2Id;
	const vencedor = CANDIDATOS.find(c => c.id === vencedorId);

	return {
		contagemScore,
		finalistas: [f1Id, f2Id],
		runoff,
		vencedorId,
		vencedor
	};
}

/**
 * 7. COLÉGIO ELEITORAL ESTILO AMERICANO
 * Lógica: Winner-Takes-All estadual e acúmulo nacional de delegados.
 */
function calcularColegioEleitoral(listaVotos) {
	const pontosNacionais = {};
	CANDIDATOS.forEach(c => pontosNacionais[c.id] = 0);

	const vitoriasPorEstado = {};
	Object.keys(PESOS_UFS).forEach(uf => {
		vitoriasPorEstado[uf] = { vencedorId: null, votos: {}, peso: PESOS_UFS[uf] };
		CANDIDATOS.forEach(c => {
			vitoriasPorEstado[uf].votos[c.id] = 0;
		});
	});

	if (listaVotos.length === 0) {
		return { pontosNacionais, vitoriasPorEstado, vencedorId: null, vencedor: null };
	}

	listaVotos.forEach(voto => {
		const uf = voto.uf;
		const cid = voto.voto_simples;
		if (vitoriasPorEstado[uf] && vitoriasPorEstado[uf].votos[cid] !== undefined) {
			vitoriasPorEstado[uf].votos[cid]++;
		}
	});

	Object.keys(PESOS_UFS).forEach(uf => {
		const estadoInfo = vitoriasPorEstado[uf];
		const votosCandidatos = estadoInfo.votos;

		let maxVotosNoEstado = 0;
		CANDIDATOS.forEach(c => {
			if (votosCandidatos[c.id] > maxVotosNoEstado) {
				maxVotosNoEstado = votosCandidatos[c.id];
			}
		});

		if (maxVotosNoEstado === 0) return;

		const lideresEstado = CANDIDATOS.filter(c => votosCandidatos[c.id] === maxVotosNoEstado);

		if (lideresEstado.length === 1) {
			const vencedorUnicoId = lideresEstado[0].id;
			estadoInfo.vencedorId = vencedorUnicoId;
			pontosNacionais[vencedorUnicoId] += estadoInfo.peso;
		} else {
			const pontosDivididos = estadoInfo.peso / lideresEstado.length;
			estadoInfo.vencedorId = 'empate';
			lideresEstado.forEach(l => {
				pontosNacionais[l.id] += pontosDivididos;
			});
		}
	});

	let vencedorId = null;
	let maxPontosNacionais = -1;
	CANDIDATOS.forEach(c => {
		if (pontosNacionais[c.id] > maxPontosNacionais) {
			maxPontosNacionais = pontosNacionais[c.id];
			vencedorId = c.id;
		}
	});

	const vencedor = CANDIDATOS.find(c => c.id === vencedorId);

	return {
		pontosNacionais,
		vitoriasPorEstado,
		vencedorId,
		vencedor
	};
}

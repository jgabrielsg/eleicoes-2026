<script>
	import { onMount } from 'svelte';

	// Estados da página
	let dados = $state(null);
	let carregando = $state(true);
	let erro = $state('');
	let redefinindo = $state(false);

	// Pontuação máxima derivada para normalização gráfica
	let maxScore = $derived(dados?.resultados?.score?.contagem ? Math.max(...Object.values(dados.resultados.score.contagem), 1) : 1);

	// Carrega dados da API
	async function carregarDados() {
		carregando = true;
		erro = '';
		try {
			const res = await fetch('/api/votos');
			if (!res.ok) throw new Error('Não foi possível obter os dados da apuração.');
			dados = await res.json();
		} catch (err) {
			erro = err.message;
		} finally {
			carregando = false;
		}
	}

	// Limpa dados de votos
	async function resetarVotos() {
		if (!confirm('Deseja realmente excluir todos os votos em memória e redefinir a simulação?')) return;
		redefinindo = true;
		try {
			const res = await fetch('/api/votos', { method: 'DELETE' });
			if (!res.ok) throw new Error('Erro ao apagar dados do servidor.');
			localStorage.removeItem('ja_votou_simulador');
			await carregarDados();
		} catch (err) {
			alert(err.message);
		} finally {
			redefinindo = false;
		}
	}

	onMount(() => {
		carregarDados();
	});

	// Função de cálculo de porcentagem auxiliar
	function obterPct(valor, total) {
		if (!total || total === 0) return 0;
		return ((valor / total) * 100).toFixed(1);
	}
</script>

<svelte:head>
	<title>Simulador Eleitoral - Dashboard 2026</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-start p-4 md:p-8">
	
	<!-- Container Central -->
	<div class="w-full max-w-6xl flex flex-col gap-6">
		
		<!-- Cabeçalho Dashboard -->
		<header class="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6 mt-4">
			<div class="text-center sm:text-left">
				<div class="flex items-center justify-center sm:justify-start gap-2">
					<h1 class="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-150 to-indigo-300 bg-clip-text text-transparent">
						Dashboard Comparativo 2026
					</h1>
					<span class="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-3xs font-semibold uppercase tracking-wider">
						12 Presidenciáveis
					</span>
				</div>
				<p class="text-xs text-slate-400 mt-1">
					Análise empírica dos resultados eleitorais a partir de diferentes teorias democráticas.
				</p>
			</div>
			
			<div class="flex items-center gap-2">
				<a href="/votar" class="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md">
					🗳️ Registrar Voto
				</a>
				
				<button 
					type="button"
					onclick={carregarDados}
					class="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800 rounded-xl transition-all"
					title="Recarregar dados"
				>
					🔄
				</button>

				<button 
					type="button" 
					onclick={resetarVotos}
					disabled={redefinindo || carregando}
					class="py-2.5 px-4 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30 font-semibold rounded-xl text-xs transition-all"
				>
					{redefinindo ? 'Redefinindo...' : 'Resetar Eleição'}
				</button>
			</div>
		</header>

		{#if carregando}
			<!-- Carregamento -->
			<div class="flex flex-col items-center justify-center py-28 gap-4">
				<div class="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
				<p class="text-slate-400 text-xs tracking-wider">Computando votos das seções eleitorais...</p>
			</div>
		{:else if erro}
			<!-- Erro -->
			<div class="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-3xl text-center my-8">
				<p class="font-bold text-sm">Erro ao processar simulações</p>
				<p class="text-xs mt-1 text-red-300">{erro}</p>
				<button onclick={carregarDados} class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors">
					Recarregar
				</button>
			</div>
		{:else if !dados || dados.totalVotos === 0}
			<!-- Vazio -->
			<div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 backdrop-blur-md text-center flex flex-col items-center justify-center gap-6 shadow-xl py-24">
				<div class="w-20 h-20 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-400 text-3xl">
					📊
				</div>
				<div class="max-w-md">
					<h2 class="text-2xl font-bold text-white mb-2">Simulador sem Dados</h2>
					<p class="text-slate-400 text-xs leading-relaxed">
						Nenhuma cédula inteligente de 12 candidatos foi depositada na urna em memória ainda. Registre seu voto ou adicione alguns votos simulados para visualizar as distorções nos sistemas democráticos.
					</p>
				</div>
				<a href="/votar" class="py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-md transition-all">
					Preencher Primeiro Voto
				</a>
			</div>
		{:else}
			<!-- Resultados -->

			<!-- ANÁLISE GERAL DO PAINEL -->
			{@const MSWinner = dados.resultados.maioriaSimples.vencedor}
			{@const AVWinner = dados.resultados.aprovacao.vencedor}
			{@const IRVWinner = dados.resultados.votoAlternativo.vencedor}
			{@const CondWinner = dados.resultados.condorcet.vencedor}
			{@const ScoreWinner = dados.resultados.score.vencedor}
			{@const StarWinner = dados.resultados.star.vencedor}
			{@const CollWinner = dados.resultados.colegio.vencedor}

			<!-- Analisador do Efeito Spoiler e Distorções -->
			<section class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-3">
				<h2 class="text-base font-bold text-white flex items-center gap-2">
					<span>🧠</span> Análise de Cenários Democráticos (Total: {dados.totalVotos} {dados.totalVotos === 1 ? 'voto' : 'votos'})
				</h2>
				
				<div class="text-xs text-slate-350 leading-relaxed flex flex-col gap-2">
					<p>
						{#if MSWinner?.id !== AVWinner?.id || MSWinner?.id !== IRVWinner?.id || MSWinner?.id !== CollWinner?.id}
							<span class="text-amber-400 font-bold">🚨 Efeito de Divisão de Votos / Divergência de Regra:</span> A escolha da fórmula de contagem alterou o presidente eleito! 
							Na Maioria Simples tradicional, o vencedor é <strong style="color: {MSWinner.corHexadecimal}">{MSWinner.nome}</strong>. 
							Contudo, sob o Voto por Aprovação, elegeu-se <strong style="color: {AVWinner.corHexadecimal}">{AVWinner.nome}</strong>, e no Colégio Eleitoral, venceu <strong style="color: {CollWinner.corHexadecimal}">{CollWinner.nome}</strong>. 
							Com 12 candidatos na disputa, o voto tradicional tende a dividir votos e eleger candidatos de maior rejeição, enquanto sistemas cardinal e preferencial buscam o candidato mais aceitável para o país.
						{:else}
							<span class="text-emerald-400 font-bold">✅ Consenso Unânime:</span> O candidato 
							<strong style="color: {MSWinner.corHexadecimal}">{MSWinner.nome}</strong> venceu sob todas as metodologias eleitorais avaliadas. 
							Mesmo em um cenário disperso com 12 pré-candidatos, ele conseguiu atingir a liderança em todas as contagens, revelando um forte apelo consensual nesta simulação.
						{/if}
					</p>
				</div>
			</section>

			<!-- GRID COM OS 7 RESULTADOS -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				
				<!-- 1. MAIORIA SIMPLES + SEGUNDO TURNO (ORDENADO) -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125">
					<div>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-sm font-bold text-white">1. Maioria Simples & Runoff</h3>
								<p class="text-3xs text-slate-400">Voto tradicional de 1º lugar. Exibe quem iria ao 2º turno.</p>
							</div>
							<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Majoritário</span>
						</div>

						<!-- Leaderboard dos 12 candidatos -->
						<div class="flex flex-col gap-2.5 my-4 max-h-80 overflow-y-auto pr-1">
							{#each [...dados.candidatos].sort((a, b) => (dados.resultados.maioriaSimples.contagem[b.id] || 0) - (dados.resultados.maioriaSimples.contagem[a.id] || 0)) as c}
								{@const votosC = dados.resultados.maioriaSimples.contagem[c.id] || 0}
								{@const pct = obterPct(votosC, dados.totalVotos)}
								{@const isEleito = !dados.resultados.maioriaSimples.precisaSegundoTurno && c.id === MSWinner?.id}
								{@const isFinalista = dados.resultados.maioriaSimples.precisaSegundoTurno && dados.resultados.maioriaSimples.finalistas.includes(c.id)}
								
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-4xs font-semibold">
										<span class="flex items-center gap-1.5 truncate" style="color: {c.corHexadecimal}">
											<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {c.corHexadecimal}"></span>
											<span class="truncate block max-w-40">{c.nome}</span>
											{#if isEleito}
												<span class="text-5xs px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">Eleito</span>
											{:else if isFinalista}
												<span class="text-5xs px-1 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">2º Turno</span>
											{/if}
										</span>
										<span class="text-slate-350">{votosC} ({pct}%)</span>
									</div>
									<div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
										<div class="h-full rounded-full transition-all" style="width: {pct}%; background-color: {c.corHexadecimal}; opacity: {c.id === MSWinner?.id || isFinalista ? '1' : '0.35'}"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="border-t border-slate-850 pt-2.5 text-3xs">
						{#if dados.resultados.maioriaSimples.precisaSegundoTurno}
							{@const f1 = dados.candidatos.find(c => c.id === dados.resultados.maioriaSimples.finalistas[0])}
							{@const f2 = dados.candidatos.find(c => c.id === dados.resultados.maioriaSimples.finalistas[1])}
							<div class="text-slate-400 flex flex-col gap-0.5">
								<span class="text-amber-400 font-bold">⚠️ Segundo Turno Requerido:</span>
								<span>Confronto: <strong style="color: {f1?.corHexadecimal}">{f1?.nome.split(' ')[0]}</strong> vs <strong style="color: {f2?.corHexadecimal}">{f2?.nome.split(' ')[0]}</strong></span>
							</div>
						{:else}
							<div class="text-emerald-400 font-bold flex items-center gap-1">
								<span>🏆 Eleito Direto:</span>
								<span style="color: {MSWinner?.corHexadecimal}">{MSWinner?.nome}</span>
							</div>
						{/if}
					</div>
				</section>

				<!-- 2. VOTO POR APROVAÇÃO (ORDENADO) -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125">
					<div>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-sm font-bold text-white">2. Voto por Aprovação</h3>
								<p class="text-3xs text-slate-400">Total de aprovações recebidas (aceitabilidade por eleitor).</p>
							</div>
							<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Consensual</span>
						</div>

						<div class="flex flex-col gap-2.5 my-4 max-h-80 overflow-y-auto pr-1">
							{#each [...dados.candidatos].sort((a, b) => (dados.resultados.aprovacao.contagem[b.id] || 0) - (dados.resultados.aprovacao.contagem[a.id] || 0)) as c}
								{@const aprovacoes = dados.resultados.aprovacao.contagem[c.id] || 0}
								{@const pct = obterPct(aprovacoes, dados.totalVotos)}
								{@const isVenc = c.id === AVWinner?.id}
								
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-4xs font-semibold">
										<span class="flex items-center gap-1.5 truncate" style="color: {c.corHexadecimal}">
											<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {c.corHexadecimal}"></span>
											<span class="truncate block max-w-40">{c.nome}</span>
											{#if isVenc}
												<span class="text-5xs px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">Mais Aprovado</span>
											{/if}
										</span>
										<span class="text-slate-350">{aprovacoes} apr. ({pct}%)</span>
									</div>
									<div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
										<div class="h-full rounded-full transition-all" style="width: {pct}%; background-color: {c.corHexadecimal}; opacity: {isVenc ? '1' : '0.35'}"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="border-t border-slate-850 pt-2.5 flex justify-between items-center text-3xs">
						<span class="text-slate-450">Vencedor Consensual:</span>
						<span class="font-bold font-sm" style="color: {AVWinner?.corHexadecimal}">{AVWinner?.nome || 'Nenhum'}</span>
					</div>
				</section>

				<!-- 3. VOTO ALTERNATIVO / IRV (RODADAS COMPACTADAS) -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125">
					<div>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-sm font-bold text-white">3. Voto Alternativo (IRV)</h3>
								<p class="text-3xs text-slate-400">Elimina o lanterna de cada turno e transfere preferências.</p>
							</div>
							<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Preferencial</span>
						</div>

						<div class="my-4 flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
							{#each dados.resultados.votoAlternativo.rodadas as rodada}
								{@const elim = dados.candidatos.find(c => c.id === rodada.eliminadoId)}
								<div class="bg-slate-950/60 p-2.5 border border-slate-855 rounded-2xl flex flex-col gap-1.5 text-3xs">
									<div class="flex justify-between text-4xs font-bold text-slate-400 border-b border-slate-900 pb-1">
										<span>Rodada #{rodada.numero}</span>
										<span>Votos Ativos: {rodada.totalVotosAtivos}</span>
									</div>
									<div class="grid grid-cols-4 sm:grid-cols-6 gap-1 text-center font-medium">
										{#each dados.candidatos as c}
											{@const votosR = rodada.contagem[c.id]}
											<div class="p-0.5 rounded {votosR === undefined ? 'opacity-20' : ''}">
												<span class="text-5xs block truncate" style="color: {c.corHexadecimal}">{c.nome.split(' ')[0]}</span>
												<span class="font-bold text-slate-200 text-4xs">{votosR === undefined ? '-' : votosR}</span>
											</div>
										{/each}
									</div>
									{#if elim}
										<div class="text-4xs text-red-450 bg-red-950/20 px-2 py-0.5 border border-red-900/10 rounded-lg flex justify-between">
											<span>Eliminado: {elim.nome.split(' ')[0]}</span>
											<span>Votos transferidos</span>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<div class="border-t border-slate-850 pt-2.5 flex justify-between items-center text-3xs">
						<span class="text-slate-450">Vencedor por IRV:</span>
						<span class="font-bold" style="color: {IRVWinner?.corHexadecimal}">{IRVWinner?.nome || 'Nenhum'}</span>
					</div>
				</section>

				<!-- 4. MÉTODO DE CONDORCET (ESCALA 11 DUELOS) -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125">
					<div>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-sm font-bold text-white">4. Método de Condorcet</h3>
								<p class="text-3xs text-slate-400">Duelos 1x1 em todas as cédulas. Vence quem ganhar de todos.</p>
							</div>
							<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Confrontos</span>
						</div>

						<div class="flex flex-col gap-2.5 my-4 max-h-80 overflow-y-auto pr-1">
							{#each [...dados.candidatos].sort((a, b) => (dados.resultados.condorcet.duelosVencidos[b.id] || 0) - (dados.resultados.condorcet.duelosVencidos[a.id] || 0)) as c}
								{@const duelos = dados.resultados.condorcet.duelosVencidos[c.id] || 0}
								{@const isVenc = c.id === CondWinner?.id}
								{@const totalDuelosPossiveis = dados.candidatos.length - 1}
								
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-4xs font-semibold">
										<span class="flex items-center gap-1.5 truncate" style="color: {c.corHexadecimal}">
											<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {c.corHexadecimal}"></span>
											<span class="truncate block max-w-40">{c.nome}</span>
											{#if isVenc}
												<span class="text-5xs px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase font-sans">Campeão</span>
											{/if}
										</span>
										<span class="text-slate-350">{duelos} / {totalDuelosPossiveis} duelos</span>
									</div>
									<div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
										<div class="h-full rounded-full transition-all" style="width: {(duelos / totalDuelosPossiveis) * 100}%; background-color: {c.corHexadecimal}; opacity: {isVenc ? '1' : '0.35'}"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="border-t border-slate-850 pt-2.5 text-3xs">
						{#if dados.resultados.condorcet.paradoxo}
							<div class="text-amber-400 font-bold">🚨 Paradoxo de Condorcet Detectado!</div>
							<div class="text-4xs text-slate-400 leading-tight">Empate cíclico: nenhum candidato venceu todos os confrontos individuais.</div>
						{:else}
							<div class="flex justify-between items-center">
								<span class="text-slate-450">Vencedor de Condorcet:</span>
								<span class="font-bold" style="color: {CondWinner?.corHexadecimal}">{CondWinner?.nome}</span>
							</div>
						{/if}
					</div>
				</section>

				<!-- 5. VOTO POR NOTA (SCORE - ORDENADO) -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125">
					<div>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-sm font-bold text-white">5. Voto por Nota (Score)</h3>
								<p class="text-3xs text-slate-400">Soma de todas as notas acumuladas (pontuação total de 0 a 5).</p>
							</div>
							<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Cardinal</span>
						</div>

						<div class="flex flex-col gap-2.5 my-4 max-h-80 overflow-y-auto pr-1">
							{#each [...dados.candidatos].sort((a, b) => (dados.resultados.score.contagem[b.id] || 0) - (dados.resultados.score.contagem[a.id] || 0)) as c}
								{@const scoreVal = dados.resultados.score.contagem[c.id] || 0}
								{@const pct = (scoreVal / maxScore) * 100}
								{@const isVenc = c.id === ScoreWinner?.id}
								
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-4xs font-semibold">
										<span class="flex items-center gap-1.5 truncate" style="color: {c.corHexadecimal}">
											<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {c.corHexadecimal}"></span>
											<span class="truncate block max-w-40">{c.nome}</span>
											{#if isVenc}
												<span class="text-5xs px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">Maior Nota</span>
											{/if}
										</span>
										<span class="text-slate-350">{scoreVal} pontos</span>
									</div>
									<div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
										<div class="h-full rounded-full transition-all" style="width: {pct}%; background-color: {c.corHexadecimal}; opacity: {isVenc ? '1' : '0.35'}"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="border-t border-slate-850 pt-2.5 flex justify-between items-center text-3xs">
						<span class="text-slate-450">Vencedor por Notas:</span>
						<span class="font-bold" style="color: {ScoreWinner?.corHexadecimal}">{ScoreWinner?.nome || 'Nenhum'}</span>
					</div>
				</section>

				<!-- 6. STAR VOTING -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125">
					<div>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-sm font-bold text-white">6. STAR Voting</h3>
								<p class="text-3xs text-slate-400">Score Then Automatic Runoff: Notas qualificam 2, runoff decide.</p>
							</div>
							<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Híbrido</span>
						</div>

						{#if dados.resultados.star.finalistas && dados.resultados.star.finalistas.length >= 2}
							{@const f1StarId = dados.resultados.star.finalistas[0]}
							{@const f2StarId = dados.resultados.star.finalistas[1]}
							{@const f1Star = dados.candidatos.find(c => c.id === f1StarId)}
							{@const f2Star = dados.candidatos.find(c => c.id === f2StarId)}
							{@const votesF1 = dados.resultados.star.runoff[f1StarId] || 0}
							{@const votesF2 = dados.resultados.star.runoff[f2StarId] || 0}
							{@const tiesStar = dados.resultados.star.runoff.empates || 0}
							{@const totalStarRunoff = votesF1 + votesF2 + tiesStar}

							<div class="flex flex-col gap-4 my-5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850">
								<div class="text-4xs font-bold text-slate-450 uppercase tracking-wide">Fase de Runoff Automático:</div>
								
								<!-- Finalista 1 -->
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-3xs font-semibold">
										<span class="flex items-center gap-1.5" style="color: {f1Star?.corHexadecimal}">
											<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {f1Star?.corHexadecimal}"></span>
											<span class="truncate block max-w-40">{f1Star?.nome}</span>
											{#if StarWinner?.id === f1StarId}
												<span class="text-5xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">Vencedor</span>
											{/if}
										</span>
										<span class="text-slate-350">{votesF1} ({obterPct(votesF1, totalStarRunoff)}%)</span>
									</div>
									<div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
										<div class="h-full rounded-full transition-all" style="width: {obterPct(votesF1, totalStarRunoff)}%; background-color: {f1Star?.corHexadecimal}; opacity: {StarWinner?.id === f1StarId ? '1' : '0.35'}"></div>
									</div>
								</div>

								<!-- Finalista 2 -->
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-3xs font-semibold">
										<span class="flex items-center gap-1.5" style="color: {f2Star?.corHexadecimal}">
											<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {f2Star?.corHexadecimal}"></span>
											<span class="truncate block max-w-40">{f2Star?.nome}</span>
											{#if StarWinner?.id === f2StarId}
												<span class="text-5xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">Vencedor</span>
											{/if}
										</span>
										<span class="text-slate-350">{votesF2} ({obterPct(votesF2, totalStarRunoff)}%)</span>
									</div>
									<div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
										<div class="h-full rounded-full transition-all" style="width: {obterPct(votesF2, totalStarRunoff)}%; background-color: {f2Star?.corHexadecimal}; opacity: {StarWinner?.id === f2StarId ? '1' : '0.35'}"></div>
									</div>
								</div>

								<div class="text-4xs text-slate-400 flex justify-between border-t border-slate-850 pt-2.5">
									<span>Empates na cédula: {tiesStar}</span>
									<span>Total runoff: {totalStarRunoff}</span>
								</div>
							</div>
						{/if}
					</div>

					<div class="border-t border-slate-850 pt-2.5 flex justify-between items-center text-3xs">
						<span class="text-slate-450">Vencedor por STAR:</span>
						<span class="font-bold" style="color: {StarWinner?.corHexadecimal}">{StarWinner?.nome || 'Nenhum'}</span>
					</div>
				</section>

				<!-- 7. COLÉGIO ELEITORAL (ORDENADO + MAPA DE UFS) -->
				<section class="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl min-h-125 md:col-span-2 lg:col-span-3">
					<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
						
						<!-- Gráfico de Delegados -->
						<div class="lg:col-span-6 flex flex-col justify-between">
							<div>
								<div class="flex justify-between items-start">
									<div>
										<h3 class="text-sm font-bold text-white">7. Colégio Eleitoral (Estilo Americano)</h3>
										<p class="text-3xs text-slate-400">Winner-takes-all por estado baseado no voto simples da UF. Total de 594 pontos.</p>
									</div>
									<span class="text-4xs px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold text-slate-500 uppercase">Delegados</span>
								</div>

								<div class="flex flex-col gap-2.5 my-4 max-h-80 overflow-y-auto pr-1">
									{#each [...dados.candidatos].sort((a, b) => (dados.resultados.colegio.pontosNacionais[b.id] || 0) - (dados.resultados.colegio.pontosNacionais[a.id] || 0)) as c}
										{@const pontos = dados.resultados.colegio.pontosNacionais[c.id] || 0}
										{@const pct = obterPct(pontos, 594)}
										{@const isVenc = c.id === CollWinner?.id}
										
										<div class="flex flex-col gap-0.5">
											<div class="flex justify-between text-4xs font-semibold">
												<span class="flex items-center gap-1.5 truncate" style="color: {c.corHexadecimal}">
													<span class="w-1.5 h-1.5 rounded-full border border-slate-800" style="background-color: {c.corHexadecimal}"></span>
													<span class="truncate block max-w-40">{c.nome}</span>
													{#if isVenc}
														<span class="text-5xs px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">Vitória Federal</span>
													{/if}
												</span>
												<span class="text-slate-350">{pontos} delegados ({pct}%)</span>
											</div>
											<div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
												<div class="h-full rounded-full transition-all" style="width: {pct}%; background-color: {c.corHexadecimal}; opacity: {isVenc ? '1' : '0.35'}"></div>
											</div>
										</div>
									{/each}
								</div>
							</div>

							<div class="border-t border-slate-850 pt-2.5 flex justify-between items-center text-3xs">
								<span class="text-slate-450">Presidente do Colégio Eleitoral:</span>
								<span class="font-bold text-sm" style="color: {CollWinner?.corHexadecimal}">{CollWinner?.nome || 'Nenhum'} ({CollWinner?.partido})</span>
							</div>
						</div>

						<!-- Distribuição das UFs conquistadas -->
						<div class="lg:col-span-6 border-l border-slate-800 pl-0 lg:pl-6">
							<h4 class="text-3xs font-bold text-slate-400 uppercase tracking-wide mb-3">Distribuição das UFs conquistadas:</h4>
							<div class="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-76 overflow-y-auto pr-1">
								{#each Object.keys(dados.resultados.colegio.vitoriasPorEstado) as uf}
									{@const estInfo = dados.resultados.colegio.vitoriasPorEstado[uf]}
									{@const ufWinner = dados.candidatos.find(c => c.id === estInfo.vencedorId)}
									
									<div 
										class="p-1 rounded-lg border text-center flex flex-col gap-0.5 text-2xs transition-colors"
										style="background-color: {ufWinner ? ufWinner.corHexadecimal + '10' : '#1e293b10'};
										       border-color: {ufWinner ? ufWinner.corHexadecimal + '30' : '#33415540'}"
										title="Vencedor em {uf}: {ufWinner ? ufWinner.nome : 'Sem votos'} (Peso: {estInfo.peso} pontos)"
									>
										<span class="font-bold text-white text-3xs">{uf}</span>
										<span class="text-4xs font-semibold truncate block w-full" style="color: {ufWinner ? ufWinner.corHexadecimal : '#64748b'}">
											{ufWinner ? ufWinner.nome.split(' ')[0] : 'Sem votos'}
										</span>
										<span class="text-5xs text-slate-500 font-bold">{estInfo.peso} pts</span>
									</div>
								{/each}
							</div>
						</div>

					</div>
				</section>

			</div>

		{/if}

	</div>
</main>

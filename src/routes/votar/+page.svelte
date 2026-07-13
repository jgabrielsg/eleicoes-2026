<script>
	import { onMount } from 'svelte';

	// Lista oficial de 12 candidatos reais à Presidência do Brasil em 2026
	const CANDIDATOS = [
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

	// Lista de UFs do Brasil
	const UFS = [
		'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
		'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
		'SP', 'SE', 'TO'
	];

	// Controle de Passos (0 a 4)
	let step = $state(0);

	// Dados do Eleitor
	let selectedUf = $state('');
	let votoSimples = $state(''); // Passo 1: Id do candidato eleito
	
	// Passo 2: Votos de aprovação (dicionário reativo)
	let votoAprovacao = $state({
		lula: false, aldo: false, cury: false, daciolo: false, edmilson: false,
		flavio: false, hertz: false, renan: false, zema: false, caiado: false,
		rui: false, samara: false
	});

	// Passo 3: Slots de rankeamento (contém ids dos candidatos ou null)
	let slotsRank = $state([null, null, null, null, null]);

	// Passo 4: Notas dadas (inicializadas com 0)
	let votoNota = $state({
		lula: 0, aldo: 0, cury: 0, daciolo: 0, edmilson: 0,
		flavio: 0, hertz: 0, renan: 0, zema: 0, caiado: 0,
		rui: 0, samara: 0
	});

	// Estados auxiliares
	let jaVotou = $state(false);
	let enviando = $state(false);
	let erro = $state('');
	let sucesso = $state(false);

	onMount(() => {
		if (localStorage.getItem('ja_votou_simulador') === 'true') {
			jaVotou = true;
		}
	});

	// Manipula o preenchimento dos 5 slots de preferência (Passo 3)
	function alternarSelecaoRank(candidateId) {
		const idx = slotsRank.indexOf(candidateId);
		if (idx !== -1) {
			// Se o candidato já está ranqueado, remove-o
			slotsRank[idx] = null;
		} else {
			// Caso contrário, insere no primeiro slot disponível
			const primeiroVazio = slotsRank.indexOf(null);
			if (primeiroVazio !== -1) {
				slotsRank[primeiroVazio] = candidateId;
			}
		}
	}

	function limparSlot(idx) {
		slotsRank[idx] = null;
	}

	// Validação dinâmica por etapa
	function possoSeguir() {
		if (step === 0) return selectedUf !== '';
		if (step === 1) return votoSimples !== '';
		return true;
	}

	function avancar() {
		if (possoSeguir() && step < 4) {
			step++;
		}
	}

	function voltar() {
		if (step > 0) {
			step--;
		}
	}

	// Envia a cédula final para a API
	async function submeterVoto() {
		enviando = true;
		erro = '';

		const aprovados = Object.keys(votoAprovacao).filter(id => votoAprovacao[id]);
		
		// Converte o rank de slots para array de objetos { id_candidato, posicao }
		const rankArray = [];
		slotsRank.forEach((id, index) => {
			if (id !== null) {
				rankArray.push({ id_candidato: id, posicao: index + 1 });
			}
		});

		// Converte notas de dicionário para array de objetos { id_candidato, nota }
		const notasArray = Object.keys(votoNota).map(id => ({
			id_candidato: id,
			nota: votoNota[id]
		}));

		const payload = {
			uf: selectedUf,
			voto_simples: votoSimples,
			voto_aprovacao: aprovados,
			voto_rank: rankArray,
			voto_nota: notasArray
		};

		try {
			const res = await fetch('/api/votos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.erro || 'Falha ao registrar seu voto.');
			}

			localStorage.setItem('ja_votou_simulador', 'true');
			sucesso = true;
			jaVotou = true;
		} catch (err) {
			erro = err.message;
		} finally {
			enviando = false;
		}
	}

	// Helpers de estilização reativa
	function obterCorEstilo(candidato, active) {
		const isRenan = candidato.id === 'renan';
		const borderClass = isRenan ? 'border-slate-600' : '';
		
		if (active) {
			return {
				borderStyle: `border-color: ${candidato.corHexadecimal}`,
				ringStyle: `ring-2 ring-[${candidato.corHexadecimal}] border-color: ${candidato.corHexadecimal}`,
				fallbackBorder: borderClass
			};
		}
		return {
			borderStyle: 'border-color: rgba(51, 65, 85, 0.4)',
			ringStyle: 'border-color: rgba(51, 65, 85, 0.4)',
			fallbackBorder: isRenan ? 'border-slate-800' : ''
		};
	}
</script>

<svelte:head>
	<title>Simulador Eleitoral - Preencher Cédula 2026</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-start p-4 md:p-8">
	<div class="w-full max-w-4xl flex flex-col gap-6 mt-4">
		
		<!-- Navegação Superior -->
		<div class="flex justify-between items-center">
			<a href="/" class="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1">
				← Voltar para a Página Inicial
			</a>
			<span class="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Cédula Oficial 2026</span>
		</div>

		{#if jaVotou && !sucesso}
			<!-- Estado: Já Votou -->
			<div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md text-center flex flex-col items-center justify-center gap-6 shadow-2xl py-16">
				<div class="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl">
					🗳️
				</div>
				<div class="max-w-md">
					<h2 class="text-2xl font-bold text-white mb-2">Simulação Concluída!</h2>
					<p class="text-slate-400 text-sm">
						Seus votos continuam salvos no banco em memória da PoC. Siga para o dashboard para analisar o resultado acumulado.
					</p>
				</div>
				<a href="/resultados" class="py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-center shadow-lg transition-all w-full max-w-xs">
					Ver Dashboard de Resultados
				</a>
			</div>
		{:else if sucesso}
			<!-- Estado: Sucesso -->
			<div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md text-center flex flex-col items-center justify-center gap-6 shadow-2xl py-16">
				<div class="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
					✓
				</div>
				<div class="max-w-md">
					<h2 class="text-3xl font-extrabold text-white mb-2">Cédula Processada!</h2>
					<p class="text-slate-350 text-sm">
						Sua cédula foi armazenada com sucesso. Analise como sua escolha muda de posição dependendo do algoritmo empregado.
					</p>
				</div>
				<a href="/resultados" class="py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-center shadow-lg transition-all w-full max-w-xs">
					Visualizar Resultados
				</a>
			</div>
		{:else}
			<!-- Card Principal do Wizard -->
			<div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-8 backdrop-blur-md flex flex-col gap-6 shadow-2xl relative">
				
				<!-- Progresso Stepper -->
				<div class="flex items-center justify-between border-b border-slate-800 pb-4">
					<div class="flex items-center gap-1.5">
						{#each Array(5) as _, i}
							<div class="flex items-center">
								<div 
									class="w-6 h-6 rounded-full flex items-center justify-center text-3xs font-extrabold transition-all border
									{step === i ? 'bg-indigo-600 border-indigo-500 text-white ring-4 ring-indigo-500/20' : 
									 step > i ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-600'}"
								>
									{i}
								</div>
								{#if i < 4}
									<div class="w-4 sm:w-8 h-0.5 {step > i ? 'bg-indigo-500/50' : 'bg-slate-800'}"></div>
								{/if}
							</div>
						{/each}
					</div>
					<div class="text-3xs font-extrabold uppercase tracking-widest text-slate-500">
						Etapa {step} de 4
					</div>
				</div>

				<!-- Corpo Dinâmico por Passo -->
				<div class="min-h-120 flex flex-col justify-between gap-6">

					<!-- PASSO 0: SELEÇÃO DA UF -->
					{#if step === 0}
						<div class="flex flex-col gap-4 max-w-xl mx-auto w-full py-8">
							<div class="text-center">
								<span class="text-2xs font-extrabold text-indigo-400 uppercase tracking-widest">Passo Inicial</span>
								<h2 class="text-2xl md:text-3xl font-bold text-white mt-1">Selecione o seu estado</h2>
								<p class="text-xs text-slate-400 mt-2 leading-relaxed">
									Seu estado (UF) servirá para a simulação do **Colégio Eleitoral** nacional, onde cada região brasileira carrega um peso representativo.
								</p>
							</div>

							<div class="flex flex-col gap-2 mt-6">
								<label for="uf-select" class="text-xs font-semibold text-slate-350">UF do Eleitor:</label>
								<select 
									id="uf-select"
									bind:value={selectedUf}
									class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
								>
									<option value="" disabled selected>Escolha sua Unidade Federativa...</option>
									{#each UFS as uf}
										<option value={uf}>{uf} - {uf === 'DF' ? 'Distrito Federal' : 'Estado'}</option>
									{/each}
								</select>
							</div>
						</div>

					<!-- PASSO 1: MAIORIA SIMPLES (GRID 2x2 ou 3x4) -->
					{:else if step === 1}
						<div class="flex flex-col gap-4">
							<div>
								<span class="text-2xs font-extrabold text-indigo-400 uppercase tracking-widest">Maioria Simples</span>
								<h2 class="text-xl md:text-2xl font-bold text-white mt-1">Voto Único de Primeiro Turno</h2>
								<p class="text-xs text-slate-400 mt-1 leading-relaxed">
									Selecione **apenas um** candidato. Este é o método tradicional que decide eleições de um turno e fornece a votação simples estadual do Colégio Eleitoral.
								</p>
							</div>

							<!-- Grid de Candidatos -->
							<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
								{#each CANDIDATOS as c}
									{@const active = votoSimples === c.id}
									{@const estilos = obterCorEstilo(c, active)}
									<button 
										type="button" 
										onclick={() => votoSimples = c.id}
										class="group flex flex-col p-2 bg-slate-950/60 border rounded-2xl text-left hover:bg-slate-950 transition-all select-none relative overflow-hidden
										       {active ? 'border-2' : 'border'} {estilos.fallbackBorder}"
										style={active ? estilos.ringStyle : estilos.borderStyle}
									>
										<!-- Imagem com Filtro CSS -->
										<div class="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-800/40">
											<img 
												src="/{c.imagem}" 
												alt={c.nome}
												class="w-full h-full object-cover transition-all duration-300
												       {active ? 'grayscale-0 saturate-100 contrast-100' : 'contrast-125 saturate-50 grayscale-[30%] group-hover:grayscale-0 group-hover:saturate-80'}"
											/>
										</div>

										<!-- Detalhes do Candidato -->
										<div class="px-1 flex flex-col flex-grow justify-between">
											<h4 class="text-xs font-bold text-white leading-tight truncate-2-lines min-h-8">{c.nome}</h4>
											<div class="flex justify-between items-center mt-1 pt-1 border-t border-slate-900/60">
												<span class="text-4xs text-slate-500 font-bold uppercase">{c.partido}</span>
												<div class="w-2.5 h-2.5 rounded-full" style="background-color: {c.corHexadecimal}"></div>
											</div>
										</div>
									</button>
								{/each}
							</div>
						</div>

					<!-- PASSO 2: VOTO POR APROVAÇÃO (GRID CHECKBOX) -->
					{:else if step === 2}
						<div class="flex flex-col gap-4">
							<div>
								<span class="text-2xs font-extrabold text-indigo-400 uppercase tracking-widest">Voto por Aprovação</span>
								<h2 class="text-xl md:text-2xl font-bold text-white mt-1">Marque quais são aceitáveis para você</h2>
								<p class="text-xs text-slate-400 mt-1 leading-relaxed">
									Selecione **quantos quiser** (de 0 a 12). Esse modelo busca identificar qual candidato é considerado aceitável pela maioria da população, atenuando divisões.
								</p>
							</div>

							<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
								{#each CANDIDATOS as c}
									{@const active = votoAprovacao[c.id]}
									{@const estilos = obterCorEstilo(c, active)}
									<button 
										type="button" 
										onclick={() => votoAprovacao[c.id] = !votoAprovacao[c.id]}
										class="group flex flex-col p-2 bg-slate-950/60 border rounded-2xl text-left hover:bg-slate-950 transition-all select-none relative overflow-hidden
										       {active ? 'border-2' : 'border'} {estilos.fallbackBorder}"
										style={active ? estilos.ringStyle : estilos.borderStyle}
									>
										<!-- Imagem com Filtro CSS -->
										<div class="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-800/40">
											<img 
												src="/{c.imagem}" 
												alt={c.nome}
												class="w-full h-full object-cover transition-all duration-300
												       {active ? 'grayscale-0 saturate-100 contrast-100' : 'contrast-125 saturate-50 grayscale-[30%] group-hover:grayscale-0 group-hover:saturate-80'}"
											/>
										</div>

										<!-- Detalhes do Candidato -->
										<div class="px-1 flex flex-col flex-grow justify-between">
											<h4 class="text-xs font-bold text-white leading-tight truncate-2-lines min-h-8">{c.nome}</h4>
											<div class="flex justify-between items-center mt-1 pt-1 border-t border-slate-900/60 text-4xs">
												<span class="text-slate-500 font-bold uppercase">{c.partido}</span>
												<span class="font-extrabold uppercase tracking-wide {active ? 'text-indigo-400' : 'text-slate-600'}">
													{active ? 'Aprovado' : 'Aprovar'}
												</span>
											</div>
										</div>
									</button>
								{/each}
							</div>
						</div>

					<!-- PASSO 3: RANKEAMENTO DE PREFERÊNCIAS (MECÂNICA SIMPLIFICADA DE 5 SLOTS) -->
					{:else if step === 3}
						<div class="flex flex-col gap-4">
							<div>
								<span class="text-2xs font-extrabold text-indigo-400 uppercase tracking-widest">Ordem Preferencial</span>
								<h2 class="text-xl md:text-2xl font-bold text-white mt-1">Escolha suas 5 primeiras opções</h2>
								<p class="text-xs text-slate-400 mt-1 leading-relaxed">
									Para evitar fadiga, ordene apenas seus **candidatos favoritos (1º ao 5º lugar)**. Clique no candidato abaixo para preencher o próximo slot. Candidatos não listados serão considerados empatados em último lugar.
								</p>
							</div>

							<!-- 5 Slots de Preferência -->
							<div class="grid grid-cols-5 gap-3 bg-slate-950/60 p-4 border border-slate-800 rounded-3xl mt-2">
								{#each slotsRank as candidateId, idx}
									{@const cand = CANDIDATOS.find(c => c.id === candidateId)}
									{#if cand}
										<button 
											type="button" 
											onclick={() => limparSlot(idx)}
											class="flex flex-col items-center justify-between p-2 bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl relative group transition-colors select-none"
										>
											<span class="text-4xs font-bold text-slate-500 absolute top-1 left-1.5">{idx + 1}º</span>
											<div class="w-10 h-10 rounded-full overflow-hidden border border-slate-800 mt-2">
												<img src="/{cand.imagem}" alt={cand.nome} class="w-full h-full object-cover" />
											</div>
											<span class="text-4xs text-slate-350 mt-1.5 truncate w-full text-center font-bold">{cand.nome.split(' ')[0]}</span>
											<span class="text-5xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold uppercase mt-0.5">Remover</span>
										</button>
									{:else}
										<div class="flex flex-col items-center justify-center p-2.5 bg-slate-950/60 border border-dashed border-slate-800/80 rounded-2xl h-24 text-center">
											<span class="text-4xs font-extrabold text-slate-600 block">{idx + 1}ª escolha</span>
											<span class="text-5xs text-slate-600 italic mt-1 leading-tight">Vazio</span>
										</div>
									{/if}
								{/each}
							</div>

							<!-- Grid de 12 Candidatos para Atribuição -->
							<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-2">
								{#each CANDIDATOS as c}
									{@const rankIndex = slotsRank.indexOf(c.id)}
									{@const active = rankIndex !== -1}
									{@const estilos = obterCorEstilo(c, active)}
									<button 
										type="button" 
										onclick={() => alternarSelecaoRank(c.id)}
										class="group flex flex-col p-1.5 bg-slate-950/40 border rounded-2xl text-left hover:bg-slate-950 transition-all select-none relative overflow-hidden
										       {active ? 'border-2' : 'border'} {estilos.fallbackBorder}"
										style={active ? estilos.ringStyle : estilos.borderStyle}
									>
										<!-- Foto -->
										<div class="w-full aspect-square rounded-xl overflow-hidden mb-1.5 bg-slate-900 border border-slate-800/40 relative">
											<img 
												src="/{c.imagem}" 
												alt={c.nome}
												class="w-full h-full object-cover transition-all duration-300
												       {active ? 'grayscale-0 saturate-100 contrast-100' : 'contrast-125 saturate-50 grayscale-[30%] group-hover:grayscale-0'}"
											/>
											{#if active}
												<div class="absolute inset-0 bg-indigo-600/30 flex items-center justify-center backdrop-blur-3xs font-extrabold text-white text-sm">
													{rankIndex + 1}º
												</div>
											{/if}
										</div>

										<h4 class="text-4xs font-bold text-white leading-tight truncate block w-full">{c.nome}</h4>
									</button>
								{/each}
							</div>
						</div>

					<!-- PASSO 4: VOTO POR NOTA (GRID SLIDER OU PONTOS) -->
					{:else if step === 4}
						<div class="flex flex-col gap-4">
							<div>
								<span class="text-2xs font-extrabold text-indigo-400 uppercase tracking-widest">Avaliação Cardinal</span>
								<h2 class="text-xl md:text-2xl font-bold text-white mt-1">Atribua uma nota de 0 a 5</h2>
								<p class="text-xs text-slate-400 mt-1 leading-relaxed">
									Avalie cada candidato individualmente. Notas de 0 (rejeição total) a 5 (apoio absoluto). A nota padrão é 0. Utilizado no **STAR Voting** e **Voto por Notas**.
								</p>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
								{#each CANDIDATOS as c}
									{@const active = votoNota[c.id] > 0}
									{@const estilos = obterCorEstilo(c, active)}
									<div 
										class="flex flex-col p-3 bg-slate-950/60 border rounded-2xl border-slate-800/80 transition-all select-none
										       {active ? 'border-2' : 'border'} {estilos.fallbackBorder}"
										style={active ? estilos.ringStyle : estilos.borderStyle}
									>
										<!-- Cabeçalho do Card de Nota -->
										<div class="flex items-center gap-2.5 pb-2.5 border-b border-slate-900/60 mb-2.5">
											<div class="w-9 h-9 rounded-full overflow-hidden border border-slate-800">
												<img src="/{c.imagem}" alt={c.nome} class="w-full h-full object-cover" />
											</div>
											<div class="flex-grow min-w-0">
												<h4 class="text-xs font-bold text-white truncate leading-tight">{c.nome}</h4>
												<span class="text-4xs text-slate-500 font-bold uppercase">{c.partido}</span>
											</div>
										</div>

										<!-- Seletor 0 a 5 -->
										<div class="flex items-center justify-between gap-1">
											{#each Array(6) as _, notaVal}
												<button
													type="button"
													onclick={() => votoNota[c.id] = notaVal}
													class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all border
													{votoNota[c.id] === notaVal ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400'}"
												>
													{notaVal}
												</button>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Mensagem de erro -->
					{#if erro}
						<div class="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs mt-2">
							⚠️ {erro}
						</div>
					{/if}

					<!-- Botões de Ação do Wizard -->
					<div class="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-800/80">
						<button 
							type="button"
							onclick={voltar}
							disabled={step === 0 || enviando}
							class="py-3 px-6 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-850 rounded-xl font-bold text-sm transition-colors disabled:opacity-30 disabled:pointer-events-none"
						>
							← Anterior
						</button>

						{#if step < 4}
							<button 
								type="button"
								onclick={avancar}
								disabled={!possoSeguir()}
								class="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-indigo-500/15"
							>
								Avançar →
							</button>
						{:else}
							<button 
								type="button"
								onclick={submeterVoto}
								disabled={enviando}
								class="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-500/15 disabled:opacity-50 flex items-center gap-2"
							>
								{#if enviando}
									<div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
									Registrando...
								{:else}
									🗳️ Submeter Voto de Simulação
								{/if}
							</button>
						{/if}
					</div>

				</div>

			</div>
		{/if}

	</div>
</main>

<script>
	// Landing Page - Simulador de Sistemas Eleitorais
</script>

<svelte:head>
	<title>Simulador Eleitoral - Entenda os Sistemas de Votação</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
	
	<!-- Círculos de Brilho de Fundo (Aesthetics) -->
	<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
	<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

	<div class="w-full max-w-4xl flex flex-col gap-10 py-12">
		
		<!-- Cabeçalho Principal -->
		<header class="text-center flex flex-col items-center gap-4">
			<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
				🏛️ Ciência Política na Prática
			</div>
			
			<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent max-w-3xl leading-tight">
				Como seu voto é contado muda quem governa?
			</h1>
			
			<p class="text-sm md:text-lg text-slate-400 max-w-2xl leading-relaxed">
				Explore como diferentes regras de contagem influenciam a representação democrática, reduzem o extremismo e mitigam o bipartidarismo.
			</p>
		</header>

		<!-- Cards Explicativos: Ciência Política -->
		<section class="grid grid-cols-1 md:grid-cols-2 gap-6">
			
			<!-- Card 1: Lei de Duverger -->
			<div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-3 shadow-xl">
				<div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
					⚖️
				</div>
				<h3 class="text-lg font-bold text-white">A Lei de Duverger & O Bipartidarismo</h3>
				<p class="text-xs text-slate-400 leading-relaxed">
					Na ciência política, a <strong>Lei de Duverger</strong> estabelece que eleições baseadas em maioria simples (vencedor leva tudo) tendem fortemente a consolidar um sistema bipartidário (como nos EUA ou a polarização no Brasil). Eleitores votam estrategicamente no "menos pior" para não desperdiçar o voto, sufocando opções moderadas ou alternativas.
				</p>
			</div>

			<!-- Card 2: Efeito Spoiler -->
			<div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-3 shadow-xl">
				<div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl font-bold">
					💥
				</div>
				<h3 class="text-lg font-bold text-white">O "Efeito Spoiler" & Polarização</h3>
				<p class="text-xs text-slate-400 leading-relaxed">
					O <strong>Efeito Spoiler</strong> ocorre quando dois candidatos com propostas parecidas dividem os votos da maioria da população, permitindo que um terceiro candidato polarizador (rejeitado pela maioria) vença a eleição. Sistemas como Voto Alternativo (IRV) ou Voto por Aprovação resolvem isso ao permitir expressar nuances de opinião.
				</p>
			</div>

		</section>

		<!-- Seção Como Funciona -->
		<section class="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-6">
			<h3 class="text-xl font-bold text-slate-200 text-center md:text-left">Como funciona o Simulador?</h3>
			
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
				<div class="flex flex-col gap-2">
					<div class="text-xs font-extrabold text-indigo-400 tracking-wide">PASSO 1</div>
					<h4 class="text-sm font-semibold text-white">Cédula Inteligente</h4>
					<p class="text-2xs text-slate-450 leading-relaxed">
						Preencha um fluxo de votação sequencial. Coletamos seu estado (UF), voto simples, aprovações, ordenação preferencial e notas para os candidatos.
					</p>
				</div>
				<div class="flex flex-col gap-2">
					<div class="text-xs font-extrabold text-indigo-400 tracking-wide">PASSO 2</div>
					<h4 class="text-sm font-semibold text-white">Cálculo em Larga Escala</h4>
					<p class="text-2xs text-slate-450 leading-relaxed">
						Nossa API processa todos os votos em memória simulando 7 sistemas diferentes simultaneamente, incluindo Condorcet, STAR e Colégio Eleitoral.
					</p>
				</div>
				<div class="flex flex-col gap-2">
					<div class="text-xs font-extrabold text-indigo-400 tracking-wide">PASSO 3</div>
					<h4 class="text-sm font-semibold text-white">Análise de Cenários</h4>
					<p class="text-2xs text-slate-450 leading-relaxed">
						Compare como o vencedor se altera dependendo de quem votou e da regra de contagem. Descubra qual método gera mais consenso ou polarização.
					</p>
				</div>
			</div>
		</section>

		<!-- Ações / CTA -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
			<a 
				href="/votar" 
				class="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-center shadow-lg hover:shadow-indigo-500/25 transition-all text-base"
			>
				⚡ Iniciar Simulação (Votar)
			</a>
			
			<a 
				href="/resultados" 
				class="w-full sm:w-auto py-4 px-8 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-center transition-all text-base"
			>
				📊 Visualizar Resultados
			</a>
		</div>

	</div>
</main>

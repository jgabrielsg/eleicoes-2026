<script>
	// Landing Page - Simulador de Sistemas Eleitorais (Estilo Acadêmico / Jornalístico)
</script>

<svelte:head>
	<title>Simulador Eleitoral - Estudo de Regras de Contagem e Representação</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
	
	<!-- Círculos de Brilho de Fundo (Aesthetics) -->
	<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
	<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

	<div class="w-full max-w-4xl flex flex-col gap-8 py-12">
		
		<!-- Cabeçalho Principal (Tom Jornalístico) -->
		<header class="text-center flex flex-col items-center gap-4">
			<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-3xs font-bold uppercase tracking-widest">
				🎓 Pesquisa de Matemática Eleitoral & Teoria dos Jogos
			</div>
			
			<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent max-w-3xl leading-tight">
				Como as Regras de Contagem Definem o Vencedor?
			</h1>
			
			<p class="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed font-normal">
				Um projeto interativo para testar e expor de forma matemática como as regras de apuração dos votos determinam a representação democrática, reduzem o extremismo e mitigam a polarização cívica.
			</p>
		</header>

		<!-- Bloco de Privacidade (Trust & Onboarding) -->
		<section class="bg-indigo-950/30 border border-indigo-500/20 rounded-3xl p-5 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-start gap-4 shadow-2xl">
			<div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold shrink-0">
				🛡️
			</div>
			<div>
				<h4 class="text-xs font-extrabold text-white uppercase tracking-wider">Disclaimer de Privacidade & Isenção Institucional</h4>
				<p class="text-2xs text-slate-350 leading-relaxed mt-1.5 font-normal">
					Esta é uma ferramenta acadêmica de simulação matemática. <strong>Não possuímos filiação partidária ou política.</strong> Não coletamos seu nome, e-mail, CPF, endereço IP ou geolocalização. O objetivo deste estudo é puramente analisar as distorções causadas pelo <strong>"Efeito Spoiler"</strong> e a <strong>Lei de Duverger</strong> nas eleições presidenciais brasileiras sob diferentes metodologias de apuração.
				</p>
			</div>
		</section>

		<!-- Cards Explicativos: Ciência Política -->
		<section class="grid grid-cols-1 md:grid-cols-2 gap-6">
			
			<!-- Card 1: Lei de Duverger -->
			<div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-3 shadow-xl">
				<div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
					⚖️
				</div>
				<h3 class="text-base font-bold text-white">A Lei de Duverger & O Bipartidarismo</h3>
				<p class="text-2xs text-slate-400 leading-relaxed font-normal">
					Na ciência política, a <strong>Lei de Duverger</strong> estabelece que eleições baseadas em maioria simples (vencedor leva tudo) tendem fortemente a consolidar um sistema bipartidário. Eleitores votam estrategicamente no candidato viável que consideram o "menos pior" para não desperdiçar o voto, sufocando opções moderadas ou alternativas.
				</p>
			</div>

			<!-- Card 2: Efeito Spoiler -->
			<div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-3 shadow-xl">
				<div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl font-bold">
					💥
				</div>
				<h3 class="text-base font-bold text-white">O "Efeito Spoiler" & Polarização</h3>
				<p class="text-2xs text-slate-400 leading-relaxed font-normal">
					O <strong>Efeito Spoiler</strong> ocorre quando dois candidatos com propostas similares dividem a mesma base eleitoral, permitindo que um terceiro candidato polarizador (rejeitado pela maioria) vença. Sistemas preferenciais e cardinais (como Voto por Aprovação, IRV e STAR) mitigam esse efeito ao permitir nuances de escolhas.
				</p>
			</div>

		</section>

		<!-- Seção Como Funciona -->
		<section class="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-6">
			<h3 class="text-base font-bold text-slate-200 text-center md:text-left">Etapas do Simulador</h3>
			
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
				<div class="flex flex-col gap-2">
					<div class="text-3xs font-extrabold text-indigo-400 tracking-wider">PASSO 1</div>
					<h4 class="text-xs font-bold text-white">Cédula Acadêmica</h4>
					<p class="text-2xs text-slate-450 leading-relaxed font-normal">
						Preencha sua cédula com voto simples, aprovações múltiplas, pódio de preferências (Top 3) e atribuição de notas para os candidatos.
					</p>
				</div>
				<div class="flex flex-col gap-2">
					<div class="text-3xs font-extrabold text-indigo-400 tracking-wider">PASSO 2</div>
					<h4 class="text-xs font-bold text-white">Apuração Algorítmica</h4>
					<p class="text-2xs text-slate-450 leading-relaxed font-normal">
						Nossos algoritmos processam os votos comparando 7 sistemas diferentes simultaneamente, incluindo Condorcet, STAR, IRV e o Colégio Eleitoral.
					</p>
				</div>
				<div class="flex flex-col gap-2">
					<div class="text-3xs font-extrabold text-indigo-400 tracking-wider">PASSO 3</div>
					<h4 class="text-xs font-bold text-white">Divergências Matemáticas</h4>
					<p class="text-2xs text-slate-450 leading-relaxed font-normal">
						Veja como a escolha da regra de contagem redefine o vencedor nacional e analise os efeitos spoilers em tempo real na página de resultados.
					</p>
				</div>
			</div>
		</section>

		<!-- Ações / CTA (Destaque e Transições Suaves) -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
			<a 
				href="/votar" 
				class="w-full sm:w-auto py-3.5 px-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-center shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
			>
				⚡ Iniciar Simulação (Votar)
			</a>
			
			<a 
				href="/resultados" 
				class="w-full sm:w-auto py-3.5 px-10 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-center transition-all duration-350 hover:scale-105 text-sm uppercase tracking-wider"
			>
				📊 Ver Resultados
			</a>
		</div>

		<!-- Rodapé de Transparência Open Source -->
		<footer class="w-full text-center border-t border-slate-850 pt-6 mt-6">
			<p class="text-3xs text-slate-500 font-semibold tracking-wider uppercase">
				Simulador de Sistemas Eleitorais © 2026. Código Aberto sob Licença MIT. 
				<a href="https://github.com/jgabrielsg/eleicoes-2026" class="text-indigo-400 hover:text-indigo-300 underline ml-1 hover:no-underline transition-colors">Repositório Open Source no GitHub</a>
			</p>
		</footer>

	</div>
</main>

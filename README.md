
# Simulador de Sistemas Eleitorais (Eleições 2026)

### [ACESSO AO SITE](https://simulador-eleitoral-2026.netlify.app)

Este projeto é uma plataforma web desenvolvida em SvelteKit e TailwindCSS com o objetivo de analisar e comparar o impacto de diferentes modelos de votação e contagem de votos na escolha de um único cargo executivo (Presidente da República). 

A aplicação permite visualizar na prática teorias da ciência política (como o "Efeito Spoiler" e a Lei de Duverger), evidenciando como o resultado de uma mesma eleição e a lista de candidatos vencedores podem mudar drasticamente apenas alterando as regras matemáticas do sistema de votação.

## Status Atual do Projeto
O projeto encontra-se em fase de **Prova de Conceito (PoC)**. A estrutura atual conta com:
- Interface de votação em múltiplas etapas baseada em uma "cédula inteligente".
- Os 12 nomes reais que figuram como pré-candidatos à presidência em 2026.
- Scripts de simulação para até 5.000 votos simultâneos para testes lógicos e matemáticos.
- Dashboard completo comparando 7 métodos eleitorais simultaneamente (incluindo Maioria Simples, Dois Turnos, Voto por Aprovação, Instant-Runoff Voting, Método de Condorcet, Score Voting, STAR Voting e Colégio Eleitoral).

## Planos para o Futuro
A arquitetura foi projetada para suportar, em breve, a integração com um banco de dados de produção (*Serverless*). Isso permitirá que múltiplos usuários, de computadores e localidades diferentes, enviem seus votos reais de forma segura. O resultado consolidado gerará um mapa interativo e estatísticas precisas sobre o comportamento de cada modelo eleitoral com dados populacionais reais.

## Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter o **Node.js** instalado em sua máquina.

### Passos para Instalação
1. Clone o repositório para sua máquina local.
2. Instale as dependências do projeto:
   ```sh
   npm install

### Desenvolvimento

Para rodar o servidor de desenvolvimento local:

```sh
npm run dev

```

O terminal indicará o endereço local (geralmente `http://localhost:5173`) para você abrir no navegador.

### Geração de Votos de Teste (Seed)

Em ambiente de desenvolvimento, você pode simular a carga inicial de 5.000 votos aleatórios realizando uma requisição do tipo `POST` para o endpoint `/api/seed`.

---

## Declaração de Isenção de Responsabilidade e Fins Educativos

* **Sem Vínculos Políticos:** Este projeto possui caráter estritamente acadêmico, científico e informativo. Não possui qualquer tipo de financiamento, apoio, parceria ou participação de nenhum partido político, coligação, candidato ou entidade governamental.
* **Objetivo de Estudo:** A ferramenta serve exclusivamente como objeto de estudo de modelos de votação alternativos no campo da ciência política e teoria da escolha social.
* **Direitos Autorais e Imagens:** Todas as imagens, fotografias dos candidatos e informações biográficas utilizadas nesta aplicação foram obtidas de fontes públicas de comunicação ou bancos de dados institucionais. Elas são utilizadas sob os termos de licenças de uso comum e livre distribuição (como *Creative Commons* ou domínio público), destinadas exclusivamente à identificação visual dos nomes citados na simulação acadêmica.

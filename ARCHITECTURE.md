# Arquitetura — Redacao Nota 1000

## Visao Geral

O **Redacao Nota 1000** e um portal estatico de estudo de redacao para o ENEM, com correcao automatizada por IA. A arquitetura e dividida em tres camadas: **Frontend estatico**, **API Serverless** e **Engenharia de Dados**.

```
┌─────────────────────────────────────────────┐
│                  USUARIO                      │
│          (navegador / celular)                │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │   GitHub Pages /    │  ← Hosting estatico
    │   Vercel (static)   │
    │                     │
    │  ┌───────────────┐  │
    │  │  index.html   │  │  ← Pagina principal
    │  │  paginas/*    │  │  ← Modulos (aulas, biblioteca, etc)
    │  │  dados/*.js   │  │  ← Bancos de dados client-side
    │  └───────────────┘  │
    └──────────┬───────────┘
               │
    ┌──────────▼───────────┐
    │  Vercel Edge Runtime │  ← API serverless
    │  api/corrigir-      │
    │  redacao.js         │
    │                     │
    │  Recebe texto +     │
    │  tema → chama Groq  │
    │  → retorna nota     │
    └──────────┬───────────┘
               │
    ┌──────────▼───────────┐
    │  Groq API           │  ← LLM para correcao
    │  (server-side key)  │
    └─────────────────────┘
```

## Modulos do Site

| Modulo | Arquivo | Funcao |
|--------|---------|--------|
| Home | `index.html` | Landing page com navegacao |
| Aulas | `paginas/aulas/*.html` | Introducao, desenvolvimento, conclusao |
| Biblioteca | `paginas/biblioteca/*.html` | Redacoes nota 1000 para leitura |
| Corretor | `paginas/corretor/corretor.html` | Correcao por IA (Groq) |
| Temas | `paginas/temas/temas.html` | Banco de temas de redacao |
| Repertorios | `paginas/repertorio/*.html` | Repertorios socioculturais |
| Pratica | `paginas/pratica/pratica.html` | Pratica de escrita com timer |

## Fluxo de Correcao com IA

```
Usuario escreve redacao → corretor.html
    │
    ▼
scripts/ia_corretor.js (frontend)
    │  POST /api/corrigir-redacao
    │  body: { tema, texto }
    ▼
api/corrigir-redacao.js (Vercel Edge)
    │  1. Valida metodo POST
    │  2. Usa GROQ_API_KEY do servidor
    │  3. Monta prompt com 5 competencias
    │  4. Chama Groq API (llama3-70b)
    ▼
Resposta JSON:
    { nota_final, competencias[], sugestao_estudo }
    │
    ▼
Frontend renderiza feedback por competencia
```

## Engenharia de Dados

Os dados do site sao coletados via crawlers e versionados como JS:

```
scripts/uol-redacoes-xml/     ← Crawlers Scrapy
    │  Coleta de UOL e Brasil Escola
    ▼
scripts/gerador_massa.py     ← Gera massa de dados
    │
    ▼
paginas/dados/*.json         ← Fonte de dados (build)
    │
    ▼ scripts/convert_*_json_to_js.py
    │
    ▼
paginas/dados/*.js           ← Dados carregados pelo site
```

## Bancos de Dados (Client-side)

| Arquivo | Tamanho | Conteudo |
|---------|---------|----------|
| `banco_redacoes.js` | ~275 KB | Redacoes nota 1000 com metadados |
| `banco_temas.js` | ~86 KB | Temas de redacao com propostas |
| `banco_repertorios.js` | ~5 KB | Repertorios socioculturais por area |

## Stack Tecnologica

- **Frontend**: HTML5 + Tailwind CSS (CDN) + JavaScript vanilla
- **Fontes**: Outfit (display) + Inter (body) via Google Fonts
- **Icones**: Lucide Icons
- **Hosting**: GitHub Pages + Vercel (para API)
- **API**: Vercel Edge Runtime (serverless)
- **IA**: Groq API (llama3-70b-8192)
- **Crawlers**: Python + Scrapy
- **CI**: GitHub Actions (`verify_site.py`)

## Seguranca

- A chave GROQ_API_KEY nunca e exposta ao frontend
- O proxy serverless (`api/corrigir-redacao.js`) ignora qualquer chave enviada pelo cliente
- CORS configurado para aceitar requisicoes do dominio do site

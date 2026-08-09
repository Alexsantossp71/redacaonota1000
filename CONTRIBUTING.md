# Contribuindo — Redacao Nota 1000

Obrigado pelo interesse em contribuir! Este guia explica como participar do desenvolvimento do portal.

## Como Contribuir

### Reportando Bugs

1. Abra uma **Issue** descrevendo o problema
2. Inclua: navegador, passo a passo, screenshots se possivel
3. Se for um bug de dados (redacao errada, tema duplicado), mencione o ID

### Sugerindo Melhorias

1. Abra uma **Issue** com a tag `enhancement`
2. Descreva a melhoria e o beneficio para os usuarios

### Enviando Changes

1. **Fork** o repositorio
2. Crie uma branch: `git checkout -b feature/nome-da-feature`
3. Faca as alteracoes
4. Commit com mensagem clara: `git commit -m 'feat: descricao'`
5. Push: `git push origin feature/nome-da-feature`
6. Abra um **Pull Request**

## Padrões de Commit

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova funcionalidade |
| `fix:` | Correcao de bug |
| `docs:` | Documentacao |
| `chore:` | Manutencao (deps, config) |
| `style:` | Formatacao (sem logica) |
| `refactor:` | Refatoracao (sem mudanca de comportamento) |
| `perf:` | Melhoria de performance |

## Estrutura de Arquivos

```
redacaonota1000/
├── index.html                 # Pagina principal
├── paginas/
│   ├── aulas/                 # Modulo de aulas
│   ├── biblioteca/            # Biblioteca de redacoes
│   ├── corretor/              # Corretor com IA
│   ├── dados/                 # Bancos de dados (.js)
│   ├── pratica/               # Pratica de escrita
│   ├── repertorio/            # Repertorios
│   ├── temas/                 # Banco de temas
│   └── institucional/         # Termos, etc
├── scripts/
│   ├── ia_corretor.js         # Engine de IA
│   ├── verify_site.py         # Validacao CI
│   └── uol-redacoes-xml/      # Crawlers
├── api/
│   └── corrigir-redacao.js    # API serverless (Vercel)
├── ARCHITECTURE.md            # Este documento
└── README.md
```

## Adicionando Redacoes ou Temas

1. Edite o banco de dados JS correspondente em `paginas/dados/`
2. Siga o formato existente (JSON dentro de `const BANCO = ...`)
3. Teste localmente com `python -m http.server 8000`
4. O CI (`verify_site.py`) validara JSON e referencias

## Design System

- **Fonte display**: Outfit (Google Fonts)
- **Fonte body**: Inter (Google Fonts)
- **Icones**: Lucide Icons
- **Cores primarias**: primary `#1E40AF`, accent `#10B981`
- **Framework CSS**: Tailwind CSS

## CI

O repositorio usa GitHub Actions com `verify_site.py` que verifica:
- Validade de todos os arquivos JSON
- Existencia de `index.html`
- Referencias locais (href/src) nao quebradas

# ✍️ Redação Nota 1000

> Portal completo de estudo de redação para o ENEM: aulas, biblioteca de redações nota 1000, corretor com IA, banco de temas e repertórios.

## 📌 Sobre

Plataforma gratuita para quem quer conquistar a nota máxima na redação do ENEM. Reúne **aulas passo a passo** (introdução, desenvolvimento e conclusão), **biblioteca de redações nota 1000**, **corretor automático com inteligência artificial** e **bancos de temas e repertórios** atualizados.

## ✨ Funcionalidades

- 📖 **Aulas** — estrutura da redação: introdução, desenvolvimento, conclusão
- 📚 **Biblioteca** — redações nota 1000 para leitura e estudo
- 🤖 **Corretor com IA** — correção automática de redações com nota e feedback por competência (via Groq, em função serverless na Vercel)
- 🎯 **Temas** — banco de temas de redação com propostas
- 🧠 **Repertórios** — banco de repertórios socioculturais por área
- 🔎 **SEO otimizado** para busca orgânica

## 🗂️ Scripts e dados

O repositório também contém a **engenharia de dados** por trás do portal:

- `scripts/uol-redacoes-xml/` — crawlers **Scrapy** que coletam redações nota 1000 de fontes públicas (UOL, Brasil Escola)
- `scripts/gerador_massa.py` — geração de massa de dados
- `scripts/convert_*_json_to_js.py` — conversão dos bancos de dados (JSON → JS)
- `paginas/dados/` — bancos de redações, temas e repertórios

## 🚀 Como executar localmente

```bash
# Frontend (site estático)
git clone https://github.com/Alexsantossp71/redacaonota1000.git
cd redacaonota1000
python -m http.server 8000
# acesse http://localhost:8000

# Corretor de IA (requer deploy na Vercel e variável GROQ_API_KEY)
# 1. Importe o projeto na Vercel
# 2. Configure a variável GROQ_API_KEY no painel
# 3. Deploy — a função api/corrigir-redacao.js roda no Edge Runtime
```

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript + Tailwind CSS
- **Vercel** (deploy do site + função serverless `api/corrigir-redacao.js`)
- **Groq** (IA de correção)
- **Python / Scrapy** (crawlers de redações)

## 👤 Autor

**Alexandre Ramos** — [github.com/Alexsantossp71](https://github.com/Alexsantossp71)

## 📄 Status

Em desenvolvimento (última atualização: março/2026).

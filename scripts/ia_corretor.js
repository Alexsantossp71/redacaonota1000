/**
 * Core da Inteligência Artificial - Corretor Nota 1000
 * Este script lida com a simulação de correção e integração futura com APIs.
 */

const IA_CORRETOR = {
    async analisarRedacao(payload) {
        // Tenta pegar a chave do localStorage (caso o usuário tenha inserido uma própria), senão envia null para a Vercel usar o server secret dela
        let apiKey = localStorage.getItem('groq_api_key') || null;

        const systemPrompt = `Você é um corretor oficial do ENEM de alto nível.
Sua missão é corrigir a redação do usuário seguindo rigorosamente as 5 competências do ENEM.

REGRAS DE OURO:
1. Retorne APENAS um objeto JSON. Sem explicações fora do JSON.
2. Cada competência (C1 a C5) deve ter nota entre 0, 40, 80, 120, 160 ou 200.
3. No campo "highlights", identifique trechos específicos. 
   - offset: índice do caractere inicial no texto original.
   - length: quantidade de caracteres do trecho destacado.
   - tipo: "gramatica", "argumentacao" ou "estrutura".
   - dica: Um comentário curto e pedagógico.
4. Se não tiver certeza absoluta do offset, deixe o array de highlights vazio.

ESTRUTURA JSON ESPERADA:
{
    "nota_final": [Soma das 5 competências],
    "competencias": [
        {
            "id": 1,
            "nome": "Domínio da Norma Culta",
            "nota": 160,
            "feedback": "Texto descritivo sobre o desempenho...",
            "highlights": []
        },
        ... (repetir para C2, C3, C4, C5)
    ],
    "sugestao_estudo": "Uma recomendação de tópico para o aluno focar.",
    "proximo_modulo": "Nome de um módulo sugerido (ex: Regência, Coesão, etc)"
}`;

        const userPrompt = `Tema: ${payload.tema}\n\nRedação:\n${payload.texto}`;

        try {
            // Nova Rota segura: O Frontend não faz mais request no Groq (evita CORS e roubo de chaves). 
            // Ele pede ao nosso Backend Serverless na Vercel (/api/corrigir-redacao) enviando opcionalmente a chave do localStorage (caso o usuário queira usar chave própria).
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocal ? 'http://localhost:3000/api/corrigir-redacao' : '/api/corrigir-redacao';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tema: payload.tema,
                    texto: payload.texto,
                    apiKey: apiKey // Passamos a do localStorage como fallback. Se for undefined, a Vercel usa o server secret dela.
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    return { status: "unauthorized", message: "A chave de API está inválida ou não foi configurada." };
                }
                throw new Error(`Erro no Servidor (${response.status}): ${response.statusText}`);
            }

            const wrapperData = await response.json();
            
            if (wrapperData.status === "error") {
                throw new Error(wrapperData.message);
            }

            // O nosso proxy retorna { status: 'success', data: { choices: [...] } }
            const data = wrapperData.data;
            const analiseIA = JSON.parse(data.choices[0].message.content);

            return {
                ...analiseIA,
                status: "success",
                tema: payload.tema,
                tempo: payload.tempo,
                data: new Date().toLocaleDateString('pt-BR')
            };
        } catch (error) {
            console.error("Erro na correção:", error);
            return { status: "error", message: error.message };
        }
    }
};

window.IA_CORRETOR = IA_CORRETOR;

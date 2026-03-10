/**
 * Core da Inteligência Artificial - Corretor Nota 1000
 * Este script lida com a simulação de correção e integração futura com APIs.
 */

const IA_CORRETOR = {
    async analisarRedacao(payload) {
        const apiKey = localStorage.getItem('groq_api_key');
        
        if (!apiKey) {
            return { status: "error", message: "API_KEY_MISSING" };
        }

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
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.3,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) throw new Error('Falha na comunicação com Groq');

            const data = await response.json();
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

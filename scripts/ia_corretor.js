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

        const systemPrompt = `Você é um corretor especialista do ENEM. Sua tarefa é corrigir uma redação baseada no tema fornecido.
Retorne APENAS um JSON estruturado seguindo rigorosamente as 5 competências do ENEM (C1 a C5).
A nota de cada competência deve ser 0, 40, 80, 120, 160 ou 200.

O JSON deve ter este formato:
{
    "nota_final": 0,
    "competencias": [
        { "id": 1, "nome": "Domínio da Norma Culta", "nota": 0, "feedback": "", "highlights": [{"offset": 0, "length": 0, "tipo": "gramatica", "dica": ""}] }
    ],
    "sugestao_estudo": "",
    "proximo_modulo": ""
}

Importante: No campo "highlights", tente identificar pelo menos 2 ou 3 pontos (gramática, coesão ou argumentação). O "offset" é a posição do caractere inicial e "length" o tamanho do trecho. Use o texto original para calcular. Se não conseguir calcular offsets precisos, retorne highlights vazios.`;

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

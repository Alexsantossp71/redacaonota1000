export const config = {
  runtime: 'edge', // Usa Edge Runtime para ser grátis e super rápido
};

export default async function handler(req) {
  // Configuração básica do CORS para requisições de preflight (OPTIONS)
  const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, PATCH, DELETE, POST, PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Somente permite POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Tenta receber a API Key do ambiente da Vercel
    const serverKey = process.env.GROQ_API_KEY;
    
    // Pega o body enviado pelo frontend (tema e redação) 
    let body = {};
    try {
        body = await req.json();
    } catch(e) {
        console.warn("Nenhum body JSON encontrado ou mal formatado.");
    }
    
    // Agora que temos nosso Backend Seguro, VAMOS IGNORAR completamente 
    // qualquer chave que vier do frontend (pra evitar chaves expiradas em cache local)
    const groqKeyToUse = serverKey;

    if (!groqKeyToUse) {
         return new Response(JSON.stringify({ 
           status: "unauthorized", 
           message: "Chave do Groq não configurada no servidor Vercel. Adicione-a nas variáveis de ambiente." 
         }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
         });
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
        }
    ],
    "sugestao_estudo": "Uma recomendação de tópico para o aluno focar.",
    "proximo_modulo": "Nome de um módulo sugerido (ex: Regência, Coesão, etc)"
}`;

    const userPrompt = `Tema: ${body.tema}\n\nRedação:\n${body.texto}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqKeyToUse}`,
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

    if (!response.ok) {
       if (response.status === 401 || response.status === 403) {
            return new Response(JSON.stringify({ status: "unauthorized", message: "A chave da API Groq expirou ou é inválida." }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
       }
       throw new Error(`Erro na API Groq (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({
       status: "success",
       data: data
    }), {
       status: 200,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro interno no Edge Proxy:", error);
    return new Response(JSON.stringify({ status: "error", message: error.message }), {
       status: 500,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

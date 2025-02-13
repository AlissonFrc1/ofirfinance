import { NextResponse } from 'next/server';

interface AnalysisData {
  periodo: string;
  total_receitas: string;
  total_despesas: string;
  saldo_geral: string;
  percentual_comprometido: string;
  limite_total_cartoes: string;
  percentual_limite_usado: string;
  total_cartoes: number;
  categorias_despesas: Array<{
    categoria: string;
    valor: string;
    percentual: string;
  }>;
  categorias_receitas: Array<{
    categoria: string;
    valor: string;
    percentual: string;
  }>;
  transacoes_parceladas: number;
  transacoes_fixas: number;
  transacoes_recorrentes: number;
}

export async function POST(request: Request) {
  try {
    const data: AnalysisData = await request.json();

    // Validar se a chave da API está presente
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API não configurada');
    }

    // Construir o prompt para a análise
    const prompt = `Você é um analista financeiro experiente. Analise os seguintes dados financeiros e forneça insights relevantes em português:

Período: ${data.periodo}
Receitas: ${data.total_receitas}
Despesas: ${data.total_despesas}
Saldo: ${data.saldo_geral}
Percentual da Renda Comprometido: ${data.percentual_comprometido}
Limite Total em Cartões: ${data.limite_total_cartoes}
Uso do Limite: ${data.percentual_limite_usado}
Total de Cartões: ${data.total_cartoes}

Categorias de Despesas:
${data.categorias_despesas.map(cat => `- ${cat.categoria}: ${cat.valor} (${cat.percentual})`).join('\n')}

Categorias de Receitas:
${data.categorias_receitas.map(cat => `- ${cat.categoria}: ${cat.valor} (${cat.percentual})`).join('\n')}

Informações Adicionais:
- Transações Parceladas: ${data.transacoes_parceladas}
- Transações Fixas: ${data.transacoes_fixas}
- Transações Recorrentes: ${data.transacoes_recorrentes}

Por favor, forneça uma análise detalhada focando em:

1. Visão Geral:
   - Avalie a saúde financeira geral
   - Compare receitas vs despesas
   - Analise o saldo e sua sustentabilidade

2. Análise de Receitas:
   - Avalie a distribuição das fontes de renda
   - Identifique dependências ou riscos
   - Sugira possíveis diversificações

3. Análise de Despesas:
   - Identifique os principais gastos
   - Avalie o uso dos cartões de crédito
   - Analise o impacto das despesas fixas e parceladas

4. Recomendações:
   - Sugira otimizações específicas
   - Indique áreas para redução de gastos
   - Proponha estratégias de investimento ou poupança

5. Alertas e Riscos:
   - Destaque pontos de atenção
   - Alerte sobre possíveis problemas
   - Sugira ações preventivas

Mantenha a análise objetiva e prática, focando em ações concretas que podem ser tomadas para melhorar a situação financeira.`;

    console.log('Enviando requisição para a API do Gemini...');

    // Fazer a chamada para a API do Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Erro na API do Gemini: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Resposta inválida da API:', result);
      throw new Error('Resposta inválida da API do Gemini');
    }

    const analysis = result.candidates[0].content.parts[0].text;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Erro ao gerar análise:', error);
    
    let errorMessage = 'Não foi possível gerar a análise. Por favor, tente novamente mais tarde.';
    if (error instanceof Error) {
      if (error.message.includes('Chave da API')) {
        errorMessage = 'Erro de configuração do serviço. Por favor, contate o suporte.';
      } else if (error.message.includes('Gemini')) {
        errorMessage = 'Serviço de análise temporariamente indisponível. Por favor, tente novamente em alguns minutos.';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
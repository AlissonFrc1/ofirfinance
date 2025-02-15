"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TransactionFormProps {
  type: "expense" | "expense-card" | "income";
  onClose: () => void;
  onSubmit: (data: any) => void;
  cards: {
    id: string;
    name: string;
    brand: string;
    lastDigits: string;
    limit: number;
    dueDay: number;
    closingDay: number;
    color: string;
  }[];
}

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  color: string;
}

export const CATEGORIES = {
  expense: [
    "Alimentação",
    "Habitação",
    "Saúde",
    "Transporte",
    "Cuidados pessoais e cosméticos",
    "Lazer",
    "Educação",
    "Dependentes",
    "Animais de Estimação",
    "Assinaturas",
    "Investimentos",
    "Outros pagamentos"
  ],
  income: [
    "Renda formal",
    "Autônomo",
    "Receita de investimentos",
    "Receita variável",
    "Receita passiva",
    "Outras receitas"
  ]
};

const SUBCATEGORIES: Record<string, string[]> = {
  "Alimentação": [
    "Alimentação",
    "Supermercado",
    "Açougue",
    "Feira",
    "Fast food",
    "Outros"
  ],
  "Habitação": [
    "Prestação imóvel",
    "Condomínio",
    "Internet",
    "Luz",
    "Gás",
    "IPTU e outro impostos",
    "Aluguel",
    "Outros"
  ],
  "Saúde": [
    "Plano de Saúde",
    "Consulta Médica",
    "Exames",
    "Dentista",
    "Medicamentos",
    "Terapia",
    "Seguro de Vida",
    "Outros"
  ],
  "Transporte": [
    "Ônibus/Metrô/Trem",
    "Táxi/App",
    "Prestação do Veículo",
    "Seguro do Veículo",
    "Combustível",
    "Lavagens",
    "IPVA/DPVAT/Licenciamento",
    "Mecânico",
    "Multas",
    "Estacionamentos",
    "Pedágios",
    "Outros"
  ],
  "Cuidados pessoais e cosméticos": [
    "Cuidados pessoais e cosméticos",
    "Cabeleireiro",
    "Vestuário",
    "Academia",
    "Cursos",
    "Presentes",
    "Outros"
  ],
  "Lazer": [
    "Restaurantes e Lanchonetes",
    "Cafés/Sorveterias",
    "Bares/Boates",
    "Livrarias",
    "Passagens",
    "Hotéis",
    "Passeios (Cinema, Teatro, Shows, etc.)",
    "Outros"
  ],
  "Educação": [
    "Graduação",
    "Pós-Graduação/MBA",
    "Cursos de Especialização",
    "Cursos de Idiomas",
    "Outros"
  ],
  "Dependentes": [
    "Escola/Faculdade",
    "Cursos Extras",
    "Material Escolar",
    "Esportes/Uniformes",
    "Mesada",
    "Passeios/Férias",
    "Vestuário",
    "Saúde/Medicamentos",
    "Transporte",
    "Outros"
  ],
  "Animais de Estimação": [
    "Pet Shop",
    "Ração",
    "Veterinário",
    "Medicamentos",
    "Vacinas",
    "Outros"
  ],
  "Assinaturas": [
    "Netflix",
    "Amazon Prime",
    "Youtube",
    "Disney",
    "Plano celular",
    "Outros"
  ],
  "Investimentos": [
    "Reserva de emergência",
    "Ações",
    "FII",
    "Exterior",
    "Cripto",
    "LCI",
    "LCA",
    "CDB",
    "Fundos de Investimento",
    "Tesouro Direto",
    "Previdência privada",
    "Outros"
  ],
  "Outros pagamentos": [
    "Outros"
  ],
  "Salário": [
    "CLT",
    "PJ",
    "Outros"
  ],
  "Freelance": [
    "Projeto",
    "Consultoria",
    "Outros"
  ],
  "Renda formal": [
    "Salário",
    "Bônus",
    "13°",
    "Férias",
    "Outros"
  ],
  "Autônomo": [
    "Vendas",
    "Serviços Prestados",
    "Outros"
  ],
  "Receita de investimentos": [
    "Dividendos",
    "Venda De Ativos",
    "Reserva De Emergência",
    "Outros"
  ],
  "Receita variável": [
    "Venda De Imóvel",
    "Venda De Automóvel",
    "Venda De Itens Pessoais",
    "Presentes",
    "Outros"
  ],
  "Receita passiva": [
    "Aluguel",
    "Royalties",
    "Licenciamento",
    "Outros"
  ],
  "Outras receitas": [
    "Outros"
  ]
};

const PAYMENT_METHODS = [
  "Dinheiro",
  "Débito",
  "Transferência Bancária",
  "Pix"
];

export function TransactionForm({ type, onClose, onSubmit, cards }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    value: "",
    paid: false,
    recurring: false,
    date: new Date().toISOString().split("T")[0],
    nextDate: "",
    paymentMethod: "",
    category: "",
    subcategory: "",
    fixed: false,
    installments: "",
    description: "",
    cardId: "",
    dueDate: "",
    dueDay: "",
    endRecurrenceDate: null
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para calcular a data de vencimento com base na data da compra e no cartão selecionado
  const calculateDueDate = (purchaseDate: string, cardId: string) => {
    if (!purchaseDate || !cardId) {
      console.log('Data de compra ou cartão não fornecidos');
      return "";
    }

    const card = cards.find(c => c.id === cardId);
    if (!card) {
      console.log('Cartão não encontrado');
      return "";
    }

    if (!card.closingDay || !card.dueDay) {
      console.log('Cartão sem data de fechamento ou vencimento:', card);
      return "";
    }

    try {
      console.log('Dados para cálculo:', {
        purchaseDate,
        cardId,
        card: {
          ...card,
          closingDay: card.closingDay,
          dueDay: card.dueDay
        }
      });

      // Cria a data da compra usando UTC para evitar problemas com fuso horário
      const [purchaseYear, purchaseMonth, purchaseDay] = purchaseDate.split('-').map(Number);
      const purchase = new Date(Date.UTC(purchaseYear, purchaseMonth - 1, purchaseDay));
      
      // Obtém o ano e mês para o vencimento
      let dueYear = purchase.getUTCFullYear();
      let dueMonth = purchase.getUTCMonth();
      
      console.log('Data da compra:', {
        year: purchaseYear,
        month: purchaseMonth,
        day: purchaseDay,
        date: purchase.toLocaleDateString('pt-BR'),
        closingDay: card.closingDay,
        dueDay: card.dueDay
      });

      // Se a data da compra for depois do fechamento, a fatura vence em um mês adicional
      if (purchase.getUTCDate() > card.closingDay) {
        dueMonth++;
        if (dueMonth > 11) {
          dueMonth = 0;
          dueYear++;
        }
      }

      // Se o dia de fechamento for maior que o dia de vencimento,
      // o vencimento será sempre no mês seguinte ao do fechamento
      if (card.closingDay > card.dueDay) {
        dueMonth++;
        if (dueMonth > 11) {
          dueMonth = 0;
          dueYear++;
        }
      }
      
      // Cria a data de vencimento usando UTC
      const dueDate = new Date(Date.UTC(dueYear, dueMonth, card.dueDay, 12, 0, 0));
      
      console.log('Data de vencimento:', {
        dueYear,
        dueMonth,
        dueDay: card.dueDay,
        finalDate: dueDate.toLocaleDateString('pt-BR')
      });

      // Formata a data no formato YYYY-MM-DD
      const formattedMonth = String(dueDate.getUTCMonth() + 1).padStart(2, '0');
      const formattedDay = String(dueDate.getUTCDate()).padStart(2, '0');
      const dueDateStr = `${dueDate.getUTCFullYear()}-${formattedMonth}-${formattedDay}`;
      
      console.log('Data formatada:', dueDateStr);
      return dueDateStr;
    } catch (error) {
      console.error('Erro ao calcular data de vencimento:', error);
      return "";
    }
  };

  useEffect(() => {
    if (type === "expense-card" && formData.date && formData.cardId) {
      console.log('Calculando data de vencimento:', {
        date: formData.date,
        cardId: formData.cardId
      });
      
      const dueDate = calculateDueDate(formData.date, formData.cardId);
      console.log('Data de vencimento calculada:', dueDate);
      
      setFormData(prev => ({ ...prev, dueDate }));
    }
  }, [formData.date, formData.cardId, type]);

  useEffect(() => {
    if (type === "expense-card") {
      setFormData(prev => ({
        ...prev,
        paymentMethod: "Cartão de Crédito"
      }));
    }
    setLoading(false);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log(' Enviando formulário com dados:', {
      ...formData,
      endRecurrenceDate: formData.endRecurrenceDate,
      recurring: formData.recurring
    });

    try {
      // Preparar dados para envio
      const dataToSubmit = {
        ...formData,
        value: Number(formData.value.replace(/[^\d,]/g, '').replace(',', '.')),
        date: new Date(formData.date).toISOString(),
        dueDate: type === 'expense-card' ? calculateDueDate(formData.date, formData.cardId) : formData.date,
        recurring: formData.recurring,
        endRecurrenceDate: formData.recurring ? null : formData.endRecurrenceDate
      };

      console.log(' Dados preparados para envio:', {
        ...dataToSubmit,
        endRecurrenceDate: dataToSubmit.endRecurrenceDate
      });

      // Chamada para onSubmit
      await onSubmit(dataToSubmit);
      
      // Resetar formulário
      setFormData({
        value: "",
        paid: false,
        recurring: false,
        date: new Date().toISOString().split("T")[0],
        nextDate: "",
        paymentMethod: "",
        category: "",
        subcategory: "",
        fixed: false,
        installments: "",
        description: "",
        cardId: "",
        dueDate: "",
        dueDay: "",
        endRecurrenceDate: null
      });

      onClose();
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFormData({
      ...formData,
      category,
      subcategory: "", // Reset subcategory when category changes
    });
  };

  const getAvailableSubcategories = () => {
    if (!selectedCategory) return [];
    return SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES] || [];
  };

  return (
    <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[1.5rem] font-semibold text-text-primary">
            {type === "expense"
              ? "Nova Despesa"
              : type === "expense-card"
              ? "Nova Despesa no Cartão"
              : "Nova Receita"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.85rem] text-text-secondary">
                R$
              </span>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="w-full pl-10 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                required
                step="0.01"
                min="0"
                style={{ fontSize: '16px' }}
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Linha com Status, Toggle e Data */}
          {type !== "expense-card" && (
            <div className="flex items-center gap-4">
              {/* Status (Pago/Recebido) */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.paid}
                  onChange={(e) =>
                    setFormData({ ...formData, paid: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="status" className="text-[0.85rem] text-text-primary">
                  {type === "income" ? "Recebido" : "Pago"}
                </label>
              </div>

              {/* Toggle Fixa/Variável */}
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer w-20">
                  <input
                    type="checkbox"
                    checked={formData.fixed}
                    onChange={(e) => {
                      if (e.target.checked && formData.recurring) {
                        // Se tentar marcar fixa e já estiver parcelada, desmarca parcelas
                        setFormData({ 
                          ...formData, 
                          fixed: e.target.checked,
                          recurring: false,
                          installments: "" 
                        });
                      } else {
                        setFormData({ ...formData, fixed: e.target.checked });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-full h-6 bg-background rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-card-bg after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[0.75rem] text-gray-600">
                      {formData.fixed ? "Fixa" : ""}
                    </span>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.75rem] text-gray-600">
                      {!formData.fixed ? "Variável" : ""}
                    </span>
                  </div>
                </label>
              </div>

              {/* Data */}
              <div className="flex-1">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          )}

          {type === "expense-card" && (
            <div className="flex items-center gap-4">
              {/* Toggle Fixa/Variável */}
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer w-20">
                  <input
                    type="checkbox"
                    checked={formData.fixed}
                    onChange={(e) => {
                      if (e.target.checked && formData.recurring) {
                        // Se tentar marcar fixa e já estiver parcelada, desmarca parcelas
                        setFormData({ 
                          ...formData, 
                          fixed: e.target.checked,
                          recurring: false,
                          installments: "" 
                        });
                      } else {
                        setFormData({ ...formData, fixed: e.target.checked });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-full h-6 bg-background rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-card-bg after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[0.75rem] text-gray-600">
                      {formData.fixed ? "Fixa" : ""}
                    </span>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.75rem] text-gray-600">
                      {!formData.fixed ? "Variável" : ""}
                    </span>
                  </div>
                </label>
              </div>

              {/* Data */}
              <div className="flex-1">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          )}

          {/* Recorrente, Número de Parcelas e Dia do Vencimento/Recebimento */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => {
                  console.log('Alteração de recorrência:', {
                    checked: e.target.checked,
                    currentFormData: formData
                  });

                  if (e.target.checked && formData.fixed) {
                    // Se tentar marcar parcelas e já estiver fixa, desmarca fixa
                    const newFormData = { 
                      ...formData, 
                      recurring: e.target.checked,
                      fixed: false,
                      endRecurrenceDate: null  // Explicitamente definir como null
                    };
                    
                    console.log('Novo estado após alteração:', newFormData);
                    setFormData(newFormData);
                  } else {
                    // Ao ativar recorrência, limpar data final
                    const newFormData = { 
                      ...formData, 
                      recurring: e.target.checked,
                      endRecurrenceDate: null  // Sempre definir como null
                    };
                    
                    console.log('Novo estado após alteração:', newFormData);
                    setFormData(newFormData);
                  }
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="recurring" className="text-[0.85rem] text-text-primary">
                Parcelas
              </label>
            </div>

            {formData.recurring && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  value={formData.installments}
                  onChange={(e) =>
                    setFormData({ ...formData, installments: e.target.value })
                  }
                  className="w-20 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Qtd"
                  required
                  style={{ fontSize: '16px' }}
                  inputMode="numeric"
                />
                <span className="text-[0.85rem] text-text-secondary">parcelas</span>
              </div>
            )}

            {/* Campo de Dia do Vencimento/Recebimento (aparece se for fixa ou parcelada) */}
            {(formData.fixed || formData.recurring) && type !== "expense-card" && (
              <div className="flex items-center gap-2">
                <label htmlFor="dueDay" className="text-[0.85rem] text-text-primary">
                  {type === "income" ? "Dia do Recebimento" : "Dia do Vencimento"}:
                </label>
                <input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDay: e.target.value })
                  }
                  className="w-16 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                  style={{ fontSize: '16px' }}
                  inputMode="numeric"
                />
              </div>
            )}
          </div>

          {type === "expense-card" && (
            <>
              {/* Cartão */}
              <div>
                <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
                  Cartão
                </label>
                <select
                  name="cardId"
                  value={formData.cardId}
                  onChange={(e) =>
                    setFormData({ ...formData, cardId: e.target.value })
                  }
                  className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                  style={{ fontSize: '16px' }}
                >
                  <option value="">Selecione um cartão</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} (*{card.lastDigits})
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Vencimento */}
              {formData.dueDate && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[0.85rem] text-text-secondary">Vencimento:</span>
                  <span className="text-[0.85rem] font-medium text-text-primary">
                    {new Date(formData.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Método de Pagamento (apenas para despesas) */}
          {type === "expense" && (
            <div>
              <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
                Forma de Pagamento
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                required
                style={{ fontSize: '16px' }}
              >
                <option value="">Selecione um método</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
              required
              style={{ fontSize: '16px' }}
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES[type === "income" ? "income" : "expense"].map(
                (category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Subcategoria */}
          {formData.category && (
            <div>
              <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
                Subcategoria
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                required
                style={{ fontSize: '16px' }}
              >
                <option value="">Selecione uma subcategoria</option>
                {getAvailableSubcategories().map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Descrição (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Adicione uma descrição..."
              inputMode="text"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[0.85rem] text-text-primary hover:bg-background/50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[0.85rem] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
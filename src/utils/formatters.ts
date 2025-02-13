export const formatCurrency = (value: number): string => {
  console.log('Formatando valor:', value);
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDate = (dateString: string | Date) => {
  // Garantir que seja um objeto Date
  const date = dateString instanceof Date 
    ? dateString 
    : new Date(dateString);
  
  // Adicionar 4 horas para corrigir o fuso horário
  const adjustedDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));

  // Logs detalhados para debug
  console.log('Formatação de Data:', {
    inputDate: dateString,
    originalDate: date,
    adjustedDate: adjustedDate,
    year: adjustedDate.getFullYear(),
    month: adjustedDate.getMonth(),
    day: adjustedDate.getDate(),
    hours: adjustedDate.getHours(),
    isoString: adjustedDate.toISOString(),
    localString: adjustedDate.toLocaleDateString('pt-BR')
  });

  // Formatar data
  return adjustedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

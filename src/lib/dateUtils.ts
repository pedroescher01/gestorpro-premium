// Utilitários para manipulação de datas sem problemas de timezone

/**
 * Retorna a data atual no formato YYYY-MM-DD sem problemas de timezone
 */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data no formato YYYY-MM-DD para exibição em pt-BR
 * Usa split para evitar problemas de timezone
 */
export const formatDateBR = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Se a data está no formato YYYY-MM-DD, faz o split direto
    const parts = dateString.split('T')[0].split('-');
    
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    
    // Fallback: tenta criar a data normalmente
    const date = new Date(dateString + 'T00:00:00');
    
    if (isNaN(date.getTime())) {
      return dateString; // Retorna a string original se não conseguir converter
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Converte uma data do formato ISO para YYYY-MM-DD local
 */
export const isoToLocalDate = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

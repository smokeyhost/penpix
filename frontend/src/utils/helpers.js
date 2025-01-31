import axios from 'axios'

export const formatDueDateTime = (dateString) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',  
    day: 'numeric',  
  });

  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,  
  });
  return `${formattedDate} | ${formattedTime}`;
};

export const formatDate = (date) => {
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const convertISOToLocalDate = (isoDate) => {
  const date = new Date(isoDate);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


export const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }
  return text;
};

export const isExpressionValid = async (expression) => {
  const validSymbols = /^[X\d\s~|&^()]+$/;
  if (!validSymbols.test(expression)) {
    return false;
  }

  const containsAllowedSymbol = /X\d/.test(expression);
  if (!containsAllowedSymbol) {
    return false;
  }

  try {
    const response = await axios.post('/detect-gates/validate-expression', { expression });
    return response.data.valid;
  } catch (error) {
    console.error("Error validating expression:", error);
    return false;
  }
};

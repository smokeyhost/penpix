import axios from 'axios'

export const formatDueDateTime = (dateString) => {
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila', // Use Philippine Time
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila', // Use Philippine Time
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
  if (text.length == 0 ) return

  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }
  return text;
};

export const isExpressionValid = async (expression) => {
  const validSymbols = /^[X\d\s~|&^()]+$/;
  if (!validSymbols.test(expression)) {
    console.log("Invalid symbols in expression:", expression);
    return false;
  }
  const containsAllowedSymbol = /X\d/.test(expression);
  if (!containsAllowedSymbol) {
    console.log("Expression does not contain allowed symbols:", expression);
    return false;
  }
  
  try {
    const response = await axios.post('/detect-gates/validate-expression', { expression });
    console.log("Expressions123", response.data.valid)
    return response.data.valid;
  } catch (error) {
    console.error("Error validating expression:", error);
    return false;
  }
};

export const convertSymbols = (expression) => {
  // Replace boolean operators
  let convertedExpression = expression
    .replace(/\^/g, '⊕')  // XOR
    .replace(/&/g, '⋅')   // AND
    .replace(/\|/g, '+')  // OR
    .replace(/~/g, '¬');  // NOT

  // Replace input signals X1 to X8 with A to H
  const inputSignalMap = {
    'X1': 'A',
    'X2': 'B',
    'X3': 'C',
    'X4': 'D',
    'X5': 'E',
    'X6': 'F',
    'X7': 'G',
    'X8': 'H'
  };

  Object.keys(inputSignalMap).forEach(signal => {
    const regex = new RegExp(signal, 'g');
    convertedExpression = convertedExpression.replace(regex, inputSignalMap[signal]);
  });

  return convertedExpression;
};

export const convertExpressionToServerFormat = (expression) => {
  const letterToXMap = {
    'A': 'X1',
    'B': 'X2',
    'C': 'X3',
    'D': 'X4',
    'E': 'X5',
    'F': 'X6',
    'G': 'X7'
  };

  return expression.replace(/[A-G]/g, (match) => letterToXMap[match]);
};

export const convertExpressionToUserFormat = (expression) => {
  const xToLetterMap = {
    'X1': 'A',
    'X2': 'B',
    'X3': 'C',
    'X4': 'D',
    'X5': 'E',
    'X6': 'F',
    'X7': 'G'
  };

  return expression.replace(/X[1-7]/g, (match) => xToLetterMap[match]);
};
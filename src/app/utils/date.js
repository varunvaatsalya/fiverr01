export function formatDateTimeToIST(dateString) {
  const date = new Date(dateString);
  const options = { 
    timeZone: 'Asia/Kolkata', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  };
  return date.toLocaleString('en-GB', options);
}

export function formatDateToIST(dateString) {
  const date = new Date(dateString);
  const options = { 
    timeZone: 'Asia/Kolkata', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
  };
  return date.toLocaleString('en-GB', options);
}

export function formatTimeToIST(dateString) {
  const date = new Date(dateString);
  const options = { 
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  };
  return date.toLocaleString('en-GB', options);
}
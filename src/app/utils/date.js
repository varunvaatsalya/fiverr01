export function formatDateTimeToIST(dateString) {
  try{
  const date = new Date(dateString);
  const options = {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-GB", options);
} catch (error) {
  return "-";
}
}

export function formatDateToIST(dateString) {
  const date = new Date(dateString);
  const options = {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleString("en-GB", options);
}

export function formatTimeToIST(dateString) {
  const date = new Date(dateString);
  const options = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-GB", options);
}

export function timeDifference(startTime, endTime) {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid date");
    }
    const diff = end - start;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return `${diffDays}D ${diffHours}H`;
  } catch (error) {
    return "- -";
  }
}

export function formatShortDateTime(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1; // 0-based indexing
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${day}/${month} ${hours}:${minutes}`;
}

export const daysLeft = (deadline) => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);

  return difference <= 0 ? 0 : Math.floor(remainingDays); // ✅ Fix: Always return a number
};

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);
  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};

export const timeLeft = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const difference = end - now;

  if (difference > 0) {
    let hours = end.getHours();
    let minutes = end.getMinutes().toString().padStart(2, "0");
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; 

    return {
      date: `${end.getDate().toString().padStart(2, "0")}-${(end.getMonth() + 1).toString().padStart(2, "0")}-${end.getFullYear()}`, // Format: DD-MM-YYYY
      time: `${hours}:${minutes} ${ampm}`, // Format: HH:MM AM/PM
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 12),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
    };
  }

  return { date: "Expired", time: "--:-- --", days: 0, hours: 0, minutes: 0 }; // ✅ Fix: Ensure proper expiration format
};

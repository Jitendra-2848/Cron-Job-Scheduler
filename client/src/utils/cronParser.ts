export function parseCronExpression(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return "Custom cron schedule";
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Preset checks
  if (expression === "* * * * *") return "Runs every minute";
  if (expression === "*/5 * * * *") return "Runs every 5 minutes";
  if (expression === "*/15 * * * *") return "Runs every 15 minutes";
  if (expression === "*/30 * * * *") return "Runs every 30 minutes";
  if (expression === "0 * * * *") return "Runs every hour, on the hour";
  if (expression === "0 0 * * *") return "Runs every day at midnight (00:00)";
  if (expression === "0 12 * * *") return "Runs every day at noon (12:00)";
  if (expression === "0 9 * * 1-5") return "Runs Monday through Friday at 09:00 AM";
  if (expression === "0 0 * * 0") return "Runs every Sunday at midnight";
  if (expression === "0 0 1 * *") return "Runs on the 1st of every month at 00:00";

  let result = "Runs ";

  // Minute
  if (minute.startsWith("*/")) {
    result += `every ${minute.replace("*/", "")} minutes `;
  } else if (minute === "*") {
    result += "every minute ";
  } else {
    result += `at minute ${minute} `;
  }

  // Hour
  if (hour.startsWith("*/")) {
    result += `every ${hour.replace("*/", "")} hours `;
  } else if (hour !== "*") {
    const formattedHour = parseInt(hour, 10);
    const ampm = formattedHour >= 12 ? "PM" : "AM";
    const displayHour = formattedHour % 12 === 0 ? 12 : formattedHour % 12;
    result += `at ${displayHour}:${minute.padStart(2, '0')} ${ampm} `;
  }

  // Day of Month
  if (dayOfMonth !== "*") {
    result += `on day ${dayOfMonth} of the month `;
  }

  // Month
  if (month !== "*") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthNum = parseInt(month, 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      result += `in ${months[monthNum - 1]} `;
    }
  }

  // Day of Week
  if (dayOfWeek !== "*") {
    if (dayOfWeek === "1-5") {
      result += "on weekdays";
    } else if (dayOfWeek === "0,6" || dayOfWeek === "6,0") {
      result += "on weekends";
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayNum = parseInt(dayOfWeek, 10);
      if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
        result += `on ${days[dayNum]}`;
      }
    }
  }

  return result.trim();
}

export function formatTimeAgo(timestampStr: string): string {
  if (!timestampStr) return "Never";
  return timestampStr;
}

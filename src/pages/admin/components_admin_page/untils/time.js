// src/utils/time.js
export function formatMessageTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const hhmm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return hhmm;
  if (isYesterday) return `вчера ${hhmm}`;
  return `${d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })} ${hhmm}`;
}

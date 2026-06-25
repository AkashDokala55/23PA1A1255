const notifications = [
  { id: "1", type: "Placement", message: "Amazon Hiring", timestamp: "2026-04-22T17:51:18" },
  { id: "2", type: "Result", message: "Mid Sem Result", timestamp: "2026-04-22T17:51:30" },
  { id: "3", type: "Event", message: "Tech Fest", timestamp: "2026-04-22T17:50:06" },
  { id: "4", type: "Placement", message: "Microsoft Hiring", timestamp: "2026-04-22T17:49:42" },
  { id: "5", type: "Result", message: "Project Review", timestamp: "2026-04-22T17:50:54" },
  { id: "6", type: "Placement", message: "Google Hiring", timestamp: "2026-04-22T17:48:12" },
  { id: "7", type: "Event", message: "Farewell", timestamp: "2026-04-22T17:51:06" },
  { id: "8", type: "Result", message: "External Results", timestamp: "2026-04-22T17:50:30" },
  { id: "9", type: "Placement", message: "Adobe Hiring", timestamp: "2026-04-22T17:47:55" },
  { id: "10", type: "Event", message: "Hackathon", timestamp: "2026-04-22T17:49:10" }
];
function getPriority(type) {
  switch (type.toLowerCase()) {
    case "placement":
      return 3;
    case "result":
      return 2;
    case "event":
      return 1;
    default:
      return 0;
  }
}
notifications.sort((a, b) => {
  const p = getPriority(b.type) - getPriority(a.type);
  if (p !== 0) return p;
  return new Date(b.timestamp) - new Date(a.timestamp);
});
console.log("Top Priority Notifications\n");
notifications.slice(0, 10).forEach((n, i) => {
  console.log(`${i + 1}. ${n.type} - ${n.message} (${n.timestamp})`);
});
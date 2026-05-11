export const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-400 border border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  Medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

export const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  "In Progress": "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  Completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  Cancelled: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};
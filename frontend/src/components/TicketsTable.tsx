import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Eye,
  FilterX,
  PlayCircle,
  Search,
} from "lucide-react";
import type { MaintenanceTicket, Technician } from "../types";
import { PRIORITY_STYLES, STATUS_STYLES } from "../constants/ticketStyles";
import Pagination from "./Pagination";

type TicketsTableProps = {
  tickets: MaintenanceTicket[];
  technicians: Technician[];
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onViewTicket: (ticket: MaintenanceTicket) => void;
  onStartTicket: (ticketId: number) => void;
  onCompleteTicket: (ticket: MaintenanceTicket) => void;
  onAssignTechnician: (ticketId: number, technicianId: string) => void;
};

export default function TicketsTable({
  tickets,
  technicians,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewTicket,
  onStartTicket,
  onCompleteTicket,
  onAssignTechnician,
}: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredTickets = tickets.filter((ticket) => {
    const searchText = `
      ${ticket.ticket_no}
      ${ticket.issue_title}
      ${ticket.issue_description}
      ${ticket.issue_category ?? ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    onPageChange(1);
  }

  const hasActiveFilter =
    searchTerm || statusFilter !== "All" || priorityFilter !== "All";

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d1017]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Maintenance Tickets
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {filteredTickets.length} shown from {tickets.length} total record
            {tickets.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Bot size={14} className="text-cyan-500" />
          <span className="text-xs text-slate-500">AI-assisted analysis</span>
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/[0.06] px-6 py-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onPageChange(1);
            }}
            placeholder="Search ticket no, issue title, category, or description..."
            className="w-full rounded-lg border border-white/[0.08] bg-[#131820] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/60"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            onPageChange(1);
          }}
          className="rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/60"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            onPageChange(1);
          }}
          className="rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/60"
        >
          <option value="All">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.08] md:col-span-4"
          >
            <FilterX size={14} />
            Reset Filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              <th className="px-6 py-3 text-left">Ticket No.</th>
              <th className="px-6 py-3 text-left">Issue</th>
              <th className="px-6 py-3 text-left">Priority</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">AI Root Cause</th>
              <th className="px-6 py-3 text-left">AI Recommended Action</th>
              <th className="px-6 py-3 text-left">Est. Hours</th>
              <th className="px-6 py-3 text-left">Assign</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedTickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`border-b border-white/[0.04] align-top transition-colors hover:bg-white/[0.025] ${
                  index % 2 === 0 ? "" : "bg-white/[0.01]"
                }`}
              >
                <td className="px-6 py-4">
                  <span className="rounded bg-cyan-500/10 px-2 py-1 font-mono text-xs font-semibold text-cyan-400">
                    {ticket.ticket_no}
                  </span>
                </td>

                <td className="max-w-[220px] px-6 py-4">
                  <p className="text-sm font-medium text-white">
                    {ticket.issue_title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {ticket.issue_description}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      PRIORITY_STYLES[ticket.priority] ??
                      "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      STATUS_STYLES[ticket.status] ??
                      "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>

                <td className="max-w-[220px] px-6 py-4">
                  <p className="text-xs leading-relaxed text-slate-400">
                    {ticket.ai_possible_root_cause || (
                      <span className="italic text-slate-600">
                        Pending analysis
                      </span>
                    )}
                  </p>
                </td>

                <td className="max-w-[220px] px-6 py-4">
                  <p className="text-xs leading-relaxed text-slate-400">
                    {ticket.ai_recommended_action || (
                      <span className="italic text-slate-600">Awaiting AI</span>
                    )}
                  </p>
                </td>

                <td className="px-6 py-4">
                  {ticket.estimated_repair_hours != null ? (
                    <span className="text-sm font-semibold text-white">
                      {ticket.estimated_repair_hours}
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        hrs
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs italic text-slate-600">—</span>
                  )}
                </td>

                <td className="min-w-[170px] px-6 py-4">
                  <select
                    value={ticket.technician_id ?? ""}
                    onChange={(e) =>
                      onAssignTechnician(ticket.id, e.target.value)
                    }
                    className="w-full rounded-lg border border-white/[0.08] bg-[#131820] px-2 py-2 text-xs text-white outline-none focus:border-cyan-500/60"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.full_name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onViewTicket(ticket)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08]"
                      type="button"
                    >
                      <Eye size={13} />
                      View
                    </button>

                    {ticket.status === "Open" && (
                      <button
                        onClick={() => onStartTicket(ticket.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/20"
                        type="button"
                      >
                        <PlayCircle size={13} />
                        Start
                      </button>
                    )}

                    {ticket.status !== "Completed" && (
                      <button
                        onClick={() => onCompleteTicket(ticket)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                        type="button"
                      >
                        <CheckCircle2 size={13} />
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                      <AlertTriangle size={20} className="text-slate-600" />
                    </div>

                    <p className="text-sm text-slate-500">No tickets found.</p>

                    <p className="text-xs text-slate-600">
                      Try changing the search keyword or filter selection.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredTickets.length}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </section>
  );
}
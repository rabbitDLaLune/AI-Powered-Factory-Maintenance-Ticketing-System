import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Cpu,
  Users,
  Plus,
  ChevronDown,
  Zap,
  Activity,
  X,
} from "lucide-react";
import { api } from "./api/api";
import TicketsTable from "./components/TicketsTable";
import type {
  DashboardSummary,
  Machine,
  MaintenanceTicket,
  Technician,
} from "./types";

export default function App() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);

  const [activePanel, setActivePanel] = useState<
    "machine" | "technician" | "ticket" | null
  >(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [machineCode, setMachineCode] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineLocation, setMachineLocation] = useState("");
  const [machineType, setMachineType] = useState("");

  const [technicianName, setTechnicianName] = useState("");
  const [technicianEmail, setTechnicianEmail] = useState("");
  const [technicianPhone, setTechnicianPhone] = useState("");
  const [skillArea, setSkillArea] = useState("");

  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueCategory, setIssueCategory] = useState("");

  const [selectedTicket, setSelectedTicket] =
    useState<MaintenanceTicket | null>(null);
  const [completeTicketId, setCompleteTicketId] = useState<number | null>(null);

  const [completionRootCause, setCompletionRootCause] = useState("");
  const [completionActionTaken, setCompletionActionTaken] = useState("");
  const [completionSpareParts, setCompletionSpareParts] = useState("");
  const [completionDowntimeStart, setCompletionDowntimeStart] = useState("");
  const [completionDowntimeEnd, setCompletionDowntimeEnd] = useState("");

  async function loadData() {
    const [machineRes, technicianRes, ticketRes, dashboardRes] =
      await Promise.all([
        api.get("/machines/"),
        api.get("/technicians/"),
        api.get("/tickets/"),
        api.get("/dashboard/summary"),
      ]);

    setMachines(machineRes.data);
    setTechnicians(technicianRes.data);
    setTickets(ticketRes.data);
    setDashboardSummary(dashboardRes.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createMachine(e: React.FormEvent) {
    e.preventDefault();

    await api.post("/machines/", {
      machine_code: machineCode,
      name: machineName,
      location: machineLocation,
      machine_type: machineType,
      status: "Running",
    });

    setMachineCode("");
    setMachineName("");
    setMachineLocation("");
    setMachineType("");

    await loadData();
    setCurrentPage(1);
    setActivePanel(null);
  }

  async function createTechnician(e: React.FormEvent) {
    e.preventDefault();

    await api.post("/technicians/", {
      full_name: technicianName,
      email: technicianEmail || null,
      phone: technicianPhone || null,
      skill_area: skillArea || null,
    });

    setTechnicianName("");
    setTechnicianEmail("");
    setTechnicianPhone("");
    setSkillArea("");

    await loadData();
    setCurrentPage(1);
    setActivePanel(null);
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();

    await api.post("/tickets/", {
      machine_id: Number(selectedMachineId),
      technician_id: selectedTechnicianId
        ? Number(selectedTechnicianId)
        : null,
      issue_title: issueTitle,
      issue_description: issueDescription,
      issue_category: issueCategory || null,
    });

    setSelectedMachineId("");
    setSelectedTechnicianId("");
    setIssueTitle("");
    setIssueDescription("");
    setIssueCategory("");

    await loadData();
    setCurrentPage(1);
    setActivePanel(null);
  }

  async function updateTicketStatus(ticketId: number, status: string) {
    await api.patch(`/tickets/${ticketId}/status`, { status });
    await loadData();
  }

  async function assignTechnician(ticketId: number, technicianId: string) {
    await api.patch(`/tickets/${ticketId}/assign`, {
      technician_id: technicianId ? Number(technicianId) : null,
    });

    await loadData();
  }

  function openCompleteModal(ticket: MaintenanceTicket) {
    setCompleteTicketId(ticket.id);
    setCompletionRootCause(
      ticket.root_cause || ticket.ai_possible_root_cause || ""
    );
    setCompletionActionTaken(
      ticket.action_taken || ticket.ai_recommended_action || ""
    );
    setCompletionSpareParts(ticket.spare_parts_used || "");
    setCompletionDowntimeStart(
      ticket.downtime_start ? ticket.downtime_start.slice(0, 16) : ""
    );
    setCompletionDowntimeEnd(
      ticket.downtime_end ? ticket.downtime_end.slice(0, 16) : ""
    );
  }

  async function completeTicket(e: React.FormEvent) {
    e.preventDefault();

    if (!completeTicketId) return;

    await api.patch(`/tickets/${completeTicketId}/complete`, {
      root_cause: completionRootCause,
      action_taken: completionActionTaken,
      spare_parts_used: completionSpareParts || null,
      downtime_start: completionDowntimeStart
        ? new Date(completionDowntimeStart).toISOString()
        : null,
      downtime_end: completionDowntimeEnd
        ? new Date(completionDowntimeEnd).toISOString()
        : null,
    });

    setCompleteTicketId(null);
    setCompletionRootCause("");
    setCompletionActionTaken("");
    setCompletionSpareParts("");
    setCompletionDowntimeStart("");
    setCompletionDowntimeEnd("");

    await loadData();
    setCurrentPage(1);
  }

  const openTickets = dashboardSummary?.ticket_summary.open ?? 0;
  const inProgressTickets = dashboardSummary?.ticket_summary.in_progress ?? 0;
  const criticalTickets = dashboardSummary?.priority_summary.critical ?? 0;
  const machinesDown = dashboardSummary?.machine_summary.down ?? 0;
  const completedTickets = dashboardSummary?.ticket_summary.completed ?? 0;
  const averageRepairHours =
    dashboardSummary?.performance_summary.average_estimated_repair_hours ?? 0;

  return (
    <main className="min-h-screen bg-[#0a0c10] font-sans text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0d1017]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Zap size={14} className="text-white" />
            </div>

            <span className="text-sm font-semibold tracking-wide text-white">
              MaintainAI
            </span>

            <span className="hidden rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:block">
              MAINTENANCE AI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500">API Connected</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
            Full-Stack Python + React Portfolio Project
          </p>

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            AI-Powered Factory Maintenance
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Ticketing System
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            A manufacturing-focused maintenance system built to manage machines,
            technicians, breakdown tickets, downtime records, and AI-assisted
            maintenance analysis.
          </p>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            title="Machines"
            value={machines.length}
            icon={<Cpu size={16} />}
            accent="cyan"
            delta={`${machinesDown} machine down`}
          />

          <KpiCard
            title="Open Tickets"
            value={openTickets}
            icon={<Activity size={16} />}
            accent="amber"
            delta={`${inProgressTickets} in progress`}
          />

          <KpiCard
            title="Critical"
            value={criticalTickets}
            icon={<AlertTriangle size={16} />}
            accent="red"
            delta="Requires action"
          />

          <KpiCard
            title="Avg Repair"
            value={averageRepairHours}
            icon={<Bot size={16} />}
            accent="blue"
            delta={`${completedTickets} completed`}
          />
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          {(["machine", "technician", "ticket"] as const).map((panel) => (
            <button
              key={panel}
              type="button"
              onClick={() =>
                setActivePanel(activePanel === panel ? null : panel)
              }
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activePanel === panel
                  ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                  : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Plus
                size={14}
                className={
                  activePanel === panel
                    ? "rotate-45 transition-transform"
                    : "transition-transform"
                }
              />

              {panel === "machine"
                ? "Add Machine"
                : panel === "technician"
                ? "Add Technician"
                : "New Ticket"}

              <ChevronDown
                size={12}
                className={`transition-transform ${
                  activePanel === panel ? "rotate-180" : ""
                }`}
              />
            </button>
          ))}
        </section>

        {activePanel === "machine" && (
          <FormPanel
            title="Register New Machine"
            onSubmit={createMachine}
            submitLabel="Save Machine"
          >
            <FieldRow>
              <Field
                label="Machine Code"
                value={machineCode}
                onChange={setMachineCode}
                placeholder="e.g. CNC-001"
                required
              />
              <Field
                label="Machine Name"
                value={machineName}
                onChange={setMachineName}
                placeholder="e.g. Lathe Unit A"
                required
              />
            </FieldRow>

            <FieldRow>
              <Field
                label="Location"
                value={machineLocation}
                onChange={setMachineLocation}
                placeholder="e.g. Bay 3, Floor 2"
                required
              />
              <Field
                label="Machine Type"
                value={machineType}
                onChange={setMachineType}
                placeholder="e.g. CNC, Hydraulic"
                required
              />
            </FieldRow>
          </FormPanel>
        )}

        {activePanel === "technician" && (
          <FormPanel
            title="Register Technician"
            onSubmit={createTechnician}
            submitLabel="Save Technician"
          >
            <FieldRow>
              <Field
                label="Full Name"
                value={technicianName}
                onChange={setTechnicianName}
                placeholder="e.g. Ahmad Zaki"
                required
              />
              <Field
                label="Email"
                value={technicianEmail}
                onChange={setTechnicianEmail}
                placeholder="email@factory.com"
              />
            </FieldRow>

            <FieldRow>
              <Field
                label="Phone"
                value={technicianPhone}
                onChange={setTechnicianPhone}
                placeholder="+60 12-345 6789"
              />
              <Field
                label="Skill Area"
                value={skillArea}
                onChange={setSkillArea}
                placeholder="e.g. Hydraulics, Electrical"
              />
            </FieldRow>
          </FormPanel>
        )}

        {activePanel === "ticket" && (
          <FormPanel
            title="Create Maintenance Ticket"
            onSubmit={createTicket}
            submitLabel="Create Ticket with AI"
            accent
          >
            <FieldRow>
              <SelectField
                label="Machine"
                value={selectedMachineId}
                onChange={setSelectedMachineId}
                required
              >
                <option value="">Select Machine</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.machine_code} — {machine.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Assign Technician"
                value={selectedTechnicianId}
                onChange={setSelectedTechnicianId}
              >
                <option value="">Unassigned</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.full_name}
                  </option>
                ))}
              </SelectField>
            </FieldRow>

            <FieldRow>
              <Field
                label="Issue Title"
                value={issueTitle}
                onChange={setIssueTitle}
                placeholder="Brief description of issue"
                required
              />
              <Field
                label="Category"
                value={issueCategory}
                onChange={setIssueCategory}
                placeholder="e.g. Mechanical, Electrical"
              />
            </FieldRow>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Issue Description *
              </label>

              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the malfunction in detail. The system will analyze priority, possible root cause, and recommended action."
                className="min-h-[100px] resize-none rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                required
              />
            </div>
          </FormPanel>
        )}

        {dashboardSummary && (
          <DashboardAnalytics dashboardSummary={dashboardSummary} />
        )}

        {dashboardSummary &&
          dashboardSummary.recent_critical_tickets.length > 0 && (
            <RecentCriticalTickets dashboardSummary={dashboardSummary} />
          )}

        <TicketsTable
          tickets={tickets}
          technicians={technicians}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onViewTicket={setSelectedTicket}
          onStartTicket={(ticketId) =>
            updateTicketStatus(ticketId, "In Progress")
          }
          onCompleteTicket={openCompleteModal}
          onAssignTechnician={assignTechnician}
        />

        <PortfolioFooter />
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {completeTicketId && (
        <CompleteTicketModal
          completionRootCause={completionRootCause}
          completionActionTaken={completionActionTaken}
          completionSpareParts={completionSpareParts}
          completionDowntimeStart={completionDowntimeStart}
          completionDowntimeEnd={completionDowntimeEnd}
          setCompletionRootCause={setCompletionRootCause}
          setCompletionActionTaken={setCompletionActionTaken}
          setCompletionSpareParts={setCompletionSpareParts}
          setCompletionDowntimeStart={setCompletionDowntimeStart}
          setCompletionDowntimeEnd={setCompletionDowntimeEnd}
          onClose={() => setCompleteTicketId(null)}
          onSubmit={completeTicket}
        />
      )}
    </main>
  );
}

function DashboardAnalytics({
  dashboardSummary,
}: {
  dashboardSummary: DashboardSummary;
}) {
  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-3">
      <AnalyticsCard title="Ticket Status Breakdown">
        <AnalyticsBar
          label="Open"
          value={dashboardSummary.ticket_summary.open}
          total={dashboardSummary.ticket_summary.total}
          tone="blue"
        />
        <AnalyticsBar
          label="In Progress"
          value={dashboardSummary.ticket_summary.in_progress}
          total={dashboardSummary.ticket_summary.total}
          tone="purple"
        />
        <AnalyticsBar
          label="Completed"
          value={dashboardSummary.ticket_summary.completed}
          total={dashboardSummary.ticket_summary.total}
          tone="emerald"
        />
        <AnalyticsBar
          label="Cancelled"
          value={dashboardSummary.ticket_summary.cancelled}
          total={dashboardSummary.ticket_summary.total}
          tone="slate"
        />
      </AnalyticsCard>

      <AnalyticsCard title="Priority Distribution">
        <AnalyticsBar
          label="Critical"
          value={dashboardSummary.priority_summary.critical}
          total={dashboardSummary.ticket_summary.total}
          tone="red"
        />
        <AnalyticsBar
          label="High"
          value={dashboardSummary.priority_summary.high}
          total={dashboardSummary.ticket_summary.total}
          tone="orange"
        />
        <AnalyticsBar
          label="Medium"
          value={dashboardSummary.priority_summary.medium}
          total={dashboardSummary.ticket_summary.total}
          tone="yellow"
        />
        <AnalyticsBar
          label="Low"
          value={dashboardSummary.priority_summary.low}
          total={dashboardSummary.ticket_summary.total}
          tone="emerald"
        />
      </AnalyticsCard>

      <AnalyticsCard title="Machine Condition">
        <AnalyticsBar
          label="Running"
          value={dashboardSummary.machine_summary.running}
          total={dashboardSummary.machine_summary.total}
          tone="emerald"
        />
        <AnalyticsBar
          label="Down"
          value={dashboardSummary.machine_summary.down}
          total={dashboardSummary.machine_summary.total}
          tone="red"
        />
        <AnalyticsBar
          label="Maintenance"
          value={dashboardSummary.machine_summary.maintenance}
          total={dashboardSummary.machine_summary.total}
          tone="blue"
        />

        <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Average Estimated Repair Time
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {
              dashboardSummary.performance_summary
                .average_estimated_repair_hours
            }
            <span className="ml-1 text-xs font-normal text-slate-500">
              hrs
            </span>
          </p>
        </div>
      </AnalyticsCard>
    </section>
  );
}

function RecentCriticalTickets({
  dashboardSummary,
}: {
  dashboardSummary: DashboardSummary;
}) {
  return (
    <section className="mb-8 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-400" />
        <h2 className="text-sm font-semibold text-white">
          Recent Critical Tickets
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {dashboardSummary.recent_critical_tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-lg border border-red-500/20 bg-[#0d1017] p-4"
          >
            <p className="font-mono text-xs font-semibold text-red-400">
              {ticket.ticket_no}
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {ticket.issue_title}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2 py-1 text-[11px] font-semibold text-red-400">
                {ticket.priority}
              </span>
              <span className="text-xs text-slate-500">{ticket.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  icon,
  accent,
  delta,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  delta: string;
}) {
  const accentMap: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const textMap: Record<string, string> = {
    cyan: "text-cyan-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1017] p-5 transition-colors hover:border-white/[0.12]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accentMap[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="text-3xl font-bold tabular-nums text-white">{value}</p>
      <p className={`mt-1 text-xs ${textMap[accent]}`}>{delta}</p>
    </div>
  );
}

function AnalyticsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1017] p-5">
      <h2 className="mb-5 text-sm font-semibold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AnalyticsBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const toneMap: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
    slate: "bg-slate-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="text-xs text-slate-500">
          {value} / {total}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${toneMap[tone] ?? "bg-cyan-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FormPanel({
  title,
  onSubmit,
  submitLabel,
  children,
  accent,
}: {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#0d1017] p-6">
      <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
        {title}
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              accent
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
                : "border border-white/[0.1] bg-white/[0.08] text-white hover:bg-white/[0.13]"
            }`}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
        {required && " *"}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
        {required && " *"}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
      >
        {children}
      </select>
    </div>
  );
}

function TicketDetailModal({
  ticket,
  onClose,
}: {
  ticket: MaintenanceTicket;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl rounded-xl border border-white/[0.08] bg-[#0d1017] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="font-mono text-xs text-cyan-400">
              {ticket.ticket_no}
            </p>
            <h3 className="text-lg font-semibold text-white">
              {ticket.issue_title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 hover:text-white"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Priority" value={ticket.priority} />
            <DetailItem label="Status" value={ticket.status} />
            <DetailItem
              label="Issue Category"
              value={ticket.issue_category || "Not specified"}
            />
            <DetailItem
              label="Estimated Repair Hours"
              value={
                ticket.estimated_repair_hours != null
                  ? `${ticket.estimated_repair_hours} hrs`
                  : "Not available"
              }
            />
            <DetailItem label="Created At" value={formatDate(ticket.created_at)} />
            <DetailItem
              label="Completed At"
              value={
                ticket.completed_at
                  ? formatDate(ticket.completed_at)
                  : "Not completed"
              }
            />
            <DetailItem
              label="Downtime Start"
              value={
                ticket.downtime_start
                  ? formatDate(ticket.downtime_start)
                  : "Not recorded"
              }
            />
            <DetailItem
              label="Downtime End"
              value={
                ticket.downtime_end
                  ? formatDate(ticket.downtime_end)
                  : "Not recorded"
              }
            />
          </div>

          <div className="mt-5 space-y-4">
            <DetailBlock
              label="Issue Description"
              value={ticket.issue_description}
            />
            <DetailBlock
              label="AI Possible Root Cause"
              value={ticket.ai_possible_root_cause || "Pending AI analysis"}
            />
            <DetailBlock
              label="AI Recommended Action"
              value={ticket.ai_recommended_action || "Pending AI recommendation"}
            />
            <DetailBlock
              label="Final Root Cause"
              value={ticket.root_cause || "Not submitted yet"}
            />
            <DetailBlock
              label="Action Taken"
              value={ticket.action_taken || "Not submitted yet"}
            />
            <DetailBlock
              label="Spare Parts Used"
              value={ticket.spare_parts_used || "None recorded"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteTicketModal({
  completionRootCause,
  completionActionTaken,
  completionSpareParts,
  completionDowntimeStart,
  completionDowntimeEnd,
  setCompletionRootCause,
  setCompletionActionTaken,
  setCompletionSpareParts,
  setCompletionDowntimeStart,
  setCompletionDowntimeEnd,
  onClose,
  onSubmit,
}: {
  completionRootCause: string;
  completionActionTaken: string;
  completionSpareParts: string;
  completionDowntimeStart: string;
  completionDowntimeEnd: string;
  setCompletionRootCause: (value: string) => void;
  setCompletionActionTaken: (value: string) => void;
  setCompletionSpareParts: (value: string) => void;
  setCompletionDowntimeStart: (value: string) => void;
  setCompletionDowntimeEnd: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl rounded-xl border border-white/[0.08] bg-[#0d1017] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Complete Maintenance Ticket
            </p>
            <h3 className="text-lg font-semibold text-white">
              Submit repair findings
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 hover:text-white"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField
              label="Downtime Start"
              value={completionDowntimeStart}
              onChange={setCompletionDowntimeStart}
            />

            <DateTimeField
              label="Downtime End"
              value={completionDowntimeEnd}
              onChange={setCompletionDowntimeEnd}
            />
          </div>

          <TextAreaField
            label="Final Root Cause"
            value={completionRootCause}
            onChange={setCompletionRootCause}
            required
          />

          <TextAreaField
            label="Action Taken"
            value={completionActionTaken}
            onChange={setCompletionActionTaken}
            required
          />

          <TextAreaField
            label="Spare Parts Used"
            value={completionSpareParts}
            onChange={setCompletionSpareParts}
            placeholder="Example: Bearing set, oil seal, sensor cable..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.08]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-semibold text-white hover:from-emerald-400 hover:to-green-500"
            >
              Complete Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/60"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
        {required && " *"}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="min-h-[90px] resize-none rounded-lg border border-white/[0.08] bg-[#131820] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/60"
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
        {value}
      </p>
    </div>
  );
}

function PortfolioFooter() {
  return (
    <div className="mt-8 border-t border-white/[0.06] pt-5 text-center">
      <p className="text-xs text-slate-600">
        MaintainAI · AI-Powered Factory Maintenance Ticketing System · Designed
        and developed by Khairulnizam
      </p>
      <p className="mt-1 text-[11px] text-slate-700">
        Full-stack portfolio project built with React, TypeScript, Python
        FastAPI, MySQL, and AI-assisted maintenance logic.
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
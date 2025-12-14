"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Filter,
  MapPin,
  Phone,
  Plus,
  Search,
  Settings,
  Video,
} from "lucide-react"

/** -----------------------------
 *  TYPES
 *  ----------------------------- */
type ProjectRef = {
  id: string
  title: string
  address: string
  status:
    | "In Prüfung"
    | "Ortstermin geplant"
    | "Auswertung läuft"
    | "Gutachten in Vorbereitung"
    | "Abgeschlossen"
}

type AppointmentType = "Ortstermin" | "Telefon" | "Online" | "Frist" | "Interner Meilenstein"
type AppointmentStatus = "angefragt" | "bestätigt" | "geplant" | "erledigt" | "verschoben" | "abgesagt"

type Appointment = {
  id: string
  projectId: string
  title: string
  type: AppointmentType
  status: AppointmentStatus
  dateISO: string // YYYY-MM-DD
  start?: string // HH:MM
  end?: string // HH:MM
  location?: string
  note?: string
  prep?: { id: string; text: string; done: boolean }[]
  createdBy?: "Sie" | "Gutachterteam"
  originalDateISO?: string
  originalStart?: string
}

/** -----------------------------
 *  DEMO DATA
 *  ----------------------------- */
const projects: ProjectRef[] = [
  {
    id: "p-001",
    title: "Feuchtigkeitsprüfung – EFH",
    address: "Westring 12, 48143 Münster",
    status: "Auswertung läuft",
  },
  {
    id: "p-003",
    title: "Sanierungsbewertung – Altbau",
    address: "Hauptstraße 88, 48143 Münster",
    status: "In Prüfung",
  },
  {
    id: "p-007",
    title: "Bauabnahme – Neubau",
    address: "Am Park 4, 48155 Münster",
    status: "Ortstermin geplant",
  },
]

const appointments: Appointment[] = [
  {
    id: "t-001",
    projectId: "p-007",
    title: "Ortstermin – Bauabnahme (B...",
    type: "Ortstermin",
    status: "bestätigt",
    dateISO: "2025-12-18",
    start: "10:00",
    end: "12:00",
    location: "Am Park 4, 48155 Münster",
    note: "Bitte Bauunterlagen + Übergabeprotokoll bereithalten (Demo).",
    prep: [
      { id: "p1", text: "Zugang zu allen Räumen sicherstellen", done: true },
      { id: "p2", text: "Bauunterlagen / Pläne bereitlegen", done: false },
      { id: "p3", text: "Mängel-Fotokamera/Handy bereit", done: false },
    ],
    createdBy: "Gutachterteam",
  },
  {
    id: "t-002",
    projectId: "p-001",
    title: "Telefontermin – Rückfragen F...",
    type: "Telefon",
    status: "geplant",
    dateISO: "2025-12-16",
    start: "15:30",
    end: "15:50",
    note: "Kurzes Update + offene Fragen zur Nutzung/Lüftung (Demo).",
    createdBy: "Gutachterteam",
  },
  {
    id: "t-003",
    projectId: "p-003",
    title: "Online-Call – Maßnahmenpaket abstimmen",
    type: "Online",
    status: "angefragt",
    dateISO: "2025-12-20",
    start: "09:00",
    end: "09:30",
    note: "Bitte 2–3 Rückfragen vorab notieren (Demo).",
    createdBy: "Gutachterteam",
  },
  {
    id: "t-004",
    projectId: "p-001",
    title: "Frist: Fotos Keller/Bad nach...",
    type: "Frist",
    status: "geplant",
    dateISO: "2025-12-15",
    note: "Fotos beschleunigen die Auswertung (Demo).",
    createdBy: "Gutachterteam",
  },
  {
    id: "t-005",
    projectId: "p-001",
    title: "Ortstermin – Messpunkte Keller (bereits erfolgt)",
    type: "Ortstermin",
    status: "erledigt",
    dateISO: "2025-12-10",
    start: "08:30",
    end: "10:00",
    location: "Westring 12, 48143 Münster",
    note: "Messpunkte aufgenommen, Foto-Doku begonnen (Demo).",
    createdBy: "Gutachterteam",
  },
  {
    id: "t-006",
    projectId: "p-003",
    title: "Termin verschoben – Vor-Ort Begehung",
    type: "Ortstermin",
    status: "verschoben",
    dateISO: "2025-12-22",
    start: "13:00",
    end: "14:30",
    originalDateISO: "2025-12-19",
    originalStart: "11:30",
    location: "Hauptstraße 88, 48143 Münster",
    note: "Terminverschiebung wegen Verfügbarkeit (Demo).",
    createdBy: "Sie",
  },
]

/** -----------------------------
 *  DATE HELPERS
 *  ----------------------------- */
type MonthModel = { year: number; month0: number } // month0: 0..11
function pad2(n: number) {
  return n.toString().padStart(2, "0")
}
function isoDate(y: number, m0: number, d: number) {
  return `${y}-${pad2(m0 + 1)}-${pad2(d)}`
}
function monthTitle(y: number, m0: number) {
  const names = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ]
  return `${names[m0]} ${y}`
}
function dayOfWeekMon0Sun6(y: number, m0: number, d: number) {
  const js = new Date(y, m0, d).getDay() // 0=Sun..6=Sat
  return (js + 6) % 7 // Mon=0..Sun=6
}
function daysInMonth(y: number, m0: number) {
  return new Date(y, m0 + 1, 0).getDate()
}

/** -----------------------------
 *  UI HELPERS
 *  ----------------------------- */
function typeIcon(type: AppointmentType) {
  switch (type) {
    case "Ortstermin":
      return MapPin
    case "Telefon":
      return Phone
    case "Online":
      return Video
    case "Frist":
      return AlertTriangle
    case "Interner Meilenstein":
      return CheckCircle2
  }
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 items-start gap-2">
      <div className="col-span-4 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="col-span-8">{children}</div>
    </div>
  )
}
function statusTone(s: AppointmentStatus) {
  switch (s) {
    case "bestätigt":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "geplant":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "angefragt":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "erledigt":
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300"
    case "verschoben":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
    case "abgesagt":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  }
}

function typeTone(t: AppointmentType) {
  switch (t) {
    case "Ortstermin":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "Telefon":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-300"
    case "Online":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
    case "Frist":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Interner Meilenstein":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
}

function timeRange(a: Appointment) {
  if (!a.start && !a.end) return "—"
  if (a.start && a.end) return `${a.start} – ${a.end}`
  return a.start ?? a.end ?? "—"
}

function projectLabel(projectId: string) {
  const p = projects.find((x) => x.id === projectId)
  return p ? p.title : projectId
}
function projectAddress(projectId: string) {
  const p = projects.find((x) => x.id === projectId)
  return p ? p.address : "—"
}

/** -----------------------------
 *  SMALL BUILDING BLOCKS
 *  ----------------------------- */
function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  )
}

function MonthGrid({
  month,
  marked,
  selectedISO,
  onSelect,
}: {
  month: MonthModel
  marked: Record<string, number> // iso -> count
  selectedISO: string | null
  onSelect: (iso: string) => void
}) {
  const { year, month0 } = month
  const dim = daysInMonth(year, month0)
  const startDow = dayOfWeekMon0Sun6(year, month0, 1)

  const cells: Array<{ iso: string | null; d: number | null }> = []
  for (let i = 0; i < startDow; i++) cells.push({ iso: null, d: null })
  for (let d = 1; d <= dim; d++) cells.push({ iso: isoDate(year, month0, d), d })
  while (cells.length % 7 !== 0) cells.push({ iso: null, d: null })

  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
        {weekdays.map((w) => (
          <div key={w} className="px-1 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((c, idx) => {
          if (!c.iso || !c.d) {
            return <div key={idx} className="h-16 rounded-lg bg-muted/20" />
          }

          const count = marked[c.iso] ?? 0
          const isSelected = selectedISO === c.iso
          const isMarked = count > 0

          return (
            <button
              key={c.iso}
              type="button"
              onClick={() => onSelect(c.iso!)}
              className={[
                "group relative h-16 rounded-lg border bg-background px-2 py-2 text-left hover:bg-muted/20",
                isSelected ? "border-primary/50 bg-primary/5" : "border-muted",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <span className={["text-xs font-medium", isSelected ? "text-foreground" : "text-muted-foreground"].join(" ")}>
                  {c.d}
                </span>
                {isMarked ? (
                  <span className="inline-flex items-center rounded-full bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground border">
                    {count}
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-2 left-2 flex gap-1">
                {isMarked ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500/80" />
                    {count >= 2 ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" /> : null}
                    {count >= 3 ? <span className="h-1.5 w-1.5 rounded-full bg-violet-500/80" /> : null}
                  </>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AppointmentCard({
  a,
  onOpen,
  compact = false,
}: {
  a: Appointment
  onOpen: (a: Appointment) => void
  compact?: boolean
}) {
  const Icon = typeIcon(a.type)
  return (
    <button
      type="button"
      onClick={() => onOpen(a)}
      className="w-full rounded-xl border bg-card p-4 text-left bg-white/60 hover:bg-white/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Icon className="h-4.5 w-4.5 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <p className={["text-sm font-semibold", compact ? "truncate" : ""].join(" ")}>{a.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {projectLabel(a.projectId)} • {timeRange(a)}
            </p>

            {!compact ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {a.type === "Ortstermin" ? projectAddress(a.projectId) : a.note ?? "—"}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", typeTone(a.type)].join(" ")}>
                {a.type}
              </span>
              <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusTone(a.status)].join(" ")}>
                {a.status}
              </span>
            </div>

            {a.status === "verschoben" && a.originalDateISO ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Ursprünglich: {a.originalDateISO}
                {a.originalStart ? ` • ${a.originalStart}` : ""}
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0">
          <Button variant="outline" size="sm" className="gap-2 hover:bg-white/2">
            Details <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </button>
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 items-start gap-2">
      <div className="col-span-4 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="col-span-8">{children}</div>
    </div>
  )
}

/** -----------------------------
 *  MAIN PAGE
 *  ----------------------------- */
export default function TerminePage() {
  const [month, setMonth] = useState<MonthModel>({ year: 2025, month0: 11 })
  const [projectId, setProjectId] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [onlyUpcoming, setOnlyUpcoming] = useState(false)
  const [onlyNeedsAction, setOnlyNeedsAction] = useState(false)

  const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null)
  const [detail, setDetail] = useState<Appointment | null>(null)

  const todayISO = "2025-12-14" // demo "today"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = appointments.slice()

    if (projectId !== "all") list = list.filter((a) => a.projectId === projectId)

    if (q) {
      list = list.filter((a) => {
        const hay = [
          a.title,
          a.type,
          a.status,
          a.dateISO,
          a.start ?? "",
          a.end ?? "",
          projectLabel(a.projectId),
          projectAddress(a.projectId),
          a.location ?? "",
          a.note ?? "",
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(q)
      })
    }

    if (onlyNeedsAction) {
      list = list.filter((a) => a.status === "angefragt" || (a.prep?.some((p) => !p.done) ?? false))
    }

    if (onlyUpcoming) {
      list = list.filter((a) => a.dateISO >= todayISO && a.status !== "abgesagt")
    }

    list.sort((a, b) => {
      const da = `${a.dateISO} ${a.start ?? "99:99"}`
      const db = `${b.dateISO} ${b.start ?? "99:99"}`
      return da.localeCompare(db)
    })

    return list
  }, [projectId, query, onlyNeedsAction, onlyUpcoming, todayISO])

  const markedDays = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of filtered) m[a.dateISO] = (m[a.dateISO] ?? 0) + 1
    return m
  }, [filtered])

  const selectedDayList = useMemo(() => {
    if (!selectedDayISO) return []
    return filtered.filter((a) => a.dateISO === selectedDayISO)
  }, [filtered, selectedDayISO])

  const needsAction = useMemo(
    () => filtered.filter((a) => a.status === "angefragt" || (a.prep?.some((p) => !p.done) ?? false)),
    [filtered]
  )

  const headerChips = useMemo(() => {
    const total = filtered.length
    const open = filtered.filter((a) => a.status !== "erledigt" && a.status !== "abgesagt").length
    const done = filtered.filter((a) => a.status === "erledigt").length
    return { total, open, done }
  }, [filtered])

  const upcoming = useMemo(
    () => filtered.filter((a) => a.dateISO >= todayISO && a.status !== "abgesagt").slice(0, 3),
    [filtered, todayISO]
  )

  function prevMonth() {
    setMonth((m) => {
      const n = { ...m, month0: m.month0 - 1 }
      if (n.month0 < 0) return { year: m.year - 1, month0: 11 }
      return n
    })
  }
  function nextMonth() {
    setMonth((m) => {
      const n = { ...m, month0: m.month0 + 1 }
      if (n.month0 > 11) return { year: m.year + 1, month0: 0 }
      return n
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Kundenportal • Bereich</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Termine</h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Kalenderübersicht + Terminliste im Projektkontext. Fokus: Was passiert wann – und was ist Ihr nächster Schritt?
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Chip>
                <CalendarDays className="mr-2 h-3.5 w-3.5" />
                {headerChips.total} Termine
              </Chip>
              <Chip>
                <Clock className="mr-2 h-3.5 w-3.5" />
                {headerChips.open} geplant
              </Chip>
              <Chip>
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                {headerChips.done} erledigt
              </Chip>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Controls */}
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">Projekt</p>
              <div className="mt-2">
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Projekt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Projekte</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tipp: „Alle Projekte“ zeigt alle Termine – ideal für Planung.
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">Suche</p>

              <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Suche nach Titel, Projekt, Ort, Status…"
                    className="pl-9"
                  />
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Demo-Logik: „Aktion“ = angefragt oder Vorbereitung unvollständig.
              </p>
            </div>
          </div>
        </div>

        <div className="my-6" />

        {/* ACTION BLOCK (full width, highlighted) */}
        <Card className="border-blue-500/30 bg-blue-500/2">
          <CardHeader className="space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-0">
                <CardTitle className="text-lg">Benötigt Aktion</CardTitle>
                <CardDescription>Rückfragen, Bestätigungen, Vorbereitung – gebündelt und priorisiert.</CardDescription>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground border">
                <AlertTriangle className="h-3.5 w-3.5" />
                {needsAction.length} offen
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {needsAction.length === 0 ? (
              <div className="rounded-xl border bg-background/60 p-6 text-center">
                <p className="text-sm font-semibold">Alles im grünen Bereich</p>
                <p className="mt-1 text-sm text-muted-foreground">Aktuell keine offenen Bestätigungen/Vorbereitung.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {needsAction.slice(0, 6).map((a) => (
                  <AppointmentCard key={a.id} a={a} onOpen={setDetail} compact />
                ))}
              </div>
            )}

            
          </CardContent>
        </Card>

        <div className="my-6" />

        {/* Main two-column layout */}
        <div className="grid gap-4 md:grid-cols-12">
          {/* LEFT: Calendar card with selected day content underneath (same block) */}
          <Card className="md:col-span-7">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-lg">Kalender</CardTitle>
                  <CardDescription>{monthTitle(month.year, month.month0)}</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Vorheriger Monat">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Nächster Monat">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <MonthGrid
                month={month}
                marked={markedDays}
                selectedISO={selectedDayISO}
                onSelect={setSelectedDayISO}
              />

              <Separator />

              {/* Selected day content (directly under calendar) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedDayISO ? `Termine am ${selectedDayISO}` : "Tag auswählen"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedDayISO
                        ? "Klick auf einen Termin öffnet Details (Demo)."
                        : "Wählen Sie einen Tag im Kalender, um die Termine zu sehen."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDayISO(todayISO)}
                      className="gap-2"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Heute
                    </Button>
                    {selectedDayISO ? (
                      <Button variant="outline" size="sm" onClick={() => setSelectedDayISO(null)}>
                        Auswahl löschen
                      </Button>
                    ) : null}
                  </div>
                </div>

                {!selectedDayISO ? (
                  <div className="rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-semibold">Kein Tag ausgewählt</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tipp: Tage mit Zahl-Badge haben mehrere Termine.
                    </p>
                  </div>
                ) : selectedDayList.length === 0 ? (
                  <div className="rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-semibold">Keine Termine an diesem Tag</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Wähle einen anderen Tag oder entferne Filter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayList.map((a) => (
                      <AppointmentCard key={a.id} a={a} onOpen={setDetail} />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Next appointments */}
          <div className="md:col-span-5 space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Nächste Termine</CardTitle>
                <CardDescription>Was als nächstes ansteht – schnell erfassbar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ? (
                  <div className="rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-semibold">Keine kommenden Termine</p>
                    <p className="mt-1 text-sm text-muted-foreground">Sie können jederzeit einen Termin anfragen (Demo).</p>
                  </div>
                ) : (
                  upcoming.map((a) => <AppointmentCard key={a.id} a={a} onOpen={setDetail} compact />)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Kalender Export (Demo)</CardTitle>
                <CardDescription>Wirkt sehr professionell, auch als UI-only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between">
                  iCal herunterladen <Download className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  In echt: Export pro Projekt oder gesamtes Portal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Details dialog */}
        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="max-w-* max-h-[90vh] overflow-y-auto">
            {detail ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base">{detail.title}</DialogTitle>
                  <DialogDescription>
                    {detail.dateISO} • {timeRange(detail)} • {projectLabel(detail.projectId)}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-7 space-y-3">
                    <div className="rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", typeTone(detail.type)].join(" ")}>
                          {detail.type}
                        </span>
                        <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusTone(detail.status)].join(" ")}>
                          {detail.status}
                        </span>
                        {detail.createdBy ? (
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                            erstellt von: {detail.createdBy}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <MetaRow label="Projekt">
                        <span className="inline-flex px-2.5 py-0.5 text-xs text-muted-foreground">
                                {projectLabel(detail.projectId)}
                              </span>
                        </MetaRow>
                        <MetaRow label="Adresse">
                          <span className="inline-flex px-2.5 py-0.5 text-xs text-muted-foreground">
                            {projectAddress(detail.projectId)}
                          </span>
                        </MetaRow>
                        <MetaRow label="Datum">
                          <span className="inline-flex px-2.5 py-0.5 text-xs text-muted-foreground">
                            {detail.dateISO}
                          </span>
                        </MetaRow>
                        <MetaRow label="Zeit">
                         <div className="flex flex-wrap gap-2">
                              <span className="inline-flex px-2.5 py-0.5 text-xs text-muted-foreground">
                                {timeRange(detail)}
                              </span>
                          </div>
                        </MetaRow>
                        
                        <MetaRow label="Ort">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex px-2.5 py-0.5 text-xs text-muted-foreground">
                            {detail.location ?? (detail.type === "Ortstermin" ? projectAddress(detail.projectId) : "—")}
                            </span>
                          </div>
                        </MetaRow>
                      </div>
                      {detail.status === "verschoben" && detail.originalDateISO ? (
                        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                          Verschoben: ursprünglich {detail.originalDateISO}
                          {detail.originalStart ? ` • ${detail.originalStart}` : ""}.
                        </div>
                      ) : null}
                    </div>

                  
                  </div>

                  <div className="md:col-span-5 space-y-3">
                    <div className="rounded-xl bg-primary/5 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Aktionen</p>
                      <div className="mt-3 grid gap-2">
                        <Button className="w-full gap-2 cursor-pointer">
                          Zum Projekt
                        </Button>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                          Ändern<Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                          ILCS<ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                      Bitte melden Sie sich bei Fragen oder zur Terminänderung.
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2025 BauVisio Portal • Termine (Demo UI)</p>
          <div className="flex gap-3">
            <a href="#" className="hover:text-foreground">
              Datenschutz
            </a>
            <a href="#" className="hover:text-foreground">
              Impressum
            </a>
            <a href="#" className="hover:text-foreground">
              Hilfe
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

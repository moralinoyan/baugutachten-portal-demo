"use client"

import { useMemo, useState } from "react"
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
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Gauge,
  LineChart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type ProjectStatus =
  | "In Prüfung"
  | "Ortstermin geplant"
  | "Auswertung läuft"
  | "Gutachten in Vorbereitung"
  | "Abgeschlossen"

type SeverityLevel = "critical" | "warning" | "ok"

function severityStyles(severity: SeverityLevel) {
  switch (severity) {
    case "critical":
      return {
        bar: "bg-rose-600",
        text: "text-rose-700",
        pill: "bg-rose-500/10 text-rose-700",
        track: "bg-rose-200/40",
      }
    case "warning":
      return {
        bar: "bg-amber-500",
        text: "text-amber-700",
        pill: "bg-amber-500/10 text-amber-700",
        track: "bg-amber-200/40",
      }
    case "ok":
      return {
        bar: "bg-emerald-600",
        text: "text-emerald-700",
        pill: "bg-emerald-500/10 text-emerald-700",
        track: "bg-emerald-200/40",
      }
  }
}

type Phase =
  | "Auftrag & Unterlagen"
  | "Ortstermin"
  | "Messungen"
  | "Auswertung"
  | "Empfehlung"
  | "Gutachten"
  | "Abschluss"

type ActivityType = "Termin" | "Dokument" | "Nachricht" | "Meilenstein" | "Rechnung"

type Activity = {
  id: string
  title: string
  meta: string
  time: string
  type: ActivityType
}

type Measurement = {
  id: string
  location: string
  metric:
    | "Luftfeuchte (RH%)"
    | "Oberflächenfeuchte"
    | "Temperatur (°C)"
    | "Schimmelrisiko (Index)"
  value: string
  rating: "OK" | "Erhöht" | "Kritisch"
  recordedAt: string
}

type Doc = {
  id: string
  title: string
  category: "Gutachten" | "Messprotokoll" | "Fotos" | "Absprachen" | "Normen/Hinweise"
  date: string
  status?: "Entwurf" | "Final" | "Neu"
}

type Invoice = {
  id: string
  title: string
  date: string
  amount: string
  status: "Offen" | "Bezahlt" | "In Prüfung"
}

type Msg = {
  id: string
  from: "Sie" | "Gutachterteam"
  text: string
  time: string
}

type Project = {
  id: string
  title: string
  subtitle: string
  address: string
  status: ProjectStatus
  phase: Phase
  progress: number
  severity: Severity
  updatedAt: string
  nextAppointment?: string
  nextCustomerTodo?: string
  responsible: {
    name: string
    role: string
    availability: string
  }
}

const project: Project = {
  id: "p-001",
  title: "Feuchtigkeitsgutachten – Einfamilienhaus",
  subtitle: "Schimmelverdacht im Keller • Messung & Ursachenanalyse",
  address: "Musterstraße 12, 48143 Münster",
  status: "Auswertung läuft",
  phase: "Auswertung",
  progress: 62,
  severity: "Mittel",
  updatedAt: "Heute, 14:10",
  nextAppointment: "Nächster Slot: 18. Dez., 09:30 (optional)",
  nextCustomerTodo: "Rückfragen zu Messwerten beantworten (2 Fragen)",
  responsible: {
    name: "Dipl.-Ing. Lara Becker",
    role: "Sachverständige • Feuchtigkeit & Bauschäden",
    availability: "Mo–Fr, 09:00–17:00",
  },
}

const phases: { name: Phase; hint: string }[] = [
  { name: "Auftrag & Unterlagen", hint: "Basisdaten, Fotos, Pläne" },
  { name: "Ortstermin", hint: "Begehung & Sichtprüfung" },
  { name: "Messungen", hint: "Messpunkte, Protokolle" },
  { name: "Auswertung", hint: "Analyse & Hypothesen" },
  { name: "Empfehlung", hint: "Maßnahmen & Prioritäten" },
  { name: "Gutachten", hint: "Entwurf → Final" },
  { name: "Abschluss", hint: "Übergabe & Archiv" },
]

const progressSeries = [
  { date: "03. Dez.", score: 8 },
  { date: "06. Dez.", score: 18 },
  { date: "09. Dez.", score: 34 },
  { date: "12. Dez.", score: 48 },
  { date: "13. Dez.", score: 62 },
]

const activities: Activity[] = [
  {
    id: "a1",
    title: "Messprotokoll hochgeladen",
    meta: "Keller • 6 Messpunkte",
    time: "Heute, 14:10",
    type: "Dokument",
  },
  {
    id: "a2",
    title: "Rückfrage gestellt",
    meta: "Zugang zu Abstellraum/Leitungsschacht",
    time: "Heute, 11:02",
    type: "Nachricht",
  },
  {
    id: "a3",
    title: "Ortstermin durchgeführt",
    meta: "Dauer: 55 min • Fotodoku erstellt",
    time: "12. Dez., 10:30",
    type: "Meilenstein",
  },
  {
    id: "a4",
    title: "Rechnung bereitgestellt",
    meta: "Anzahlung",
    time: "09. Dez., 16:20",
    type: "Rechnung",
  },
]

const measurements: Measurement[] = [
  {
    id: "m1",
    location: "Keller • Nordwand",
    metric: "Luftfeuchte (RH%)",
    value: "71%",
    rating: "Erhöht",
    recordedAt: "12. Dez., 10:42",
  },
  {
    id: "m2",
    location: "Keller • Bodenplatte",
    metric: "Oberflächenfeuchte",
    value: "2.6 Digits",
    rating: "Kritisch",
    recordedAt: "12. Dez., 10:50",
  },
  {
    id: "m3",
    location: "EG • Wohnzimmer",
    metric: "Luftfeuchte (RH%)",
    value: "49%",
    rating: "OK",
    recordedAt: "12. Dez., 11:05",
  },
  {
    id: "m4",
    location: "Keller • Gesamt",
    metric: "Schimmelrisiko (Index)",
    value: "0.62",
    rating: "Erhöht",
    recordedAt: "13. Dez., 09:12",
  },
]

const docs: Doc[] = [
  { id: "d1", title: "Messprotokoll Keller (PDF)", category: "Messprotokoll", date: "Heute", status: "Neu" },
  { id: "d2", title: "Fotodokumentation (ZIP)", category: "Fotos", date: "12. Dez." },
  { id: "d3", title: "Absprachen & Leistungsumfang", category: "Absprachen", date: "06. Dez.", status: "Final" },
  { id: "d4", title: "Hinweise zu DIN/Normen (Auszug)", category: "Normen/Hinweise", date: "06. Dez." },
  { id: "d5", title: "Gutachten – Entwurf v1", category: "Gutachten", date: "—", status: "Entwurf" },
]

const invoices: Invoice[] = [
  { id: "i1", title: "Rechnung 2025-001 (Anzahlung)", date: "09. Dez.", amount: "290,00 €", status: "Offen" },
  { id: "i2", title: "Rechnung 2025-002 (Restbetrag)", date: "—", amount: "—", status: "In Prüfung" },
]

const messages: Msg[] = [
  { id: "c1", from: "Gutachterteam", text: "Können Sie bestätigen, ob der Leitungsschacht im Abstellraum zugänglich ist?", time: "Heute, 11:02" },
  { id: "c2", from: "Sie", text: "Ja, Zugang ist möglich. Muss ich etwas vorbereiten?", time: "Heute, 11:18" },
  { id: "c3", from: "Gutachterteam", text: "Perfekt. Wir benötigen nur freie Fläche vor der Wand (ca. 1 m).", time: "Heute, 11:25" },
]

function statusTone(status: ProjectStatus) {
  switch (status) {
    case "Abgeschlossen":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "Auswertung läuft":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "Ortstermin geplant":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Gutachten in Vorbereitung":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
    default:
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300"
  }
}

function severityTone(s: Severity) {
  switch (s) {
    case "Niedrig":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "Mittel":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Hoch":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  }
}

function ratingTone(r: Measurement["rating"]) {
  switch (r) {
    case "OK":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "Erhöht":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Kritisch":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  }
}

function activityIcon(t: ActivityType) {
  switch (t) {
    case "Termin":
      return CalendarDays
    case "Dokument":
      return FileText
    case "Nachricht":
      return MessageCircle
    case "Meilenstein":
      return CheckCircle2
    case "Rechnung":
      return ClipboardList
  }
}

/** Inline line chart (same as before, but used inside progress card) */
function ProgressOverTimeInline({ series }: { series: { date: string; score: number }[] }) {
  const points = useMemo(() => {
    const max = Math.max(...series.map((s) => s.score), 100)
    const min = Math.min(...series.map((s) => s.score), 0)
    const padX = 12
    const padY = 10
    const w = 520
    const h = 120

    const normX = (i: number) => padX + (i / Math.max(series.length - 1, 1)) * (w - padX * 2)
    const normY = (v: number) => {
      const t = (v - min) / Math.max(max - min, 1)
      return padY + (1 - t) * (h - padY * 2)
    }

    const pts = series.map((s, i) => [normX(i), normY(s.score)] as const)
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")
    return { pts, d, w, h }
  }, [series])

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Fortschritt über Zeit</p>
          <p className="text-xs text-muted-foreground">
            Meilenstein-basierter Score (Demo) – zeigt, wann Fortschritt sichtbar wurde.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
          <LineChart className="h-3.5 w-3.5" />
          {series.at(-1)?.score ?? 0} / 100
        </span>
      </div>

      <div className="mt-4">
        <svg viewBox={`0 0 ${points.w} ${points.h}`} className="h-[130px] w-full">
          <g opacity="0.6">
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1={12}
                x2={points.w - 12}
                y1={10 + (i / 3) * (points.h - 20)}
                y2={10 + (i / 3) * (points.h - 20)}
                className="stroke-muted"
                strokeWidth="1"
              />
            ))}
          </g>

          <path
            d={`${points.d} L ${points.pts.at(-1)?.[0] ?? 0} ${points.h - 10} L ${
              points.pts[0]?.[0] ?? 0
            } ${points.h - 10} Z`}
            className="fill-primary/10"
          />
          <path d={points.d} className="stroke-primary" strokeWidth="2.5" fill="none" />
          {points.pts.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="4"
              className="fill-background stroke-primary"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{series[0]?.date}</span>
          <span>{series.at(-1)?.date}</span>
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  children,
  rightSlot,
}: {
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
  rightSlot?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border bg-muted/30">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-muted/20"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {rightSlot ? <div className="hidden sm:block">{rightSlot}</div> : null}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </button>

      {open ? <div className="border-t p-4">{children}</div> : null}
    </div>
  )
}

function PhaseList({ current }: { current: Phase }) {
  const idx = phases.findIndex((p) => p.name === current)

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {phases.map((p, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div
            key={p.name}
            className={[
              "flex items-start gap-3 rounded-lg border bg-background p-3",
              active ? "border-primary/40" : "border-muted",
            ].join(" ")}
          >
            <div
              className={[
                "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border",
                done ? "bg-primary text-primary-foreground border-primary" : "",
                active ? "border-primary" : "border-muted",
              ].join(" ")}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
            </div>

            <div className="min-w-0">
              <p className={["text-sm font-medium", active ? "text-foreground" : "text-muted-foreground"].join(" ")}>
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground">{p.hint}</p>
            </div>

            {active ? (
              <Badge variant="outline" className="ml-auto shrink-0">
                aktuell
              </Badge>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function ActivityList({ items }: { items: Activity[] }) {
  const maxH = "max-h-[320px]"
  return (
    <div className={["space-y-3 overflow-y-auto pr-1", maxH].join(" ")}>
      {items.map((a) => {
        const Icon = activityIcon(a.type)
        return (
          <div key={a.id} className="rounded-xl border bg-background p-4 hover:bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.meta}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.time}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Speedometer({
  label,
  value,
  max = 100,
  note,
  severity,
}: {
  label: string
  value: number
  max?: number
  note?: string
  severity: SeverityLevel
}) {
  const styles = severityStyles(severity)
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="rounded-xl border bg-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{label}</p>
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>

        {/* VALUE PILL */}
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
            styles.pill,
          ].join(" ")}
        >
          {Math.round(value)}/{max}
        </div>
      </div>

      {/* BAR */}
      <div className="mt-4">
        <div className="relative h-24 overflow-hidden rounded-xl bg-muted/40">
          {/* Track */}
          <div
            className={[
              "absolute inset-x-0 bottom-0 h-1.5",
              styles.track,
            ].join(" ")}
          />

          {/* Filled bar */}
          <div
            className={[
              "absolute bottom-0 left-0 h-1.5 transition-all",
              styles.bar,
            ].join(" ")}
            style={{ width: `${pct}%` }}
          />

          {/* Indicator */}
          <div
            className={[
              "absolute bottom-0 h-9 w-9 -translate-x-1/2 rounded-full border bg-background shadow-sm",
              styles.text,
            ].join(" ")}
            style={{ left: `${pct}%` }}
          >
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold">
              {Math.round(pct)}%
            </div>
          </div>

          <div className="absolute left-3 top-3 text-xs text-muted-foreground">
            niedrig
          </div>
          <div className="absolute right-3 top-3 text-xs text-muted-foreground">
            hoch
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-3 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Interpretation (Demo)
        </p>
        <p className={["mt-1 text-sm font-medium", styles.text].join(" ")}>
          {severity === "critical" && "Kritisch – Handlungsbedarf möglich."}
          {severity === "warning" && "Auffällig – wird geprüft."}
          {severity === "ok" && "Unauffällig / stabil."}
        </p>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const [progressView, setProgressView] = useState<"Prozent" | "Graph">("Prozent")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.address}
              </span>
              <span className="hidden md:inline">•</span>
              <span>Projekt-ID: {project.id}</span>
              <span className="hidden md:inline">•</span>
              <span>Letztes Update: {project.updatedAt}</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {project.title}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {project.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusTone(project.status),
                ].join(" ")}
              >
                {project.status}
              </span>
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  severityTone(project.severity),
                ].join(" ")}
              >
                {project.severity === "Hoch" ? (
                  <TriangleAlert className="h-3.5 w-3.5" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                Schweregrad: {project.severity}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button variant="outline" className="gap-2 cursor-pointer hover:bg-muted">
              Nachricht <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2 cursor-pointer hover:bg-muted">
              Anrufen <Phone className="h-4 w-4" />
            </Button>
            <Button className="gap-2 cursor-pointer">
              Projektbericht <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* SECTION 1 — Projekt & Fortschritt */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Progress (2/3) */}
          <Card className="md:col-span-8 border-primary/30">
            <CardHeader className="space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Gesamtfortschritt</CardTitle>
                  <CardDescription>
                    Zentraler Überblick – quantifiziert & nachvollziehbar.
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={progressView === "Prozent" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setProgressView("Prozent")}
                  >
                    Prozent
                  </Button>
                  <Button
                    size="sm"
                    variant={progressView === "Graph" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setProgressView("Graph")}
                  >
                    Graph
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {progressView === "Prozent" ? (
                <div className="rounded-xl bg-primary/5 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Aktuelle Phase
                      </p>
                      <p className="mt-1 text-sm font-semibold">{project.phase}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Wir verdichten gerade die Messungen zu Ursache(n). Danach folgen priorisierte Maßnahmen.
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Fortschritt</p>
                      <p className="text-3xl font-semibold tracking-tight">{project.progress}%</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Meilenstein-Score (Demo)</span>
                      <span className="font-medium text-foreground">{project.progress} / 100</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              ) : (
                <ProgressOverTimeInline series={progressSeries} />
              )}

              {/* Collapsible Phases */}
              <CollapsibleSection
                title="Projektphasen"
                description="Aus den Phasen ergibt sich der Fortschritt – aufklappen für Details."
                defaultOpen={false}
                rightSlot={
                  <span className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    {phases.findIndex((p) => p.name === project.phase) + 1}/{phases.length}
                  </span>
                }
              >
                <PhaseList current={project.phase} />
              </CollapsibleSection>

              {/* Collapsible Activity (scrollable) */}
              <CollapsibleSection
                title="Aktivität"
                description="Transparenz: Was ist passiert – und wann? (scrollbar bei vielen Einträgen)"
                defaultOpen={false}
                rightSlot={
                  <span className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {activities.length}
                  </span>
                }
              >
                <ActivityList items={activities} />
                <Button variant="outline" className="mt-4 w-full justify-between cursor-pointer hover:bg-muted">
                  Gesamte Timeline <ArrowRight className="h-4 w-4" />
                </Button>
              </CollapsibleSection>
            </CardContent>
          </Card>

          {/* Next Step (1/3) */}
          <Card className="md:col-span-4">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Nächster Schritt</CardTitle>
              <CardDescription>Konzentriert – ohne Sie zu überladen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs font-medium text-muted-foreground">Für Sie</p>
                <p className="mt-1 text-sm font-semibold">
                  {project.nextCustomerTodo ?? "—"}
                </p>
                <div className="mt-3">
                  <Button className="w-full gap-2 cursor-pointer">
                    Jetzt erledigen <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Termininfo</p>
                <p className="mt-1 text-sm">{project.nextAppointment ?? "—"}</p>
                <Button
                  variant="outline"
                  className="mt-3 w-full justify-between cursor-pointer hover:bg-muted"
                >
                  Terminübersicht <CalendarDays className="h-4 w-4" />
                </Button>
              </div>

              {/* (rest unchanged; kept minimal as requested) */}
              <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                Tipp: Hier könnten auch Freigaben (z. B. Gutachten-Entwurf) oder Rückrufwunsch auftauchen.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 2 — Ergebnisse & Inhaltlich (Messdaten full row) */}
        <div className="my-6" />

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Ergebnisse (Kurzübersicht)</CardTitle>
            <CardDescription>
              Drei schnelle Indikatoren (Demo) – Details weiterhin unten in den Messdaten.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Speedometer
            label="Feuchte-Indikator"
            value={72}
            severity="critical"
            note="Aggregiert aus Messpunkten"
            />

            <Speedometer
            label="Schimmelrisiko"
            value={62}
            severity="warning"
            note="Abgeleiteter Index"
            />

            <Speedometer
            label="Raumklima-Stabilität"
            value={12}
            severity="ok"
            note="Schwankungen & Lüftungsfenster"
            />
          </CardContent>
        </Card>

        {/* keep the detailed messdaten card + rest below */}
        <div className="my-6" />

        {/* SECTION 2 continued — Messdaten (existing detailed component, unchanged content) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-12">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Messdaten (Detalliert)</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    (Detailansicht – Demo)
                  </div>
                </div>
                <CardDescription>
                  Quantitativ, aber mit klarer Bewertung – damit Werte einzuordnen sind.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {measurements.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border bg-card p-4 hover:bg-muted/20"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{m.metric}</p>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              ratingTone(m.rating),
                            ].join(" ")}
                          >
                            {m.rating}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{m.location}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{m.recordedAt}</p>
                      </div>
                      <div className="flex items-center gap-3 md:justify-end">
                        <p className="text-lg font-semibold">{m.value}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 cursor-pointer hover:bg-muted"
                        >
                          Details <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                  Hinweis: Werte/Skalen sind Demo. In der echten Version wären Einheiten/Normreferenzen sauber hinterlegt.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 3 — Administratives (unten der Rest, unverändert) */}
        <div className="my-6" />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Dokumente</CardTitle>
              <CardDescription>Alles projektbezogen – sauber kategorisiert.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {docs.map((d) => (
                <div key={d.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{d.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {d.category} • {d.date}
                      </p>
                      {d.status ? (
                        <div className="mt-2">
                          <Badge variant="outline">{d.status}</Badge>
                        </div>
                      ) : null}
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                Alle Dokumente öffnen <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Rechnungen</CardTitle>
              <CardDescription>Separat vom Rest – schnell auffindbar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{inv.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{inv.date}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{inv.status}</Badge>
                        <span className="text-sm font-semibold">{inv.amount}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
                      <FileText className="h-4 w-4" /> PDF
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                Rechnungsbereich öffnen <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Communication (kept as before, now implicitly also "administratives / service") */}
        <div className="my-6" />

        <Card className="border-primary/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Projekt-Kommunikation</CardTitle>
            <CardDescription>Kurze Wege – immer im Projektkontext.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-primary/5 p-4">
              <p className="text-xs font-medium text-muted-foreground">Letzte Nachrichten</p>
              <div className="mt-3 space-y-2">
                {messages.slice(-2).map((m) => (
                  <div key={m.id} className="rounded-lg bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">{m.from}</p>
                      <p className="text-xs text-muted-foreground">{m.time}</p>
                    </div>
                    <p className="mt-1 text-sm">{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <Button className="w-full gap-2 cursor-pointer">
                  Chat öffnen <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                  Rückruf anfragen <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2025 BauVisio Portal • Projekt-Dashboard (Demo UI)</p>
          <div className="flex gap-3">
            <a href="#" className="hover:text-foreground">Datenschutz</a>
            <a href="#" className="hover:text-foreground">Impressum</a>
            <a href="#" className="hover:text-foreground">Hilfe</a>
          </div>
        </div>
      </div>
    </div>
  )
}

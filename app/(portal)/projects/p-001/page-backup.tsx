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
  LineChart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  UserRound,
} from "lucide-react"

type ProjectStatus =
  | "In Prüfung"
  | "Ortstermin geplant"
  | "Auswertung läuft"
  | "Gutachten in Vorbereitung"
  | "Abgeschlossen"

type Severity = "Niedrig" | "Mittel" | "Hoch"

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
  metric: "Luftfeuchte (RH%)" | "Oberflächenfeuchte" | "Temperatur (°C)" | "Schimmelrisiko (Index)"
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
  nextAppointment: "Ortstermin abgeschlossen • Nächster Slot: 18. Dez., 09:30 (optional)",
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

function LineChartCard({ series }: { series: { date: string; score: number }[] }) {
  const points = useMemo(() => {
    const max = Math.max(...series.map((s) => s.score), 100)
    const min = Math.min(...series.map((s) => s.score), 0)
    const padX = 12
    const padY = 10
    const w = 280
    const h = 90

    const normX = (i: number) => padX + (i / Math.max(series.length - 1, 1)) * (w - padX * 2)
    const normY = (v: number) => {
      const t = (v - min) / Math.max(max - min, 1)
      return padY + (1 - t) * (h - padY * 2)
    }

    const pts = series.map((s, i) => [normX(i), normY(s.score)] as const)
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")
    return { pts, d, w, h, padX, padY }
  }, [series])

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Fortschritt über Zeit</p>
          <p className="text-xs text-muted-foreground">
            Meilenstein-basierter Score (Demo) – zeigt, wann Fortschritt sichtbar wurde.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <LineChart className="h-3.5 w-3.5" />
          {series.at(-1)?.score ?? 0} / 100
        </span>
      </div>

      <div className="mt-4">
        <svg viewBox={`0 0 ${points.w} ${points.h}`} className="h-[110px] w-full">
          {/* grid */}
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

          {/* area under line */}
          <path
            d={`${points.d} L ${points.pts.at(-1)?.[0] ?? 0} ${points.h - 10} L ${points.pts[0]?.[0] ?? 0} ${points.h - 10} Z`}
            className="fill-primary/10"
          />

          {/* line */}
          <path d={points.d} className="stroke-primary" strokeWidth="2.5" fill="none" />

          {/* points */}
          {points.pts.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="4" className="fill-background stroke-primary" strokeWidth="2" />
            </g>
          ))}
        </svg>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{series[0]?.date}</span>
          <span>{series.at(-1)?.date}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Letzter Sprung</p>
          <p className="mt-1 text-sm">+{(series.at(-1)?.score ?? 0) - (series.at(-2)?.score ?? 0)} Punkte</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Diese Woche</p>
          <p className="mt-1 text-sm">2 Meilensteine</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Nächster Meilenstein</p>
          <p className="mt-1 text-sm">Empfehlung & Maßnahmen</p>
        </div>
      </div>
    </div>
  )
}

function Stepper({ current }: { current: Phase }) {
  const idx = phases.findIndex((p) => p.name === current)

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Projektphasen</p>
          <p className="text-xs text-muted-foreground">
            Klarer Ablauf – damit jederzeit verständlich ist, wo wir stehen.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          Phase {idx + 1}/{phases.length}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {phases.map((p, i) => {
          const done = i < idx
          const active = i === idx
          return (
            <div key={p.name} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/20">
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
                <Badge variant="outline" className="ml-auto">
                  aktuell
                </Badge>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const [measureTab, setMeasureTab] = useState<"Zusammenfassung" | "Messwerte (Tabelle)">("Zusammenfassung")

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
                {project.severity === "Hoch" ? <TriangleAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                Schweregrad: {project.severity}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Transparenzmodus (Demo)
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

        {/* Top KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <Card className="md:col-span-5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Gesamtfortschritt</CardTitle>
              <CardDescription>Quantifiziert – aber in verständlichen Schritten.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Aktuelle Phase</p>
                  <p className="mt-1 text-sm font-semibold">{project.phase}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-2xl font-semibold">{project.progress}%</p>
                </div>
              </div>
              <Progress value={project.progress} className="h-2" />
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">Aktueller Fokus</p>
                <p className="mt-1 text-sm">
                  Wir werten die Messungen aus und verdichten die Ursache(n). Danach folgen Maßnahmenempfehlungen.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-4">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Nächster Schritt</CardTitle>
              <CardDescription>Damit Sie nicht suchen müssen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs font-medium text-muted-foreground">Für Sie</p>
                <p className="mt-1 text-sm font-semibold">{project.nextCustomerTodo ?? "—"}</p>
                <div className="mt-3 flex gap-2">
                  <Button className="w-full gap-2 cursor-pointer">
                    Jetzt erledigen <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Termininfo</p>
                <p className="mt-1 text-sm">{project.nextAppointment ?? "—"}</p>
                <Button variant="outline" className="mt-3 w-full justify-between cursor-pointer hover:bg-muted">
                  Terminübersicht <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Ansprechpartner</CardTitle>
              <CardDescription>Direkt erreichbar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <UserRound className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{project.responsible.name}</p>
                    <p className="text-xs text-muted-foreground">{project.responsible.role}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                    Anrufen <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                    Nachricht <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Erreichbarkeit: {project.responsible.availability}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="my-6" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left */}
          <div className="space-y-6 lg:col-span-8">
            {/* Phase + Progress over time */}
            <div className="grid gap-6 md:grid-cols-2">
              <Stepper current={project.phase} />
              <LineChartCard series={progressSeries} />
            </div>

            {/* Measurements */}
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Messdaten</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={measureTab === "Zusammenfassung" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setMeasureTab("Zusammenfassung")}
                    >
                      Zusammenfassung
                    </Button>
                    <Button
                      size="sm"
                      variant={measureTab === "Messwerte (Tabelle)" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setMeasureTab("Messwerte (Tabelle)")}
                    >
                      Messwerte
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Quantitativ, aber mit klarer Bewertung – damit Werte einzuordnen sind.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {measureTab === "Zusammenfassung" ? (
                  <div className="grid gap-4 md:grid-cols-12">
                    <div className="md:col-span-7">
                      <div className="rounded-xl bg-muted/60 p-4">
                        <p className="text-xs font-medium text-muted-foreground">Kurzfazit (Demo)</p>
                        <p className="mt-2 text-sm">
                          Im Keller zeigen mehrere Messpunkte <span className="font-medium">erhöhte Feuchtewerte</span>.
                          Die Auswertung prüft aktuell mögliche Ursachen (z. B. Kondensation, Abdichtung, Wärmebrücke).
                        </p>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          <div className="rounded-lg bg-background p-3">
                            <p className="text-xs font-medium text-muted-foreground">Betroffener Bereich</p>
                            <p className="mt-1 text-sm font-semibold">Keller (Nordwand / Bodenplatte)</p>
                          </div>
                          <div className="rounded-lg bg-background p-3">
                            <p className="text-xs font-medium text-muted-foreground">Nächster Output</p>
                            <p className="mt-1 text-sm font-semibold">Maßnahmenempfehlung (priorisiert)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <div className="space-y-3 rounded-xl border bg-card p-4">
                        <p className="text-sm font-semibold">Highlights</p>
                        <div className="space-y-2">
                          {measurements.slice(0, 3).map((m) => (
                            <div key={m.id} className="rounded-lg bg-muted/40 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">{m.metric}</p>
                                <span
                                  className={[
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                    ratingTone(m.rating),
                                  ].join(" ")}
                                >
                                  {m.rating}
                                </span>
                              </div>
                              <p className="mt-1 text-sm">{m.value}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{m.location} • {m.recordedAt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {measurements.map((m) => (
                      <div key={m.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
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
                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
                              Details <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                      Hinweis: Werte/Skalen sind Demo. In der echten Version wären Einheiten/Normreferenzen sauber hinterlegt.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents + Invoices */}
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
          </div>

          {/* Right */}
          <div className="space-y-6 lg:col-span-4">
            {/* Activity Feed */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Aktivität</CardTitle>
                <CardDescription>Transparenz: Was ist passiert – und wann?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.map((a) => {
                  const Icon = activityIcon(a.type)
                  return (
                    <div key={a.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
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
                <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                  Gesamte Timeline <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Communication Preview */}
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
                  <div className="mt-3 grid gap-2">
                    <Button className="w-full gap-2 cursor-pointer">
                      Chat öffnen <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                      Rückruf anfragen <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                      <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Hilfe (Demo-Chatbot)</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Häufige Fragen: Ablauf, Terminvorbereitung, Dokumente.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full justify-between cursor-pointer hover:bg-muted">
                        Hilfe öffnen <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action box */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">To-Dos & Freigaben</CardTitle>
                <CardDescription>Kompakt – damit nichts untergeht.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                      <ClipboardList className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Offen (2)</p>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-3">
                          <span className="min-w-0">Zugang Leitungsschacht bestätigen</span>
                          <Badge variant="outline" className="shrink-0">Heute</Badge>
                        </li>
                        <li className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-3">
                          <span className="min-w-0">Fotos „Nordwand“ ergänzen (optional)</span>
                          <Badge variant="outline" className="shrink-0">bis 18. Dez.</Badge>
                        </li>
                      </ul>
                      <Button className="mt-3 w-full justify-between cursor-pointer">
                        To-Dos öffnen <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                  Tipp: Im echten System könnten hier auch „Freigabe Gutachten-Entwurf“ oder „Termin bestätigen“ auftauchen.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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

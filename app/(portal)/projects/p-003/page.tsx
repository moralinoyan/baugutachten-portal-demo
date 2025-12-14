"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
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
  Timer,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  Wrench,
  AlertTriangle,
} from "lucide-react"

/** -----------------------------
 *  TYPES
 *  ----------------------------- */
type ProjectStatus =
  | "In Prüfung"
  | "Ortstermin geplant"
  | "Auswertung läuft"
  | "Gutachten in Vorbereitung"
  | "Abgeschlossen"

type Severity = "Niedrig" | "Mittel" | "Hoch"
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

type PackagePoint = {
  key: PackageKey
  x: number // Dringlichkeit 0..100
  y: number // Impact 0..100
  color: string
}

function ScoreStrip({
  score,
  recommendation,
  drivers,
  isDraft,
}: {
  score: number
  recommendation: Recommendation
  drivers: string[]
  isDraft: boolean
}) {
  const sev: SeverityLevel = score >= 75 ? "ok" : score >= 50 ? "warning" : "critical"
  const styles = severityStyles(sev)

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Sanierungsscore & Empfehlung</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Kompakter Überblick – Score, Empfehlung und wichtigste Treiber (Demo).
          </p>

          <div className="mt-3 flex flex-wrap gap-2 inline-flex items-center rounded-full border bg-background px-2.5 py-1.5 text-xs">
              <span className="inline-flex items-center px-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Wichtigste Treiber:
              </span>
            {drivers.slice(0, 4).map((d) => (
              <span key={d} className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <div className={["rounded-xl px-4 py-3 text-right", styles.pill].join(" ")}>
            <p className="text-xs opacity-80">Sanierungsscore</p>
            <p className="text-3xl font-semibold tracking-tight">
              {score}
              <span className="text-sm font-medium opacity-80">/100</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskMatrixPlot({
  points,
  measures,
}: {
  points: PackagePoint[]
  measures: Measure[]
}) {
  const [hovered, setHovered] = useState<PackageKey | null>(null)
  const [locked, setLocked] = useState<PackageKey | null>(null)
  const activeKey = locked ?? hovered

  const byPackage = useMemo(() => {
    const m: Record<PackageKey, Measure[]> = {
      "Sofortmaßnahmen": [],
      "Kernsanierung": [],
      "Optional/Komfort": [],
    }
    for (const it of measures) m[it.package].push(it)
    return m
  }, [measures])

  const activeMeasures = hovered ? byPackage[hovered] : []

  type TooltipPos = { left: number; top: number } | null

  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [tipPos, setTipPos] = useState<TooltipPos>(null)

  // SVG sizing
  const W = 720
  const H = 500
  const padL = 18
  const padR = 18
  const padT = 18
  const padB = 46
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const sx = (v: number) => padL + (Math.min(100, Math.max(0, v)) / 100) * innerW
  const sy = (v: number) => padT + (1 - Math.min(100, Math.max(0, v)) / 100) * innerH

  function computeTooltipPos(cx: number, cy: number) {
    const svg = svgRef.current
    const wrap = wrapRef.current
    if (!svg || !wrap) return null

    const svgRect = svg.getBoundingClientRect()
    const wrapRect = wrap.getBoundingClientRect()

    // Scale from viewBox -> rendered pixels
    const scaleX = svgRect.width / W
    const scaleY = svgRect.height / H

    // Convert to wrapper-relative px WTFFFFFF
    const left = 1
    const top = 1

    return { left, top }
  }
  useEffect(() => {
  const p = activeKey ? points.find(pt => pt.key === activeKey) : null
  if (!p) {
    setTipPos(null)
    return
  }

  const cx = sx(p.x)
  const cy = sy(p.y)

  const update = () => setTipPos(computeTooltipPos(cx, cy))
  update()

  // Snap stays correct on resize/scroll
  window.addEventListener("resize", update)
  window.addEventListener("scroll", update, true)

  return () => {
    window.removeEventListener("resize", update)
    window.removeEventListener("scroll", update, true)
  }
}, [activeKey, points])

  return (
    <div className="relative">
      <div className="rounded-xl border bg-background/2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Risiko & Prioritäten</p>
            <p className="mt-1 text-xs text-mu
            ted-foreground">
              Impact × Dringlichkeit – Hover über Punkte zeigt Paket + enthaltene Maßnahmen.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 border">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[320px] w-full select-none"
            onMouseLeave={() => {
              setHovered(null)
            }}
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((t) => (
              <g key={t} opacity="1">
                <line x1={sx(t)} y1={padT} x2={sx(t)} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth="1" />
                <line x1={padL} y1={sy(t)} x2={padL + innerW} y2={sy(t)} stroke="hsl(var(--border))" strokeWidth="1" />
              </g>
            ))}

            {/* Axis labels */}
            <text x={padL + innerW / 2} y={H - 38} textAnchor="middle" fontSize="18" fill="hsl(var(--muted-foreground))">
              Kosten →
            </text>
            <text
              x={18}
              y={padT + innerH / 2 - 38}
              textAnchor="middle"
              fontSize="18"
              fill="hsl(var(--muted-foreground))"
              transform={`rotate(-90 18 ${padT + innerH / 2})`}
            >
              Impact →
            </text>

            {/* Mid lines (stronger) */}
            <line x1={sx(50)} y1={padT} x2={sx(50)} y2={padT + innerH} stroke="hsl(var(--foreground))" opacity="0.12" strokeWidth="2" />
            <line x1={padL} y1={sy(50)} x2={padL + innerW} y2={sy(50)} stroke="hsl(var(--foreground))" opacity="0.12" strokeWidth="2" />

            {/* Points */}
            {points.map((p) => {
              const cx = sx(p.x)
              const cy = sy(p.y)
              const isActive = activeKey === p.key
              const isDimmed = activeKey !== null && !isActive

              return (
                <g
                  key={p.key}
                  onMouseEnter={() => setHovered(p.key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLocked((prev) => (prev === p.key ? null : p.key))
                  }}
                  style={{ cursor: "pointer" }}
                  opacity={isDimmed ? 0.2 : 1}
                  className="transition-opacity"
                >
                  {/* Pulse (nur wenn aktiv) */}
                  {isActive && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={18}
                      fill={p.color}
                      opacity="0.15"
                      className="animate-ping"
                    />
                  )}

                  {/* Halo */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 14 : 10}
                    fill={p.color}
                    opacity={isActive ? 0.25 : 0.15}
                    className="transition-all"
                  />

                  {/* Core */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 9 : 6}
                    fill={p.color}
                    className="transition-all"
                  />

                  {/* Outline */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 11 : 8}
                    fill="none"
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                  />
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Tooltip (snapped to point) */}
      {activeKey ? (() => {
        const p = points.find(pt => pt.key === activeKey)
        if (!p) return null

        const cx = sx(p.x)
        const cy = sy(p.y)

        const boxLeft = (cx / W) * 100
        const boxTop = (cy / H) * 100

        return (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: `calc(${boxLeft}% + 1px)`,
              top: `calc(${boxTop}% - 1px)`,
            }}
          >
            <div className="w-[320px] rounded-xl border bg-background p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{activeKey}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enthaltene Maßnahmen
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground border">
                  {byPackage[activeKey].length}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {byPackage[activeKey].slice(0, 4).map((m) => (
                  <div key={m.id} className="rounded-lg bg-muted/30 px-2.5 py-2">
                    <p className="text-xs font-medium text-foreground leading-snug">
                      {m.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {m.costRange} • {m.duration}
                    </p>
                  </div>
                ))}

                {byPackage[activeKey].length > 4 && (
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    + {byPackage[activeKey].length - 4} weitere Maßnahmen…
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })() : null}
    </div>
  )
}

type Phase =
  | "Auftrag & Unterlagen"
  | "Ortstermin"
  | "Dokumentation"
  | "Mängelliste"
  | "Bewertung"
  | "Abnahmebericht"
  | "Abschluss"

type ActivityType = "Termin" | "Dokument" | "Nachricht" | "Meilenstein" | "Rechnung"

type Activity = {
  id: string
  title: string
  meta: string
  time: string
  type: ActivityType
}

type Doc = {
  id: string
  title: string
  category: "Abnahmebericht" | "Fotos" | "Absprachen" | "Normen/Hinweise" | "Mängelliste"
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
  dueHint?: string
  responsible: {
    name: string
    role: string
    availability: string
  }
}

/** -----------------------------
 *  DATA — p-003 (Sanierungsbewertung)
 *  ----------------------------- */
const project: Project = {
  id: "p-003",
  title: "Sanierungsbewertung – Altbau",
  subtitle: "Kostenrahmen • Priorisierung • Handlungsempfehlung",
  address: "Hauptstraße 88, 48143 Münster",
  status: "In Prüfung",
  phase: "Auftrag & Unterlagen",
  progress: 12,
  severity: "Mittel",
  updatedAt: "03. Dez., 11:27",
  nextAppointment: "—",
  nextCustomerTodo: "—",
  dueHint: "—",
  responsible: {
    name: "Dipl.-Ing. Anna Berger",
    role: "Sachverständige • Sanierung & Bauphysik",
    availability: "Mo–Fr, 08:30–16:30",
  },
}

const phases: { name: Phase; hint: string }[] = [
  { name: "Auftrag & Unterlagen", hint: "Pläne, Fotos, Vorbefunde" },
  { name: "Ortstermin", hint: "Begehung vor Ort" },
  { name: "Dokumentation", hint: "Messungen, Fotos, Protokolle" },
  { name: "Mängelliste", hint: "Strukturiert nach Bauteil/Gewerk" },
  { name: "Bewertung", hint: "Prioritäten & Maßnahmenpakete" },
  { name: "Abnahmebericht", hint: "Entwurf → Final" },
  { name: "Abschluss", hint: "Übergabe & Archiv" },
]

const progressSeries = [
  { date: "28. Nov.", score: 4 },
  { date: "30. Nov.", score: 7 },
  { date: "02. Dez.", score: 10 },
  { date: "03. Dez.", score: 12 },
]

const activities: Activity[] = [
  {
    id: "a1",
    title: "Unterlagenprüfung gestartet",
    meta: "Grundrisse • Fotos • Vorbefund",
    time: "03. Dez., 11:27",
    type: "Meilenstein",
  },
  {
    id: "a2",
    title: "Rückfrage zu Feuchtehistorie",
    meta: "Baujahr, Schäden, Lüftungsgewohnheiten",
    time: "02. Dez., 16:10",
    type: "Nachricht",
  },
  {
    id: "a3",
    title: "Dokumente eingegangen",
    meta: "Energieausweis • Gutachtenauszug",
    time: "30. Nov., 09:40",
    type: "Dokument",
  },
]

const docs: Doc[] = [
  { id: "d1", title: "Energieausweis (PDF)", category: "Absprachen", date: "30. Nov.", status: "Neu" },
  { id: "d2", title: "Fotodoku – Bestand", category: "Fotos", date: "30. Nov." }
]

const invoices: Invoice[] = [
  { id: "i1", title: "Rechnung 2025-021 (Prüfungspauschale)", date: "02. Dez.", amount: "120€", status: "In Prüfung" },
]

const messages: Msg[] = [
  { id: "m1", from: "Gutachterteam", text: "Bitte schicken Sie – falls vorhanden – frühere Schimmel-/Feuchteschäden und Sanierungsversuche (Fotos/Protokolle).", time: "02. Dez., 16:10" },
  { id: "m2", from: "Sie", text: "Ich sende heute Abend Fotos vom Keller + Bad. Lüften meist morgens/abends.", time: "02. Dez., 16:28" },
]

/** -----------------------------
 *  ASSESSMENT DATA (Demo)
 *  ----------------------------- */
type Recommendation = "Dringend empfohlen" | "Empfohlen" | "Optional"
type PackageKey = "Sofortmaßnahmen" | "Kernsanierung" | "Optional/Komfort"
type Priority = "Hoch" | "Mittel" | "Gering"
type RiskQuadrant = "impact_high_urgent" | "impact_high_later" | "impact_low_urgent" | "impact_low_later"

type Measure = {
  id: string
  title: string
  trade: string
  package: PackageKey
  priority: Priority
  goal: string
  costRange: string
  duration: string
  dependencies?: string[]
  evidence?: string
  assumptions?: string[]
  alternatives?: string[]
}

const assessment = {
  isDraft: true,
  recommendation: "Empfohlen" as Recommendation,
  score: 62,
  drivers: ["Kellerabdichtung", "Lüftungskonzept", "Wärmebrücke Fensterlaibung"],
  nextStep: "Rückfragen klären → Maßnahmenpaket finalisieren",
  packages: [
    {
      key: "Sofortmaßnahmen" as const,
      costRange: "1.200–3.500 €",
      duration: "1–2 Tage",
      effect: "Risiko senken, Ursachen abklären",
      tone: "bg-amber-500/10 text-amber-800",
    },
    {
      key: "Kernsanierung" as const,
      costRange: "9.000–18.000 €",
      duration: "6–12 Tage",
      effect: "Dauerhafte Beseitigung (baulich)",
      tone: "bg-rose-500/10 text-rose-800",
    },
    {
      key: "Optional/Komfort" as const,
      costRange: "2.000–6.500 €",
      duration: "2–5 Tage",
      effect: "Komfort & Prävention",
      tone: "bg-emerald-500/10 text-emerald-800",
    },
  ],
  effects: [
    { label: "Feuchterisiko", before: 72, after: 32 },
    { label: "Schimmelrisiko", before: 66, after: 28 },
    { label: "Wohnkomfort", before: 45, after: 70 },
  ],
  riskDots: [
    { label: "Kellerabdichtung", quadrant: "impact_high_urgent" as const, color: "#EF4444" },
    { label: "Lüftung (Bad/Keller)", quadrant: "impact_high_urgent" as const, color: "#F59E0B" },
    { label: "Fensterlaibung (Wärmebrücke)", quadrant: "impact_high_later" as const, color: "#F59E0B" },
    { label: "Dämmung Teilflächen", quadrant: "impact_low_later" as const, color: "#22C55E" },
  ],
}

const measures: Measure[] = [
  {
    id: "s1",
    title: "Kellerwand: Abdichtung / Sockel prüfen (Außen/Innenkonzept)",
    trade: "Abdichtung",
    package: "Kernsanierung",
    priority: "Hoch",
    goal: "Feuchtebelastung reduzieren & Salz-/Putzschäden vermeiden",
    costRange: "5.500–11.000 €",
    duration: "4–7 Tage",
    dependencies: ["Vorher: Feuchte-/Salzdiagnostik", "Vor Putz/Anstrich"],
    evidence: "Foto-Serie Keller • Hinweis: Putzabplatzungen",
    assumptions: ["Zugang Außenwand möglich", "Keine drückende Nässe (Entwurf)"],
    alternatives: ["Innenabdichtung (falls Außen nicht zugänglich)", "Teilabdichtung nach Bauteil"],
  },
  {
    id: "s2",
    title: "Bad: Lüftungskonzept + Fugen/Anschlüsse nacharbeiten",
    trade: "Innenausbau",
    package: "Sofortmaßnahmen",
    priority: "Mittel",
    goal: "Kurzfristig Schimmelrisiko senken, Feuchtespitzen abführen",
    costRange: "600–1.800 €",
    duration: "1 Tag",
    dependencies: ["Nutzerverhalten + Lüftungszeiten abstimmen"],
    evidence: "Rückfrage: Feuchtespitzen nach Duschen",
    assumptions: ["Abluftführung möglich"],
    alternatives: ["Hygrostatgesteuerter Lüfter", "Türunterschnitt + Nachströmung"],
  },
  {
    id: "s3",
    title: "Fensterlaibung: Wärmebrücken entschärfen (Details)",
    trade: "Bauphysik",
    package: "Optional/Komfort",
    priority: "Mittel",
    goal: "Kondensatbildung reduzieren, Oberflächentemperaturen erhöhen",
    costRange: "900–2.400 €",
    duration: "2–3 Tage",
    dependencies: ["Nach Messung/IR-Check (Ortstermin)"],
    evidence: "Hinweis: kalte Laibungen (Entwurf)",
    assumptions: ["Bestand erlaubt Detaildämmung"],
    alternatives: ["Laibungsdämmplatten", "Anschlussfugen optimieren"],
  },
  {
    id: "s4",
    title: "Keller: Putzsystem (salz-/feuchteverträglich) nach Diagnose",
    trade: "Putz/Anstrich",
    package: "Kernsanierung",
    priority: "Mittel",
    goal: "Folgeschäden (Abplatzungen) minimieren, Diffusionsfähigkeit erhalten",
    costRange: "1.200–3.200 €",
    duration: "2–4 Tage",
    dependencies: ["Nach Abdichtung / nach Trocknungsphase"],
    evidence: "Putzabplatzung (Bestand)",
    assumptions: ["Salzbelastung wird geprüft"],
    alternatives: ["Sanierputzsystem", "Kalkputz (je nach Befund)"],
  },
  {
    id: "s5",
    title: "Optional: Teilflächen-Dämmung (Komfort/Prävention)",
    trade: "Energie",
    package: "Optional/Komfort",
    priority: "Gering",
    goal: "Komfort & Energieeffizienz verbessern (nach Prioritäten)",
    costRange: "1.100–3.900 €",
    duration: "2–5 Tage",
    dependencies: ["Abstimmung mit Bauphysik/Details"],
    evidence: "Energieausweis (Bestand)",
    assumptions: ["Bauteilaufbau nicht vollständig bekannt (Entwurf)"],
    alternatives: ["Nur kritische Flächen", "Alternative Materialien je nach Diffusion"],
  },
]

const costByTrade = [
  { trade: "Abdichtung", range: "5.500–11.000 €", uncertainty: "hoch" as const },
  { trade: "Innenausbau", range: "600–1.800 €", uncertainty: "mittel" as const },
  { trade: "Bauphysik/Details", range: "900–2.400 €", uncertainty: "mittel" as const },
  { trade: "Putz/Anstrich", range: "1.200–3.200 €", uncertainty: "hoch" as const },
  { trade: "Energie/Komfort", range: "1.100–3.900 €", uncertainty: "mittel" as const },
]

/** -----------------------------
 *  UI HELPERS
 *  ----------------------------- */
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

function priorityTone(p: Priority) {
  switch (p) {
    case "Hoch":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "Mittel":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Gering":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
}

function uncertaintyTone(u: "hoch" | "mittel" | "niedrig") {
  switch (u) {
    case "hoch":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "mittel":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "niedrig":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
}

function recTone(r: Recommendation) {
  switch (r) {
    case "Dringend empfohlen":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "Empfohlen":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Optional":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
}

function quadrantLabel(q: RiskQuadrant) {
  switch (q) {
    case "impact_high_urgent":
      return "Hoher Impact • Sofort"
    case "impact_high_later":
      return "Hoher Impact • Später"
    case "impact_low_urgent":
      return "Niedriger Impact • Sofort"
    case "impact_low_later":
      return "Niedriger Impact • Später"
  }
}

/** -----------------------------
 *  UI BUILDING BLOCKS
 *  ----------------------------- */
function SummaryCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
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
  children: ReactNode
  rightSlot?: ReactNode
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
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
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
          <p className="text-xs text-muted-foreground">Meilenstein-basierter Score (Demo)</p>
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
            d={`${points.d} L ${points.pts.at(-1)?.[0] ?? 0} ${points.h - 10} L ${points.pts[0]?.[0] ?? 0} ${
              points.h - 10
            } Z`}
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
  return (
    <div className="space-y-3 overflow-y-auto pr-1 max-h-[320px]">
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

function ScoreCard({ score, recommendation, drivers, isDraft }: typeof assessment) {
  const sev: SeverityLevel = score >= 75 ? "ok" : score >= 50 ? "warning" : "critical"
  const styles = severityStyles(sev)

  return (
    <div className="rounded-xl bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Sanierungsempfehlung</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", recTone(recommendation)].join(" ")}>
              {recommendation}
            </span>
            {isDraft ? (
              <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Entwurf
              </span>
            ) : null}
          </div>
        </div>

        <div className={["inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium", styles.pill].join(" ")}>
          Score: {score}/100
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-24 overflow-hidden rounded-xl bg-muted/40">
          <div className={["absolute inset-x-0 bottom-0 h-1.5", styles.track].join(" ")} />
          <div className={["absolute bottom-0 left-0 h-1.5 transition-all", styles.bar].join(" ")} style={{ width: `${score}%` }} />
          <div
            className={[
              "absolute bottom-0 h-9 w-9 -translate-x-1/2 rounded-full border bg-background shadow-sm",
              styles.text,
            ].join(" ")}
            style={{ left: `${score}%` }}
          >
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold">{score}</div>
          </div>

          <div className="absolute left-3 top-3 text-xs text-muted-foreground">hoch</div>
          <div className="absolute right-3 top-3 text-xs text-muted-foreground">niedrig</div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">Top-Treiber</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {drivers.map((d) => (
            <span key={d} className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-xs text-muted-foreground border">
              {d}
            </span>
          ))}
        </div>

        <div className="mt-3 rounded-lg bg-background p-3 text-xs text-muted-foreground">
          Hinweis: Werte sind im Demo-Projekt eine <span className="font-medium text-foreground">Entwurfsbewertung</span> und werden nach Klärung offener Punkte finalisiert.
        </div>
      </div>
    </div>
  )
}

function PackagesCard({
  items,
  isDraft,
}: {
  items: typeof assessment.packages
  isDraft: boolean
}) {
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <div key={p.key} className="rounded-xl border bg-background p-4 hover:bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{p.key}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.effect}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", p.tone].join(" ")}>
                  {p.costRange}
                </span>
                <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Dauer: {p.duration}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
              Details <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function RiskMatrix({
  dots,
}: {
  dots: { label: string; quadrant: RiskQuadrant; color: string }[]
}) {
  const cells: { key: RiskQuadrant; title: string }[] = [
    { key: "impact_high_urgent", title: "Hoher Impact • Sofort" },
    { key: "impact_high_later", title: "Hoher Impact • Später" },
    { key: "impact_low_urgent", title: "Niedriger Impact • Sofort" },
    { key: "impact_low_later", title: "Niedriger Impact • Später" },
  ]

  const cellDots = (q: RiskQuadrant) => dots.filter((d) => d.quadrant === q)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {cells.map((c) => (
          <div key={c.key} className="rounded-xl border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">{c.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cellDots(c.key).length === 0 ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : (
                cellDots(c.key).map((d) => (
                  <span
                    key={d.label}
                    title={`${d.label} • ${quadrantLabel(d.quadrant)}`}
                    className="inline-flex items-center gap-2 rounded-full border bg-muted/ px-2.5 py-0.5 text-xs"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.label}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        Interpretation: „Hoher Impact • Sofort“ hat Priorität – auch wenn Kosten/Umfang größer sind.
      </div>
    </div>
  )
}

function EffectForecast({
  items,
}: {
  items: { label: string; before: number; after: number }[]
}) {
  const max = 100
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{it.label}</span>
            <span className="text-xs text-muted-foreground">vorher → nachher</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-12 text-xs text-muted-foreground">vorher</span>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-rose-500/70" style={{ width: `${(it.before / max) * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-medium text-foreground">{it.before}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-12 text-xs text-muted-foreground">nachher</span>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-emerald-500/70" style={{ width: `${(it.after / max) * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-medium text-foreground">{it.after}</span>
            </div>
          </div>
        </div>
      ))}

      <p className="pt-1 text-xs text-muted-foreground">
        Wirkungsprognose (Demo): relative Skala 0–100 zur schnellen Einordnung.
      </p>
    </div>
  )
}

/** -----------------------------
 *  MAIN PAGE — p-003
 *  ----------------------------- */
export default function ProjectP003Page() {
  const [progressView, setProgressView] = useState<"Prozent" | "Graph">("Prozent")

  const totalMeasures = measures.length
  const pkgCounts = useMemo(() => {
    const base: Record<PackageKey, number> = {
      "Sofortmaßnahmen": 0,
      "Kernsanierung": 0,
      "Optional/Komfort": 0,
    }
    for (const m of measures) base[m.package] += 1
    return base
  }, [])

  const prioCounts = useMemo(() => {
    const base: Record<Priority, number> = { Hoch: 0, Mittel: 0, Gering: 0 }
    for (const m of measures) base[m.priority] += 1
    return base
  }, [])

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

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{project.title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">{project.subtitle}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusTone(project.status)].join(" ")}>
                {project.status}
              </span>
              <span className={["inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", severityTone(project.severity)].join(" ")}>
                {project.severity === "Hoch" ? <TriangleAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                Risiko: {project.severity}
              </span>
              {assessment.isDraft ? (
                <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Entwurf
                </span>
              ) : null}
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
              Sanierungsbericht <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* SECTION 1 — Projekt & Fortschritt */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <Card className="md:col-span-8 border-primary/30">
            <CardHeader className="space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Gesamtfortschritt</CardTitle>
                  <CardDescription>Zentraler Überblick – nachvollziehbar & ruhig.</CardDescription>
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
                      <p className="text-xs font-medium text-muted-foreground">Aktuelle Phase</p>
                      <p className="mt-1 text-sm font-semibold">{project.phase}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Wir konsolidieren gerade Befunde & Unterlagen. Im nächsten Schritt werden Maßnahmenpakete finalisiert.
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

              <CollapsibleSection
                title="Aktivität"
                description="Transparenz: Was ist passiert – und wann?"
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

          {/* Next Step */}
          <Card className="md:col-span-4">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Nächster Schritt</CardTitle>
              <CardDescription>Konzentriert – ohne Sie zu überladen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs font-medium text-muted-foreground">Für Sie</p>
                <p className="mt-1 text-sm font-semibold">{project.nextCustomerTodo ?? "—"}</p>
                <div className="mt-3">
                  <Button className="w-full gap-2 cursor-pointer">
                    Rückfragen beantworten <ArrowRight className="h-4 w-4" />
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

              <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                Tipp: Bestandsfotos (Keller/Bad/Fensterlaibungen) beschleunigen die Finalisierung der Maßnahmenpakete.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 2 — Ergebnisübersicht (Sanierungsbewertung) */}
        <div className="my-6" />
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Ergebnisse (Demoergebnisse)</CardTitle>
            <CardDescription>
              Sanierungsscore, Maßnahmenpakete und Prioritäten – fachlich relevant & schnell erfassbar.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 1) Dünne Vollzeile */}
            <ScoreStrip
              score={assessment.score}
              recommendation={assessment.recommendation}
              drivers={assessment.drivers}
              isDraft={assessment.isDraft}
            />

            {/* 2) Darunter: 1/3 Pakete, 2/3 Matrix-Graph */}
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <SummaryCard
                  title="Maßnahmenpakete"
                  description="Kostenrange, Dauer & Zweck (realistisch als Range)"
                >
                  <PackagesCard items={assessment.packages} isDraft={assessment.isDraft} />
                </SummaryCard>
              </div>

              <div className="md:col-span-7">
                <RiskMatrixPlot
                  measures={measures}
                  points={[
                    // Du kannst die Koordinaten feinjustieren (0..100)
                    { key: "Sofortmaßnahmen", x: 21, y: 50, color: "#F59E0B" }, // dringend + hoher impact
                    { key: "Kernsanierung", x: 82, y: 85, color: "#EF4444" },   // hoher impact, eher „groß“
                    { key: "Optional/Komfort", x: 38, y: 28, color: "#22C55E" }, // weniger dringend/impact
                  ]}
                />
              </div>
            </div>
            <CollapsibleSection
            title="Maßnahmenplan (detailliert)"
            description="Konkrete Maßnahmen – Priorität, Paket, Kostenrange, Abhängigkeiten."
            defaultOpen
            rightSlot={
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                {totalMeasures} Maßnahmen
              </span>
            }
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                  Hoch: {prioCounts.Hoch}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Mittel: {prioCounts.Mittel}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Gering: {prioCounts.Gering}
                </span>

                <span className="ml-auto inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Sofort: {pkgCounts["Sofortmaßnahmen"]} • Kern: {pkgCounts["Kernsanierung"]} • Optional: {pkgCounts["Optional/Komfort"]}
                </span>
              </div>

              {measures.map((m) => (
                <div key={m.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{m.title}</p>
                        <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", priorityTone(m.priority)].join(" ")}>
                          Priorität: {m.priority}
                        </span>
                        <Badge variant="outline">{m.package}</Badge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">{m.goal}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-muted-foreground border">
                          Gewerk: <span className="ml-1 font-medium text-foreground">{m.trade}</span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-muted-foreground border">
                          Kosten: <span className="ml-1 font-medium text-foreground">{m.costRange}</span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-muted-foreground border">
                          Dauer: <span className="ml-1 font-medium text-foreground">{m.duration}</span>
                        </span>
                      </div>

                      {m.dependencies?.length ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Abhängigkeiten: <span className="text-foreground">{m.dependencies.join(" • ")}</span>
                        </p>
                      ) : null}

                      {m.evidence ? (
                        <p className="mt-1 text-xs text-muted-foreground">Nachweis/Quelle: {m.evidence}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 md:justify-end">
                      <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
                        Details <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* “Details” Preview (always visible but compact) */}
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Annahmen (Entwurf)</p>
                      <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                        {(m.assumptions ?? ["—"]).slice(0, 3).map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Alternativen</p>
                      <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                        {(m.alternatives ?? ["—"]).slice(0, 3).map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                Hinweis: Demo-Daten. In der echten Version wären Normbezug, Messwerte und Fotobelege sauber verknüpft.
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Kostenübersicht"
            description="Gewerk-basierte Range + Unsicherheit (realistisch)."
            defaultOpen={false}
          >
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="grid grid-cols-12 gap-0 border-b bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-5">Gewerk</div>
                <div className="col-span-4">Kostenrange</div>
                <div className="col-span-3 text-right">Unsicherheit</div>
              </div>

              {costByTrade.map((r) => (
                <div key={r.trade} className="grid grid-cols-12 px-4 py-3 text-sm border-b last:border-b-0">
                  <div className="col-span-5 font-medium">{r.trade}</div>
                  <div className="col-span-4 text-muted-foreground">{r.range}</div>
                  <div className="col-span-3 flex justify-end">
                    <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", uncertaintyTone(r.uncertainty)].join(" ")}>
                      {r.uncertainty}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Wichtig: Schätzwerte (Range) – keine Angebotsbindung. Final nach Ortstermin/Detailkonzept.
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Wirkungsprognose"
            description="Vorher/Nachher (0–100) zur schnellen Einordnung."
            defaultOpen={false}
          >
            <EffectForecast items={assessment.effects} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Fachliche Grundlagen"
            description="Befundbasis, Annahmen, Grenzen & Regelwerks-Hinweise."
            defaultOpen={false}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm font-semibold">Befundbasis (Demo)</p>
                <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                  <li>Unterlagenprüfung (Fotos/Pläne/Energieausweis)</li>
                  <li>Hinweise auf Feuchte-/Kondensatprobleme (Entwurf)</li>
                  <li>Wärmebrücken-Verdacht an Laibungen (Entwurf)</li>
                </ul>
              </div>

              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm font-semibold">Grenzen & Annahmen</p>
                <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                  <li>Keine vollständige Bauteilöffnung im Entwurf</li>
                  <li>Kosten als Range – abhängig von Zugang/Detail</li>
                  <li>Finalisierung nach Ortstermin/Messungen</li>
                </ul>
              </div>

              <div className="rounded-xl border bg-background p-4 md:col-span-2">
                <p className="text-sm font-semibold">Regelwerks-/Hinweis-Dokumente</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {docs
                    .filter((d) => d.category === "Normen/Hinweise")
                    .map((d) => (
                      <div key={d.id} className="rounded-lg border bg-card p-3 hover:bg-muted/20">
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{d.category} • {d.date}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>
          </CardContent>
        </Card>

        

        {/* SECTION 4 — Administratives (wie Projekt 2) */}
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

        {/* Communication */}
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

            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Ansprechpartner</p>
              <p className="mt-1 text-sm font-semibold">{project.responsible.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{project.responsible.role}</p>
              <p className="mt-2 text-xs text-muted-foreground">{project.responsible.availability}</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2025 BauVisio Portal • Projekt-Dashboard (Demo UI)</p>
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

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Sparkles,
  BadgeCheck,
  CalendarDays,
  Receipt,
  BookOpen,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"

/** -----------------------------
 *  TYPES
 *  ----------------------------- */
type DocCategory =
  | "Berichte"
  | "Messprotokolle"
  | "Fotos"
  | "Absprachen"
  | "Unterlagen"
  | "Sonstiges"

type DocStatus = "Neu" | "Entwurf" | "Final" | "Archiv"

type InvoiceStatus = "Offen" | "Bezahlt" | "Überfällig" | "In Prüfung"

type DocVisibility = "Kunde" | "Intern"

type ProjectRef = {
  id: string
  title: string
  address: string
  status: "In Prüfung" | "Ortstermin geplant" | "Auswertung läuft" | "Gutachten in Vorbereitung" | "Abgeschlossen"
}

type DocItem = {
  id: string
  title: string
  description?: string
  category: DocCategory
  type: "PDF" | "Bild" | "ZIP" | "Link"
  date: string
  status: DocStatus
  projectId: string
  visibility: DocVisibility
  tags?: string[]
  version?: string
  size?: string
}

type InvoiceItem = {
  id: string
  number: string
  title: string
  date: string
  due: string
  amount: string
  status: InvoiceStatus
  projectId: string
  paymentHint?: string
}

type ChecklistItem = {
  id: string
  title: string
  scope: "Für Sie" | "Intern"
  projectId: string
  done: number
  total: number
  updated: string
  hint?: string
}

type NormItem = {
  id: string
  title: string
  short: string
  tags: string[]
  projectId?: string
  kind: "Norm" | "Hinweis" | "Glossar"
  linkLabel?: string
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

const docs: DocItem[] = [
  // p-001
  {
    id: "d-001",
    title: "Ortstermin-Protokoll (Keller/Bad)",
    description: "Kurzzusammenfassung + Messpunkte .",
    category: "Messprotokolle",
    type: "PDF",
    date: "12. Dez. 2025",
    status: "Final",
    projectId: "p-001",
    visibility: "Kunde",
    tags: ["Feuchte", "Messpunkte"],
    version: "v2",
    size: "1.2 MB",
  },
  {
    id: "d-002",
    title: "Fotodokumentation – Bestand",
    description: "Fotos Keller, Bad, Fensterlaibungen .",
    category: "Fotos",
    type: "ZIP",
    date: "10. Dez. 2025",
    status: "Neu",
    projectId: "p-001",
    visibility: "Kunde",
    tags: ["Fotos"],
    size: "18.4 MB",
  },
  {
    id: "d-003",
    title: "Unterlagen: Grundrisse (Upload Kunde)",
    description: "Grundriss EG/OG, PDF-Scan .",
    category: "Unterlagen",
    type: "PDF",
    date: "09. Dez. 2025",
    status: "Final",
    projectId: "p-001",
    visibility: "Kunde",
    tags: ["Grundriss"],
    size: "860 KB",
  },

  // p-003
  {
    id: "d-010",
    title: "Energieausweis (PDF)",
    description: "Bestandsdaten als Grundlage .",
    category: "Unterlagen",
    type: "PDF",
    date: "30. Nov. 2025",
    status: "Neu",
    projectId: "p-003",
    visibility: "Kunde",
    tags: ["Energie", "Bestand"],
    version: "v1",
    size: "540 KB",
  },
  {
    id: "d-011",
    title: "Sanierungsbewertung – Entwurf",
    description: "Kostenrange, Prioritäten, Maßnahmenpakete .",
    category: "Berichte",
    type: "PDF",
    date: "13. Dez. 2025",
    status: "Entwurf",
    projectId: "p-003",
    visibility: "Kunde",
    tags: ["Maßnahmen", "Kostenrange"],
    version: "v0.9",
    size: "2.4 MB",
  },
  {
    id: "d-012",
    title: "Absprachen: Zugang Außenwand",
    description: "Kurznotiz zur Zugänglichkeit / Terminplanung .",
    category: "Absprachen",
    type: "PDF",
    date: "03. Dez. 2025",
    status: "Final",
    projectId: "p-003",
    visibility: "Kunde",
    tags: ["Absprachen"],
    size: "220 KB",
  },

  // p-007
  {
    id: "d-020",
    title: "Checkliste Bauabnahme – Vorbereitung",
    description: "Was Sie zum Termin bereithalten sollten .",
    category: "Unterlagen",
    type: "PDF",
    date: "14. Dez. 2025",
    status: "Neu",
    projectId: "p-007",
    visibility: "Kunde",
    tags: ["Abnahme", "Vorbereitung"],
    size: "310 KB",
  },
  {
    id: "d-021",
    title: "Mängelliste (Vorlage)",
    description: "Template zum Mitschreiben am Ortstermin .",
    category: "Unterlagen",
    type: "PDF",
    date: "14. Dez. 2025",
    status: "Final",
    projectId: "p-007",
    visibility: "Kunde",
    tags: ["Mängel", "Template"],
    size: "190 KB",
  },

  // "Intern" to make UI feel real (optional)
  {
    id: "d-999",
    title: "Interne Notiz: Hypothesen & offene Punkte",
    description: "Nur Demo für Rollen-/Sichtbarkeitsgefühl.",
    category: "Sonstiges",
    type: "PDF",
    date: "11. Dez. 2025",
    status: "Entwurf",
    projectId: "p-001",
    visibility: "Intern",
    tags: ["intern"],
    size: "120 KB",
  },
]

const invoices: InvoiceItem[] = [
  {
    id: "i-001",
    number: "2025-021",
    title: "Prüfungspauschale",
    date: "02. Dez. 2025",
    due: "16. Dez. 2025",
    amount: "120,00 €",
    status: "In Prüfung",
    projectId: "p-003",
    paymentHint: "Zahlung nach Freigabe der Rechnung .",
  },
  {
    id: "i-002",
    number: "2025-018",
    title: "Ortstermin & Messung",
    date: "10. Dez. 2025",
    due: "24. Dez. 2025",
    amount: "390,00 €",
    status: "Offen",
    projectId: "p-001",
    paymentHint: "Banküberweisung • 7 Tage Zahlungsziel .",
  },
  {
    id: "i-003",
    number: "2025-012",
    title: "Bauabnahme – Anfahrt",
    date: "20. Nov. 2025",
    due: "04. Dez. 2025",
    amount: "85,00 €",
    status: "Bezahlt",
    projectId: "p-007",
  },
]

const checklists: ChecklistItem[] = [
  {
    id: "c-001",
    title: "Ortstermin: Vorbereitung (Feuchteprüfung)",
    scope: "Für Sie",
    projectId: "p-001",
    done: 6,
    total: 9,
    updated: "12. Dez. 2025",
    hint: "Zugang Keller + Fotos früherer Schäden beschleunigen die Auswertung.",
  },
  {
    id: "c-002",
    title: "Rückfragen: Feuchtehistorie",
    scope: "Für Sie",
    projectId: "p-003",
    done: 2,
    total: 5,
    updated: "13. Dez. 2025",
    hint: "Baujahr, frühere Sanierung, Lüftungsgewohnheiten.",
  },
  {
    id: "c-010",
    title: "Interne Abnahme: Messpunkte konsolidieren",
    scope: "Intern",
    projectId: "p-001",
    done: 3,
    total: 7,
    updated: "11. Dez. 2025",
  },
]

const norms: NormItem[] = [
  {
    id: "n-001",
    title: "Feuchte & Schimmel: Einordnung (Klartext)",
    short: "Was bedeuten typische Messwerte – und wann wird es kritisch? (Demo-Wissenskarte).",
    tags: ["Feuchte", "Schimmel", "Interpretation"],
    kind: "Hinweis",
  },
  {
    id: "n-002",
    title: "Wärmebrücken: Warum Kondensat entsteht",
    short: "Kurz erklärt: Oberflächentemperatur, Luftfeuchte und Kondensation.",
    tags: ["Wärmebrücke", "Kondensat"],
    kind: "Glossar",
    linkLabel: "Artikel öffnen",
  },
  {
    id: "n-003",
    title: "Relevante Normen (Projekt p-001)",
    short: "Auszug/Verweise für das laufende Projekt – inkl. kurzer Erklärung, warum relevant.",
    tags: ["Norm", "Projekt"],
    kind: "Norm",
    projectId: "p-001",
    linkLabel: "Verweise ansehen",
  },
  {
    id: "n-004",
    title: "Relevante Normen (Projekt p-007)",
    short: "Checkpunkte/Begriffe, die in der Bauabnahme typischerweise vorkommen.",
    tags: ["Abnahme", "Norm", "Qualität"],
    kind: "Norm",
    projectId: "p-007",
  },
]

/** -----------------------------
 *  UI HELPERS
 *  ----------------------------- */
function statusTone(status: DocStatus) {
  switch (status) {
    case "Neu":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "Entwurf":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Final":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "Archiv":
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300"
  }
}

function invoiceTone(status: InvoiceStatus) {
  switch (status) {
    case "Offen":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Überfällig":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "Bezahlt":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "In Prüfung":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }
}

function docIcon(type: DocItem["type"]) {
  switch (type) {
    case "PDF":
      return FileText
    case "Bild":
      return Sparkles
    case "ZIP":
      return Download
    case "Link":
      return ExternalLink
  }
}

function projectLabel(id: string) {
  const p = projects.find((x) => x.id === id)
  return p ? p.title : id
}

function Section({
  title,
  description,
  children,
  rightSlot,
}: {
  title: string
  description?: string
  rightSlot?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      <div className="border-t p-4">{children}</div>
    </div>
  )
}

function CollapsibleSection({
  title,
  hint,
  defaultOpen = true,
  rightSlot,
  children,
}: {
  title: string
  hint?: string
  defaultOpen?: boolean
  rightSlot?: ReactNode
  children: ReactNode
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
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
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

/** -----------------------------
 *  MAIN PAGE
 *  ----------------------------- */
export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"docs" | "checklists" | "norms" | "invoices">("docs")
  const [projectId, setProjectId] = useState<string>("all")
  const [query, setQuery] = useState<string>("")
  const [onlyNew, setOnlyNew] = useState(false)
  const [onlyCustomerVisible, setOnlyCustomerVisible] = useState(true)
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "az" | "za">("date_desc")

  const [onlyOpenInvoices, setOnlyOpenInvoices] = useState(false)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailDoc, setDetailDoc] = useState<DocItem | null>(null)
  const [detailInvoice, setDetailInvoice] = useState<InvoiceItem | null>(null)

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = docs.slice()

    if (projectId !== "all") list = list.filter((d) => d.projectId === projectId)
    if (onlyNew) list = list.filter((d) => d.status === "Neu")
    if (onlyCustomerVisible) list = list.filter((d) => d.visibility === "Kunde")

    if (q) {
      list = list.filter((d) => {
        const hay = [
          d.title,
          d.description ?? "",
          d.category,
          d.type,
          projectLabel(d.projectId),
          (d.tags ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(q)
      })
    }

    list.sort((a, b) => {
      const da = new Date(a.date.replace(".", "")).getTime()
      const db = new Date(b.date.replace(".", "")).getTime()
      if (sortBy === "az") return a.title.localeCompare(b.title)
      if (sortBy === "za") return b.title.localeCompare(a.title)
      if (sortBy === "date_asc") return da - db
      return db - da
    })

    return list
  }, [projectId, query, onlyNew, onlyCustomerVisible, sortBy])

  const groupedDocs = useMemo(() => {
    const g: Record<DocCategory, DocItem[]> = {
      Berichte: [],
      Messprotokolle: [],
      Fotos: [],
      Absprachen: [],
      Unterlagen: [],
      Sonstiges: [],
    }
    for (const d of filteredDocs) g[d.category].push(d)
    return g
  }, [filteredDocs])

  const invoiceList = useMemo(() => {
    let list = invoices.slice()
    if (projectId !== "all") list = list.filter((x) => x.projectId === projectId)
    if (onlyOpenInvoices) list = list.filter((x) => x.status === "Offen" || x.status === "Überfällig" || x.status === "In Prüfung")

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((x) => {
        const hay = [x.number, x.title, x.amount, x.status, projectLabel(x.projectId)].join(" ").toLowerCase()
        return hay.includes(q)
      })
    }
    return list
  }, [projectId, onlyOpenInvoices, query])

  const checklistList = useMemo(() => {
    let list = checklists.slice()
    if (projectId !== "all") list = list.filter((x) => x.projectId === projectId)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((x) => [x.title, x.scope, projectLabel(x.projectId)].join(" ").toLowerCase().includes(q))
    return list
  }, [projectId, query])

  const normList = useMemo(() => {
    let list = norms.slice()
    if (projectId !== "all") list = list.filter((x) => !x.projectId || x.projectId === projectId)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((x) => [x.title, x.short, x.kind, x.tags.join(" ")].join(" ").toLowerCase().includes(q))
    return list
  }, [projectId, query])

  const counts = useMemo(() => {
    const docCount = filteredDocs.length
    const invoiceCount = invoiceList.length
    const checklistCount = checklistList.length
    const normCount = normList.length
    const openInv = invoiceList.filter((x) => x.status !== "Bezahlt").length
    const newDocs = filteredDocs.filter((d) => d.status === "Neu").length
    return { docCount, invoiceCount, checklistCount, normCount, openInv, newDocs }
  }, [filteredDocs, invoiceList, checklistList, normList])

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function selectAllVisible() {
    setSelected(new Set(filteredDocs.map((d) => d.id)))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Kundenportal • Bereich</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dokumente & Rechnungen</h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Alles sauber nach Projekt und Typ organisiert. Suche, Filter und Detailansicht sind im Demo als UI vorgesehen.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                {counts.docCount} Dokumente
              </span>
              
              <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                <Receipt className="h-3.5 w-3.5" />
                {counts.openInv} offen / {counts.invoiceCount} gesamt
              </span>
              {counts.newDocs ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {counts.newDocs} neu
                </span>
              ) : null}
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
                    placeholder="Suche nach Titel, Tag, Kategorie, Rechnungsnummer…"
                    className="pl-9"
                  />
                </div>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Sortierung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Neueste zuerst</SelectItem>
                    <SelectItem value="date_asc">Älteste zuerst</SelectItem>
                    <SelectItem value="az">A–Z</SelectItem>
                    <SelectItem value="za">Z–A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="my-6" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full h-10 grid-cols-4">
            <TabsTrigger value="docs" className="gap-2">
              <FileText className="h-4 w-4" />
              Dokumente
              <span className="ml-1 inline-flex items-center rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                {counts.docCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="checklists" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Checklisten
              <span className="ml-1 inline-flex items-center rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                {counts.checklistCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="norms" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Normen & Hinweise
              <span className="ml-1 inline-flex items-center rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                {counts.normCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <Receipt className="h-4 w-4" />
              Rechnungen
              <span className="ml-1 inline-flex items-center rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                {counts.invoiceCount}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* DOCUMENTS TAB */}
          <TabsContent value="docs" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-12">
              <Card className="md:col-span-8 border-primary/20">
                <CardHeader className="space-y-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Projekt-Dokumente</CardTitle>
                      <CardDescription>
                        Übersicht aller hochgeladenen Dateien, Berichte und Protokolle.
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={selectAllVisible}
                      >
                        Alle auswählen
                      </Button>
                      <Button size="sm" className="gap-2 cursor-pointer" disabled={!selected.size}>
                        <Download className="h-4 w-4" />
                        Bulk-Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {filteredDocs.length === 0 ? (
                    <div className="rounded-xl border bg-muted/30 p-6 text-center">
                      <p className="text-sm font-semibold">Keine Treffer</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Passe Projektfilter oder Suche an.
                      </p>
                    </div>
                  ) : (
                    <>
                      <CollapsibleSection
                        title="Berichte"
                        hint="Gutachten, Entwürfe, Abschlussberichte"
                        defaultOpen
                        rightSlot={
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {groupedDocs.Berichte.length}
                          </span>
                        }
                      >
                        <DocList
                          items={groupedDocs.Berichte}
                          selected={selected}
                          onToggle={toggleSelected}
                          onOpen={(d) => setDetailDoc(d)}
                        />
                      </CollapsibleSection>

                      <CollapsibleSection
                        title="Messprotokolle"
                        hint="Messpunkte, Ortstermin-Protokolle, Auszüge"
                        defaultOpen={false}
                        rightSlot={
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {groupedDocs.Messprotokolle.length}
                          </span>
                        }
                      >
                        <DocList
                          items={groupedDocs.Messprotokolle}
                          selected={selected}
                          onToggle={toggleSelected}
                          onOpen={(d) => setDetailDoc(d)}
                        />
                      </CollapsibleSection>

                      <CollapsibleSection
                        title="Fotos"
                        hint="Fotodokumentationen, Bildpakete"
                        defaultOpen={false}
                        rightSlot={
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {groupedDocs.Fotos.length}
                          </span>
                        }
                      >
                        <DocList
                          items={groupedDocs.Fotos}
                          selected={selected}
                          onToggle={toggleSelected}
                          onOpen={(d) => setDetailDoc(d)}
                        />
                      </CollapsibleSection>

                      <CollapsibleSection
                        title="Absprachen"
                        hint="Freigaben, Notizen, Terminabstimmungen"
                        defaultOpen={false}
                        rightSlot={
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {groupedDocs.Absprachen.length}
                          </span>
                        }
                      >
                        <DocList
                          items={groupedDocs.Absprachen}
                          selected={selected}
                          onToggle={toggleSelected}
                          onOpen={(d) => setDetailDoc(d)}
                        />
                      </CollapsibleSection>

                      <CollapsibleSection
                        title="Unterlagen"
                        hint="Uploads, Pläne, Scans, Vorbefunde"
                        defaultOpen={false}
                        rightSlot={
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {groupedDocs.Unterlagen.length}
                          </span>
                        }
                      >
                        <DocList
                          items={groupedDocs.Unterlagen}
                          selected={selected}
                          onToggle={toggleSelected}
                          onOpen={(d) => setDetailDoc(d)}
                        />
                      </CollapsibleSection>

                      <CollapsibleSection
                        title="Sonstiges"
                        hint="Optionale Demo-Kategorie"
                        defaultOpen={false}
                        rightSlot={
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {groupedDocs.Sonstiges.length}
                          </span>
                        }
                      >
                        <DocList
                          items={groupedDocs.Sonstiges}
                          selected={selected}
                          onToggle={toggleSelected}
                          onOpen={(d) => setDetailDoc(d)}
                        />
                      </CollapsibleSection>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="md:col-span-4 space-y-4">
                <Section
                  title="Schnellübersicht"
                  description="Damit die Seite nicht nur „Dateiliste“ ist."
                >
                  <div className="space-y-3">
                    <div className="rounded-xl bg-primary/5 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Letzte Updates</p>
                      <div className="mt-3 space-y-2">
                        {filteredDocs.slice(0, 3).map((d) => (
                          <button
                            key={d.id}
                            className="w-full rounded-lg bg-background p-3 text-left hover:bg-muted/20"
                            onClick={() => setDetailDoc(d)}
                          >
                            <p className="text-sm font-semibold leading-snug">{d.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {d.date} • {projectLabel(d.projectId)}
                            </p>
                          </button>
                        ))}
                        {filteredDocs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">—</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs font-medium text-muted-foreground">Aktionen</p>
                      <div className="mt-3 grid gap-2">
                        <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                          Dokumente exportieren <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                          Termin-Checkliste <CalendarDays className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                          Rechnungen prüfen <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                      Hinweis: In der echten Version wären Dokumente mit Messpunkten, Timeline und Chat verknüpft.
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </TabsContent>

          {/* CHECKLISTS TAB */}
          <TabsContent value="checklists" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Checklisten</CardTitle>
                <CardDescription>
                  Greifbarer Fortschritt: Aufgaben statt unklarer Fachbegriffe .
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {checklistList.length === 0 ? (
                  <div className="md:col-span-2 rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-semibold">Keine Checklisten</p>
                    <p className="mt-1 text-sm text-muted-foreground">Wähle ein anderes Projekt oder entferne Filter.</p>
                  </div>
                ) : (
                  checklistList.map((c) => {
                    const pct = Math.round((c.done / Math.max(c.total, 1)) * 100)
                    return (
                      <div key={c.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{c.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {c.scope} • {projectLabel(c.projectId)} • Update: {c.updated}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {c.done}/{c.total}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Fortschritt</span>
                            <span className="font-medium text-foreground">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>

                        {c.hint ? (
                          <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                            {c.hint}
                          </div>
                        ) : null}

                      
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NORMS TAB */}
          <TabsContent value="norms" className="mt-4 space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Normen & Hinweise</CardTitle>
                <CardDescription>
                  Erklärende Wissensbasis für alle Projekte.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {normList.length === 0 ? (
                  <div className="md:col-span-2 rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-semibold">Keine Einträge</p>
                    <p className="mt-1 text-sm text-muted-foreground">Passe Projektfilter oder Suche an.</p>
                  </div>
                ) : (
                  normList.map((n) => (
                    <div key={n.id} className="rounded-xl border bg-card p-4 hover:bg-muted/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{n.title}</p>
                            <span className="inline-flex items-center rounded-full bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground border">
                              {n.kind}
                            </span>
                            {n.projectId ? (
                              <span className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-xs text-muted-foreground border">
                                {projectLabel(n.projectId)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{n.short}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {n.tags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-xs text-muted-foreground border"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
                          {n.linkLabel ?? "Öffnen"} <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                        Ziel: Kunde versteht „Warum relevant?“ in 30 Sekunden – Details optional.
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVOICES TAB */}
          <TabsContent value="invoices" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Rechnungen</CardTitle>
                    <CardDescription>
                      Separat vom Rest. Status ist klar und sofort sichtbar.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={onlyOpenInvoices ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setOnlyOpenInvoices((v) => !v)}
                    >
                      Nur offen
                    </Button>
                    <Button variant="outline" className="gap-2 cursor-pointer hover:bg-muted">
                      <Download className="h-4 w-4" />
                      Export 
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invoiceList.length === 0 ? (
                  <div className="rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-semibold">Keine Rechnungen gefunden</p>
                    <p className="mt-1 text-sm text-muted-foreground">Passe Projektfilter oder Suche an.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border bg-background">
                    <div className="grid grid-cols-12 gap-0 border-b bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
                      <div className="col-span-3">Rechnung</div>
                      <div className="col-span-3">Projekt</div>
                      <div className="col-span-2">Datum</div>
                      <div className="col-span-2">Fällig</div>
                      <div className="col-span-2 text-right">Status / Betrag</div>
                    </div>

                    {invoiceList.map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        className="grid w-full grid-cols-12 px-4 py-3 text-left text-sm border-b last:border-b-0 hover:bg-muted/20"
                        onClick={() => setDetailInvoice(inv)}
                      >
                        <div className="col-span-3">
                          <p className="font-semibold">{inv.number}</p>
                          <p className="text-xs text-muted-foreground">{inv.title}</p>
                        </div>
                        <div className="col-span-3 text-muted-foreground">{projectLabel(inv.projectId)}</div>
                        <div className="col-span-2 text-muted-foreground">{inv.date}</div>
                        <div className="col-span-2 text-muted-foreground">{inv.due}</div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", invoiceTone(inv.status)].join(" ")}>
                            {inv.status}
                          </span>
                          <span className="font-semibold">{inv.amount}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialogs */}
        <Dialog open={!!detailDoc} onOpenChange={(o) => !o && setDetailDoc(null)}>
          <DialogContent className="max-w-2xl">
            {detailDoc ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base">{detailDoc.title}</DialogTitle>
                  <DialogDescription>
                    {projectLabel(detailDoc.projectId)} • {detailDoc.category} • {detailDoc.date}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-7 space-y-3">
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Vorschau </p>
                      <div className="mt-3 flex items-center gap-3 rounded-lg bg-background p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          {(() => {
                            const Icon = docIcon(detailDoc.type)
                            return <Icon className="h-5 w-5 text-muted-foreground" />
                          })()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{detailDoc.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {detailDoc.size ?? "—"} • {detailDoc.version ? `Version: ${detailDoc.version}` : "—"}
                          </p>
                        </div>
                      </div>

                      {detailDoc.description ? (
                        <p className="mt-3 text-sm text-muted-foreground">{detailDoc.description}</p>
                      ) : null}
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs font-medium text-muted-foreground">Metadaten</p>
                      <div className="mt-3 grid gap-2 text-sm">
                        <MetaRow label="Projekt">
                        <span className="inline-flex px-2.5 py-0.5 text-xs text-muted-foreground">
                                {projectLabel(detailDoc.projectId)}
                              </span>
                        </MetaRow>
                        <MetaRow label="Status">
                          <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusTone(detailDoc.status)].join(" ")}>
                            {detailDoc.status}
                          </span>
                        </MetaRow>
                        <MetaRow label="Sichtbarkeit">
                          <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                            {detailDoc.visibility}
                          </span>
                        </MetaRow>
                        <MetaRow label="Kategorie">
                         <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                                {detailDoc.category}
                              </span>
                          </div>
                        </MetaRow>
                        
                        <MetaRow label="Tags">
                          <div className="flex flex-wrap gap-2">
                            {(detailDoc.tags ?? ["—"]).map((t) => (
                              <span key={t} className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                                {t}
                              </span>
                            ))}
                          </div>
                        </MetaRow>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-3">
                    <div className="rounded-xl bg-primary/5 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Aktionen</p>
                      <div className="mt-3 grid gap-2">
                        <Button className="w-full gap-2 cursor-pointer">
                          <FileText className="h-4 w-4" />
                          Ansehen
                        </Button>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                          Download <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                          Teilen<ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs font-medium text-muted-foreground">Versionen </p>
                      <div className="mt-3 space-y-2">
                        {[
                          { v: detailDoc.version ?? "v1", date: detailDoc.date, label: detailDoc.status },
                          { v: "v0.8", date: "09. Dez. 2025", label: "Entwurf" },
                        ].map((it) => (
                          <div key={it.v} className="rounded-lg border bg-background p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold">{it.v}</p>
                              <Badge variant="outline">{it.label}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{it.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={!!detailInvoice} onOpenChange={(o) => !o && setDetailInvoice(null)}>
          <DialogContent className="max-w-xl">
            {detailInvoice ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base">
                    Rechnung {detailInvoice.number}
                  </DialogTitle>
                  <DialogDescription>
                    {projectLabel(detailInvoice.projectId)} • {detailInvoice.date}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{detailInvoice.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Fällig: {detailInvoice.due}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Betrag</p>
                        <p className="text-2xl font-semibold tracking-tight">{detailInvoice.amount}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", invoiceTone(detailInvoice.status)].join(" ")}>
                        {detailInvoice.status}
                      </span>
                      <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                        Projekt: {projectLabel(detailInvoice.projectId)}
                      </span>
                    </div>
                  </div>

                  {detailInvoice.paymentHint ? (
                    <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                      {detailInvoice.paymentHint}
                    </div>
                  ) : null}

                  <div className="grid gap-2 md:grid-cols-2">
                    <Button className="w-full gap-2 cursor-pointer">
                      <Receipt className="h-4 w-4" />
                      PDF öffnen 
                    </Button>
                    <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-muted">
                      Download <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2025 BauVisio Portal • Dokumente (Demo UI)</p>
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

/** -----------------------------
 *  SUBCOMPONENTS
 *  ----------------------------- */
function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 items-start gap-2">
      <div className="col-span-4 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="col-span-8">{children}</div>
    </div>
  )
}

function DocList({
  items,
  selected,
  onToggle,
  onOpen,
}: {
  items: DocItem[]
  selected: Set<string>
  onToggle: (id: string) => void
  onOpen: (d: DocItem) => void
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">—</p>
  }

  return (
    <div className="space-y-2">
      {items.map((d) => {
        const Icon = docIcon(d.type)
        const isChecked = selected.has(d.id)

        return (
          <div key={d.id} className="rounded-xl border bg-background p-4 hover:bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Checkbox checked={isChecked} onCheckedChange={() => onToggle(d.id)} />
              </div>

              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusTone(d.status)].join(" ")}>
                    {d.status}
                  </span>
                  {d.visibility === "Intern" ? (
                    <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Intern
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {d.category} • {d.date} • {projectLabel(d.projectId)}
                  {d.size ? ` • ${d.size}` : ""}
                  {d.version ? ` • ${d.version}` : ""}
                </p>

                {d.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                ) : null}

                {d.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {d.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 cursor-pointer hover:bg-muted"
                  onClick={() => onOpen(d)}
                >
                  <FileText className="h-4 w-4" />
                  Details
                </Button>
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer hover:bg-muted">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

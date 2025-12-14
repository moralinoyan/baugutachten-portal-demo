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
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Search,
  MessageCircle,
  Plus,
  Inbox,
  Archive,
  ArrowRight,
  Paperclip,
  Send,
  Circle,
  MapPin,
  User,
  Clock,
} from "lucide-react"

/** -----------------------------
 *  TYPES
 *  ----------------------------- */
type Project = {
  id: string
  title: string
  address: string
}

type ThreadStatus = "Offen" | "Wartet auf Sie" | "Erledigt"
type Thread = {
  id: string
  projectId: string
  subject: string
  participants: { name: string; role: string }[]
  lastMessageAt: string
  unreadCount: number
  status: ThreadStatus
  preview: string
  tags?: string[]
  archived?: boolean
}

type Message = {
  id: string
  threadId: string
  from: "Sie" | "Gutachterteam" | "Backoffice"
  text: string
  time: string
  kind?: "normal" | "system"
}

/** -----------------------------
 *  DEMO DATA
 *  ----------------------------- */
const projects: Project[] = [
  { id: "p-001", title: "Feuchtigkeitsprüfung – EFH", address: "Westring 12, 48143 Münster" },
  { id: "p-003", title: "Sanierungsbewertung – Altbau", address: "Hauptstraße 88, 48143 Münster" },
  { id: "p-007", title: "Bauabnahme – Neubau", address: "Am Park 4, 48155 Münster" },
]

const seedThreads: Thread[] = [
  {
    id: "t-001",
    projectId: "p-001",
    subject: "Rückfrage: Feuchtehistorie & Lüftung",
    participants: [
      { name: "Dipl.-Ing. Anna Berger", role: "Sachverständige" },
      { name: "Backoffice", role: "Koordination" },
    ],
    lastMessageAt: "14. Dez., 10:12",
    unreadCount: 2,
    status: "Wartet auf Sie",
    preview: "Können Sie uns kurz sagen, ob es frühere Sanierungen gab…",
    tags: ["Feuchte", "Unterlagen"],
  },
  {
    id: "t-002",
    projectId: "p-003",
    subject: "Sanierungsbewertung – Entwurf (Feedback)",
    participants: [{ name: "Gutachterteam", role: "Team" }],
    lastMessageAt: "13. Dez., 17:44",
    unreadCount: 0,
    status: "Offen",
    preview: "Wir haben den Entwurf hochgeladen. Bitte prüfen Sie kurz…",
    tags: ["Entwurf", "Kostenrange"],
  },
  {
    id: "t-003",
    projectId: "p-007",
    subject: "Ortstermin Bauabnahme – Terminabstimmung",
    participants: [{ name: "Backoffice", role: "Koordination" }],
    lastMessageAt: "12. Dez., 09:05",
    unreadCount: 0,
    status: "Erledigt",
    preview: "Termin ist bestätigt. Falls sich etwas ändert, melden wir uns…",
    tags: ["Termin"],
  },
  {
    id: "t-004",
    projectId: "p-001",
    subject: "Dokumente: Grundrisse / Fotos (Upload)",
    participants: [{ name: "Gutachterteam", role: "Team" }],
    lastMessageAt: "10. Dez., 14:21",
    unreadCount: 0,
    status: "Offen",
    preview: "Danke! Wir haben die Pläne erhalten. Nächster Schritt: Auswertung…",
    tags: ["Dokumente"],
    archived: true,
  },
]

const seedMessages: Message[] = [
  {
    id: "m-001",
    threadId: "t-001",
    from: "Gutachterteam",
    text: "Bitte schicken Sie – falls vorhanden – frühere Schimmel-/Feuchteschäden und Sanierungsversuche (Fotos/Protokolle).",
    time: "14. Dez., 09:58",
  },
  {
    id: "m-002",
    threadId: "t-001",
    from: "Gutachterteam",
    text: "Außerdem: Wie oft lüften Sie typischerweise (morgens/abends)?",
    time: "14. Dez., 10:12",
  },
  {
    id: "m-003",
    threadId: "t-001",
    from: "Sie",
    text: "Ich sende heute Abend Fotos vom Keller + Bad. Lüften meist morgens/abends.",
    time: "14. Dez., 10:20",
  },

  {
    id: "m-010",
    threadId: "t-002",
    from: "Gutachterteam",
    text: "Wir haben den Entwurf der Sanierungsbewertung hochgeladen. Bitte prüfen Sie die Annahmen (Zugang Außenwand / keine drückende Nässe).",
    time: "13. Dez., 17:44",
  },
  {
    id: "m-011",
    threadId: "t-002",
    from: "Sie",
    text: "Sieht gut aus. Außenwand-Zugang ist möglich, drückende Nässe ist mir nicht bekannt.",
    time: "13. Dez., 18:02",
  },

  {
    id: "m-020",
    threadId: "t-003",
    from: "Backoffice",
    text: "Ortstermin Bauabnahme ist bestätigt: 18. Dez., 09:30. Bitte halten Sie die Bauunterlagen bereit (Pläne, Baubeschreibung, ggf. Protokolle).",
    time: "12. Dez., 09:05",
  },
  {
    id: "m-021",
    threadId: "t-003",
    from: "Sie",
    text: "Bestätigt, danke.",
    time: "12. Dez., 09:12",
  },

  {
    id: "m-030",
    threadId: "t-004",
    from: "Gutachterteam",
    text: "Danke! Wir haben die Pläne erhalten. Nächster Schritt: Auswertung der Messpunkte.",
    time: "10. Dez., 14:21",
  },
]

/** -----------------------------
 *  HELPERS
 *  ----------------------------- */
function projectById(id: string) {
  return projects.find((p) => p.id === id)
}

function threadTone(status: ThreadStatus) {
  switch (status) {
    case "Wartet auf Sie":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "Erledigt":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "Offen":
    default:
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }
}

/** -----------------------------
 *  MAIN PAGE
 *  ----------------------------- */
export default function MessagesPage() {
  const [tab, setTab] = useState<"inbox" | "archive">("inbox")
  const [projectId, setProjectId] = useState<string>("all")
  const [q, setQ] = useState("")
  const [onlyUnread, setOnlyUnread] = useState(false)

  const [threads, setThreads] = useState<Thread[]>(seedThreads)
  const [messages, setMessages] = useState<Message[]>(seedMessages)

  const visibleThreads = useMemo(() => {
    const query = q.trim().toLowerCase()
    return threads
      .filter((t) => (tab === "archive" ? !!t.archived : !t.archived))
      .filter((t) => (projectId === "all" ? true : t.projectId === projectId))
      .filter((t) => (onlyUnread ? t.unreadCount > 0 : true))
      .filter((t) => {
        if (!query) return true
        const hay = [
          t.subject,
          t.preview,
          projectById(t.projectId)?.title ?? "",
          (t.tags ?? []).join(" "),
          t.participants.map((p) => p.name).join(" "),
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(query)
      })
      .sort((a, b) => {
        // keep it simple: newest-ish first by string (demo)
        return b.lastMessageAt.localeCompare(a.lastMessageAt)
      })
  }, [threads, tab, projectId, onlyUnread, q])

  const [activeThreadId, setActiveThreadId] = useState<string>(() => visibleThreads[0]?.id ?? "t-001")
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? visibleThreads[0] ?? null,
    [threads, activeThreadId, visibleThreads]
  )

  const activeMessages = useMemo(() => {
    if (!activeThread) return []
    return messages.filter((m) => m.threadId === activeThread.id)
  }, [messages, activeThread])

  const [draft, setDraft] = useState("")
  const [newMsgOpen, setNewMsgOpen] = useState(false)

  // ensure active thread exists when filters change
  useMemo(() => {
    if (!visibleThreads.length) return
    const stillVisible = visibleThreads.some((t) => t.id === activeThreadId)
    if (!stillVisible) setActiveThreadId(visibleThreads[0].id)
  }, [visibleThreads, activeThreadId])

  function markThreadRead(id: string) {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
    )
  }

  function toggleArchive(id: string) {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, archived: !t.archived } : t))
    )
  }

  function sendMessage() {
    if (!activeThread) return
    const text = draft.trim()
    if (!text) return

    const now = "14. Dez., 12:34" // Demo
    const newM: Message = {
      id: `m-${Math.random().toString(16).slice(2)}`,
      threadId: activeThread.id,
      from: "Sie",
      text,
      time: now,
    }

    setMessages((prev) => [...prev, newM])
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, lastMessageAt: now, preview: text.slice(0, 90) }
          : t
      )
    )
    setDraft("")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Kundenportal • Bereich</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Nachrichten</h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Direkter Austausch mit den Zuständigen – strukturiert nach Projekt, mit klarer Historie.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button variant="outline" className="gap-2 hover:bg-muted" onClick={() => setNewMsgOpen(true)}>
              <Plus className="h-4 w-4" />
              Neue Nachricht
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Top Controls */}
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
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Suche nach Betreff, Projekt, Tag, Teilnehmer…"
                    className="pl-9"
                  />
                </div>

                <Button
                  variant={onlyUnread ? "default" : "outline"}
                  className="hover:bg-muted"
                  onClick={() => setOnlyUnread((v) => !v)}
                >
                  Nur ungelesen
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="my-6" />

        {/* Main layout */}
        <div className="grid gap-4 md:grid-cols-12">
          {/* Left: Thread list */}
          <Card className="md:col-span-5 border-primary/20">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Postfach</CardTitle>
                  <CardDescription>
                    Threads nach Projekt – klarer Kontext, keine Chat-Überforderung.
                  </CardDescription>
                </div>
              </div>

              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox" className="gap-2">
                    <Inbox className="h-4 w-4" /> Inbox
                  </TabsTrigger>
                  <TabsTrigger value="archive" className="gap-2">
                    <Archive className="h-4 w-4" /> Archiv
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="mt-3" />
                <TabsContent value="archive" className="mt-3" />
              </Tabs>
            </CardHeader>

            <CardContent>
              {visibleThreads.length === 0 ? (
                <div className="rounded-xl border bg-muted/30 p-6 text-center">
                  <p className="text-sm font-semibold">Keine Threads</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Passe Filter oder Suche an.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                  {visibleThreads.map((t) => {
                    const p = projectById(t.projectId)
                    const isActive = t.id === activeThreadId
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setActiveThreadId(t.id)
                          markThreadRead(t.id)
                        }}
                        className={[
                          "w-full rounded-xl border bg-background p-4 text-left hover:bg-muted/20",
                          isActive ? "border-primary/40 bg-primary/5" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold">{t.subject}</p>
                              <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", threadTone(t.status)].join(" ")}>
                                {t.status}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {p ? p.title : t.projectId} • {t.lastMessageAt}
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {t.preview}
                            </p>

                            {t.tags?.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {t.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div className="shrink-0 text-right">
                            {t.unreadCount > 0 ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                                <Circle className="h-3 w-3 fill-current" />
                                {t.unreadCount}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Conversation */}
          <Card className="md:col-span-7">
            <CardHeader className=" relative space-y-2">
              {activeThread ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-lg">{activeThread.subject}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {projectById(activeThread.projectId)?.address ?? "—"}
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {activeThread.participants.map((x) => x.name).join(" • ")}
                        </span>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", threadTone(activeThread.status)].join(" ")}>
                      {activeThread.status}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Letzte Aktivität: {activeThread.lastMessageAt}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <CardTitle className="text-lg">Keine Konversation</CardTitle>
                  <CardDescription>Wähle links einen Thread aus.</CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="rounded-xl border bg-muted/20">
                <div className="max-h-[420px] overflow-auto p-4 space-y-3">
                  {activeThread ? (
                    activeMessages.length ? (
                      activeMessages.map((m) => {
                        const isMe = m.from === "Sie"
                        return (
                          <div
                            key={m.id}
                            className={[
                              "flex",
                              isMe ? "justify-end" : "justify-start",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "max-w-[86%] rounded-2xl border px-4 py-3",
                                isMe ? "bg-primary text-primary-foreground border-primary/40" : "bg-background",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className={["text-xs font-medium", isMe ? "opacity-90" : "text-muted-foreground"].join(" ")}>
                                  {m.from}
                                </p>
                                <p className={["text-xs", isMe ? "opacity-80" : "text-muted-foreground"].join(" ")}>
                                  {m.time}
                                </p>
                              </div>
                              <p className="mt-2 text-sm leading-relaxed">{m.text}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="rounded-xl border bg-background p-6 text-center">
                        <p className="text-sm font-semibold">Noch keine Nachrichten</p>
                        <p className="mt-1 text-sm text-muted-foreground">Schreibe unten die erste Nachricht.</p>
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border bg-background p-6 text-center">
                      <p className="text-sm font-semibold">Wähle links einen Thread</p>
                      <p className="mt-1 text-sm text-muted-foreground">Dann siehst du hier die Konversation.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Composer */}
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Antwort</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Kurz, klar, im Projektkontext. (Demo-UI)
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2 hover:bg-muted">
                    <Paperclip className="h-4 w-4" />
                    Anhang
                  </Button>
                </div>

                <div className="mt-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Nachricht schreiben…"
                    className="min-h-[110px] w-full resize-none rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={!activeThread}
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Hinweis: Im echten System könnte hier „Senden an Gutachter/Backoffice“ getrennt werden.
                  </p>
                  <Button
                    className="gap-2"
                    onClick={sendMessage}
                    disabled={!activeThread || !draft.trim()}
                  >
                    <Send className="h-4 w-4" />
                    Senden
                  </Button>
                </div>
              </div>

              {/* Quick info block */}
              {activeThread ? (
                <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                  Tipp: Halte Rückfragen „belegbar“ (Fotos/Datum/Ort). Das reduziert Ping-Pong und beschleunigt die Auswertung.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* New message dialog (Demo) */}
        <Dialog open={newMsgOpen} onOpenChange={setNewMsgOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base">Neue Nachricht</DialogTitle>
              <DialogDescription>
                Startet einen neuen Thread im Projektkontext (Demo).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Projekt</p>
                <div className="mt-2">
                  <Select defaultValue="p-001">
                    <SelectTrigger>
                      <SelectValue placeholder="Projekt wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="mt-3 text-xs font-medium text-muted-foreground">Betreff</p>
                <div className="mt-2">
                  <Input placeholder="z. B. Rückfrage zum Ortstermin" />
                </div>

                <p className="mt-3 text-xs font-medium text-muted-foreground">Nachricht</p>
                <div className="mt-2">
                  <textarea
                    placeholder="Kurz schildern, worum es geht…"
                    className="min-h-[110px] w-full resize-none rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <Button className="w-full">Thread erstellen (Demo)</Button>
                <Button variant="outline" className="w-full hover:bg-muted" onClick={() => setNewMsgOpen(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2025 BauVisio Portal • Nachrichten (Demo UI)</p>
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

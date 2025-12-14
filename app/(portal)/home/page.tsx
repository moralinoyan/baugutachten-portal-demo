"use client"
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
import { useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  FileText,
  MessageCircle,
  Phone,
  ArrowRight,
  MapPin,
  ClipboardList,
  Sparkles,
  Bell,
  Home,
  Folder,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react"


type ProjectStatus =
  | "In Prüfung"
  | "Ortstermin geplant"
  | "Auswertung läuft"
  | "Gutachten in Vorbereitung"
  | "Abgeschlossen"

type Project = {
  id: string
  title: string
  subtitle: string
  address: string
  status: ProjectStatus
  progress: number
  nextStep: string
  dueHint?: string
  updatedAt: string
}

const projects: Project[] = [
  {
    id: "p-001",
    title: "Feuchtigkeitsgutachten – Einfamilienhaus",
    subtitle: "Schimmelverdacht im Keller • Messung & Ursachenanalyse",
    address: "Musterstraße 12, 48143 Münster",
    status: "Auswertung läuft",
    progress: 62,
    nextStep: "Rückfragen zu Messwerten beantworten",
    dueHint: "bis 18. Dez.",
    updatedAt: "Heute, 14:10",
  },
  {
    id: "p-002",
    title: "Baumängelprüfung – Neubau",
    subtitle: "Abnahmebegleitung • Dokumentation & Mängelliste",
    address: "Beispielweg 3, 48139 Münster",
    status: "Ortstermin geplant",
    progress: 28,
    nextStep: "Ortstermin bestätigen",
    dueHint: "15. Jan.",
    updatedAt: "Gestern, 19:02",
  },
  {
    id: "p-003",
    title: "Sanierungsbewertung – Altbau",
    subtitle: "Kostenrahmen • Priorisierung • Handlungsempfehlung",
    address: "Hauptstraße 88, 48143 Münster",
    status: "In Prüfung",
    progress: 12,
    nextStep: "-",
    updatedAt: "03. Dez., 11:27",
  },
]

const updates = [
  {
    id: "u1",
    title: "Ortstermin vorgeschlagen",
    meta: "Neubau • 15. Jan., 10:30",
  },
  {
    id: "u2",
    title: "Neues Dokument verfügbar",
    meta: "Feuchtigkeitsgutachten",
  },
]

function statusBadgeVariant(status: ProjectStatus) {
  switch (status) {
    case "Abgeschlossen":
      return "secondary"
    case "Auswertung läuft":
      return "default"
    case "Ortstermin geplant":
      return "outline"
    case "Gutachten in Vorbereitung":
      return "default"
    default:
      return "secondary"
  }
}

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

export default function HomePage() {
  const primaryProject = projects[0]
  return (
    <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          {/* Top Header / Welcome */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Willkommen zurück, <span className="text-primary">Herr Müller!</span>
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Hier sehen Sie Ihre laufenden Projekte auf einen Blick. Für Details,
                Zahlen und Timeline wechseln Sie ins Projekt-Dashboard.
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left / Main */}
            <div className="space-y-6 lg:col-span-8">
              {/* Projects */}
              <Card className="overflow-hidden">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">Ihre aktuellen Projekte</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {projects.length} aktiv
                    </span>
                  </div>
                  <CardDescription>
                    Wählen Sie ein Projekt aus, um Status und nächste Schritte zu sehen.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-xl border bg-card p-4 transition hover:bg-muted/20"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold">
                              {p.title}
                            </h3>
                            <span
                              className={[
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                statusTone(p.status),
                              ].join(" ")}
                            >
                              {p.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {p.address}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span>Letztes Update: {p.updatedAt}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center md:justify-end">
                          <Button
                            asChild
                            variant="outline"
                            className="gap-2 whitespace-nowrap"
                          >
                            <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-2">
                              Projekt ansehen
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-7">
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Fortschritt</span>
                            <span className="font-medium text-foreground">
                              {p.progress}%
                            </span>
                          </div>
                          <Progress value={p.progress} className="h-2" />
                        </div>

                        <div className="md:col-span-5">
                          <div className="rounded-lg bg-muted/60 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Nächster Schritt
                                </p>
                                <p className="truncate text-sm">{p.nextStep}</p>
                              </div>
                              {p.dueHint ? (
                                <Badge variant={statusBadgeVariant(p.status)} className="shrink-0">
                                  {p.dueHint}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right / Sidebar */}
            <div className="space-y-6 lg:col-span-4">
              {/* Next best action */}
              <Card className="border-primary/30">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Ihr nächster Schritt</CardTitle>
                  <CardDescription>
                    Eine Empfehlung – damit Sie nicht suchen müssen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Empfohlen für:
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {primaryProject.title}
                    </p>
                    <p className="mt-2 text-sm">{primaryProject.nextStep}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button className="w-full gap-2 cursor-pointer">
                        Jetzt erledigen <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Trust / Contact */}
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Ihr Ansprechpartner</CardTitle>
                  <CardDescription>
                    Persönlich erreichbar – keine Blackbox.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm font-semibold">Dipl.-Ing. Lara Becker</p>
                    <p className="text-sm text-muted-foreground">
                      Sachverständige • Feuchtigkeit & Bauschäden
                    </p>
                    <div className="mt-3 grid gap-2">
                      <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                        Anrufen <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="justify-between cursor-pointer hover:bg-muted">
                        Nachricht <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Erreichbarkeit: Mo–Fr, 09:00–17:00
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Subtle footer */}
          <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>© 2025 BauVisio Portal • Demo UI</p>
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

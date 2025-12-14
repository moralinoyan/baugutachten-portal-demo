"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Folder,
  FileText,
  CalendarDays,
  MessageCircle,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"


/* =======================
   Data
======================= */

const projects = [
  { id: "p-001", name: "1. Feuchtigkeitsgutachten ..." },
  { id: "p-002", name: "2. Baumängelprüfung – Ne..." },
  { id: "p-003", name: "3. Sanierungsbewertung - ..." },
]

/* =======================
   Sidebar
======================= */

export default function Sidebar({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const projectsOpen = pathname.startsWith("/projects")

  const [projectsExpanded, setProjectsExpanded] = useState(false)

  useEffect(() => {
    if (pathname.startsWith("/projects")) {
      setProjectsExpanded(true)
    }
  }, [pathname])

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen border-r bg-card
        transition-[width] duration-300
        ${open ? "w-64" : "w-16"}
      `}
    >
      <div className="flex h-full flex-col">
        {/* ================= Header ================= */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          {open && (
            <img
              src="/images/logo.png"
              alt="BauGutachten Logo"
              className="h-10 w-auto"
            />
          )}

          <button
            onClick={onToggle}
            className="h-8 w-8 cursor-pointer"
          >
            {open ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ================= Navigation ================= */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <nav className="space-y-1">
            {/* -------- Home -------- */}
            <Link
              href="/home"
              className={`
                flex h-8 items-center rounded-lg
                text-sm font-medium transition
                ${pathname === "/home"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"}
              `}
            >
              <div
                className={`
                  flex items-center gap-3 px-3
                  ${open ? "justify-start" : "justify-center w-full"}
                `}
              >
                <Home className="h-4 w-4 shrink-0" />
                {open && <span>Home</span>}
              </div>
            </Link>

            {/* -------- Projekte (Section Header, kein Link) -------- */}
            <button
              type="button"
              onClick={() => setProjectsExpanded(v => !v)}
              className={`
                flex h-8 w-full items-center rounded-lg
                text-sm font-medium transition cursor-pointer
                ${projectsExpanded
                  ? "text-muted-foreground hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted"}
              `}
            >
              <div
                className={`
                  flex items-center gap-3 px-3
                  ${open ? "justify-start" : "justify-center w-full"}
                `}
              >
                <Folder className="h-4 w-4 shrink-0" />
                {open && (
                  <>
                    <span>Projekte</span>
                    <ChevronRight
                      className={`ml-auto h-3 w-3 transition ${
                        projectsExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </>
                )}
              </div>
            </button>

            {/* -------- Projekt Links -------- */}
            {projectsExpanded && open && (
              <div className="ml-6 mt-1 space-y-1">
                {projects.map(project => {
                  const active =
                    pathname === `/projects/${project.id}`

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className={`
                        flex h-7 items-center rounded-md px-3
                        text-xs transition cursor-pointer
                        ${active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted"}
                      `}
                    >
                      {project.name}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* -------- Other Sections -------- */}
            <Link
              href="/documents"
              className={`
                flex h-8 items-center rounded-lg
                text-sm font-medium transition
                ${pathname.startsWith("/documents")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"}
              `}
            >
              <div
                className={`
                  flex items-center gap-3 px-3
                  ${open ? "justify-start" : "justify-center w-full"}
                `}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {open && <span>Dokumente</span>}
              </div>
            </Link>

            <Link
              href="/appointments"
              className={`
                flex h-8 items-center rounded-lg
                text-sm font-medium transition
                ${pathname.startsWith("/appointments")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"}
              `}
            >
              <div
                className={`
                  flex items-center gap-3 px-3
                  ${open ? "justify-start" : "justify-center w-full"}
                `}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                {open && <span>Termine</span>}
              </div>
            </Link>

            <Link
              href="/messages"
              className={`
                flex h-8 items-center rounded-lg
                text-sm font-medium transition
                ${pathname.startsWith("/messages")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"}
              `}
            >
              <div
                className={`
                  flex items-center gap-3 px-3
                  ${open ? "justify-start" : "justify-center w-full"}
                `}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                {open && <span>Nachrichten</span>}
              </div>
            </Link>
          </nav>

          <Separator />

          {/* -------- New Project CTA -------- */}
          <Link
              href="/new"
              className={`
                flex h-8 items-center rounded-lg
                text-sm font-medium transition
                ${pathname === "/new"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"}
              `}
            >
              <div
                className={`
                  flex items-center gap-3 px-3
                  ${open ? "justify-start" : "justify-center w-full"}
                `}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {open && <span>Neues Projekt Starten</span>}
              </div>
            </Link>
        </div>

        {/* ================= Account ================= */}
        <div className="border-t px-4 py-4 space-y-2">
          <Button
            variant="ghost"
            className={`w-full ${
              open ? "justify-start px-3" : "justify-center px-0"
            }`}
          >
            <User className="h-4 w-4" />
            {open && "Herr Müller"}
          </Button>

          <Button
            variant="ghost"
            className={`w-full text-muted-foreground ${
              open ? "justify-start px-3" : "justify-center px-0"
            }`}
          >
            <LogOut className="h-4 w-4" />
            {open && "Abmelden"}
          </Button>
        </div>
      </div>
    </aside>
  )
}

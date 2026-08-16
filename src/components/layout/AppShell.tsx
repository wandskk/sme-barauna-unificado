"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CURRENT_TENANT } from "@/core/config/tenant";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  Award,
  Calendar,
  FileText,
  CheckCircle2,
  UploadCloud,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Globe,
  BookOpen,
} from "lucide-react";

interface AppShellProps {
  user: {
    name: string;
    email: string;
    role: "SECRETARIA" | "ADMIN" | "ESCOLA";
    schoolName?: string;
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSecretariaOrAdmin = user.role === "SECRETARIA" || user.role === "ADMIN";

  const navGroups = isSecretariaOrAdmin
    ? [
        {
          title: "Geral",
          items: [
            { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
            { href: "/admin/indicadores", label: "Indicadores", icon: BarChart3 },
          ],
        },
        {
          title: "Rede Escolar",
          items: [
            { href: "/admin/escolas", label: "Escolas", icon: Building2 },
            { href: "/admin/turmas", label: "Turmas", icon: Users },
            { href: "/admin/alunos", label: "Alunos", icon: GraduationCap },
          ],
        },
        {
          title: "Equipe",
          items: [
            { href: "/admin/professores", label: "Professores", icon: BookOpen },
            { href: "/admin/coordenadores", label: "Coordenadores", icon: UserCheck },
          ],
        },
        {
          title: "Gestão de Dados",
          items: [
            { href: "/painel/lancamento", label: "Lançamento", icon: UploadCloud },
            { href: "/painel/validar", label: "Validação", icon: CheckCircle2 },
          ],
        },
        {
          title: "Administração",
          items: [
            { href: "/admin/avaliacoes", label: "Avaliações", icon: Award },
            { href: "/admin/anos-letivos", label: "Anos letivos", icon: Calendar },
            { href: "/admin/conteudos", label: "Conteúdos do Portal", icon: FileText },
          ],
        },
      ]
    : [
        {
          title: "Minha Escola",
          items: [
            { href: "/painel", label: "Início", icon: LayoutDashboard },
            { href: "/painel/indicadores", label: "Indicadores da Escola", icon: BarChart3 },
            { href: "/painel/validar", label: "Validação da Escola", icon: CheckCircle2 },
            { href: "/painel/lancamento", label: "Visualizar Lançamentos", icon: UploadCloud },
          ],
        },
      ];

  const handleSignOut = () => {
    window.location.href = "/api/auth/signout";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-surface transition-all duration-200 z-20 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header da Sidebar */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              {CURRENT_TENANT.abbreviation.substring(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-foreground truncate">
                  {CURRENT_TENANT.abbreviation}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {CURRENT_TENANT.stateAbbr}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface-subtle"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[40px] ${
                      isActive
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="border-t border-border p-3 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-lg bg-surface-subtle">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              <span className="mt-1 inline-block text-[10px] uppercase font-bold text-primary px-1.5 py-0.5 rounded bg-primary-soft">
                {user.role} {user.schoolName ? `• ${user.schoolName}` : ""}
              </span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sair do sistema</span>}
          </button>
        </div>
      </aside>

      {/* Drawer Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-col bg-surface border-r border-border p-4 shadow-xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary text-white font-bold flex items-center justify-center">
                  {CURRENT_TENANT.abbreviation.substring(0, 2)}
                </div>
                <span className="font-semibold text-foreground">{CURRENT_TENANT.abbreviation}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-4">
              {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                    {group.title}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary-soft text-primary font-semibold"
                            : "text-muted-foreground hover:bg-surface-subtle"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="px-3 py-2 rounded-lg bg-surface-subtle">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-danger hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-surface px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-surface-subtle min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">
                {CURRENT_TENANT.secretariatName}
              </h2>
              <span className="hidden sm:inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                {CURRENT_TENANT.stateAbbr}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border bg-surface-subtle"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Ver Portal</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Área Principal de Trabalho */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

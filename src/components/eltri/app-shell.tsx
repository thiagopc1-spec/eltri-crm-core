import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Building2,
  Contact,
  Heart,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Target,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { EltriLogo } from "@/components/eltri/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/lib/workspace-context";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contatos", label: "Contatos", icon: Contact },
  { to: "/oportunidades", label: "Oportunidades", icon: Target },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/atividades", label: "Atividades / Retornos", icon: Activity },
  { to: "/imoveis", label: "Imóveis", icon: Building2 },
  { to: "/interesses", label: "Interesses", icon: Heart },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          }}
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { workspace, companyId, setCompanyId } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = workspace.fullName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-sidebar p-4 lg:flex">
        <div className="space-y-6">
          <EltriLogo />
          <NavLinks />
        </div>
        <div className="space-y-3 border-t border-sidebar-border pt-4">
          <p className="px-1 text-xs text-sidebar-foreground/60">{workspace.organization.name}</p>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-none bg-sidebar p-4">
              <SheetTitle className="sr-only">Navegação</SheetTitle>
              <div className="space-y-6">
                <EltriLogo />
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="h-9 w-full max-w-[220px] text-sm">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                {workspace.companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">
                {workspace.fullName}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {workspace.roles[0] ?? "usuário"}
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {initials}
            </span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleSignOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

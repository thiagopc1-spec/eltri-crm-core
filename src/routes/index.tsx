import { createFileRoute, Link } from "@tanstack/react-router";

import { EltriLogo } from "@/components/eltri/logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELTRI CRM — Tecnologia que integra." },
      {
        name: "description",
        content:
          "CRM multiempresa da ELTRI para contatos, oportunidades, funil de vendas, atividades, imóveis e interesses.",
      },
      { property: "og:title", content: "ELTRI CRM — Tecnologia que integra." },
      {
        property: "og:description",
        content:
          "Gestão comercial integrada: contatos, oportunidades, pipeline, atividades, imóveis e interesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-sidebar px-6 py-4">
        <EltriLogo />
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Ecossistema ELTRI</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-5xl">
          O CRM que integra a operação comercial da sua imobiliária.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Contatos, oportunidades, funil, atividades, imóveis e interesses em uma estrutura
          multiempresa, com isolamento de dados por empresa.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/auth">Entrar no ELTRI CRM</Link>
          </Button>
        </div>
      </main>
      <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
        ELTRI · Tecnologia que integra.
      </footer>
    </div>
  );
}

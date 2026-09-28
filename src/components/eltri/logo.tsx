export function EltriLogo({ tone = "light" }: { tone?: "light" | "dark" }) {
  const title = tone === "light" ? "text-sidebar-accent-foreground" : "text-foreground";
  const slogan = tone === "light" ? "text-sidebar-foreground/60" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
        EL
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-sm font-semibold tracking-wide ${title}`}>
          ELTRI CRM
        </span>
        <span className={`block text-[11px] ${slogan}`}>Tecnologia que integra.</span>
      </span>
    </div>
  );
}

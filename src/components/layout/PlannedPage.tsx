import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Section } from "@/components/ui/Section";

/** Temporary shell for routes defined in the route map but not built yet. */
export function PlannedPage({ title, purpose }: { title: string; purpose: string }) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section theme="light" labelledBy="planned-title">
          <h1 id="planned-title" style={{ fontSize: "var(--fs-xl)", fontWeight: 600, letterSpacing: "-0.025em" }}>{title}</h1>
          <p style={{ marginTop: "var(--s-4)", color: "var(--muted)", maxWidth: "40rem" }}>{purpose}</p>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

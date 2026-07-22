import { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({
  children,
  mainClassName = "",
  hideFooter = false,
  hideHeader = false,
}: {
  children: ReactNode;
  mainClassName?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
}) {
  return (
    <div className="landing-shell flex min-h-screen flex-col text-[var(--ink)]">
      {!hideHeader ? <SiteHeader /> : null}
      <main className={`flex-1 ${mainClassName}`}>{children}</main>
      {!hideFooter ? <SiteFooter /> : null}
    </div>
  );
}

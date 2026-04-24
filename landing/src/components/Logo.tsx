import { Link } from "vite-react-ssg";
import { useLang } from "../i18n";
import { langPath } from "../seo/constants";

export function Logo({ className = "" }: { className?: string }) {
  const lang = useLang();
  return (
    <Link
      to={langPath(lang)}
      aria-label="Azafaran"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30"
      >
        <span className="font-bold text-lg leading-none">A</span>
      </span>
      <span className="font-bold text-xl tracking-tight text-foreground">
        Azafaran
      </span>
    </Link>
  );
}

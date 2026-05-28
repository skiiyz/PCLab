import { LANGS, useI18n, type Lang } from "@/hooks/use-i18n";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-3 h-9 rounded-full border border-border text-[12px] font-semibold text-foreground hover:bg-accent transition-colors"
        aria-label="Select language"
      >
        {lang}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 z-50 min-w-[80px] rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {LANGS.map((l: Lang) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-accent ${
                l === lang ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
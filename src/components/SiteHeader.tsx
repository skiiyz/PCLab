import { Link } from "@tanstack/react-router";
import { ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/pclab-logo.png";
import GradientText from "@/components/text/GradientText";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const { user, profile, signOut } = useAuth();
  return (
    <header className="w-full max-w-[1100px] mx-auto flex items-center justify-between mb-6 px-2">
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="PCLab logo" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
        <GradientText
          colors={["#2c78f5", "#19c1dd", "#6366F1", "#2c78f5"]}
          animationSpeed={6}
          className="font-display text-[20px] md:text-[24px] font-semibold tracking-[0.2em] uppercase"
        >
          PCLab
        </GradientText>
      </Link>
      <nav className="flex items-center gap-2">
        <Link to="/build" className="px-4 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
          {t("nav.build")}
        </Link>
        <a href="https://github.com/skiiyz/PCLab" className="px-4 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
          {t("nav.github")}
        </a>
        {user ? (
          <>
            <span className="px-3 py-2 text-[13px] font-semibold text-foreground">
              {profile?.username ?? user.email}
            </span>
            <button
              onClick={signOut}
              className="px-4 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.login")}
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-[13px] font-semibold inline-flex items-center gap-1"
            >
              {t("nav.signup")}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
        <LanguageSwitcher />
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-foreground hover:bg-accent transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>
    </header>
  );
}

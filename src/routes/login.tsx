import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/hooks/use-i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen px-4 py-10 bg-background">
      <SiteHeader />
      <section className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8">
        <h1 className="font-serif text-3xl font-semibold text-card-foreground mb-6">{t("auth.login")}</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1">{t("auth.email")}</span>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1">{t("auth.password")}</span>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {t("auth.login")}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t("auth.noAccount")} <Link to="/signup" className="text-foreground underline">{t("auth.signup")}</Link>
        </p>
      </section>
    </main>
  );
}
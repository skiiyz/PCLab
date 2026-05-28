import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/hooks/use-i18n";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/signup")({ component: SignupPage });

const schema = z.object({
  email: z.string().trim().email().max(255),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
  password: z.string().min(6).max(72),
});

function SignupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, username, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { username: parsed.data.username },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created");
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen px-4 py-10 bg-background">
      <SiteHeader />
      <section className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8">
        <h1 className="font-serif text-3xl font-semibold text-card-foreground mb-6">{t("auth.signup")}</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field label={t("auth.username")} value={username} onChange={setUsername} autoComplete="username" />
          <Field label={t("auth.password")} type="password" value={password} onChange={setPassword} autoComplete="new-password" />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {t("auth.signup")}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t("auth.haveAccount")} <Link to="/login" className="text-foreground underline">{t("auth.login")}</Link>
        </p>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted-foreground mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </label>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Your Profile — PCLab" }] }),
});

type Build = {
  id: string;
  name: string;
  selections: Record<string, string>;
  created_at: string;
};

function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("builds")
        .select("id, name, selections, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setBuilds((data ?? []) as Build[]);
    })();
  }, [user]);

  const onAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ avatar_url: pub.publicUrl })
      .eq("id", user.id);
    setUploading(false);
    if (profErr) {
      toast.error(profErr.message);
      return;
    }
    await refreshProfile();
    toast.success("Avatar updated");
  };

  const deleteBuild = async (id: string) => {
    const { error } = await supabase.from("builds").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setBuilds((b) => b.filter((x) => x.id !== id));
    toast.success("Build deleted");
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen px-4 py-10 bg-background">
        <SiteHeader />
      </main>
    );
  }

  const initial = (profile?.username ?? user.email ?? "?").charAt(0).toUpperCase();
  const partCount = (s: Record<string, string>) => Object.values(s).filter(Boolean).length;

  return (
    <main className="min-h-screen px-4 py-10 bg-background">
      <SiteHeader />

      <section className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-primary text-primary-foreground text-3xl font-semibold border border-border">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:opacity-90 disabled:opacity-60"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={onAvatarPick}
              className="hidden"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-card-foreground truncate">
              {profile?.username ?? user.email}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-card-foreground">Saved builds</h2>
            <Link
              to="/build"
              className="text-[13px] font-semibold bg-primary text-primary-foreground rounded-full px-4 py-2"
            >
              New build
            </Link>
          </div>

          {builds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven't saved any builds yet. Open the builder, pick parts, then click "Save build".
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {builds.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                  <Link
                    to="/build"
                    search={{ build: b.id }}
                    className="flex-1 min-w-0 hover:opacity-80"
                  >
                    <div className="text-sm font-semibold text-foreground truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {partCount(b.selections)} parts · {new Date(b.created_at).toLocaleDateString()}
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteBuild(b.id)}
                    aria-label="Delete build"
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

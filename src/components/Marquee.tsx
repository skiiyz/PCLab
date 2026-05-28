import { type CSSProperties } from "react";

const logos = [
  { name: "Ozon", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6gNxrq7zf_WamlRnYWs0S0h0FS87CMyxy8Q&s", from: "#1e3a8a", to: "#3b82f6" },
  { name: "DNS", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-ke5W_tjrv2ORVxRPVAX9CNLLQveScOnxjA&s", from: "#1e40af", to: "#60a5fa" },
  { name: "Apple", src: "https://svgl.app/library/apple.svg", from: "#1d4ed8", to: "#38bdf8" },
  { name: "Amazon", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoIwGv61BBxMlFDmBHeDvMo8-5HNlM4_8Skw&s", from: "#6d28d9", to: "#a78bfa" },
  { name: "Spotify", src: "https://svgl.app/library/spotify.svg", from: "#be123c", to: "#f472b6" },
  { name: "Google", src: "https://svgl.app/library/google.svg", from: "#0ea5e9", to: "#7dd3fc" },
];

const maskStyle: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  maskImage:
    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
};

export function Marquee() {
  return (
    <div className="marquee-pause overflow-hidden mt-10" style={maskStyle}>
      <div className="flex w-max animate-marquee gap-4">
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden"
          >
            <div
              className="absolute inset-0 scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${logo.from}, ${logo.to})` }}
            />
            <img
              src={logo.src}
              alt={`${logo.name} logo`}
              className="relative z-10 max-h-8 max-w-[60%] object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

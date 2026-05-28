import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Check, ExternalLink, AlertTriangle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/build")({
  component: BuildPage,
  head: () => ({
    meta: [
      { title: "Build a PC — PCLab" },
      { name: "description", content: "Assemble your custom PC by choosing a CPU, GPU, motherboard, RAM, storage, PSU, and case. Live prices in RUB and USD." },
      { property: "og:title", content: "Build a PC — PCLab" },
      { property: "og:description", content: "Assemble your custom PC and compare prices in rubles and dollars." },
    ],
  }),
});

// Approximate RUB/USD rate used to derive the missing currency.
const USD_RUB = 92;

type Source = "ozon" | "dns";
type Part = {
  id: string;
  name: string;
  rub: number;
  source: Source;
  url: string;
  // Image URL — edit/add freely by pasting a link here.
  image?: string;
  // Compatibility metadata (optional per category)
  socket?: string;            // CPU + Motherboard
  ramType?: "DDR4" | "DDR5";  // Motherboard + RAM
  ramSpeed?: number;          // RAM speed (MHz)
  maxRamSpeed?: number;       // Motherboard max supported speed (MHz)
  watts?: number;             // PSU output / part draw
};

type Category = {
  key: string;
  label: string;
  // Default placeholder image for this category when no part is selected
  // or the selected part has no image. Edit/add by pasting a link.
  image?: string;
  parts: Part[];
};


const sourceLabel: Record<Source, string> = {
  ozon: "ozon.ru",
  dns: "dns-shop.ru",
};

const CATEGORIES: Category[] = [
  {
    key: "cpu",
    label: "Processor (CPU)",
    parts: [
      { id: "cpu-1", name: "AMD Ryzen 5 5600 OEM", rub: 11681, image: "https://pctec.uk/cdn/shop/files/5600.webp?v=1771374363&width=823", source: "ozon", url: "https://www.ozon.ru/product/protsessor-cpu-amd-ryzen-5-5600-oem-6-yader-3-5-ggts-turbo-4-4-ggts-socket-am4-7-nm-kesh-32-mb-3079121766/?at=ywtAQ35A3INXQvKRhYZwR8WIN89q40f3YvpX4Uqkmnm8", socket: "AM4", watts: 65 },
      { id: "cpu-2", name: "AMD Ryzen 7 7800X3D OEM", rub: 28999, image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/bbd34c68dedfd816f74f2e1c8982ee28/a456db21c4184e22b75ccb0c07c70c520aacaa20efed5a50da6e0c6c3d17c2d7.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/3ecad0b7a46fed20/processor-amd-ryzen-7-7800x3d-oem/", socket: "AM5", watts: 120 },
      { id: "cpu-3", name: "Intel Core i5-13400F BOX", rub: 15999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/2066d47aefeb9a9a79306908dd9e0a11/a4c43147d538308f5a15e7271f4d2432d7681142b1c0816b699eb2b491a6c738.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/accf0607bcf9d9cb/processor-intel-core-i5-13400f-box/", socket: "LGA1700", watts: 65 },
      { id: "cpu-4", name: "Intel Core i7-13700K BOX", rub: 40799, image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/070290116603225351ae1ae591f32a56/2d66506e9cba91fed8c76c0090f51b0f3b4111b1a43a91648fbc5dbb5fe47041.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/6d3c9e0c3f93ed20/processor-intel-core-i7-13700k-box/", socket: "LGA1700", watts: 125 },
      { id: "cpu-5", name: "AMD Ryzen 5 7500F OEM", rub: 10299, image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/468445509cd3eea209514f68179db807/e6293f21cc6d64c505e37405fa55d329827db7f8cd863e254841198e037f2386.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/d4bde9994d11ed20/processor-amd-ryzen-5-7500f-oem/", socket: "AM5", watts: 65 },
      { id: "cpu-6", name: "AMD Ryzen 5 5500 OEM", rub: 7499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/ebb6a813d310240237cbd705ee93d08c/c3cea0db9053eee4edb67d6becd13bc1b724ef71edddbe5f9b6ac95bd98ffc48.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/2779e1d6afeced20/processor-amd-ryzen-5-5500-oem/", socket: "AM4", watts: 65 },
      { id: "cpu-7", name: "Intel Core i3-12100F OEM", rub: 9399, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/812b0c6325d9b596eb284ddcb3a8e844/86bc0632fb125aa5a7ec17ae73cfe23974d3862c4fbacb18a46e29b559e81985.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/a1d8e652064fed20/processor-intel-core-i3-12100f-oem/", socket: "LGA1700", watts: 89 },
      { id: "cpu-8", name: "AMD Ryzen 7 9800X3D OEM", rub: 37999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/a701aca59ed4eccc30c928311252a71b/d25d58c44e7c15ea8828ee4cb6718486c53a48e3af8c02a216ceba902125a737.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/104767799cdfd582/processor-amd-ryzen-7-9800x3d-oem/", socket: "AM5", watts: 120 },
    ],
  },
  {
    key: "gpu",
    label: "Graphics Card (GPU)",
    parts: [
      { id: "gpu-1", name: "KFA2 GeForce RTX 4060 8GB CORE Black", rub: 34999, image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/9b6485107edf7b26907be30f0c307e1e/e19ad47a5d61e1ad9ad38ed88707c481d5ab730d0e21fd4cd2d1d4cb36bf29d8.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/93826d9c94dced20/videokarta-kfa2-geforce-rtx-4060-core-black-46nsl8md9nxk/", watts: 115 },
      { id: "gpu-2", name: "ASUS GeForce RTX 5060 16GB Ti DUAL OC", rub: 54999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/84cebd7393184117561b44b8c110673f/10b37126f8ea2bface789202b3fc93360e41b46bf9d43724d828351a8a4d6903.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/a7c2b65e20d6d9cb/videokarta-asus-geforce-rtx-5060-ti-dual-oc-dual-rtx5060ti-o16g/", watts: 180 },
      { id: "gpu-3", name: "ASUS GeForce RTX 5070 12GB PRIME OC Edition", rub: 69999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/8c48122c54d8d1bc02e91b2ce00e2a48/6e59b11392b550b05a475f67477d9bba9c2881bba92a01922d5cb3ef9f0741a6.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/3dd353dcfb37d582/videokarta-asus-geforce-rtx-5070-prime-oc-edition-prime-rtx5070-o12g/", watts: 270 },
      { id: "gpu-4", name: "GIGABYTE AMD Radeon 9060 XT 16GB GAMING OC", rub: 41999, image: "https://c.dns-shop.ru/thumb/st1/fit/wm/0/0/2358e0bd8a66fc0e3ac3fd86c5583201/e7e17ba0ba767975e4892101aef8bd726d0eb4ad538dd180a9a870bdadd4d0c9.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/37d191a63202d9cb/videokarta-gigabyte-amd-radeon-9060-xt-gaming-oc-gv-r9060xtgaming-oc-16gda", watts: 182 },
      { id: "gpu-5", name: "MSI GeForce RTX 3050 VENTUS 2X XS OC", rub: 23199, image: "https://c.dns-shop.ru/thumb/st4/fit/wm/0/0/1038a236e3b9b6620671c35b023ba325/3a6a710235a7d28bf6ca67ad60cfac5d9fc724bb1e3d368b5d22a6294684f83e.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/f6a696bd3b11ed20/videokarta-msi-geforce-rtx-3050-ventus-2x-xs-oc-rtx-3050-ventus-2x-xs-8g-oc/", watts: 115 },
      { id: "gpu-6", name: "KFA2 GeForce RTX 3060 CORE (LHR)", rub: 35999, image: "https://c.dns-shop.ru/thumb/st4/fit/wm/0/0/2d40aa22b0701d61c3b3b1ae26aea13e/3a61cbd54b5ec7e12a9566bb151ce75e0778e40196208fccc5b415f6ee9621f8.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/49b77a8077562eb0/videokarta-kfa2-geforce-rtx-3060-core-lhr-36nol7md1vok/", watts: 170 },
      { id: "gpu-7", name: "Palit GeForce RTX 5080 GamingPro", rub: 116999, image: "https://c.dns-shop.ru/thumb/st1/fit/wm/0/0/428078714deaf1e4151e56034402eb37/daa98ea4de1f23fe2b2798de36f677ee4ddb8c1c9a8f62c7b058623614531765.jpg.webp",  source: "dns", url: "https://www.dns-shop.ru/product/72372f3cd49ad9cb/videokarta-palit-geforce-rtx-5080-gamingpro-ne75080019t2-gb2031a/", watts: 360 },
      { id: "gpu-8", name: "GIGABYTE AMD Radeon RX 9060 XT GAMING OC", rub: 44999, image: "https://c.dns-shop.ru/thumb/st1/fit/wm/0/0/2358e0bd8a66fc0e3ac3fd86c5583201/e7e17ba0ba767975e4892101aef8bd726d0eb4ad538dd180a9a870bdadd4d0c9.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/37d191a63202d9cb/videokarta-gigabyte-amd-radeon-rx-9060-xt-gaming-oc-gv-r9060xtgaming-oc-16gd/", watts: 160 },
    ],
  },
  {
    key: "mobo",
    label: "Motherboard",
    parts: [
      { id: "mb-1", name: "MSI MAG B550 Tomahawk", rub: 14599, source: "ozon", image: "", url: "https://www.ozon.ru/product/msi-mag-b550-tomahawk-max-wifi-am4-ddr4-materinskaya-plata-1628554023/?at=16tL0JoJ4h349oLXuJYKGXOhYxznV5CQz3K5pF6g9yvN", socket: "AM4", ramType: "DDR4", maxRamSpeed: 5100 },
      { id: "mb-2", name: "MSI B850 GAMING PLUS WIFI", rub: 17999, source: "dns", image: "", url: "https://www.dns-shop.ru/product/ec6a873ec35ed582/materinskaa-plata-msi-b850-gaming-plus-wifi/", socket: "AM5", ramType: "DDR5", maxRamSpeed: 5600 },
      { id: "mb-3", name: "ASRock Phantom Gaming X870E NOVA", rub: 32999, source: "dns", image: "", url: "https://www.dns-shop.ru/product/68d9eb08b2aed9cb/materinskaa-plata-asrock-phantom-gaming-x870e-nova-wifi/", socket: "LGA1700", ramType: "DDR5", maxRamSpeed: 8000 },
    ],
  },
  {
    key: "ram",
    label: "Memory (RAM)",
    parts: [
      { id: "ram-1", name: "Kingston FURY Beast Black 16GB (2x8GB,DDR4)", rub: 16899, image: "", source: "dns", url: "https://www.dns-shop.ru/product/5d78bc3afad6ed20/operativnaa-pamat-kingston-fury-beast-black-kf436c17bbk216-16-gb/", ramType: "DDR4", ramSpeed: 3600 },
      { id: "ram-2", name: "Kingston FURY Beast Black 8GB (1x8GB,DDR4)", rub: 7999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/b7209fec7326d9cb/operativnaa-pamat-kingston-fury-beast-black-kf432c16bb8wp-8-gb/", ramType: "DDR4", ramSpeed: 3200 },
      { id: "ram-3", name: "ADATA XPG Lancer Blade 16GB (1x16GB,DDR5)", rub: 22999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/14d288c04230ed20/operativnaa-pamat-adata-xpg-lancer-blade-ax5u5600c4616g-slabbk-16-gb/", ramType: "DDR5", ramSpeed: 5600 },
      { id: "ram-4", name: "ADATA XPG Lancer 16GB (2x8GB,DDR5)", rub: 25499, image: "", source: "dns", url: "https://www.dns-shop.ru/product/562750cb8b61d21a/operativnaa-pamat-adata-xpg-lancer-ax5u5600c468g-dtlabbk-16-gb/", ramType: "DDR5", ramSpeed: 5600 },
      { id: "ram-5", name: "ADATA XPG Lancer Blade RGB 32GB (2x16GB,DDR5)", rub: 43999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/7ba2e84831b6ed20/operativnaa-pamat-adata-xpg-lancer-blade-rgb-ax5u6000c3016g-dtlabrbk-32-gb/", ramType: "DDR5", ramSpeed: 6000 },
      { id: "ram-6", name: "Kingston FURY Beast Black 32GB (2x16GB,DDR4)", rub: 25999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/a2fd6b03821ed9cb/operativnaa-pamat-kingston-fury-beast-black-kf432c16bb1k232wp-32-gb/", ramType: "DDR4", ramSpeed: 3200 },
      { id: "ram-7", name: "Kingston FURY Beast Black 32GB (2x16GB,DDR5) ", rub: 39999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/17e2942c3953ed20/operativnaa-pamat-kingston-fury-beast-black-kf556c36bbek2-32-32-gb/", ramType: "DDR5", ramSpeed: 5600 },
    ],
  },
  {
    key: "storage",
    label: "Storage (SSD)",
    parts: [
      { id: "ssd-1", name: "Kingston A400 480GB", rub: 8199, image: "", source: "dns", url: "https://www.dns-shop.ru/product/d74ecd0b00cded20/480-gb-25-sata-nakopitel-kingston-a400-sa400s37480g/" },
      { id: "ssd-2", name: "Kingston A400 960GB", rub: 10999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/b39a8d59e7a1ed20/960-gb-25-sata-nakopitel-kingston-a400-sa400s37960g/" },
      { id: "ssd-3", name: "DEXP C100 1TB", rub: 10999, image: "", source: "dns", url: "https://www.dns-shop.ru/product/944e92bda055ed20/1024-gb-25-sata-nakopitel-dexp-c100-c100smym1024/" },
      { id: "ssd-4", name: "ADATA Ultimate SU650 2TB", rub: 22499, image: "", source: "dns", url: "https://www.dns-shop.ru/product/c8badc26d054ed20/2000-gb-25-sata-nakopitel-adata-ultimate-su650-asu650ss-2tt-r/" },
      { id: "ssd-5", name: "Apacer AS350 PANTHER 512GB", rub: 7199, image: "", source: "dns", url: "https://www.dns-shop.ru/product/a38a88c6fd28d9cb/512-gb-25-sata-nakopitel-apacer-as350-panther-ap512gas350-1/" },
      { id: "ssd-6", name: "AS350 PANTHER 256GB", rub: 5599, image: "", source: "dns", url: "https://www.dns-shop.ru/product/69d7986bfd28d9cb/256-gb-25-sata-nakopitel-apacer-as350-panther-ap256gas350-1/" },
      { id: "ssd-7", name: "Samsung 870 EVO 2TB", rub: 41799, image: "", source: "dns", url: "https://www.dns-shop.ru/product/f1f4d783f76bed20/2000-gb-25-sata-nakopitel-samsung-870-evo-mz-77e2t0bw/" },
    ],
  },
  {
    key: "psu",
    label: "Power Supply (PSU)",
    parts: [
      { id: "psu-1", name: "DEEPCOOL PF750 (750W)", rub: 3899, source: "dns", url: "https://www.dns-shop.ru/product/5117a7c5fa5fd763/blok-pitania-deepcool-pf750-r-pf750d-ha0b-eu-cernyj/", watts: 750 },
      { id: "psu-2", name: "Cougar GR 850 (850W)", rub: 6499, source: "dns", url: "https://www.dns-shop.ru/product/61fda40aed8bd21a/blok-pitania-cougar-gr-850-31gr0856433p-cernyj/", watts: 850 },
      { id: "psu-3", name: "DEEPCOOL GamerStorm PQ750G WH (750W)", rub: 7599, source: "dns", url: "https://www.dns-shop.ru/product/e37fe0d55d47d9cb/blok-pitania-deepcool-gamerstorm-pq750g-wh-r-pq750g-fd0w-wgeu-v1-belyj/", watts: 750 },
      { id: "psu-4", name: "DEEPCOOL PF600 (600W)", rub: 3399, source: "dns", url: "https://www.dns-shop.ru/product/16ed5812fa5ed763/blok-pitania-deepcool-pf600-r-pf600d-ha0b-eu-cernyj/", watts: 600 },
      { id: "psu-5", name: "DEEPCOOL GamerStorm PQ1200G (1200W)", rub: 11299, source: "dns", url: "https://www.dns-shop.ru/product/80cdce8b5d44d9cb/blok-pitania-deepcool-gamerstorm-pq1200g-r-pqc00g-fd0b-wgeu-v1-cernyj/", watts: 1200 },
      { id: "psu-6", name: "DEEPCOOL GamerStorm PQ1000G WH (1000W)", rub: 9499, source: "dns", url: "https://www.dns-shop.ru/product/b97eadac5d46d9cb/blok-pitania-deepcool-gamerstorm-pq1000g-wh-r-pqa00g-fd0w-wgeu-v1-belyj/", watts: 1000 },
      { id: "psu-7", name: "Cougar XTC600 (600W)", rub: 3499, source: "dns", url: "https://www.dns-shop.ru/product/9a91cf0ed0ba3332/blok-pitania-cougar-xtc600-31xc0600001p-cernyj/", watts: 850 },
    ],
  },
  {
    key: "case",
    label: "Case",
    parts: [
      { id: "case-1", name: "DeepCool CC560", rub: 5490, source: "ozon", url: "https://www.ozon.ru/search/?text=DeepCool+CC560" },
      { id: "case-2", name: "Lian Li Lancool 216", rub: 11990, source: "dns", url: "https://dns-shop.ru/search/?q=Lancool+216" },
      { id: "case-3", name: "Fractal Design North", rub: 14990, source: "dns", url: "https://dns-shop.ru/search/?q=Fractal+Design+North" },
    ],
  },
];

function fmtRub(v: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);
}
function fmtUsd(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function BuildPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Record<string, string>>({});

  const totals = useMemo(() => {
    let rub = 0;
    for (const cat of CATEGORIES) {
      const id = selected[cat.key];
      const part = cat.parts.find((p) => p.id === id);
      if (part) rub += part.rub;
    }
    return { rub, usd: rub / USD_RUB };
  }, [selected]);

  const picks = useMemo(() => {
    const get = (k: string) => CATEGORIES.find((c) => c.key === k)?.parts.find((p) => p.id === selected[k]);
    return {
      cpu: get("cpu"),
      mobo: get("mobo"),
      ram: get("ram"),
      gpu: get("gpu"),
      psu: get("psu"),
    };
  }, [selected]);

  const warnings = useMemo(() => {
    const ws: string[] = [];
    const { cpu, mobo, ram, gpu, psu } = picks;

    if (cpu && mobo && cpu.socket && mobo.socket && cpu.socket !== mobo.socket) {
      ws.push(`CPU socket (${cpu.socket}) does not match motherboard socket (${mobo.socket}).`);
    }
    if (mobo && ram && mobo.ramType && ram.ramType && mobo.ramType !== ram.ramType) {
      ws.push(`RAM type (${ram.ramType}) is incompatible with motherboard (${mobo.ramType}).`);
    }
    if (mobo && ram && ram.ramSpeed && mobo.maxRamSpeed && ram.ramSpeed > mobo.maxRamSpeed) {
      ws.push(`RAM speed (${ram.ramSpeed} MHz) exceeds motherboard max (${mobo.maxRamSpeed} MHz); it may downclock.`);
    }
    const draw = (cpu?.watts ?? 0) + (gpu?.watts ?? 0) + 100; // overhead for mobo/ram/storage/fans
    if (psu && draw > 0) {
      const recommended = Math.ceil(draw * 1.3);
      if (psu.watts! < recommended) {
        ws.push(`PSU (${psu.watts}W) may be insufficient. Estimated draw ${draw}W, recommended ≥ ${recommended}W.`);
      }
    }
    return ws;
  }, [picks]);

  const hasAnySelection = Object.values(selected).some(Boolean);

  return (
    <main className="min-h-screen px-4 py-10 bg-background">
      <SiteHeader />

      <section className="w-full max-w-[1600px] mx-auto">
        <div className="mb-8 px-2">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Build your PC
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Pick a part for each category. Prices are sourced from{" "}
            <a href="https://www.ozon.ru" className="underline">ozon.ru</a> and{" "}
            <a href="https://dns-shop.ru" className="underline">dns-shop.ru</a>.
          </p>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px_320px] gap-6 px-2">

          <div className="space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold text-card-foreground mb-3">
                  {cat.label}
                </h2>
                <div className="grid gap-2">
                  {cat.parts.map((part) => {
                    const isSelected = selected[cat.key] === part.id;
                    return (
                      <button
                        key={part.id}
                        onClick={() =>
                          setSelected((s) => ({
                            ...s,
                            [cat.key]: isSelected ? "" : part.id,
                          }))
                        }
                        className={`w-full text-left flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${
                          isSelected
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{part.name}</div>
                            <a
                              href={part.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                            >
                              {sourceLabel[part.source]} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-foreground">{fmtRub(part.rub)}</div>
                          <div className="text-xs text-muted-foreground">{fmtUsd(part.rub / USD_RUB)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex flex-col gap-6">
            {CATEGORIES.map((cat) => {
              const part = cat.parts.find((p) => p.id === selected[cat.key]);
              const img = part?.image ?? cat.image;
              return (
                <div
                  key={cat.key}
                  className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center justify-center min-h-[280px]"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={part?.name ?? cat.label}
                      className="max-h-80 max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground text-center">
                      No image
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground text-center truncate w-full">
                    {part?.name ?? cat.label}
                  </div>
                </div>
              );
            })}
          </div>


          <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold text-card-foreground mb-4">{t("build.your")}</h2>
            <ul className="space-y-2 mb-4">
              {CATEGORIES.map((cat) => {
                const part = cat.parts.find((p) => p.id === selected[cat.key]);
                return (
                  <li key={cat.key} className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{cat.label}</span>
                    <span className="text-foreground text-right truncate max-w-[55%]">
                      {part ? part.name : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>

            {hasAnySelection && (
              <div className="border-t border-border pt-4 mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("build.warnings")}
                </h3>
                {warnings.length === 0 ? (
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span>{t("build.ok")}</span>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {(!hasAnySelection || warnings.length === 0) && (
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">{t("build.total")}</span>
                <div className="text-right">
                  <div className="text-xl font-semibold text-foreground">{fmtRub(totals.rub)}</div>
                  <div className="text-xs text-muted-foreground">≈ {fmtUsd(totals.usd)}</div>
                </div>
              </div>
            </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

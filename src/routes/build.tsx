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
      { id: "mb-1", name: "MSI MAG B550 TOMAHAWK", rub: 17999, source: "dns", image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/cac4c5e2f5b0d3b5e6c2ca690f5a50f7/907bf69866a5592d2a92732fef8e99e4f91d83c3c763c13351dba3b29cfaa5e6.png.webp", url: "https://www.dns-shop.ru/product/b9a4575dafa61b80/materinskaa-plata-msi-mag-b550-tomahawk/", socket: "AM4", ramType: "DDR4", maxRamSpeed: 3200 },
      { id: "mb-2", name: "MSI B850 GAMING PLUS WIFI", rub: 17999, source: "dns", image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/50e73eeb758181cdec7fc538584be756/65a94e73f6ef8751b7aaca346c612b630c5df6e346350c4153b72cd30d5dd60d.jpg.webp", url: "https://www.dns-shop.ru/product/ec6a873ec35ed582/materinskaa-plata-msi-b850-gaming-plus-wifi/", socket: "AM5", ramType: "DDR5", maxRamSpeed: 5600 },
      { id: "mb-3", name: "ASRock Phantom Gaming X870E NOVA", rub: 32999, source: "dns", image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/0e2ddce4bd3c826755b11333562208bd/5766abebdd980369c113e753b8a7a65839b413505e881d0b56db29df54beddd8.png.webp", url: "https://www.dns-shop.ru/product/68d9eb08b2aed9cb/materinskaa-plata-asrock-phantom-gaming-x870e-nova-wifi/", socket: "LGA1700", ramType: "DDR5", maxRamSpeed: 8000 },
      { id: "mb-4", name: "MSI B760 GAMING PLUS WIFI", rub: 9999, source: "dns", image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/997526f1ba8bda6af489c0d17f2de12e/55735805018792740450a7b0d3ba40cce356a95c49ee03468a65b3c69fbffff0.jpg.webp", url: "https://www.dns-shop.ru/product/b53ec787e255ed20/materinskaa-plata-msi-b760-gaming-plus-wifi/", socket: "LGA1700", ramType: "DDR5", maxRamSpeed: 5600 },
      { id: "mb-5", name: "MSI MPG B550 GAMING PLUS", rub: 11499, source: "dns", image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/267998bb3eb97620ace63198adfa63fc/489e1dfb774c68ca8c80a1cd66477739765abc0c00722185d2c1178489ffdec3.png.webp", url: "https://www.dns-shop.ru/product/232aa9f9b9a11b80/materinskaa-plata-msi-mpg-b550-gaming-plus/", socket: "AM4", ramType: "DDR4", maxRamSpeed: 3200 },
      { id: "mb-6", name: "GIGABYTE B550 AORUS ELITE V2", rub: 12999, source: "dns", image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/a94091d13e1c46b264e46890eebb71cc/cbeada593290a99b56177e3c496c9ae68eabaa00ef47178f7e303a3ec398b647.png.webp", url: "https://www.dns-shop.ru/product/556eadf1e5cf3332/materinskaa-plata-gigabyte-b550-aorus-elite-v2/", socket: "AM4", ramType: "DDR4", maxRamSpeed: 3200 },
      { id: "mb-7", name: "ASRock B650M Pro RS", rub: 9899, source: "dns", image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/a7471569e967644352ffed3e60f3a87f/2eba027c1975912c0203207c855de7826035443f55146b6308fb84b213fc3f0a.jpg.webp", url: "https://www.dns-shop.ru/product/090c477cf389ed20/materinskaa-plata-asrock-b650m-pro-rs/", socket: "AM5", ramType: "DDR5", maxRamSpeed: 5200 },
    ],
  },
  {
    key: "ram",
    label: "Memory (RAM)",
    parts: [
      { id: "ram-1", name: "Kingston FURY Beast Black 16GB (2x8GB,DDR4)", rub: 16899, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/7b7fa42b16cc3c1b6322a9fbbf818cb5/9acfdabe4489e240cc8a91c5e6910465cb65cd76e25640fb198f265be3f83b20.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/5d78bc3afad6ed20/operativnaa-pamat-kingston-fury-beast-black-kf436c17bbk216-16-gb/", ramType: "DDR4", ramSpeed: 3600 },
      { id: "ram-2", name: "Kingston FURY Beast Black 8GB (1x8GB,DDR4)", rub: 7999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/b1a0406ab31670f17ae077344dfa7265/1cefc9941d52f6a3224f5de6d545c51df3a2c147406d0169519a2a9d3a746317.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/b7209fec7326d9cb/operativnaa-pamat-kingston-fury-beast-black-kf432c16bb8wp-8-gb/", ramType: "DDR4", ramSpeed: 3200 },
      { id: "ram-3", name: "ADATA XPG Lancer Blade 16GB (1x16GB,DDR5)", rub: 22999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/c8d2e3b5b484c378fe14a681eb507bba/813b5aa4333a321729a06b68edad603d2e811efbfe5fde86bf6a43e6186cbda3.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/14d288c04230ed20/operativnaa-pamat-adata-xpg-lancer-blade-ax5u5600c4616g-slabbk-16-gb/", ramType: "DDR5", ramSpeed: 5600 },
      { id: "ram-4", name: "ADATA XPG Lancer 16GB (2x8GB,DDR5)", rub: 25499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/40866caccc7542b84d84b8c0c3585144/b699ed136a51a899af7c73dc1d08316dbd4ec79c9d1105a8463bcef891f18bee.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/562750cb8b61d21a/operativnaa-pamat-adata-xpg-lancer-ax5u5600c468g-dtlabbk-16-gb/", ramType: "DDR5", ramSpeed: 5600 },
      { id: "ram-5", name: "ADATA XPG Lancer Blade RGB 32GB (2x16GB,DDR5)", rub: 45999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/d34cfcabc863cb718554dab975467b45/2acfe3f6dc3849684b2861755930169d807b321a731939c245a07260f8151b53.png.webp", source: "dns", url: "https://www.dns-shop.ru/product/7ba2e84831b6ed20/operativnaa-pamat-adata-xpg-lancer-blade-rgb-ax5u6000c3016g-dtlabrbk-32-gb/", ramType: "DDR5", ramSpeed: 6000 },
      { id: "ram-6", name: "Kingston FURY Beast Black 32GB (2x16GB,DDR4)", rub: 25999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/a963ef235ddffcff73d332a14dfecdc9/ec0756a0e464e3ee054995708d915d7e1b238888416107891fba8108ff4c5be6.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/a2fd6b03821ed9cb/operativnaa-pamat-kingston-fury-beast-black-kf432c16bb1k232wp-32-gb/", ramType: "DDR4", ramSpeed: 3200 },
      { id: "ram-7", name: "Kingston FURY Beast Black RGB 32GB (2x16GB,DDR5) ", rub: 41999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/305e744399540bb0293728144d9853bb/258eaf9405d2d7072123f8bf3fb00f44d851258974184744a34ff63e85d900ff.png.webp", source: "dns", url: "https://www.dns-shop.ru/product/17e2942c3953ed20/operativnaa-pamat-kingston-fury-beast-black-kf556c36bbek2-32-32-gb/", ramType: "DDR5", ramSpeed: 5600 },
    ],
  },
  {
    key: "storage",
    label: "Storage (SSD)",
    parts: [
      { id: "ssd-1", name: "Kingston A400 480GB", rub: 8199, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/4fac7ea653f6305b9ef47e259c77479c/5fc1569ac60c68a2e6eb2dc867beac7abde14dca93da7882a1e71ee16b54a525.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/d74ecd0b00cded20/480-gb-25-sata-nakopitel-kingston-a400-sa400s37480g/" },
      { id: "ssd-2", name: "Kingston A400 960GB", rub: 10999, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/41f2f9b61fd4c2bd58362d385c68f1fa/c089bad909b8ffa0147c83c59ac42c486aefcb4b1abd595db625284f94877283.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/b39a8d59e7a1ed20/960-gb-25-sata-nakopitel-kingston-a400-sa400s37960g/" },
      { id: "ssd-3", name: "DEXP C100 1TB", rub: 10999, image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/5d319862d900c3b2997e48cfc787902a/d58f78ad3e7eb5e2966cacc40a28a4dd40326e03d7bc8c0227b402ea964b94ed.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/944e92bda055ed20/1024-gb-25-sata-nakopitel-dexp-c100-c100smym1024/" },
      { id: "ssd-4", name: "ADATA Ultimate SU650 2TB", rub: 22499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/3a2211a0f6e696f4230577810357f5d3/a5fcfb984bd6c67f90052e4bcd39f5d7b2de54a657cb4319d94ac26668db4587.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/c8badc26d054ed20/2000-gb-25-sata-nakopitel-adata-ultimate-su650-asu650ss-2tt-r/" },
      { id: "ssd-5", name: "Apacer AS350 PANTHER 512GB", rub: 7199, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/de93a3be8b58da9f34511cce16b457e4/0f678762e66837c32a05d603c8bab8b2e4b5662f6b1dc00b5a04cc802f9aaa6d.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/a38a88c6fd28d9cb/512-gb-25-sata-nakopitel-apacer-as350-panther-ap512gas350-1/" },
      { id: "ssd-6", name: "AS350 PANTHER 256GB", rub: 5599, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/40e9730e26ece8388ba0d16bf63af541/450e1ce118be8efb404c466760d5189d8a0f2a4c36b6b18d07b79190273e27da.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/69d7986bfd28d9cb/256-gb-25-sata-nakopitel-apacer-as350-panther-ap256gas350-1/" },
      { id: "ssd-7", name: "Samsung 870 EVO 2TB", rub: 41799, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/14dc9b6f8932c644615617026e0728a7/1732bb464efb6c27c71b45cdeebb541f576a0dcab668aa86eff5aafaf87dc861.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/f1f4d783f76bed20/2000-gb-25-sata-nakopitel-samsung-870-evo-mz-77e2t0bw/" },
    ],
  },
  {
    key: "psu",
    label: "Power Supply (PSU)",
    parts: [
      { id: "psu-1", name: "DEEPCOOL PF750 (750W)", rub: 3899, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/8622d4ba4f352cb8f64fd2be19f2b176/0ada5f8f9f62ec8a7348166259129b184a603e88c6c654e038a44bc838af8a70.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/5117a7c5fa5fd763/blok-pitania-deepcool-pf750-r-pf750d-ha0b-eu-cernyj/", watts: 750 },
      { id: "psu-2", name: "Cougar GR 850 (850W)", rub: 6499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/7534dc639bf41395da0465e78d0bd0cb/79603a8f093cc8be264f422702a70f3a50e7bf28fcab059b6dfc41a2cb5c61c6.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/61fda40aed8bd21a/blok-pitania-cougar-gr-850-31gr0856433p-cernyj/", watts: 850 },
      { id: "psu-3", name: "DEEPCOOL GamerStorm PQ750G WH (750W)", rub: 7599, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/bac21fbf06274a8fa9d20bdd4607520e/415472d4b3d7189713bf61ed7dbb2ab24cf30389bb09f840602925690e213d62.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/e37fe0d55d47d9cb/blok-pitania-deepcool-gamerstorm-pq750g-wh-r-pq750g-fd0w-wgeu-v1-belyj/", watts: 750 },
      { id: "psu-4", name: "DEEPCOOL PF600 (600W)", rub: 3399, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/5dc4fb71a792a05790007538192ec0aa/ceccbb0646eee8ae8313ca6951bc7f6301235ab9c2d0484ad3a3c3c362a7f9e4.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/16ed5812fa5ed763/blok-pitania-deepcool-pf600-r-pf600d-ha0b-eu-cernyj/", watts: 600 },
      { id: "psu-5", name: "DEEPCOOL GamerStorm PQ1200G (1200W)", rub: 11299, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/0ea51e9343e8e21e354e04838c0b89d7/32d46e43150c9016436b9bec47db453c521eed1e9a6fb4df239b3668964f4258.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/80cdce8b5d44d9cb/blok-pitania-deepcool-gamerstorm-pq1200g-r-pqc00g-fd0b-wgeu-v1-cernyj/", watts: 1200 },
      { id: "psu-6", name: "DEEPCOOL GamerStorm PQ1000G WH (1000W)", rub: 9499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/e9a09977705475b86c4cd19d54bcec20/76124287d6d2c9343402aaf9990c11a48581c7d07c1bfb5a8d480230bf637a5a.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/b97eadac5d46d9cb/blok-pitania-deepcool-gamerstorm-pq1000g-wh-r-pqa00g-fd0w-wgeu-v1-belyj/", watts: 1000 },
      { id: "psu-7", name: "Cougar XTC600 (600W)", rub: 3499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/2934ad4a74216dfa4619ae4f377f805d/b3d76a87f4a7bbea9e0ba311b49ba9ce5ea7310ef9fd407445128ba8ca8bef55.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/9a91cf0ed0ba3332/blok-pitania-cougar-xtc600-31xc0600001p-cernyj/", watts: 850 },
    ],
  },
  {
    key: "case",
    label: "Case",
    parts: [
      { id: "case-1", name: "Cougar FV150 RGB Black", rub: 6399, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/da967ee5f68bfc1657748e7db9622b8a/c6b7242cb9964d0dbd85dd693c9fee6161159fceefa86b2b6e2d6dca18a1ce66.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/f45d1ae8046bd9cb/korpus-cougar-fv150-rgb-fv150-rgb-black-cernyj/" },
      { id: "case-2", name: "ARDOR GAMING Rare M6 Black", rub: 4499, image: "https://c.dns-shop.ru/thumb/st1/fit/wm/0/0/0963607756489694f7ccfffb15ff7f6c/5f16a22f5f35d885cf80e8f70769dbdd5b8ce7b17971b093e3b9cc5f1c1c41c6.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/4cc7bf0f7716ed20/korpus-ardor-gaming-rare-m6-cernyj/" },
      { id: "case-3", name: "ARDOR GAMING Rare M2 ARGB Black", rub: 4999, image: "https://c.dns-shop.ru/thumb/st1/fit/wm/0/0/f8961e4f58c675019cb367daa3e71906/ff08f890aa46d09aab8f054d2ef8cbfbe7e2e61642541a304093deea91790a22.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/7b9277cb5ffeed20/korpus-ardor-gaming-rare-m2-argb-cernyj/" },
      { id: "case-4", name: "ZALMAN N4 Rev.1 Black", rub: 3799, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/46214c9497e2f265b14c492d7d16a779/005cf17b58cdaecf2c8b879bdd75482305fa98aba41d1a410dd8e9cb4ada34c9.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/f1707d8a00b9ed20/korpus-zalman-n4-rev1-cernyj/" },
      { id: "case-5", name: "MONTECH KING 95 PRO Black", rub: 15199, image: "https://c.dns-shop.ru/thumb/st4/fit/500/500/8136ecd692b82d5638a5b9ce67eca9ea/2b62aba501b575a15ebdfffe46360dd8b461b8a29150aeb44048cfe132c5b707.png.webp", source: "dns", url: "https://www.dns-shop.ru/product/d84f485d521bed20/korpus-montech-king-95-pro-king-95-pro-black-cernyj/" },
      { id: "case-6", name: "ARDOR GAMING Crystal CC1 White", rub: 4799, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/b628cd14fd7118e7d6f77ca61ee494b4/14b2eee2fabde645bf6ab14ec3707bb820f4c73ce2a1b3cbb90a7d04e05a7cfd.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/8de22c667701ed20/korpus-ardor-gaming-crystal-cc1-belyj/" },
      { id: "case-7", name: "ARDOR GAMING Rare M6 White", rub: 4499, image: "https://c.dns-shop.ru/thumb/st1/fit/500/500/e96568a8022f8c550f6a40b7295d5014/93f00d0808a522036b46f02e67e724ffc8b1224b242b1736c0d77de17923aa80.jpg.webp", source: "dns", url: "https://www.dns-shop.ru/product/1fe36f9f771aed20/korpus-ardor-gaming-rare-m6-belyj/" },
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

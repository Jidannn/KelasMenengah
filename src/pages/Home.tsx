import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet, Home as HomeIcon, GraduationCap, HeartPulse,
  ChevronDown, MousePointer2, Newspaper,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ============ DATA ============

const C_GREEN = "hsl(140 30% 48%)";
const C_GREEN_BG = "hsl(140 28% 42%)";

const DATA_PDB = [
  { key: "C", name: "Konsumsi Rumah Tangga", value: 58.8, color: C_GREEN },
  { key: "I", name: "Pembentukan Modal Tetap", value: 30.6, color: "hsl(var(--secondary))" },
  { key: "G", name: "Belanja Pemerintah", value: 7.9, color: "hsl(var(--accent))" },
  { key: "X", name: "Net Ekspor", value: 2.8, color: "hsl(var(--muted-foreground))" },
];

const DATA_KONSUMSI_KELAS = [
  { name: "Kelas Bawah", value: 4.5, color: "hsl(150 25% 78%)" },
  { name: "Menuju Kelas Menengah", value: 10.0, color: "hsl(140 28% 62%)" },
  { name: "Kelas Menengah", value: 81.5, color: "hsl(38 75% 72%)" },
  { name: "Kelas Atas", value: 4.0, color: "hsl(120 18% 88%)" },
];

const DATA_TREND = [
  { year: "2019", value: 21.5 },
  { year: "2020", value: 20.6 },
  { year: "2021", value: 19.8 },
  { year: "2022", value: 18.1 },
  { year: "2023", value: 17.7 },
  { year: "2024", value: 16.9 },
];

const DATA_PENGELUARAN = [
  { name: "Konsumsi harian", value: 40.5, color: "hsl(var(--primary))" },
  { name: "Cicilan / pinjaman", value: 16.4, color: "hsl(var(--destructive))" },
  { name: "Tabungan & investasi", value: 21.8, color: "hsl(var(--secondary))" },
  { name: "Hiburan", value: 11.5, color: "hsl(var(--accent))" },
  { name: "Pengembangan diri", value: 9.9, color: "hsl(215 25% 35%)" },
];

const KECEMASAN = [
  { label: "Penurunan kondisi kesehatan", val: 62.3 },
  { label: "Kurangnya pendapatan setelah tidak produktif", val: 47.1 },
  { label: "Peningkatan biaya pengobatan & perawatan", val: 45.1 },
  { label: "Inflasi dan biaya hidup yang meningkat", val: 44.2 },
  { label: "Kurangnya tabungan untuk kebutuhan hidup", val: 43.3 },
  { label: "Penurunan mobilitas", val: 40.6 },
];

type CardKey = "keuangan" | "hunian" | "pendidikan" | "kesehatan";

const CARD_META: Record<
  CardKey,
  {
    label: string;
    icon: typeof Wallet;
    accent: string;
    bg: string;
    headline: string;
  }
> = {
  keuangan: {
    label: "KEUANGAN",
    icon: Wallet,
    accent: "hsl(15 65% 50%)",
    bg: "hsl(15 65% 50% / 0.18)",
    headline: "Apakah penghasilan cukup untuk kebutuhan yang makin mahal?",
  },
  hunian: {
    label: "HUNIAN",
    icon: HomeIcon,
    accent: "hsl(150 38% 42%)",
    bg: "hsl(150 38% 42% / 0.20)",
    headline: "Mengapa Anda tidak berencana memiliki hunian dalam 5 tahun kedepan?",
  },
  pendidikan: {
    label: "PENDIDIKAN",
    icon: GraduationCap,
    accent: "hsl(35 75% 45%)",
    bg: "hsl(35 75% 45% / 0.22)",
    headline: "Investasi pendidikan sebagai strategi jangka panjang",
  },
  kesehatan: {
    label: "KESEHATAN",
    icon: HeartPulse,
    accent: "hsl(0 60% 50%)",
    bg: "hsl(0 60% 50% / 0.18)",
    headline: "'Bom waktu' yang tidak terlihat di buku tabungan.",
  },
};

const CARD_ORDER: CardKey[] = ["keuangan", "hunian", "pendidikan", "kesehatan"];

// Annotations for hover-flip overlay (positions in % across the grid container)
// lineStart is in viewBox 200x200 coordinates
type Annotation = {
  x: number;
  y: number;
  lineStart: { x: number; y: number };
  value: string;
  label: string;
};

const CARD_ANNOTATIONS: Record<CardKey, Annotation[]> = {
  keuangan: [
    { x: 75, y: 22, lineStart: { x: 75, y: 50 }, value: "63,6%", label: "Pernah 'besar pasak daripada tiang'" },
    { x: 22, y: 75, lineStart: { x: 50, y: 75 }, value: "56,9%", label: "Pendapatan untuk konsumsi harian + cicilan langsung lenyap" },
    { x: 78, y: 78, lineStart: { x: 75, y: 75 }, value: "21,8%", label: "Sisa pendapatan untuk tabungan & investasi" },
  ],
  hunian: [
    { x: 22, y: 22, lineStart: { x: 125, y: 50 }, value: "35%", label: "Harga rumah terlalu mahal" },
    { x: 22, y: 78, lineStart: { x: 125, y: 75 }, value: "29%", label: "Akses pembiayaan KPR terbatas" },
    { x: 78, y: 78, lineStart: { x: 150, y: 75 }, value: "28%", label: "Gaji tidak sebanding dengan kenaikan harga rumah" },
  ],
  pendidikan: [
    { x: 22, y: 22, lineStart: { x: 50, y: 125 }, value: "99%", label: "Berharap anak bisa sekolah lebih tinggi" },
    { x: 78, y: 22, lineStart: { x: 75, y: 125 }, value: "6,04", label: "Rata-rata indeks kepuasan pendidikan 2026" },
    { x: 78, y: 78, lineStart: { x: 75, y: 150 }, value: "+22,2%", label: "Kepercayaan terhadap sekolah swasta naik vs 2025" },
  ],
  kesehatan: [
    { x: 78, y: 22, lineStart: { x: 150, y: 125 }, value: "5,60", label: "Kepuasan terhadap biaya kesehatan saat ini di Indonesia" },
    { x: 22, y: 22, lineStart: { x: 125, y: 125 }, value: "-21,4%", label: "Penurunan kepercayaan pada RS Pemerintah" },
    { x: 22, y: 78, lineStart: { x: 125, y: 150 }, value: "62,3%", label: "Khawatir dengan penurunan kesehatan masa pensiun" },
  ],
};

// ============ HELPERS ============

function useInView<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setInView(true);
        });
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ============ SVG PERSON ICON ============

function PersonIcon({
  filled,
  color = "currentColor",
}: {
  filled: boolean;
  color?: string;
}) {
  const fill = filled ? color : "hsl(var(--muted-foreground) / 0.35)";
  return (
    <svg viewBox="0 0 24 36" className="w-full h-full" aria-hidden>
      <circle cx="12" cy="7" r="5" fill={fill} />
      <path
        d="M4 36 L4 22 C4 17 7.5 14 12 14 C16.5 14 20 17 20 22 L20 36 Z"
        fill={fill}
      />
    </svg>
  );
}

// ============ PANEL: NEWS ============

function PanelNews() {
  return (
    <section
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24 overflow-hidden"
      style={{ background: "hsl(28 35% 90%)" }}
    >
      {/* Decorative right-edge brand band */}
      {/* <div
        className="absolute top-0 bottom-0 right-0 w-[10px] md:w-[14px]"
        style={{
          background:
            "linear-gradient(to bottom, hsl(15 55% 52%) 0%, hsl(15 60% 45%) 50%, hsl(150 38% 35%) 100%)",
        }}
        aria-hidden
      /> */}
      {/* Subtle horizontal "newsprint" lines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, hsl(215 30% 15%) 0 1px, transparent 1px 36px)",
        }}
      />
      {/* Soft warm blob top-left */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "hsl(35 70% 70%)" }}
      />

      <div className="relative max-w-3xl w-full space-y-12">
        {/* Masthead */}
        <div className="flex items-center gap-3 md:gap-4 pb-4 border-b-2 border-foreground/15">
          <div
            className="px-2.5 py-1 text-[10px] tracking-[0.3em] font-bold uppercase text-white shadow-sm"
            style={{ background: "hsl(15 60% 50%)" }}
          >
            Terkini
          </div>
          <Newspaper className="w-4 h-4 text-foreground/55" />
          <p className="text-xs tracking-[0.3em] uppercase text-foreground/60 font-bold">
            Berita Hari Ini
          </p>
          <span className="ml-auto text-[10px] tracking-widest uppercase text-foreground/45">
            April 2026
          </span>
        </div>

        {/* News article 1 */}
        <article className="space-y-3 reveal-up">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold">
            <span
              className="px-2 py-1 rounded-sm"
              style={{
                background: "hsl(15 60% 50% / 0.15)",
                color: "hsl(15 55% 38%)",
              }}
            >
              Ekonomi
            </span>
            <span className="h-px flex-1 bg-foreground/15" />
            <span className="text-foreground/50">Sumber Berita</span>
          </div>
          <h3
            className="font-serif text-2xl md:text-4xl leading-tight text-foreground border-l-[3px] pl-5"
            style={{ borderColor: "hsl(15 60% 50%)" }}
          >
            Iuran BPJS Kesehatan Berpotensi Naik 2026, Pemerintah Targetkan{" "}
            <span style={{ color: "hsl(15 55% 42%)" }}>Kelas Menengah</span>
          </h3>
        </article>

        {/* News article 2 */}
        <article className="space-y-3 reveal-up">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold">
            <span
              className="px-2 py-1 rounded-sm"
              style={{
                background: "hsl(150 38% 42% / 0.18)",
                color: "hsl(150 40% 25%)",
              }}
            >
              Kebijakan
            </span>
            <span className="h-px flex-1 bg-foreground/15" />
            <span className="text-foreground/50">BBC News Indonesia</span>
          </div>
          <h3
            className="font-serif text-2xl md:text-4xl leading-tight text-foreground border-l-[3px] pl-5"
            style={{ borderColor: "hsl(150 38% 42%)" }}
          >
            Warga{" "}
            <span style={{ color: "hsl(150 40% 28%)" }}>kelas menengah</span>{" "}
            paling terbebani kenaikan harga BBM dan LPG nonsubsidi
          </h3>
          <p className="text-base text-foreground/65 italic pl-5">
            "Gaji tetap, biaya hidup naik, tapi dianggap{" "}
            <span className="text-foreground font-semibold not-italic">
              terlalu kaya
            </span>{" "}
            untuk dapat subsidi."
          </p>
        </article>

        {/* Pull-quote sliver */}
        {/* <div className="flex items-start gap-3 pt-2">
          <div
            className="w-1 flex-shrink-0 rounded-full mt-1"
            style={{ background: "hsl(35 75% 55%)", height: "44px" }}
          />
          <p className="text-sm md:text-base text-foreground/65 leading-relaxed max-w-md">
            Dua judul. Satu kesimpulan: kelas menengah Indonesia sedang
            dipojokkan dari banyak sisi.
          </p>
        </div> */}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/55 text-xs tracking-widest uppercase">
        <span>Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}

// ============ PANEL: WELCOME ============

function PanelWelcome() {
  return (
    <section
      data-panel
      className="relative w-full h-screen flex items-center justify-center px-6 md:px-16 overflow-hidden bg-slate-900"
    >
      {/* 1. Background Image: Jakarta Citylight */}
      <div 
        className="absolute inset-0 bg-cover bg-center grayscale-[20%] brightness-[0.7]"
        style={{ backgroundImage: "url('/images/panel1-wallet.png')" }} 
      />
      {/* 2. Gradient Overlay untuk keterbacaan */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      
      {/* 3. Konten z-10 */}
      <div className="relative z-10 max-w-4xl text-center space-y-6 reveal-up">
        <p className="text-sm tracking-[0.3em] uppercase text-primary font-bold">
          Selamat datang
        </p>
        <h2 className="font-serif text-4xl md:text-7xl leading-[1.1] text-white">
          Selamat datang ke kehidupan kelas menengah di Indonesia.
        </h2>
      </div>
    </section>
  );
}

// ============ PANEL 1: HOOK ============

function PanelHook() {
  return (
    <section
      data-panel
      className="relative w-full h-screen flex items-center justify-center px-6 md:px-16 py-12 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 90% 90%, hsl(35 75% 55% / 0.13) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 10% 15%, hsl(15 55% 50% / 0.09) 0%, transparent 50%),
          hsl(25 32% 90%)
        `
      }}
    >
      <div className="max-w-3xl text-center space-y-10">
        <p className="reveal-up text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
          Panel 01
        </p>

        <h2 className="reveal-up font-serif text-4xl md:text-4xl leading-[1.15] text-foreground">
          Punya pekerjaan tetap.
          <br />
          Bukan orang miskin.
          <br />
          Tapi tiap akhir bulan selalu was-was.
        </h2>

        <div className="reveal-up mx-auto w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden shadow-md">
          <img
            src="/images/panel1-foto.webp"
            alt="Kehidupan kelas menengah"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="reveal-up text-lg md:text-xl text-muted-foreground">
          Tidak dapat bansos, tidak dapat subsidi LPG 3 Kg — tapi harga-harga
          terus naik.
        </p>
      </div>
    </section>
  );
}

// ============ PANEL 2: DEFINITION + ZOOM INTO C → GREEN PAGE ============

function PanelDefinitionZoom() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3000",
          pin: true,
          scrub: 0.6,
        },
      });

      // Stage A → B: definition fades, pie zooms toward C slice
      tl.to(".def-text", { opacity: 0, x: -120, duration: 1, ease: "power2.in" }, 0)
        .to(
          ".pdb-pie-wrap",
          {
            scale: 2.6,
            x: "18%",
            y: "8%",
            duration: 1.4,
            ease: "power2.inOut",
          },
          0
        )
        .to(".c-callout", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, ">-0.3")
        // Stage C: GREEN PAGE expands from C slice covering everything
        .to(
          ".green-page",
          { scale: 1, duration: 1.2, ease: "power2.inOut" },
          ">+0.1"
        )
        .to(
          ".green-content",
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          ">-0.5"
        )
        .to(
          ".km-annotation",
          { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" },
          ">-0.2"
        )
        .to({}, { duration: 1.2 }); // hold the green page before unpinning
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      data-panel
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "hsl(35 38% 91%)" }}
    >
      <div className="absolute inset-0 grid md:grid-cols-2 gap-12 items-center px-6 md:px-16 py-16">
        {/* LEFT: Definition */}
        <div className="def-text space-y-6 max-w-lg">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 02 — Definisi
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Kelas Menengah Indonesia
          </h2>
          <div className="bg-card border border-card-border rounded-xl p-6 space-y-3 shadow-sm">
            <p className="text-sm leading-relaxed text-foreground/90">
              Kelompok masyarakat dengan pengeluaran{" "}
              <span className="font-bold">3,5 hingga 17 kali Garis Kemiskinan</span>{" "}
              (BPS, 2024). Setara dengan pengeluaran kira-kira{" "}
              <span className="font-bold">Rp2 juta – Rp10 juta</span> per kapita
              per bulan.
            </p>
          </div>
          <p className="text-base text-muted-foreground italic">
            Mereka bukan miskin. Mereka bukan kaya. Mereka tulang punggung yang
            sering tidak terlihat.
          </p>
        </div>

        {/* RIGHT: PDB Pie that will zoom */}
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
          <div className="pdb-pie-wrap relative w-[68%] aspect-square max-w-sm origin-center">
            <p className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold whitespace-nowrap">
              PDB Indonesia 2024 = C + I + G + X
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DATA_PDB}
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="95%"
                  paddingAngle={1}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                >
                  {DATA_PDB.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Proportional legend bar — width of each segment matches percentage */}
          <div className="pdb-legend w-full max-w-xl space-y-3 px-2">
            <div className="flex w-full h-3 rounded-full overflow-hidden border border-border/50 shadow-sm">
              {DATA_PDB.map((d) => (
                <div
                  key={d.key}
                  style={{ width: `${d.value}%`, background: d.color }}
                  title={`${d.name} ${d.value}%`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] md:text-xs">
              {DATA_PDB.map((d) => (
                <div key={d.key} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-muted-foreground whitespace-nowrap">
                    {d.name}{" "}
                    <span className="font-bold text-foreground">
                      {d.value.toString().replace(".", ",")}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Callout: positioned BESIDE the pie chart (left side of viewport) so it
          appears next to the zoomed pie during the scroll animation. Wrapper
          handles positioning; inner .c-callout handles GSAP opacity + y. */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: "6%",
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "320px",
        }}
      >
        <div
          className="c-callout opacity-0"
          style={{ transform: "translateY(20px)" }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase font-bold"
            style={{ color: C_GREEN }}
          >
            Konsumsi Rumah Tangga
          </p>
          <p className="font-serif text-4xl md:text-6xl mt-2 text-foreground leading-none">
            58,8%
          </p>
          <p
            className="text-xs tracking-[0.25em] uppercase font-bold mt-1"
            style={{ color: C_GREEN }}
          >
            dari PDB
          </p>
          <p className="text-sm text-foreground/70 italic mt-3 max-w-xs">
            Mesin terbesar pertumbuhan ekonomi Indonesia.
          </p>
        </div>
      </div>

      {/* GREEN CIRCLE — emerges from C slice as a perfect round shape.
          Wrapper handles positioning (top/left + translate centering)
          so GSAP can safely animate `scale` on .green-page without
          clobbering the centering transform. */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          top: "50%",
          left: "78%",
          width: 0,
          height: 0,
        }}
      >
        <div
          className="green-page"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "240vmax",
            height: "240vmax",
            marginLeft: "-120vmax",
            marginTop: "-120vmax",
            background: `radial-gradient(circle at center, hsl(140 32% 38%) 0%, ${C_GREEN_BG} 70%)`,
            borderRadius: "50%",
            transform: "scale(0)",
            transformOrigin: "center center",
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.18)",
          }}
        />
      </div>

      {/* GREEN CONTENT — fades in over the green circle, anchored to viewport */}
      <div className="green-content absolute inset-0 z-40 flex items-center justify-center px-6 md:px-16 py-12 opacity-0 translate-y-6 pointer-events-none">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-4 text-white">
            <p className="text-xs tracking-[0.3em] uppercase font-bold text-white/70">
              Panel 02 · Konsumsi Rumah Tangga = 58,8% PDB
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight">
              Siapa yang sebenarnya menggerakkan konsumsi nasional?
            </h2>
            <p className="text-base md:text-lg text-white/90 leading-relaxed">
              Dari seluruh konsumsi rumah tangga Indonesia,{" "}
              <span className="font-bold" style={{ color: "hsl(38 75% 78%)" }}>
                kelas menengah
              </span>{" "}
              menyumbang porsi paling besar. Mereka adalah mesin utama
              konsumsi yang menggerakkan ekonomi.
            </p>
            <p className="text-sm text-white/70 italic pt-2">
              Sumber: BPS, KIMCI 2026
            </p>
          </div>

          <div className="relative w-full">
            {/* Pie + side annotation */}
            <div className="flex items-center justify-end gap-3 md:gap-6">
              <div className="relative h-[280px] w-[280px] md:h-[360px] md:w-[360px] shrink-0 transform translate-x-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DATA_KONSUMSI_KELAS}
                      cx="50%"
                      cy="50%"
                      innerRadius="36%"
                      outerRadius="88%"
                      paddingAngle={1}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="hsl(140 30% 35%)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {DATA_KONSUMSI_KELAS.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Annotation pointing from the pie's right edge */}
              <div className="km-annotation flex items-center gap-2 md:gap-3 opacity-0 shrink-0 -ml-4">
                <svg
                  width="48"
                  height="40"
                  viewBox="0 0 48 40"
                  fill="none"
                  className="shrink-0"
                  aria-hidden
                >
                  <circle cx="6" cy="20" r="3.5" fill="hsl(38 80% 22%)" />
                  <line
                    x1="6"
                    y1="20"
                    x2="50"
                    y2="20"
                    stroke="hsl(38 80% 22%)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </svg>
                <div className="text-left">
                  <p
                    className="font-serif text-5xl md:text-6xl leading-none font-bold"
                    style={{ color: "hsl(38 80% 82%)" }}
                  >
                    81,5%
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white font-bold mt-2">
                    Kelas Menengah
                  </p>
                  <p className="text-[11px] text-white/75 italic mt-1 max-w-[150px]">
                    Kontribusi terbesar konsumsi
                  </p>
                </div>
              </div>
            </div>

            {/* Legend below — aligned & centered with the chart */}
            <div className="mt-8 mx-auto max-w-md grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-white/90">
              {DATA_KONSUMSI_KELAS.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-muted-foreground leading-tight">
                    {d.name}{" "}
                    <span className="font-bold text-foreground">
                      {d.value.toString().replace(".", ",")}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ PANEL 3: SHRINKING ============

function PanelShrinking() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(20 32% 89%)" }}
    >
      <div className="max-w-5xl w-full space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 03 — Penyusutan
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight">
            Tapi… jumlah kelas menengah terus menyusut.
          </h2>
        </div>

        <div
          className={`h-[420px] w-full bg-card/60 p-6 rounded-2xl border border-card-border transition-opacity duration-1000 ${
            inView ? "opacity-100" : "opacity-0"
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA_TREND} margin={{ top: 30, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[15, 25]} // Memaksa grafik mulai dari 0 hingga 25
                ticks={[15, 17, 19, 21, 23, 25]} // Angka sumbu Y statis dan konsisten kelipatan 5
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
                formatter={(val) => [`${val}%`, "Kelas Menengah"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 7 }}
                isAnimationActive={inView}
                animationDuration={2200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl font-bold text-destructive">
            2019: 57,3 juta orang &nbsp;→&nbsp; 2024: 47,2 juta orang
          </p>
          <p className="font-serif text-2xl md:text-3xl">
            10 juta orang turun kelas dalam 5 tahun.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============ PANEL 4: ALARM SUNYI ============

function PanelAlarm() {
  return (
    <section
      data-panel
      // py-24 dikurangi jadi py-16 agar tidak terlalu banyak ruang kosong atas-bawah
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-16"
      style={{ background: "hsl(38 40% 87%)" }}
    >
      {/* space-y-14 dikurangi jadi space-y-8 */}
      <div className="max-w-5xl w-full space-y-8 text-center">
        <div className="space-y-2 reveal-up">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 04 — Alarm Sunyi
          </p>
          {/* Ukuran font judul diperkecil dari text-5xl jadi text-4xl */}
          <h2 className="font-serif text-2xl md:text-4xl leading-tight max-w-3xl mx-auto text-foreground">
            Kelas menengah menghadapi sebuah "alarm sunyi" kerentanan.
          </h2>
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
            KIMCI 2026
          </p>
        </div>

        {/* max-w-4xl ditambahkan agar grid tidak melebar berlebihan ke samping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 reveal-up items-stretch max-w-4xl mx-auto">
          
          {/* ================= KELAS BAWAH (SUBSIDI) ================= */}
          <div className="relative rounded-xl h-[240px] md:h-[280px] p-5 flex flex-col items-center justify-center overflow-hidden shadow-sm border border-black/10 group">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              /* UBAH URL INI DENGAN FOTO BANSOS/SUBSIDI DI FOLDER LOKALMU */
              style={{ backgroundImage: "url('/images/bahlil.webp')" }} 
            />
            {/* Overlay Gelap Kehijauan */}
            <div className="absolute inset-0 bg-emerald-950/65" />

            <div className="relative z-10 flex flex-col items-center">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="mb-2 opacity-80">
                <path d="M12 18 V8 C12 6.5 13 6 14 6 H16 C17 6 18 6.5 18 8 V18" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M14 6 V3 H16 V6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 18 V10 C22 7.5 23.5 5 26 5 C28.5 5 30 7.5 30 10 V18" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M25 5 L24 2 M27 5 L28 2" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M5 18 L7.5 33.5 C7.8 35 9 36 10.5 36 H29.5 C31 36 32.2 35 32.5 33.5 L35 18 Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M3 18 H37" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M16 27 H24" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <h3 className="font-bold tracking-widest text-xs text-white">
                KELAS BAWAH
              </h3>
              <div className="h-px w-10 my-2 bg-white/30" />
              <p className="text-xs text-white/80 max-w-[160px]">
                Mendapat subsidi & bansos
              </p>
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[8px] tracking-widest font-bold uppercase text-white bg-emerald-600/80 backdrop-blur-sm">
              Dilindungi
            </div>
          </div>

          {/* ================= KELAS MENENGAH (TANDA TANYA) ================= */}
          <div className="relative rounded-xl h-[260px] md:h-[300px] p-5 flex flex-col items-center justify-center overflow-hidden shadow-xl md:-mt-2 md:mb-2 z-10 border border-white/10 group">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              /* UBAH URL INI DENGAN FOTO KELAS MENENGAH DI FOLDER LOKALMU */
              style={{ backgroundImage: "url('/images/panel1-wallet.png')" }} 
            />
            {/* Overlay Gelap Kemerahan + Efek Blur biar tanda tanya menonjol */}
            <div className="absolute inset-0 bg-orange-950/60 backdrop-blur-[2px]" />

            <div className="relative z-10 flex flex-col items-center">
              <h3 className="font-bold tracking-widest text-xs text-orange-200">
                KELAS MENENGAH
              </h3>
              {/* Tanda tanya diperkecil sedikit dari 8rem jadi 7rem */}
              <div className="font-serif text-[6rem] md:text-[7rem] leading-none text-white drop-shadow-lg">
                ?
              </div>
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[8px] tracking-widest font-bold uppercase bg-red-600/80 backdrop-blur-sm text-white">
              Tanpa Penopang
            </div>
          </div>

          {/* ================= KELAS ATAS (ASET) ================= */}
          <div className="relative rounded-xl h-[240px] md:h-[280px] p-5 flex flex-col items-center justify-center overflow-hidden shadow-sm border border-black/10 group">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              /* UBAH URL INI DENGAN FOTO ASET/MEWAH DI FOLDER LOKALMU */
              style={{ backgroundImage: "url('/images/purbaya.webp')" }} 
            />
            {/* Overlay Gelap Keabu-abuan */}
            <div className="absolute inset-0 bg-slate-950/65" />

            <div className="relative z-10 flex flex-col items-center">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="mb-2 opacity-80">
                {/* Garis Tanah */}
                <path d="M4 34H36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 34V10C18 8.895 18.895 8 20 8H30C31.105 8 32 8.895 32 10V34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 14H28 M22 20H28 M22 26H28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 22L12 17L18 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 21V34 M16 21V34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 34V28C10 27.448 10.448 27 11 27H13C13.552 27 14 27.448 14 28V34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="font-bold tracking-widest text-xs text-white">
                KELAS ATAS
              </h3>
              <div className="h-px w-10 my-2 bg-white/30" />
              <p className="text-xs text-white/80 max-w-[160px]">
                Memiliki aset & investasi
              </p>
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[8px] tracking-widest font-bold uppercase text-white bg-amber-600/80 backdrop-blur-sm">
              Diuntungkan
            </div>
          </div>

        </div>

        {/* Teks kesimpulan di bawah juga diperkecil */}
        <p className="font-serif text-lg md:text-xl reveal-up text-foreground mt-2">
          Bantuan untuk kelas bawah. Aset untuk kelas atas.
          <br />
          <span className="text-primary font-semibold">Lalu untuk kelas menengah?</span>
        </p>
      </div>
    </section>
  );
}

// ============ PANEL 5: PENGELUARAN ============

function PanelExpenses() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (inView && !hasViewed) {
      const timer = setTimeout(() => setHasViewed(true), 150);
      return () => clearTimeout(timer);
    }
  }, [inView, hasViewed]);

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(15 30% 90%)" }}
    >
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        
        {/* ================= SISI KIRI: TEKS ================= */}
        <div className="space-y-10">
          
          {/* Headline: Dibuat lebih dramatis */}
          <div className="space-y-3">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight">
              Gaji habis <br />
              <span className="text-muted-foreground italic font-light">sebelum</span> bulan habis.
            </h2>
          </div>

          {/* Card Utama: Beban Pendapatan */}
          <div className="bg-white/50 backdrop-blur-sm border border-white p-8 rounded-[2rem] shadow-xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-destructive" />
            <p className="text-sm md:text-base text-muted-foreground font-medium mb-4">
              Konsumsi harian (40,5%) + Cicilan (16,4%) =
            </p>
            <h3 className="font-serif text-5xl md:text-6xl text-destructive font-bold tracking-tighter leading-none">
              56,9%
            </h3>
            <p className="text-xl md:text-2xl font-medium mt-2 text-foreground/80">
              pendapatan langsung lenyap.
            </p>
          </div>

          {/* Highlight Section: 636 dari 1000 */}
          <div className="relative pl-8 py-2">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 rounded-full" />
            <p className="text-xl md:text-2xl leading-snug text-foreground/80">
              <span className="text-black font-extrabold underline decoration-destructive/30 decoration-4 underline-offset-4">
                636 dari 1000
              </span> kelas menengah pernah mengalami defisit dalam setahun terakhir.
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-bold tracking-widest uppercase">
              (Survey KIC Q4 2025 - Q1 2026)
            </p>
          </div>
        </div>

        {/* ================= SISI KANAN: PIE CHART (TIDAK DIUBAH) ================= */}
        <div className="w-full flex flex-col items-center">
          <div className="relative h-[400px] md:h-[450px] w-full max-w-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 120 }}>
                <Pie
                  data={hasViewed ? DATA_PENGELUARAN : []}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={-300}
                  endAngle={60}
                  isAnimationActive={true}
                  animationDuration={2000}
                  animationBegin={0}
                  labelLine={{
                    stroke: "hsl(var(--muted-foreground))",
                    strokeWidth: 1,
                    opacity: 0.5,
                  }}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    outerRadius,
                    value,
                    name,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 15;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    const isLeft = x < cx;
                    const boxWidth = 200;
                    const boxHeight = 60;
                    const foX = isLeft ? x - boxWidth : x;
                    const foY = y - boxHeight / 2;

                    return (
                      <foreignObject
                        x={foX}
                        y={foY}
                        width={boxWidth}
                        height={boxHeight}
                        className="overflow-visible"
                      >
                        <div
                          className={`w-full h-full flex flex-col justify-center transition-all duration-700 ${
                            isLeft ? "items-end" : "items-start"
                          } ${
                            hasViewed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                          }`}
                          style={{ transitionDelay: `${index * 150 + 1000}ms` }}
                        >
                          <div
                            className="w-max flex flex-col px-3 py-1.5 rounded-lg shadow-sm border bg-white/95 backdrop-blur-sm"
                            style={{ borderColor: DATA_PENGELUARAN[index].color }}
                          >
                            <span className="text-[10px] md:text-[11px] leading-tight text-muted-foreground font-medium">
                              {name}
                            </span>
                            <span
                              className="text-[11px] md:text-xs font-bold leading-tight mt-0.5"
                              style={{ color: DATA_PENGELUARAN[index].color }}
                            >
                              {value.toString().replace(".", ",")}%
                            </span>
                          </div>
                        </div>
                      </foreignObject>
                    );
                  }}
                >
                  {(hasViewed ? DATA_PENGELUARAN : []).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ PANEL 6: 4 HOVER-FLIP CARDS WITH ANNOTATED LINES ============

function PanelFourCards({
  visited,
  setVisited,
}: {
  visited: Set<CardKey>;
  setVisited: (s: Set<CardKey>) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<CardKey | null>(null);

  const recordVisit = (key: CardKey) => {
    if (!visited.has(key)) {
      const next = new Set(visited);
      next.add(key);
      setVisited(next);
    }
  };

  const handleEnter = (key: CardKey) => {
    setActive(key);
    recordVisit(key);
  };

  const handleLeave = () => {
    setActive(null);
  };

  const handleClick = (key: CardKey) => {
    setActive((prev) => {
      const next = prev === key ? null : key;
      if (next) recordVisit(key);
      return next;
    });
  };

  return (
    <section
      ref={sectionRef}
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-12 overflow-hidden"
      style={{ background: "hsl(150 22% 86%)" }}
    >
      {/* Container diubah menjadi grid 5 kolom */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
        
        {/* ================= SISI KIRI: TEKS (Mengambil 2 Kolom) ================= */}
        <div className="md:col-span-2 space-y-8 text-left">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-foreground">
              Empat keresahan utama yang terus menghantui kelas menengah.
            </h2>
            
            <p className="text-sm text-muted-foreground italic flex items-center gap-2 mt-4">
              <MousePointer2 className="w-3.5 h-3.5" />
              Arahkan kursor ke setiap kartu untuk membuka data
            </p>
          </div>

          <div className="flex items-start gap-3 text-sm text-muted-foreground pt-2">
            <ChevronDown className="w-5 h-5 text-primary animate-bounce shrink-0 mt-0.5" />
            <span className="text-primary font-bold">
              Hover setiap kartu atau lanjut scroll untuk melihat konten selanjutnya
            </span>
          </div>
        </div>

        {/* ================= SISI KANAN: KARTU (Mengambil 3 Kolom) ================= */}
        <div className="md:col-span-3 relative w-full max-w-lg mx-auto aspect-square">
          {/* SVG annotation lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
            viewBox="0 0 200 200"
            preserveAspectRatio="none"
            aria-hidden
          >
            {CARD_ORDER.map((key) =>
              CARD_ANNOTATIONS[key].map((a, i) => {
                const isActive = active === key;
                const endX = (a.x / 100) * 200;
                const endY = (a.y / 100) * 200;
                return (
                  <line
                    key={`line-${key}-${i}`}
                    x1={a.lineStart.x}
                    y1={a.lineStart.y}
                    x2={endX}
                    y2={endY}
                    stroke={CARD_META[key].accent}
                    strokeWidth="0.7"
                    strokeDasharray="3 2"
                    pathLength={1}
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: isActive ? 0 : 1,
                      opacity: isActive ? 0.85 : 0,
                      transition: `stroke-dashoffset 1.4s cubic-bezier(0.65, 0, 0.35, 1) ${
                        isActive ? 0.35 + i * 0.25 : i * 0.1
                      }s, opacity 0.9s ease`,
                    }}
                  />
                );
              })
            )}
          </svg>

          {/* Cards in 2x2 grid */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 md:gap-4">
            {CARD_ORDER.map((key) => {
              const meta = CARD_META[key];
              const Icon = meta.icon;
              const isActive = active === key;
              const isDimmed = active !== null && !isActive;
              return (
                <div
                  key={key}
                  className="flip-host relative cursor-pointer"
                  onMouseEnter={() => handleEnter(key)}
                  onMouseLeave={handleLeave}
                  onFocus={() => handleEnter(key)}
                  onBlur={handleLeave}
                  onClick={() => handleClick(key)}
                  tabIndex={0}
                  style={{
                    transition: "filter 0.9s ease, opacity 0.9s ease",
                    filter: isDimmed ? "grayscale(1)" : "grayscale(0)",
                    opacity: isDimmed ? 0.45 : 1,
                    zIndex: isActive ? 20 : 10,
                  }}
                >
                  <div className={`flip-inner ${isActive ? "flipped" : ""}`}>
                    {/* FRONT */}
                    <div
                      className="flip-front absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 p-4"
                      style={{
                        background: `linear-gradient(160deg, white 0%, ${meta.bg} 100%)`,
                        borderColor: isActive
                          ? meta.accent
                          : `${meta.accent}40`,
                        boxShadow: isActive
                          ? `0 16px 40px -10px ${meta.accent}66`
                          : `0 4px 12px -4px ${meta.accent}25`,
                        transition: "box-shadow 0.5s ease, border-color 0.5s ease",
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                        style={{
                          background: meta.accent,
                          color: "white",
                        }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3
                        className="font-bold tracking-widest text-xs md:text-sm text-center"
                        style={{ color: meta.accent }}
                      >
                        {meta.label}
                      </h3>
                    </div>
                    {/* BACK */}
                    <div
                      className="flip-back absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-5 text-center"
                      style={{
                        background: meta.accent,
                        color: "white",
                        boxShadow: `0 18px 50px -10px ${meta.accent}80`,
                      }}
                    >
                      <Icon className="w-7 h-7 opacity-80" />
                      <h3 className="font-bold tracking-widest text-[10px] md:text-xs opacity-80">
                        {meta.label}
                      </h3>
                      <p className="font-serif text-sm md:text-base leading-snug">
                        {meta.headline}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text annotations overlay */}
          {CARD_ORDER.map((key) =>
            CARD_ANNOTATIONS[key].map((a, i) => {
              const isActive = active === key;
              return (
                <div
                  key={`ann-${key}-${i}`}
                  className="absolute z-40 pointer-events-none text-center w-[180px] md:w-[210px]"
                  style={{
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    transform: "translate(-50%, -50%)",
                    opacity: isActive ? 1 : 0,
                    transition: `opacity 1s ease ${
                      isActive ? 0.7 + i * 0.25 : 0
                    }s`,
                  }}
                >
                  <div
                    className="inline-block px-3 py-2 rounded-lg backdrop-blur-md shadow-xl"
                    style={{
                      background: "rgba(255,255,255,0.96)",
                      border: `2px solid ${CARD_META[key].accent}`,
                      boxShadow: `0 10px 30px -8px ${CARD_META[key].accent}55`,
                    }}
                  >
                    <p
                      className="font-serif text-2xl md:text-3xl font-bold leading-none"
                      style={{ color: CARD_META[key].accent }}
                    >
                      {a.value}
                    </p>
                    <p className="text-[10px] md:text-xs text-foreground mt-1.5 leading-snug font-medium">
                      {a.label}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

// ============ PANEL 7: PEOPLE PICTOGRAM (CLICK ONLY) ============

function PanelPictogram() {
  const [activated, setActivated] = useState(false);
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    if (activated) {
      const t = setTimeout(() => setShowSecond(true), 1400);
      return () => clearTimeout(t);
    }
  }, [activated]);

  const total = 20;
  const colored = 9;

  return (
    <section
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(45 35% 89%)" }}
    >
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 07 — Strategi Bertahan
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight">
            Cara mereka bertahan dan menghadapi ketakutan.
          </h2>
          {!activated && (
            <p className="text-sm text-muted-foreground italic flex items-center justify-center gap-2 pt-2">
              <MousePointer2 className="w-3.5 h-3.5" />
              Klik pictogram untuk melihat persentasenya
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActivated(true)}
          className="block w-full max-w-2xl mx-auto cursor-pointer"
          aria-label="Tampilkan persentase"
        >
          <div className="grid grid-cols-10 gap-3 md:gap-4 px-4">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] transition-all duration-700"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  filter: activated && i < colored ? "none" : "saturate(0)",
                  opacity: activated && i < colored ? 1 : 0.55,
                }}
              >
                <PersonIcon
                  filled
                  color={
                    activated && i < colored
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground))"
                  }
                />
              </div>
            ))}
          </div>
        </button>

        <div
          className={`space-y-4 transition-opacity duration-1000 ${
            activated ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="font-serif text-3xl md:text-5xl">
            <span className="text-primary font-bold">46,3%</span> sudah punya
            pekerjaan sampingan.
          </p>
          <p
            className={`text-lg md:text-xl text-muted-foreground transition-opacity duration-1000 ${
              showSecond ? "opacity-100" : "opacity-0"
            }`}
          >
            Dan <span className="text-foreground font-bold">94,8%</span> berencana
            terus melakukannya 5 tahun ke depan.
          </p>
          <p className="text-xs tracking-[0.3em] text-muted-foreground/60 pt-6 uppercase font-bold">
            Reason: To survive
          </p>
        </div>
      </div>
    </section>
  );
}

// ============ PANEL 8: BAPPENAS GAP ============

function PanelBappenas() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(50 38% 92%)" }}
    >
      <div className="max-w-5xl w-full space-y-16 text-center">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-bold">
            Panel 08 — Mengatasi Ancaman Turun Kelas
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">
            Mereka tidak hanya gagal naik. Mereka aktif berjuang agar tidak
            jatuh lebih dalam.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-end pt-8">
          <div className="text-left space-y-3 relative">
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-bold">
              Bappenas — Target 2045
            </p>
            <p className="font-serif text-7xl md:text-8xl text-foreground/40">
              70%
            </p>
            <p className="text-sm max-w-xs">
              Indonesia butuh 70% populasi jadi kelas menengah untuk menjadi
              negara maju.
            </p>
            {/* 100% bar with 70% filled */}
            <div className="mt-4 space-y-1.5">
              <div className="h-7 w-full bg-muted/50 rounded-full overflow-hidden border border-border/60 shadow-inner relative">
                <div
                  className="h-full rounded-full transition-all ease-out"
                  style={{
                    width: inView ? "70%" : "0%",
                    background:
                      "linear-gradient(90deg, hsl(215 25% 35%), hsl(215 20% 50%))",
                    transitionDuration: "1800ms",
                  }}
                />
                {/* 100% marker line — darker, thicker for clear visibility */}
                <div className="absolute right-0 top-0 h-full w-[3px] bg-foreground/85 rounded-r-full" />
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="font-bold text-foreground/70">70%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 relative">
            <p className="text-xs tracking-widest uppercase text-primary font-bold">
              Realita 2024
            </p>
            <p className="font-serif text-7xl md:text-8xl text-primary">
              16,9%
            </p>
            <p className="text-sm max-w-xs">
              Hanya 16,9% kelas menengah di Indonesia hari ini. Target masih
              jauh.
            </p>
            {/* 100% bar with 16.9% filled */}
            <div className="mt-4 space-y-1.5">
              <div className="h-7 w-full bg-muted/50 rounded-full overflow-hidden border border-border/60 shadow-inner relative">
                <div
                  className="h-full rounded-full transition-all ease-out"
                  style={{
                    width: inView ? "16.9%" : "0%",
                    background:
                      "linear-gradient(90deg, hsl(15 60% 50%), hsl(15 55% 60%))",
                    transitionDuration: "1800ms",
                  }}
                />
                {/* 100% marker line — darker, thicker for clear visibility */}
                <div className="absolute right-0 top-0 h-full w-[3px] bg-foreground/85 rounded-r-full" />
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="font-bold text-primary">16,9%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ PANEL 9: HORIZONTAL BAR CHART (AUTO-TRIGGER WHEN PANEL FULL IN VIEW) ============

function PanelBarChart() {
  // Use the same lightweight in-view hook as other panels so the trigger fires
  // reliably even when the panel is taller than the viewport.
  const { ref, inView } = useInView<HTMLElement>(0.2);

  // Slight delay after entering view so animation starts when panel feels settled
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setRun(true), 220);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-12 overflow-hidden"
      style={{ background: "hsl(40 38% 84%)" }}
    >
      <div className="max-w-3xl w-full space-y-6 md:space-y-8">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
          </p>
          {/* Perubahan: Menggunakan flex-row dan whitespace-nowrap agar teks tetap satu baris */}
          <h2 className="font-serif text-3xl md:text-5xl leading-tight flex flex-row gap-x-3 whitespace-nowrap">
            <span>Hari ini sudah berat.</span>
            <span>Bagaimana nanti?</span>
          </h2>
          <p className="text-base text-muted-foreground italic">
            Persentase kelas menengah yang merasa cemas terhadap aspek-aspek
            berikut di hari tua.
          </p>
        </div>

        <div className="space-y-3 md:space-y-5">
          {KECEMASAN.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-baseline gap-4 text-sm md:text-base">
                <span className="text-foreground/85">{item.label}</span>
                <span
                  className="font-serif text-lg md:text-xl font-bold transition-opacity duration-700"
                  style={{
                    opacity: run ? 1 : 0,
                    transitionDelay: `${i * 150 + 700}ms`,
                  }}
                >
                  {item.val}%
                </span>
              </div>
              {/* Perubahan: border warna hitam */}
              <div 
                className="h-3 w-full bg-muted/40 rounded-full overflow-hidden border shadow-inner"
                style={{ borderColor: "#8f3e26" }} 
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: run ? `${item.val}%` : "0%",
                    // Perubahan: Warna merah keorenan solid
                    background: "hsl(15 85% 55%)",
                    transition: `width 1300ms cubic-bezier(0.22, 1, 0.36, 1) ${
                      i * 150
                    }ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic">
          Sumber: KIMCI 2026, Katadata Insight Center
        </p>
      </div>
    </section>
  );
}

// ============ PANEL 10: QUESTIONS (FASTER REVEAL) ============

function PanelQuestions() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const questions = [
    "Kelas menengah menyumbang 81,5% konsumsi rumah tangga Indonesia, tapi tidak ada jaring pengaman untuk mereka. Apakah ini adil?",
    "Jika tren ini terus berlanjut, apakah Indonesia masih bisa mencapai target negara maju 2045?",
    "Apa yang bisa dilakukan oleh pemerintah dan diri kita sendiri agar tidak jatuh lebih dalam?",
  ];

  // Identitas warna BPS: Biru, Oren, Hijau
  const BPS_COLORS = ["#4364df", "#ff8307", "#6bde45"];

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-12 overflow-hidden"
      style={{ background: "hsl(30 35% 88%)" }}
    >
      {/* Container z-10 dengan margin-top negatif agar judul sedikit naik ke atas */}
      <div className="relative z-10 max-w-3xl w-full space-y-8 md:space-y-12 md:-mt-24">
        <h2 className="font-serif text-4xl md:text-6xl leading-tight text-center">
          Lalu… bagaimana nasib kelas menengah?
        </h2>

        <div className="space-y-6 md:space-y-8">
          {questions.map((q, i) => (
            <blockquote
              key={i}
              // Menambahkan text-justify pada className untuk meratakan teks di kedua sisi
              className={`font-serif text-xl md:text-2xl leading-relaxed pl-6 md:pl-8 border-l-[6px] text-justify transition-all duration-700 ${
                i === 1 ? "ml-0 md:ml-12" : i === 2 ? "ml-0 md:ml-24" : ""
              } ${
                step > i
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-6"
              }`}
              style={{ borderColor: BPS_COLORS[i] }}
            >
              "{q}"
            </blockquote>
          ))}
        </div>
      </div>

      {/* Bagian sumber data diposisikan absolut di bawah seperti layout copyright */}
      <div
        className={`absolute bottom-8 left-0 w-full px-6 md:px-16 transition-opacity duration-700 ${
          step >= 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-3xl mx-auto border-t border-black/10 pt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
            Sumber data
          </p>
          <p className="text-sm mt-1 text-foreground/70">
            Katadata Indonesia Middle Class Insight (KIMCI) 2026 · BPS · Bappenas
          </p>
        </div>
      </div>
    </section>
  );
}

// ============ MAIN ============

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visited, setVisited] = useState<Set<CardKey>>(new Set());
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const reveals = gsap.utils.toArray<HTMLElement>(".reveal-up");
      reveals.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
      });
    },
    { scope: containerRef }
  );

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [visited]);

  return (
    <div ref={containerRef} className="relative w-full bg-background text-foreground">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        {/* Track */}
        <div className="w-full h-[5px] bg-black/10">
          {/* Fill */}
          <div
            className="h-full transition-[width] duration-150 ease-out"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: "linear-gradient(90deg, hsl(120, 30%, 45%), hsl(130, 30%, 49%), hsl(140 30% 48%))",
            }}
          />
        </div>
        {/* Label pill */}
        {progress > 0.01 && (
          <div className="absolute top-[7px] left-2">
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
              style={{ background: "hsl(140, 30%, 48%)" }}
            >
              {Math.round(progress * 100)}%
            </span>
          </div>
        )}
      </div>

      <PanelNews />
      <PanelWelcome />
      <PanelHook />
      <PanelDefinitionZoom />
      <PanelShrinking />
      <PanelAlarm />
      <PanelExpenses />
      <PanelFourCards visited={visited} setVisited={setVisited} />
      <PanelPictogram />
      <PanelBappenas />
      <PanelBarChart />
      <PanelQuestions />
    </div>
  );
}
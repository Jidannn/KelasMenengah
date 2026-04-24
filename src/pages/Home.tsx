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
  Wallet,
  Home as HomeIcon,
  GraduationCap,
  HeartPulse,
  ChevronDown,
  MousePointer2,
  Newspaper,
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
  { year: "2014", value: 17.6 },
  { year: "2015", value: 17.3 },
  { year: "2016", value: 19.8 },
  { year: "2017", value: 22.0 },
  { year: "2018", value: 22.5 },
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
  { name: "Pengembangan diri", value: 9.9, color: "hsl(var(--chart-4))" },
];

const KECEMASAN = [
  { label: "Biaya kesehatan & penyakit di hari tua", val: 72 },
  { label: "Tidak punya cukup tabungan pensiun", val: 65 },
  { label: "Menjadi beban anak", val: 58 },
  { label: "Tidak punya rumah sendiri", val: 51 },
  { label: "Tidak bisa membiayai pendidikan anak hingga lulus", val: 47 },
  { label: "Kehilangan pekerjaan / pendapatan", val: 44 },
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
    headline: "Mimpi punya rumah sendiri yang makin menjauh.",
  },
  pendidikan: {
    label: "PENDIDIKAN",
    icon: GraduationCap,
    accent: "hsl(35 75% 45%)",
    bg: "hsl(35 75% 45% / 0.22)",
    headline: "Ingin anak naik kelas, tapi biaya sekolah terus naik.",
  },
  kesehatan: {
    label: "KESEHATAN",
    icon: HeartPulse,
    accent: "hsl(0 60% 50%)",
    bg: "hsl(0 60% 50% / 0.18)",
    headline: "Bom waktu yang tidak terlihat di buku tabungan.",
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
    { x: 75, y: 22, lineStart: { x: 75, y: 50 }, value: "63,6%", label: "Pernah pengeluaran > pemasukan" },
    { x: 22, y: 75, lineStart: { x: 50, y: 75 }, value: "56,9%", label: "Konsumsi harian + cicilan langsung lenyap" },
    { x: 78, y: 78, lineStart: { x: 75, y: 75 }, value: "21,8%", label: "Sisa untuk tabungan & investasi" },
  ],
  hunian: [
    { x: 22, y: 22, lineStart: { x: 125, y: 50 }, value: "35%", label: "Bilang harga rumah terlalu mahal" },
    { x: 22, y: 78, lineStart: { x: 125, y: 75 }, value: "29%", label: "Akses pembiayaan KPR terbatas" },
    { x: 78, y: 78, lineStart: { x: 150, y: 75 }, value: "28%", label: "Gaji tidak ikuti kenaikan harga" },
  ],
  pendidikan: [
    { x: 22, y: 22, lineStart: { x: 50, y: 125 }, value: "99%", label: "Berharap anak sekolah lebih tinggi" },
    { x: 78, y: 22, lineStart: { x: 75, y: 125 }, value: "Top 3", label: "Prioritas pengeluaran rumah tangga" },
    { x: 78, y: 78, lineStart: { x: 75, y: 150 }, value: "+22,2%", label: "Preferensi sekolah swasta naik vs 2025" },
  ],
  kesehatan: [
    { x: 22, y: 22, lineStart: { x: 125, y: 125 }, value: "Bom waktu", label: "Beban kesehatan jangka panjang" },
    { x: 78, y: 22, lineStart: { x: 150, y: 125 }, value: "5,6/10", label: "Skor kepuasan layanan kesehatan, terendah" },
    { x: 22, y: 78, lineStart: { x: 125, y: 150 }, value: "72%", label: "Khawatir biaya kesehatan di hari tua" },
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
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16"
      style={{ background: "hsl(30 35% 88%)" }}
    >
      <div className="max-w-4xl text-center space-y-6 reveal-up">
        <p className="text-sm tracking-[0.3em] uppercase text-primary/80 font-bold">
          Selamat datang
        </p>
        <h1 className="font-serif text-4xl md:text-7xl leading-[1.1] text-foreground">
          Selamat datang ke kehidupan kelas menengah di Indonesia.
        </h1>
      </div>
    </section>
  );
}

// ============ PANEL 1: HOOK ============

function PanelHook() {
  return (
    <section
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(25 32% 90%)" }}
    >
      <div className="max-w-3xl text-center space-y-10">
        <p className="reveal-up text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
          Panel 01
        </p>

        <h2 className="reveal-up font-serif text-4xl md:text-6xl leading-[1.15] text-foreground">
          Punya pekerjaan tetap.
          <br />
          Bukan orang miskin.
          <br />
          Tapi tiap akhir bulan selalu was-was.
        </h2>

        <div className="reveal-up mx-auto w-full max-w-md aspect-[4/3] rounded-xl border-2 border-dashed border-border/70 bg-card/40 flex items-center justify-center">
          <div className="text-center px-6 text-muted-foreground/60">
            <p className="text-xs uppercase tracking-widest font-bold">
              Tempat untuk gambar
            </p>
            <p className="text-[10px] mt-1 tracking-wider">
              Gambar dapat ditambahkan di sini
            </p>
          </div>
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
          <div className="pdb-legend w-full max-w-md space-y-3 px-2">
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
                  <span className="text-muted-foreground truncate">
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
                  <span className="truncate">
                    {d.name}{" "}
                    <span className="font-bold text-white">
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
            Tapi… jumlah tulang punggung terus menyusut.
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
                domain={[15, 25]}
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
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(38 40% 87%)" }}
    >
      <div className="max-w-5xl w-full space-y-14 text-center">
        <div className="space-y-3 reveal-up">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 04 — Alarm Sunyi
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">
            Kelas menengah menghadapi sebuah "alarm sunyi" kerentanan.
          </h2>
          <p className="text-xs tracking-widest text-muted-foreground uppercase font-bold">
            KIMCI 2026
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 reveal-up items-stretch">
          {/* KELAS BAWAH — sage / received */}
          <div
            className="relative rounded-2xl p-7 md:p-8 aspect-square flex flex-col items-center justify-center space-y-3 overflow-hidden shadow-sm"
            style={{
              background: "hsl(150 25% 86%)",
              borderTop: "4px solid hsl(150 38% 38%)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-25"
              style={{ background: "hsl(150 40% 50%)" }}
            />
            {/* Down-arrow icon (receiving aid) */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="relative"
              aria-hidden
            >
              <path
                d="M20 6 v18 m-7-7 l7 7 7-7"
                stroke="hsl(150 40% 28%)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="8"
                y1="32"
                x2="32"
                y2="32"
                stroke="hsl(150 40% 28%)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <h3 className="font-bold tracking-widest text-sm text-foreground/85 relative">
              KELAS BAWAH
            </h3>
            <div
              className="h-px w-12 relative"
              style={{ background: "hsl(150 38% 38% / 0.5)" }}
            />
            <p className="text-sm text-foreground/75 relative max-w-[180px]">
              Mendapat subsidi & bansos
            </p>
            <div
              className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[9px] tracking-widest font-bold uppercase text-white"
              style={{ background: "hsl(150 38% 38%)" }}
            >
              Dilindungi
            </div>
          </div>

          {/* KELAS MENENGAH — terracotta highlight */}
          <div
            className="relative rounded-2xl p-7 md:p-8 aspect-square flex flex-col items-center justify-center space-y-2 overflow-hidden shadow-xl md:scale-105 z-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(15 55% 55%), hsl(15 60% 45%))",
              borderTop: "4px solid hsl(15 70% 35%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  "radial-gradient(circle at center, white 0%, transparent 70%)",
              }}
            />
            <h3 className="font-bold tracking-widest text-sm text-white relative">
              KELAS MENENGAH
            </h3>
            <div className="font-serif text-[7rem] md:text-[8rem] leading-none text-white/80 relative">
              ?
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[9px] tracking-widest font-bold uppercase bg-white/15 text-white border border-white/20">
              Tanpa Penopang
            </div>
          </div>

          {/* KELAS ATAS — gold / assets */}
          <div
            className="relative rounded-2xl p-7 md:p-8 aspect-square flex flex-col items-center justify-center space-y-3 overflow-hidden shadow-sm"
            style={{
              background: "hsl(35 50% 86%)",
              borderTop: "4px solid hsl(35 75% 45%)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-25"
              style={{ background: "hsl(35 75% 60%)" }}
            />
            {/* Stacked-blocks icon (assets) */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="relative"
              aria-hidden
            >
              <rect
                x="6"
                y="22"
                width="28"
                height="10"
                rx="1.5"
                stroke="hsl(35 75% 30%)"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="11"
                y="13"
                width="18"
                height="9"
                rx="1.5"
                stroke="hsl(35 75% 30%)"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="15"
                y="5"
                width="10"
                height="8"
                rx="1.5"
                stroke="hsl(35 75% 30%)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <h3 className="font-bold tracking-widest text-sm text-foreground/85 relative">
              KELAS ATAS
            </h3>
            <div
              className="h-px w-12 relative"
              style={{ background: "hsl(35 75% 45% / 0.5)" }}
            />
            <p className="text-sm text-foreground/75 relative max-w-[180px]">
              Memiliki aset & investasi
            </p>
            <div
              className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[9px] tracking-widest font-bold uppercase text-white"
              style={{ background: "hsl(35 75% 45%)" }}
            >
              Diuntungkan
            </div>
          </div>
        </div>

        {/* Spectrum indicator below — visual placement of the three classes */}
        <div className="reveal-up max-w-3xl mx-auto space-y-3">
          <div
            className="relative h-2.5 rounded-full overflow-hidden border border-foreground/10"
            style={{
              background:
                "linear-gradient(90deg, hsl(150 28% 70%) 0%, hsl(15 60% 60%) 50%, hsl(35 65% 75%) 100%)",
            }}
          >
            {/* Center pointer = kelas menengah */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-6 rounded-full border-2"
              style={{
                background: "hsl(15 65% 45%)",
                borderColor: "hsl(15 70% 25%)",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] tracking-widest uppercase font-bold">
            <span style={{ color: "hsl(150 40% 28%)" }}>Bawah · Subsidi</span>
            <span style={{ color: "hsl(15 60% 38%)" }}>Menengah · ?</span>
            <span style={{ color: "hsl(35 75% 32%)" }}>Atas · Aset</span>
          </div>
        </div>

        <p className="font-serif text-xl md:text-2xl reveal-up">
          Bantuan untuk kelas bawah. Aset untuk kelas atas.
          <br />
          <span className="text-primary">Lalu untuk kelas menengah?</span>
        </p>
      </div>
    </section>
  );
}

// ============ PANEL 5: PENGELUARAN ============

function PanelExpenses() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(15 30% 90%)" }}
    >
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
              Panel 05 — Pengeluaran
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight">
              Gaji habis sebelum bulan habis.
            </h2>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 p-6 rounded-2xl">
            <p className="text-base leading-relaxed">
              Konsumsi harian (40,5%) + Cicilan (16,4%) =
              <span className="block font-serif text-3xl md:text-4xl text-destructive mt-2">
                56,9% pendapatan langsung lenyap.
              </span>
            </p>
          </div>

          <p className="text-lg md:text-xl border-l-4 border-primary pl-5 py-1">
            <span className="font-bold">63,6%</span> kelas menengah pernah
            mengalami pengeluaran lebih besar dari pemasukan dalam 1 tahun
            terakhir.
          </p>
        </div>

        <div className="w-full flex flex-col items-center">
          <div className="relative h-[360px] w-full max-w-sm">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DATA_PENGELUARAN}
                  cx="50%"
                  cy="50%"
                  innerRadius={92}
                  outerRadius={150}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={inView}
                  animationDuration={1400}
                >
                  {DATA_PENGELUARAN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend — flex-wrap centered so 5 items align cleanly under the donut */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] max-w-md">
            {DATA_PENGELUARAN.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-muted-foreground">
                  {d.name}{" "}
                  <span className="text-foreground font-bold">
                    {d.value.toString().replace(".", ",")}%
                  </span>
                </span>
              </div>
            ))}
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
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24 overflow-hidden"
      style={{ background: "hsl(150 22% 86%)" }}
    >
      <div className="max-w-3xl w-full space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 06 — Empat Keresahan
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            Mereka tidak takut satu hal. Mereka takut semua hal sekaligus.
          </h2>
          <p className="text-sm text-muted-foreground italic flex items-center justify-center gap-2">
            <MousePointer2 className="w-3.5 h-3.5" />
            Arahkan kursor ke setiap kartu untuk membuka data
          </p>
        </div>

        {/* Card grid container — slightly smaller than before */}
        <div className="relative max-w-md md:max-w-lg mx-auto aspect-square">
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
                        className="font-bold tracking-widest text-xs md:text-sm"
                        style={{ color: meta.accent }}
                      >
                        {meta.label}
                      </h3>
                      {visited.has(key) ? (
                        <span
                          className="absolute top-2 right-2 text-[10px] uppercase tracking-widest font-bold"
                          style={{ color: meta.accent }}
                        >
                          dibuka
                        </span>
                      ) : null}
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

          {/* Text annotations overlay (positioned in % over the grid) — larger to cover blurred cards */}
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

        {/* Hint indicator — no lock, scroll bebas */}
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground pt-4">
          <ChevronDown className="w-4 h-4 text-primary animate-bounce" />
          <span className="text-primary font-bold">
            Hover setiap kartu — atau lanjut scroll untuk melihat bagaimana mereka bertahan
          </span>
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
      className="relative w-full min-h-screen flex items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(40 38% 84%)" }}
    >
      <div className="max-w-4xl w-full space-y-10">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold">
            Panel 09 — Kecemasan Masa Depan
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight">
            Hari ini sudah berat. Bagaimana nanti?
          </h2>
          <p className="text-base text-muted-foreground italic max-w-2xl">
            Persentase kelas menengah yang merasa cemas terhadap aspek-aspek
            berikut di hari tua.
          </p>
        </div>

        <div className="space-y-6">
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
              <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40 shadow-inner">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: run ? `${item.val}%` : "0%",
                    background:
                      i === 0
                        ? "linear-gradient(90deg, hsl(0 55% 45%), hsl(0 60% 55%))"
                        : i === 1
                        ? "linear-gradient(90deg, hsl(15 55% 45%), hsl(15 60% 55%))"
                        : "linear-gradient(90deg, hsl(15 50% 55%), hsl(35 55% 65%))",
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
    "Kelas menengah menyumbang 81,5% konsumsi rumah tangga Indonesia — tapi tidak ada jaring pengaman untuk mereka. Apakah ini adil?",
    "Jika tren ini terus berlanjut, apakah Indonesia masih bisa mencapai target negara maju 2045?",
    "Apa yang bisa dilakukan — oleh pemerintah, oleh kita sendiri — agar tidak jatuh lebih dalam?",
  ];

  return (
    <section
      ref={ref}
      data-panel
      className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-24"
      style={{ background: "hsl(30 35% 88%)" }}
    >
      <div className="max-w-4xl w-full space-y-16">
        <h2 className="font-serif text-4xl md:text-6xl leading-tight text-center">
          Lalu… bagaimana nasib kelas menengah?
        </h2>

        <div className="space-y-12">
          {questions.map((q, i) => (
            <blockquote
              key={i}
              className={`font-serif text-xl md:text-2xl leading-relaxed pl-6 md:pl-8 border-l-4 transition-all duration-700 ${
                i === 0
                  ? "border-primary"
                  : i === 1
                  ? "border-secondary ml-0 md:ml-12"
                  : "border-accent ml-0 md:ml-24"
              } ${
                step > i
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-6"
              }`}
            >
              "{q}"
            </blockquote>
          ))}
        </div>

        <div
          className={`pt-16 mt-8 border-t border-border text-center transition-opacity duration-700 ${
            step >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
            Sumber data
          </p>
          <p className="text-sm mt-2 text-foreground/80">
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
      <div className="fixed top-0 left-0 w-full h-1 bg-border/40 z-50">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
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

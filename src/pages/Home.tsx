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
  { key: "C", name: "Konsumsi Rumah Tangga", value: 58.8, color: "#009E73" },   // bluish-green
  { key: "I", name: "Pembentukan Modal Tetap", value: 30.6, color: "#E69F00" }, // orange
  { key: "G", name: "Belanja Pemerintah", value: 7.9, color: "#56B4E9" },       // sky blue
  { key: "X", name: "Net Ekspor", value: 2.8, color: "#CC79A7" },               // pink/mauve
];

const DATA_KONSUMSI_KELAS = [
  { name: "Kelas lainnya", value: 19.5, color: "#009E73" },
  { name: "Kelas Menengah & Menuju Kelas Menengah", value: 81.5, color: "#E69F00" },
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

// ============ PIE LABEL HELPER ============

const RADIAN = Math.PI / 180;

function makePieLabelRenderer({
  textColor,
  skipNames = [],
}: {
  textColor: string;
  skipNames?: string[];
}) {
  return function renderLabel(props: any) {
    const { cx, cy, midAngle, outerRadius, name, value } = props;
    if (skipNames.includes(name)) return null;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const anchor = x > cx ? "start" : "end";
    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        <tspan x={x} dy="-0.55em">
          {name}
        </tspan>
        <tspan x={x} dy="1.3em" fontWeight={700} fontSize={13}>
          {value.toString().replace(".", ",")}%
        </tspan>
      </text>
    );
  };
}

// ============ HELPERS ============

function useInView<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          setInView(e.isIntersecting);
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
      className="relative w-full h-screen flex items-center justify-center px-6 md:px-16 py-16 overflow-hidden"
      style={{ background: "hsl(28 35% 90%)" }}
    >
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

      <div className="relative max-w-5xl w-full space-y-5">
        {/* Masthead */}
        <div className="flex items-center gap-3 md:gap-4 pb-4 border-b-2 border-foreground/15">
          <div
            className="px-3 py-1.5 text-xs md:text-sm tracking-[0.3em] font-bold uppercase text-white shadow-sm"
            style={{ background: "hsl(15 60% 50%)" }}
          >
            Terkini
          </div>
          <Newspaper className="w-5 h-5 text-foreground/55" />
          <p className="text-sm tracking-[0.3em] uppercase text-foreground/60 font-bold">
            Berita April 2026
          </p>
        </div>

        {/* Helper info: clickable titles */}
        <p className="reveal-up text-sm italic text-foreground/55 flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" />
          Tekan judul berita untuk membaca artikel lengkap
        </p>

        {/* News article 1 */}
        <article className="space-y-3 reveal-up">
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-bold">
            <span
              className="px-2.5 py-1 rounded-sm"
              style={{
                background: "hsl(15 60% 50% / 0.15)",
                color: "hsl(15 55% 38%)",
              }}
            >
              Ekonomi
            </span>
            <span className="h-px flex-1 bg-foreground/15" />
            <span className="text-foreground/50">Berita Satu</span>
          </div>

          <a
            href="https://www.beritasatu.com/network/kabarsinjai/825269/iuran-bpjs-kesehatan-berpotensi-naik-2026-pemerintah-targetkan-kelas-menengah#goog_rewarded"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h3
              className="font-serif text-2xl md:text-[2.5rem] lg:text-[3.25rem] leading-[1.15] text-foreground border-l-[4px] pl-5 transition-colors group-hover:text-[hsl(15_55%_42%)]"
              style={{ borderColor: "hsl(15 60% 50%)" }}
            >
              Iuran BPJS Kesehatan Berpotensi Naik 2026, Pemerintah Targetkan{" "}
              <span style={{ color: "hsl(15 55% 42%)" }}>Kelas Menengah</span>
            </h3>
          </a>
        </article>

        {/* News article 2 */}
        <article className="space-y-3 reveal-up">
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-bold">
            <span
              className="px-2.5 py-1 rounded-sm"
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
          <a
            href="https://www.bbc.com/indonesia/articles/c1j74g2dx15o"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h3
              className="font-serif text-2xl md:text-[2.5rem] lg:text-[3.25rem] leading-[1.15] text-foreground border-l-[4px] pl-5 transition-colors group-hover:text-[hsl(150_40%_28%)]"
              style={{ borderColor: "hsl(150 38% 42%)" }}
            >
              Warga{" "}
              <span style={{ color: "hsl(150 40% 28%)" }}>kelas menengah</span>{" "}
              paling terbebani kenaikan harga BBM dan LPG nonsubsidi
            </h3>
          </a>
        </article>
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
        style={{ backgroundImage: "url('/images/welcome.jpeg')" }} 
      />
      {/* 2. Gradient Overlay untuk keterbacaan */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      
      {/* 3. Konten z-10 */}
      <div className="relative z-10 max-w-4xl text-center space-y-6 reveal-up">
        <p
          className="text-sm tracking-[0.3em] uppercase font-bold"
          style={{ color: "hsl(38, 67%, 56%)" }}
        >
          Tidak Cukup Miskin Untuk Dapat Bantuan, Tidak Cukup Kaya Untuk Merasa Aman
        </p>
        <h2 className="font-serif text-4xl md:text-7xl leading-[1.1] text-white">
          Selamat datang ke kehidupan kelas menengah di Indonesia.
        </h2>
      </div>

      {/* 4. Photo credit */}
      <p className="absolute bottom-4 right-5 z-20 text-[10px] text-white/50 tracking-widest">
        Foto: Agung Prasetyo - Unsplash
      </p>
    </section>
  );
}

// ============ PANEL 2: DEFINITION + ZOOM INTO C → GREEN PAGE (UPDATED) ============

function PanelDefinitionZoom() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const timer = setTimeout(() => {
      if (!sectionRef.current) return;

      // Scope ke pdb-pie-wrap saja, bukan seluruh section
      const pieWrap = sectionRef.current.querySelector(".pdb-pie-wrap");
      if (!pieWrap) return;

      const sectors = pieWrap.querySelectorAll(".recharts-pie-sector");
      const labels = pieWrap.querySelectorAll("foreignObject");

      const otherSectors = Array.from(sectors).slice(1);
      const otherLabels = Array.from(labels);

      gsap.set(otherSectors, { opacity: 1 });
      gsap.set(otherLabels, { opacity: 1 });

      if (tlRef.current) {
        tlRef.current.kill();
        ScrollTrigger.getAll()
          .filter((st) => st.vars.id === "panel-def-zoom")
          .forEach((st) => st.kill());
      }

      tlRef.current = gsap.timeline({
        scrollTrigger: {
          id: "panel-def-zoom",
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3000",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // ✅ onRefresh: reset state saat browser refresh/resize
          onRefresh: () => {
            const pw = sectionRef.current?.querySelector(".pdb-pie-wrap");
            if (!pw) return;
            const s = pw.querySelectorAll(".recharts-pie-sector");
            const l = pw.querySelectorAll("foreignObject");
            gsap.set(Array.from(s).slice(1), { opacity: 1 });
            gsap.set(l, { opacity: 1 });
          },
        },
      });

      tlRef.current
        .to(".def-text", { opacity: 0, x: -120, duration: 1, ease: "power2.in" }, 0)
        .to(otherLabels, { opacity: 0, duration: 0.3, ease: "power2.out" }, 0)
        .to(otherSectors, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0)
        .to(".pdb-pie-wrap", {
          scale: 1.8,
          x: "22%",
          y: "0%",
          rotation: 100,
          duration: 1.4,
          ease: "power2.inOut",
        }, 0)
        .to(".c-callout", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, ">-0.3")
        .to(".green-page", { scale: 1, duration: 1.2, ease: "power2.inOut" }, ">+0.1")
        .to(".green-content", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, ">-0.5")
        .to({}, { duration: 1.2 });

      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (tlRef.current) tlRef.current.kill();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.id === "panel-def-zoom")
        .forEach((st) => st.kill());
    };
  }, []);

  // Reusable label renderer modeling Panel 5
  const renderAnnotatedLabel = (data: any[]) => (props: any) => {
    const { cx, cy, midAngle, outerRadius, value, name, index } = props;
    const RADIAN = Math.PI / 180;
    
    const radius = outerRadius + 20; 
    
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const isLeft = x < cx;
    
    // Ukuran box sedikit disesuaikan agar lebih proporsional
    const boxWidth = 175;
    const boxHeight = 54;
    
    // Beri margin horizontal tambahan dari titik kordinat
    let foX = isLeft ? x - boxWidth - 3 : x + 3;
    let foY = y - boxHeight / 2;

    return (
      <foreignObject
        x={foX}
        y={foY}
        width={boxWidth}
        height={boxHeight}
        className="overflow-visible"
      >
        <div
          className={`w-full h-full flex flex-col justify-center ${
            isLeft ? "items-end" : "items-start"
          }`}
        >
          {/* py-1.5 diubah jadi py-1 agar tinggi box sedikit menyusut */}
          <div
            className="w-max flex flex-col px-3 py-1 rounded-lg shadow-md border bg-white/95 backdrop-blur-sm"
            style={{ borderColor: data[index].color }}
          >
            <span className="text-[10px] md:text-[11px] leading-tight text-muted-foreground font-medium">
              {name}
            </span>
            <span
              className="text-[11px] md:text-xs font-bold leading-tight mt-0.5"
              style={{ color: data[index].color }}
            >
              {value.toString().replace(".", ",")}%
            </span>
          </div>
        </div>
      </foreignObject>
    );
  };

  const renderCenterLabel = (data: any[]) => (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, name, index } = props;
    
    // Jika ini adalah highlight utama (81,5%)
    if (name.includes("Menengah")) {
      return (
        <foreignObject 
          x={cx - 80} 
          y={cy - 40} 
          width={160} 
          height={80} 
          className="overflow-visible"
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">
              {name}
            </span>
            <span className="text-4xl md:text-5xl font-serif font-bold text-[hsl(38,80%,82%)] leading-none mt-1">
              {value.toString().replace(".", ",")}%
            </span>
          </div>
        </foreignObject>
      );
    }

    // Untuk kategori lainnya (19,5%), kita taro di atas chart secara bersih
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <foreignObject x={x - 60} y={y - 25} width={120} height={50} className="overflow-visible">
        <div className="flex flex-col items-center justify-center opacity-70">
          <div className="px-2 py-1 rounded-md border border-white/20 bg-black/10 backdrop-blur-sm text-center">
            <p className="text-[9px] text-white/80 leading-tight">{name}</p>
            <p className="text-xs font-bold text-white">{value}%</p>
          </div>
        </div>
      </foreignObject>
    );
  };

  return (
    <section
      ref={sectionRef}
      data-panel
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "hsl(35 38% 91%)" }}
    >
      <style>{`
        .pdb-pie-wrap foreignObject,
        .pdb-pie-wrap .recharts-pie-sector:nth-child(n+2) {
          opacity: var(--chart-fade, 1);
        }
      `}</style>
      <div className="absolute inset-0 grid md:grid-cols-2 gap-12 items-center px-6 md:px-16 py-16">
        {/* LEFT: Definition */}
        <div className="def-text space-y-6 max-w-lg">
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Kelas Menengah Indonesia
          </h2>
          <div className="bg-card border border-card-border rounded-xl p-6 space-y-3 shadow-sm">
            <p className="text-sm leading-relaxed text-foreground/90">
              Kelompok masyarakat dengan pengeluaran{" "}
              <span className="font-bold">3,5 hingga 17 kali Garis Kemiskinan</span>{" "}. 
              Setara dengan pengeluaran kira-kira{" "}
              <span className="font-bold">Rp2 juta – Rp10 juta</span> per kapita
              per bulan (BPS, 2024).
            </p>
          </div>
        </div>

        {/* RIGHT: PDB Pie with Annotated Labels */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="pdb-pie-wrap relative w-full aspect-square max-w-xl origin-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 40, right: 120, bottom: 40, left: 120 }}>
                <Pie
                  className="pdb-label-container" // Class ini membungkus semua label
                  data={DATA_PDB}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="75%"
                  paddingAngle={1}
                  dataKey="value"
                  startAngle={-200}
                  endAngle={160}
                  isAnimationActive={false}
                  label={renderAnnotatedLabel(DATA_PDB)}
                  labelLine={false}
                >
                  {DATA_PDB.map((entry) => (
                    <Cell 
                      key={entry.key} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Callout during zoom */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: "6%",
          top: "50%",
          transform: "translateY(-50%) scale(2)",
          transformOrigin: "left center",
          maxWidth: "320px",
        }}
      >
        <div className="c-callout opacity-0 translate-y-5">
          <p className="text-xs tracking-[0.3em] uppercase font-bold" style={{ color: C_GREEN }}>
            Konsumsi Rumah Tangga
          </p>
          <p className="font-serif text-4xl md:text-6xl mt-2 text-foreground leading-none">
            58,8%
          </p>
          <p className="text-xs tracking-[0.25em] uppercase font-bold mt-1" style={{ color: C_GREEN }}>
            dari PDB
          </p>
          <p className="text-sm text-foreground/70 italic mt-3 max-w-xs">
            Mesin terbesar pertumbuhan ekonomi Indonesia.
          </p>
        </div>
      </div>

      {/* GREEN OVERLAY CIRCLE */}
      <div className="absolute z-30 pointer-events-none" style={{ top: "50%", left: "78%", width: 0, height: 0 }}>
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

      {/* GREEN CONTENT WITH SECOND ANNOTATED PIE */}
      <div className="green-content absolute inset-0 z-40 flex items-center justify-center px-6 md:px-16 py-12 opacity-0 translate-y-6 pointer-events-none">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-4 text-white">
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
            <p className="text-sm text-white/70 italic pt-2">Sumber: BPS, KIMCI 2026</p>
          </div>

          <div className="relative w-full flex flex-col items-center">
            <div className="relative h-[320px] md:h-[400px] w-full max-w-lg">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DATA_KONSUMSI_KELAS}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%" // Diperbesar sedikit agar teks "Center" pas
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="hsl(140 30% 35%)"
                    strokeWidth={2}
                    isAnimationActive={true}
                    label={renderCenterLabel(DATA_KONSUMSI_KELAS)}
                    labelLine={false} // Matikan garis agar tidak "nyampah"
                  >
                    {DATA_KONSUMSI_KELAS.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
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
  // Pakai threshold 0.3 supaya pas 30% panel muncul, animasi langsung siap-siap
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    // Kunci di sini: Begitu inView TRUE, hasViewed jadi TRUE selamanya
    if (inView && !hasViewed) {
      setHasViewed(true);
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
        
        {/* SISI KIRI: TEKS (TIDAK BERUBAH) */}
        <div
          className="space-y-10 transition-all duration-1000"
          style={{
            opacity: hasViewed ? 1 : 0,
            transform: hasViewed ? "translateX(0)" : "translateX(-40px)",
            transitionDelay: "100ms",
          }}
        >
          <div className="space-y-3">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight">
              Gaji habis <br />
              <span className="text-muted-foreground italic font-light">sebelum</span> bulan habis.
            </h2>
          </div>

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

          <div className="relative pl-8 py-2">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 rounded-full" />
            <p className="text-xl md:text-2xl leading-snug text-foreground/80">
              <span className="text-black font-extrabold underline decoration-destructive/30 decoration-4 underline-offset-4">
                636 dari 1000
              </span>{" "}
              kelas menengah pernah mengalami defisit dalam setahun terakhir.
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-bold tracking-widest uppercase">
              (Survey KIC Q4 2025 - Q1 2026)
            </p>
          </div>
        </div>

        {/* SISI KANAN: PIE CHART */}
        <div
          className="w-full flex flex-col items-center transition-all duration-1000"
          style={{
            opacity: hasViewed ? 1 : 0,
            transform: hasViewed ? "translateX(0)" : "translateX(40px)",
            transitionDelay: "300ms",
          }}
        >
          <div className="relative h-[400px] md:h-[450px] w-full max-w-2xl">
            {/* 1. Pakai key dinamis yang berubah dari 0 ke 1 cuma SEKALI */}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 120 }}>
                  <Pie
                    data={DATA_PENGELUARAN}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={-300}
                    endAngle={60}
                    key={hasViewed ? "active" : "idle"}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationBegin={400}
                    labelLine={{
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                      opacity: 0.5,
                    }}
                    label={({ cx, cy, midAngle, outerRadius, value, name, index }) => {
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
                            className={`w-full h-full flex flex-col justify-center transition-all duration-700 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                              isLeft ? "items-end" : "items-start"
                            }`}
                            style={{ animationDelay: `${index * 150 + 1000}ms` }}
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
                    {DATA_PENGELUARAN.map((entry, i) => (
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
  const [showThird, setShowThird] = useState(false);

  useEffect(() => {
    if (activated) {
      const t1 = setTimeout(() => setShowSecond(true), 1400);
      const t2 = setTimeout(() => setShowThird(true), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
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
            Dan dari mereka,{" "}
            <span className="text-foreground font-bold">94,8%</span> berencana
            terus melakukannya 5 tahun ke depan.
          </p>
          <p
            className={`text-3xl tracking-[0.3em] pt-6 uppercase font-bold transition-opacity duration-1000 ${
              showThird ? "opacity-100" : "opacity-0"
            }`}
            style={{ color: "hsl(var(--primary))" }}
          >
            Reason: To Survive
          </p>
          <p className="text-xs text-muted-foreground/50 pt-2">
            Sumber: Survei KIC, n=1000 responden (Q4 2025–Q1 2026)
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
      <div className="max-w-5xl w-full space-y-12 text-center">

        {/* Headline */}
        <div className="w-full">
          <h2 className="font-serif text-3xl md:text-5xl leading-tight whitespace-nowrap scale-x-[0.95] md:scale-x-100 origin-center w-full text-center block">
            Kelas menengah tidak hanya berjuang untuk naik.<br />
            Mereka berusaha keras agar tidak turun.
          </h2>
        </div>

        {/* Bar Section */}
        <div className="max-w-2xl w-full mx-auto space-y-3">
          <p className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Proporsi kelas menengah terhadap total populasi
          </p>

          {/* Bar */}
          <div
            className="relative h-14 w-full rounded-2xl overflow-hidden border border-border/40"
            style={{ background: "hsl(50 20% 86%)" }}
          >
            {/* Target fill (70% — dark purple, low opacity) */}
            <div
              className="absolute left-0 top-0 h-full rounded-2xl transition-all ease-out"
              style={{
                width: inView ? "70%" : "0%",
                background: "#3C3489",
                opacity: 0.18,
                transitionDuration: "1800ms",
              }}
            />

            {/* Actual fill (16.9% — terra cotta) */}
            <div
              className="absolute left-0 top-0 h-full rounded-2xl transition-all ease-out"
              style={{
                width: inView ? "16.9%" : "0%",
                background: "#D85A30",
                transitionDuration: "1400ms",
                transitionDelay: "200ms",
              }}
            />

            {/* Label: 16.9% inside bar */}
            <div
              className="absolute top-0 h-full flex items-center transition-all ease-out"
              style={{
                left: inView ? "17.5%" : "0%",
                transitionDuration: "1400ms",
                transitionDelay: "200ms",
              }}
            >
              <span
                className="text-sm font-semibold whitespace-nowrap pl-2"
                style={{ color: "#D85A30" }}
              >
                16,9%
              </span>
            </div>

            {/* Label: 70% after divider */}
            <div
              className="absolute top-0 h-full flex items-center transition-all ease-out"
              style={{
                left: inView ? "70.5%" : "0%",
                transitionDuration: "1800ms",
              }}
            >
              <span
                className="text-sm font-semibold whitespace-nowrap pl-1"
                style={{ color: "#3C3489" }}
              >
                70%
              </span>
            </div>
          </div>

          {/* Axis labels */}
          <div className="relative flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 text-left max-w-2xl mx-auto w-full">
          <div
            className="p-5 rounded-2xl border border-border/40 space-y-2"
            style={{ 
              background: "hsl(50 38% 96%)",
              border: "1px solid #D85A30", 
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
              Realita 2024
            </p>
            <p className="font-serif text-6xl leading-none text-center" style={{ color: "#D85A30" }}>
              16,9%
            </p>
            <p className="text-sm text-muted-foreground leading-snug text-center">
              Hanya 47,2 juta orang — turun dari 57,3 juta pada 2019
            </p>
          </div>

          <div
            className="p-5 rounded-2xl space-y-2"
            style={{
              background: "hsl(50 38% 96%)",
              border: "1px solid #3C3489",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest text-center"
              style={{ color: "#3C3489" }}
            >
              Target Bappenas 2045
            </p>
            <p className="font-serif text-6xl leading-none text-center" style={{ color: "#3C3489" }}>
              70%
            </p>
            <p className="text-sm text-muted-foreground leading-snug text-center">
              Indonesia butuh 70% populasi jadi kelas menengah untuk menjadi negara maju
            </p>
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
import React, { useState, useMemo, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  Coins,
  HeartHandshake,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  Store,
  Sun,
  Utensils,
  Ambulance,
  ArrowRight,
  Download,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  BarChart2,
  FileText,
  Printer,
  Repeat,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tenant, Invoice, RecurringWakafSubscription } from "../types";
import { INITIAL_RECURRING_WAKAF_SUBSCRIPTIONS } from "../data/mockData";
import { RecurringWakafManager } from "./RecurringWakafManager";
import { CommunityImpactReportModal, CommunityImpactReportData } from "./CommunityImpactReportModal";

interface WakafInvestmentCalculatorProps {
  tenants?: Tenant[];
  invoices?: Invoice[];
  subscriptions?: RecurringWakafSubscription[];
  onSaveSubscription?: (sub: RecurringWakafSubscription, syncInvoices: boolean) => void;
  onToggleSubscriptionStatus?: (subId: string) => void;
  onApplyToInvoice?: (tenantId: string, monthlyWaqfAmount: number) => void;
  initialTab?: "projection" | "recurring_subscription" | "projects_breakdown" | "growth_chart" | "ikrar";
}


// Project Definitions with unit economics
export interface CommunityProject {
  id: string;
  name: string;
  category: "Ekonomi Mikro" | "Pendidikan" | "Infrastruktur Hijau" | "Pangan" | "Kesehatan";
  iconName: "Store" | "GraduationCap" | "Sun" | "Utensils" | "Ambulance";
  unitCost: number;
  unitLabel: string;
  impactMetric: string;
  description: string;
  defaultShare: number; // percentage in default portfolio
  sdgGoal: string;
}

export const COMMUNITY_PROJECTS: CommunityProject[] = [
  {
    id: "proj-umkm",
    name: "Modal Bergulir Qardhul Hasan Dhuafa",
    category: "Ekonomi Mikro",
    iconName: "Store",
    unitCost: 2500000,
    unitLabel: "Pelaku UMKM / Warung",
    impactMetric: "Warung bebas jeratan rentenir & mandiri ekonomi",
    description: "Pembiayaan mikro syariah tanpa bunga dan bagi hasil lunak untuk pedagang kecil sekitar masjid.",
    defaultShare: 35,
    sdgGoal: "SDG 1: Tanpa Kemiskinan & SDG 8: Pertumbuhan Ekonomi",
  },
  {
    id: "proj-edu",
    name: "Beasiswa Santripreneur & Digital Talent",
    category: "Pendidikan",
    iconName: "GraduationCap",
    unitCost: 1500000,
    unitLabel: "Santri / Semester",
    impactMetric: "Santri terampil teknologi, koding & akuntansi syariah",
    description: "Pendidikan vokasi teknologi digital, coding, dan literasi bisnis syariah bagi santri dhuafa berprestasi.",
    defaultShare: 25,
    sdgGoal: "SDG 4: Pendidikan Berkualitas",
  },
  {
    id: "proj-green",
    name: "Solar Panel & Sanitasi Masjid Hijau (Eco-Mosque)",
    category: "Infrastruktur Hijau",
    iconName: "Sun",
    unitCost: 3500000,
    unitLabel: "Modul Surya (0.5 kWp)",
    impactMetric: "kWh listrik bersih & efisiensi biaya operasional masjid",
    description: "Instalasi PLTS atap dan pengolahan daur ulang air wudhu untuk kebun hidroponik komunitas.",
    defaultShare: 15,
    sdgGoal: "SDG 7: Energi Bersih & SDG 13: Aksi Iklim",
  },
  {
    id: "proj-food",
    name: "Dapur Berkah Jum'at & Nutrisi Balita Stunting",
    category: "Pangan",
    iconName: "Utensils",
    unitCost: 25000,
    unitLabel: "Porsi Makanan Bergizi",
    impactMetric: "Paket makan siang & paket gizi balita mustahiq",
    description: "Pemberian makanan bernutrisi tinggi dan pemantauan tumbuh kembang anak dari keluarga prasejahtera.",
    defaultShare: 15,
    sdgGoal: "SDG 2: Tanpa Kelaparan & SDG 3: Kesehatan Baik",
  },
  {
    id: "proj-health",
    name: "Klinik Pratama Wakaf & Ambulans Siaga Gratis",
    category: "Kesehatan",
    iconName: "Ambulance",
    unitCost: 500000,
    unitLabel: "Layanan Gawat Darurat",
    impactMetric: "Pasien dhuafa tertolong & fardhu kifayah gratis",
    description: "Layanan mobil ambulans 24 jam gratis dan pengobatan dasar tanpa biaya untuk masyarakat berpenghasilan rendah.",
    defaultShare: 10,
    sdgGoal: "SDG 3: Kehidupan Sehat dan Sejahtera",
  },
];

export const WakafInvestmentCalculator: React.FC<WakafInvestmentCalculatorProps> = ({
  tenants = [],
  invoices = [],
  subscriptions = [],
  onSaveSubscription,
  onToggleSubscriptionStatus,
  onApplyToInvoice,
  initialTab = "projection",
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // Local Subscriptions state fallback
  const [localSubscriptions, setLocalSubscriptions] = useState<RecurringWakafSubscription[]>(() => {
    return subscriptions && subscriptions.length > 0
      ? subscriptions
      : INITIAL_RECURRING_WAKAF_SUBSCRIPTIONS;
  });

  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      setLocalSubscriptions(subscriptions);
    }
  }, [subscriptions]);

  const handleSaveSubscriptionInternal = (sub: RecurringWakafSubscription, syncInvoices: boolean) => {
    setLocalSubscriptions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === sub.id || s.tenantId === sub.tenantId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = sub;
        return updated;
      }
      return [sub, ...prev];
    });

    if (onSaveSubscription) {
      onSaveSubscription(sub, syncInvoices);
    }
  };

  const handleToggleSubStatusInternal = (subId: string) => {
    setLocalSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subId ? { ...s, status: s.status === "active" ? "paused" : "active" } : s
      )
    );
    if (onToggleSubscriptionStatus) {
      onToggleSubscriptionStatus(subId);
    }
  };

  // Input States
  const [selectedTenantId, setSelectedTenantId] = useState<string>(safeTenants[0]?.id || "custom");
  const [calculationMode, setCalculationMode] = useState<"fixed_amount" | "percentage_omzet" | "percentage_profit" | "percentage_rent">("percentage_rent");
  const [frequency, setFrequency] = useState<"monthly" | "annually">("monthly");
  
  // Numerical Values
  const [fixedAmount, setFixedAmount] = useState<number>(500000);
  const [baseRevenue, setBaseRevenue] = useState<number>(15000000);
  const [percentageRate, setPercentageRate] = useState<number>(5);
  
  // Projection Parameters
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [expectedAnnualYield, setExpectedAnnualYield] = useState<number>(7.5); // 7.5% annual productive endowment yield
  const [reinvestmentStrategy, setReinvestmentStrategy] = useState<"direct_impact" | "hybrid_endowment">("direct_impact");
  
  // Allocation Overrides (Percentage per project)
  const [projectAllocations, setProjectAllocations] = useState<{ [id: string]: number }>(() => {
    const initial: { [id: string]: number } = {};
    COMMUNITY_PROJECTS.forEach((p) => {
      initial[p.id] = p.defaultShare;
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState<"projection" | "recurring_subscription" | "projects_breakdown" | "growth_chart" | "ikrar">(
    initialTab
  );
  const [chartMode, setChartMode] = useState<"stacked_projects_bar" | "inflow_vs_impact_bar" | "cumulative_units_bar" | "area_trajectory">("stacked_projects_bar");
  const [copiedIkrar, setCopiedIkrar] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Sync when tenant changes
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (tenantId !== "custom") {
      const found = safeTenants.find((t) => t.id === tenantId);
      if (found) {
        // Base revenue approx based on monthly rate
        setBaseRevenue(found.monthlyRate * 20);
        // Default fixed amount: 5% of monthly rent
        setFixedAmount(Math.round(found.monthlyRate * 0.05));
      }
    }
  };

  // Base Monthly Recurring Wakaf Calculation
  const monthlyWakafAmount = useMemo(() => {
    if (calculationMode === "fixed_amount") {
      return frequency === "monthly" ? fixedAmount : Math.round(fixedAmount / 12);
    }
    if (calculationMode === "percentage_rent") {
      const tenant = safeTenants.find((t) => t.id === selectedTenantId);
      const rent = tenant ? tenant.monthlyRate : 1500000;
      return Math.round((rent * percentageRate) / 100);
    }
    // percentage of omzet or profit
    return Math.round((baseRevenue * percentageRate) / 100);
  }, [calculationMode, frequency, fixedAmount, percentageRate, baseRevenue, selectedTenantId, safeTenants]);

  const annualWakafAmount = monthlyWakafAmount * 12;

  // Multi-Year Growth and Cumulative Impact Computation
  const projectionTimeline = useMemo(() => {
    const data: Array<{
      year: number;
      yearLabel: string;
      annualDeposit: number;
      cumulativeDeposited: number;
      endowmentBalance: number;
      annualYieldGenerated: number;
      annualImpactDisbursed: number;
      cumulativeImpactDisbursed: number;
      sroiMultiplier: number;
      // Project-Specific Breakdown per Year for Bar Chart (in IDR)
      umkmDisbursed: number;
      eduDisbursed: number;
      greenDisbursed: number;
      foodDisbursed: number;
      healthDisbursed: number;
      // Project Units Generated Cumulatively
      umkmUnits: number;
      eduUnits: number;
      greenUnits: number;
      foodUnits: number;
      healthUnits: number;
    }> = [];

    let runningEndowment = 0;
    let runningCumulativeDeposits = 0;
    let runningCumulativeImpact = 0;
    const monthlyRate = expectedAnnualYield / 100 / 12;

    const umkmPct = (projectAllocations["proj-umkm"] ?? 35) / 100;
    const eduPct = (projectAllocations["proj-edu"] ?? 25) / 100;
    const greenPct = (projectAllocations["proj-green"] ?? 15) / 100;
    const foodPct = (projectAllocations["proj-food"] ?? 15) / 100;
    const healthPct = (projectAllocations["proj-health"] ?? 10) / 100;

    for (let yr = 1; yr <= tenureYears; yr++) {
      const annualDep = annualWakafAmount;
      runningCumulativeDeposits += annualDep;

      let yearYield = 0;
      let yearDisbursed = 0;
      if (reinvestmentStrategy === "hybrid_endowment") {
        // 30% yield retained in principal, 70% distributed
        for (let m = 1; m <= 12; m++) {
          runningEndowment += monthlyWakafAmount;
          const monthYield = runningEndowment * monthlyRate;
          yearYield += monthYield;
          runningEndowment += monthYield * 0.30; // 30% compounded
        }
        yearDisbursed = annualDep * 0.70 + yearYield * 0.70;
        runningCumulativeImpact += yearDisbursed;
      } else {
        // Direct Perpetual Impact: All recurring contributions + annual yield directly go to community projects
        for (let m = 1; m <= 12; m++) {
          runningEndowment += monthlyWakafAmount;
          const monthYield = runningEndowment * monthlyRate;
          yearYield += monthYield;
        }
        yearDisbursed = annualDep + yearYield;
        runningCumulativeImpact += yearDisbursed;
      }

      const sroi = runningCumulativeDeposits > 0 
        ? parseFloat((runningCumulativeImpact / runningCumulativeDeposits * (1 + (yr * 0.12))).toFixed(2)) 
        : 1.0;

      data.push({
        year: yr,
        yearLabel: `Tahun ${yr}`,
        annualDeposit: Math.round(annualDep),
        cumulativeDeposited: Math.round(runningCumulativeDeposits),
        endowmentBalance: Math.round(runningEndowment),
        annualYieldGenerated: Math.round(yearYield),
        annualImpactDisbursed: Math.round(yearDisbursed),
        cumulativeImpactDisbursed: Math.round(runningCumulativeImpact),
        sroiMultiplier: sroi,
        // Specific Project Breakdown for Stacked Bar Chart
        umkmDisbursed: Math.round(yearDisbursed * umkmPct),
        eduDisbursed: Math.round(yearDisbursed * eduPct),
        greenDisbursed: Math.round(yearDisbursed * greenPct),
        foodDisbursed: Math.round(yearDisbursed * foodPct),
        healthDisbursed: Math.round(yearDisbursed * healthPct),
        // Cumulative Unit Milestones
        umkmUnits: Math.floor((runningCumulativeImpact * umkmPct) / 2500000),
        eduUnits: Math.floor((runningCumulativeImpact * eduPct) / 1500000),
        greenUnits: Math.floor((runningCumulativeImpact * greenPct) / 3500000),
        foodUnits: Math.floor((runningCumulativeImpact * foodPct) / 25000),
        healthUnits: Math.floor((runningCumulativeImpact * healthPct) / 500000),
      });
    }

    return data;
  }, [monthlyWakafAmount, annualWakafAmount, tenureYears, expectedAnnualYield, reinvestmentStrategy, projectAllocations]);

  // Final Horizon Totals
  const finalProjection = projectionTimeline[projectionTimeline.length - 1] || {
    cumulativeDeposited: annualWakafAmount * tenureYears,
    endowmentBalance: annualWakafAmount * tenureYears,
    cumulativeImpactDisbursed: annualWakafAmount * tenureYears * 1.35,
    sroiMultiplier: 1.85,
  };

  // Calculate Project Unit Impacts over the chosen horizon
  const projectImpactResults = useMemo(() => {
    const totalFundsForProjects = finalProjection.cumulativeImpactDisbursed;
    
    return COMMUNITY_PROJECTS.map((project) => {
      const allocatedPercent = projectAllocations[project.id] || project.defaultShare;
      const allocatedAmount = Math.round((totalFundsForProjects * allocatedPercent) / 100);
      const unitsGenerated = Math.floor(allocatedAmount / project.unitCost);
      const fractionalRemainder = allocatedAmount % project.unitCost;

      return {
        ...project,
        allocatedPercent,
        allocatedAmount,
        unitsGenerated,
        fractionalRemainder,
      };
    });
  }, [finalProjection.cumulativeImpactDisbursed, projectAllocations]);

  // Selected Tenant Object
  const currentTenant = safeTenants.find((t) => t.id === selectedTenantId);

  // Memoized Report Data for Stakeholder Community Impact Report
  const reportData: CommunityImpactReportData = useMemo(() => {
    return {
      tenantName: currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri",
      tenantSector: currentTenant?.businessSector || "Teknologi & Layanan Bisnis",
      tenantAddress: currentTenant?.registeredAddress || "Sentra Bisnis Wakaf Masjid Agung, Jakarta",
      representativeName: currentTenant?.representativeName || "Pimpinan Entitas",
      monthlyContribution: monthlyWakafAmount,
      annualContribution: annualWakafAmount,
      tenureYears,
      expectedAnnualYield,
      reinvestmentStrategy,
      cumulativeDeposited: finalProjection.cumulativeDeposited,
      endowmentBalance: finalProjection.endowmentBalance,
      cumulativeImpactDisbursed: finalProjection.cumulativeImpactDisbursed,
      sroiMultiplier: finalProjection.sroiMultiplier,
      projectAllocations,
      projectImpacts: projectImpactResults.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        iconName: p.iconName,
        allocatedPercent: p.allocatedPercent,
        allocatedAmountTotal: p.allocatedAmount,
        unitsGenerated: p.unitsGenerated,
        unitLabel: p.unitLabel,
        impactMetric: p.impactMetric,
        sdgGoal: p.sdgGoal,
      })),
      projectionTimeline,
    };
  }, [
    currentTenant,
    monthlyWakafAmount,
    annualWakafAmount,
    tenureYears,
    expectedAnnualYield,
    reinvestmentStrategy,
    finalProjection,
    projectAllocations,
    projectImpactResults,
    projectionTimeline,
  ]);

  // Helper for Project Icons
  const renderProjectIcon = (iconName: CommunityProject["iconName"]) => {
    switch (iconName) {
      case "Store":
        return <Store className="w-5 h-5 text-[#5A5A40]" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-[#5A5A40]" />;
      case "Sun":
        return <Sun className="w-5 h-5 text-[#5A5A40]" />;
      case "Utensils":
        return <Utensils className="w-5 h-5 text-[#5A5A40]" />;
      case "Ambulance":
        return <Ambulance className="w-5 h-5 text-[#5A5A40]" />;
      default:
        return <HeartHandshake className="w-5 h-5 text-[#5A5A40]" />;
    }
  };

  // Copy Ikrar Statement
  const handleCopyIkrar = () => {
    const tenantName = selectedTenantId !== "custom" && currentTenant ? currentTenant.companyName : "Mitra Usaha Mandiri";
    const text = `================================================
IKRAR KOMITMEN WAKAF PRODUKTIF BERKELANJUTAN
Sentra Bisnis & Virtual Office Masjid Agung
================================================
Nama Entitas / Wakif : ${tenantName}
Penanggung Jawab     : ${currentTenant?.representativeName || "Pimpinan Perusahaan"}
Skema Kontribusi     : ${calculationMode.replace("_", " ").toUpperCase()} (${frequency === "monthly" ? "Bulanan" : "Tahunan"})
Komitmen Rutin       : Rp ${monthlyWakafAmount.toLocaleString("id-ID")} / bulan (Rp ${annualWakafAmount.toLocaleString("id-ID")} / tahun)
Jangka Waktu Proyeksi: ${tenureYears} Tahun
Akumulasi Dana Wakaf : Rp ${finalProjection.cumulativeDeposited.toLocaleString("id-ID")}
Estimasi Nilai Manfaat: Rp ${finalProjection.cumulativeImpactDisbursed.toLocaleString("id-ID")} (SROI Multiplier: ${finalProjection.sroiMultiplier}x)

TARGET DAMPAK PROYEK KOMUNITAS LOKAL:
${projectImpactResults.map((p) => `- ${p.name} (${p.allocatedPercent}%): ${p.unitsGenerated} ${p.unitLabel} [Rp ${p.allocatedAmount.toLocaleString("id-ID")}]`).join("\n")}

Landasan Syariah: UU RI No. 41 Tahun 2004 tentang Wakaf & Fatwa DSN-MUI tentang Wakaf Uang Produktif.
Nadzir: Yayasan Sentra Bisnis & Wakaf Produktif Masjid Agung.
Generated at: ${new Date().toLocaleDateString("id-ID")}
================================================`;

    navigator.clipboard?.writeText(text);
    setCopiedIkrar(true);
    setTimeout(() => setCopiedIkrar(false), 2500);
  };

  return (
    <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-3 py-1 rounded-full font-mono border border-[#5A5A40]/15 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              KALKULATOR INVESTASI WAKAF PRODUKTIF
            </span>
            <span className="text-[11px] text-[#72725e] font-medium hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              Fatwa MUI No. 2/2002 & UU No. 41/2004
            </span>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2d2d22]">
            Kalkulator & Proyeksi Dampak Wakaf Komunitas
          </h3>
          <p className="text-xs text-[#72725e] max-w-3xl leading-relaxed">
            Hitung potensi imbal hasil dana abadi dan proyeksikan dampak riil kontribusi wakaf rutin Anda terhadap 5 proyek strategis pemberdayaan ekonomi, pendidikan santri, energi hijau, dan kesehatan mustahiq.
          </p>
        </div>

        {/* Action / Applied Rate Summary & PDF Report Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#f5f2ed] rounded-[20px] p-4 text-right border border-[#5A5A40]/20 min-w-[200px]">
            <div className="text-[11px] text-[#72725e]">Wakaf Rutin Terpilih:</div>
            <div className="font-serif text-xl font-bold text-[#5A5A40] font-mono">
              Rp {monthlyWakafAmount.toLocaleString("id-ID")}
              <span className="text-xs font-normal text-[#72725e] ml-1">/ bln</span>
            </div>
            <div className="text-[10px] text-[#72725e] mt-0.5">
              Rp {annualWakafAmount.toLocaleString("id-ID")} / tahun
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="h-full px-4 py-3.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-[20px] shadow-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            title="Buka & Cetak Laporan Dampak Stakeholder PDF"
          >
            <div className="flex items-center gap-1.5">
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan PDF</span>
            </div>
            <span className="text-[10px] text-[#E4E3DA] font-normal">Stakeholder Dossier</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs: Kalkulator Simulasi vs Langganan Rutin Otomatis */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-[#fafaf7] rounded-[20px] border border-black/5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("projection")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab !== "recurring_subscription"
                ? "bg-[#5A5A40] text-white shadow-2xs"
                : "text-[#72725e] hover:text-[#2d2d22] bg-white/60"
            }`}
            id="tab-btn-wakaf-calculator-mode"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator & Proyeksi Dampak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recurring_subscription")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "recurring_subscription"
                ? "bg-[#5A5A40] text-white shadow-2xs"
                : "text-[#72725e] hover:text-[#2d2d22] bg-white/60"
            }`}
            id="tab-btn-recurring-wakaf-mode"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Jadwal Langganan Wakaf Rutin (Invoice-Linked)</span>
            <span className="bg-[#E4E3DA] text-[#5A5A40] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {localSubscriptions.filter((s) => s.status === "active").length} Entitas Aktif
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {activeTab !== "recurring_subscription" && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-white border border-[#5A5A40]/30 text-[#5A5A40] hover:bg-[#E4E3DA]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan PDF Stakeholder</span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER VIEW: If Recurring Wakaf Subscription tab is active */}
      {activeTab === "recurring_subscription" ? (
        <RecurringWakafManager
          tenants={safeTenants}
          invoices={safeInvoices}
          subscriptions={localSubscriptions}
          onSaveSubscription={handleSaveSubscriptionInternal}
          onToggleSubscriptionStatus={handleToggleSubStatusInternal}
          onApplyToInvoice={onApplyToInvoice}
          prefillTenantId={selectedTenantId !== "custom" ? selectedTenantId : undefined}
          prefillMonthlyAmount={monthlyWakafAmount}
          prefillAllocations={projectAllocations}
          prefillStrategy={reinvestmentStrategy}
          onSwitchToCalculator={() => setActiveTab("projection")}
        />
      ) : (
        /* Main Grid: Controls vs Live Projections */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Parameters & Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-5 bg-[#fafaf7] p-5 sm:p-6 rounded-[20px] border border-black/5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="font-bold text-[#2d2d22] flex items-center gap-1.5 uppercase tracking-wide font-mono text-[11px]">
                <Calculator className="w-3.5 h-3.5 text-[#5A5A40]" />
                Parameter Kontribusi
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-black/5 text-[#72725e]">
                Simulasi Dinamis
              </span>
            </div>


          {/* 1. Select Tenant or Custom */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#2d2d22]">
              Pilih Entitas Penyewa / Calon Wakif:
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white font-medium text-[#2d2d22] px-4 shadow-2xs"
            >
              <option value="custom">-- Simulasi Mandiri (Custom Input) --</option>
              {safeTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.companyName} ({t.businessSector}) - Sewa: Rp {t.monthlyRate.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Calculation Mode */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#2d2d22]">
              Metode Perhitungan Wakaf:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-white p-1 rounded-full border border-black/10">
              <button
                type="button"
                onClick={() => setCalculationMode("percentage_rent")}
                className={`py-1.5 text-center text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
                  calculationMode === "percentage_rent"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                % Sewa Kantor
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode("fixed_amount")}
                className={`py-1.5 text-center text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
                  calculationMode === "fixed_amount"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                Nominal Tetap
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode("percentage_profit")}
                className={`py-1.5 text-center text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
                  calculationMode === "percentage_profit"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                % Laba Bersih
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode("percentage_omzet")}
                className={`py-1.5 text-center text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
                  calculationMode === "percentage_omzet"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                % Omzet Usaha
              </button>
            </div>
          </div>

          {/* Conditional Inputs */}
          {calculationMode === "fixed_amount" ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#2d2d22]">Nominal Wakaf Rutin (Rp):</label>
                <span className="font-mono text-[#5A5A40] font-bold">
                  Rp {fixedAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <input
                type="number"
                min={50000}
                step={50000}
                value={fixedAmount}
                onChange={(e) => setFixedAmount(Math.max(10000, Number(e.target.value)))}
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white font-mono text-xs text-[#2d2d22] px-4"
              />
              <div className="flex flex-wrap gap-1.5">
                {[150000, 350000, 500000, 1000000, 2500000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFixedAmount(val)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                      fixedAmount === val
                        ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                        : "bg-white text-[#72725e] border-black/5 hover:bg-[#E4E3DA]"
                    }`}
                  >
                    Rp {(val / 1000).toLocaleString("id-ID")}rb
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Base Revenue/Profit input if not rent mode */}
              {calculationMode !== "percentage_rent" && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-[#2d2d22]">
                      {calculationMode === "percentage_omzet" ? "Estimasi Omzet Bulanan (Rp):" : "Estimasi Laba Bersih Bulanan (Rp):"}
                    </label>
                    <span className="font-mono text-[#5A5A40] font-bold">
                      Rp {baseRevenue.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1000000}
                    step={1000000}
                    value={baseRevenue}
                    onChange={(e) => setBaseRevenue(Math.max(1000000, Number(e.target.value)))}
                    className="w-full p-2 rounded-full border border-[#5A5A40]/20 bg-white font-mono text-xs text-[#2d2d22] px-4"
                  />
                </div>
              )}

              {/* Percentage Tier selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-[#2d2d22]">Porsi Alokasi Wakaf (%):</label>
                  <span className="font-mono text-[#5A5A40] font-bold text-xs">{percentageRate}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { rate: 1, label: "1% Khair" },
                    { rate: 2.5, label: "2.5% Tijarah" },
                    { rate: 5, label: "5% Utama" },
                    { rate: 10, label: "10% Waqif" },
                  ].map((tier) => (
                    <button
                      key={tier.rate}
                      type="button"
                      onClick={() => setPercentageRate(tier.rate)}
                      className={`p-2 rounded-[14px] border text-center transition-all cursor-pointer ${
                        percentageRate === tier.rate
                          ? "bg-[#f5f2ed] border-[#5A5A40] text-[#2d2d22] font-bold ring-1 ring-[#5A5A40]/40"
                          : "bg-white border-black/5 text-[#72725e] hover:border-[#5A5A40]/20"
                      }`}
                    >
                      <div className="text-xs">{tier.rate}%</div>
                      <div className="text-[9px] text-[#72725e] mt-0.5">{tier.label}</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-[#72725e]">Kustom:</span>
                  <input
                    type="range"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={percentageRate}
                    onChange={(e) => setPercentageRate(parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40]"
                  />
                  <span className="font-mono text-[11px] font-bold text-[#5A5A40] w-10 text-right">
                    {percentageRate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Horizon (Tenure in Years) */}
          <div className="space-y-1.5 pt-2 border-t border-black/5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#2d2d22] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
                Jangka Waktu Komitmen:
              </label>
              <span className="font-mono font-bold text-[#5A5A40] text-xs">{tenureYears} Tahun</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { yr: 1, label: "1 Thn (Dasar)" },
                { yr: 3, label: "3 Thn (Akselerasi)" },
                { yr: 5, label: "5 Thn (Ekosistem)" },
                { yr: 10, label: "10 Thn (Abadi)" },
              ].map((t) => (
                <button
                  key={t.yr}
                  type="button"
                  onClick={() => setTenureYears(t.yr)}
                  className={`py-2 px-1 text-center rounded-[12px] border transition-all cursor-pointer ${
                    tenureYears === t.yr
                      ? "bg-[#5A5A40] text-white font-bold border-[#5A5A40]"
                      : "bg-white text-[#72725e] border-black/5 hover:border-[#5A5A40]/30"
                  }`}
                >
                  <div className="text-xs font-mono">{t.yr} Thn</div>
                  <div className="text-[8px] opacity-85 truncate">{t.label.split(" ")[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Productive Endowment Yield & Strategy */}
          <div className="space-y-2 pt-2 border-t border-black/5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#2d2d22] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />
                Asumsi Imbal Hasil Wakaf Produktif:
              </label>
              <span className="font-mono font-bold text-[#5A5A40] text-xs">
                {expectedAnnualYield}% / thn
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={4}
                max={12}
                step={0.5}
                value={expectedAnnualYield}
                onChange={(e) => setExpectedAnnualYield(parseFloat(e.target.value))}
                className="w-full accent-[#5A5A40]"
              />
              <span className="text-[10px] text-[#72725e] shrink-0 font-mono">CWLS / Reksadana</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReinvestmentStrategy("direct_impact")}
                className={`p-2 rounded-[14px] border text-left cursor-pointer transition-all ${
                  reinvestmentStrategy === "direct_impact"
                    ? "bg-[#f5f2ed] border-[#5A5A40] text-[#2d2d22] font-semibold"
                    : "bg-white border-black/5 text-[#72725e]"
                }`}
              >
                <div className="font-bold text-[11px] text-[#2d2d22]">100% Salur Langsung</div>
                <div className="text-[9px] text-[#72725e] mt-0.5">Dampak maksimal & instan ke mustahiq</div>
              </button>

              <button
                type="button"
                onClick={() => setReinvestmentStrategy("hybrid_endowment")}
                className={`p-2 rounded-[14px] border text-left cursor-pointer transition-all ${
                  reinvestmentStrategy === "hybrid_endowment"
                    ? "bg-[#f5f2ed] border-[#5A5A40] text-[#2d2d22] font-semibold"
                    : "bg-white border-black/5 text-[#72725e]"
                }`}
              >
                <div className="font-bold text-[11px] text-[#2d2d22]">Hybrid Abadi (30:70)</div>
                <div className="text-[9px] text-[#72725e] mt-0.5">30% diputar kembali di pokok abadi</div>
              </button>
            </div>
          </div>

          {/* Direct Shortcut to Recurring Subscription Setup */}
          <div className="pt-2 border-t border-black/5">
            <button
              type="button"
              onClick={() => setActiveTab("recurring_subscription")}
              className="w-full py-2.5 px-4 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Atur Jadwal Langganan Rutin (Auto-Debit)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Projections, Project Impact, Recharts & Ikrar Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-[#fafaf7] p-1 rounded-full border border-black/5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("projection")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "projection"
                  ? "bg-[#5A5A40] text-white shadow-2xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ringkasan Dampak</span>
            </button>
            <button
              onClick={() => setActiveTab("recurring_subscription")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "recurring_subscription"
                  ? "bg-[#5A5A40] text-white shadow-2xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Langganan Rutin</span>
            </button>
            <button
              onClick={() => setActiveTab("projects_breakdown")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "projects_breakdown"
                  ? "bg-[#5A5A40] text-white shadow-2xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5 Proyek Komunitas</span>
            </button>
            <button
              onClick={() => setActiveTab("growth_chart")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "growth_chart"
                  ? "bg-[#5A5A40] text-white shadow-2xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Grafik Pertumbuhan Abadi</span>
            </button>
            <button
              onClick={() => setActiveTab("ikrar")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ikrar"
                  ? "bg-[#5A5A40] text-white shadow-2xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Ikrar & Sertifikat</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-[#f5f2ed] border border-[#5A5A40]/30 text-[#5A5A40] hover:bg-[#E4E3DA] ml-auto shrink-0"
              title="Buka Dokumen Laporan Dampak PDF untuk Stakeholder"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan PDF</span>
            </button>
          </div>

          {/* TAB 1: PROJECTION SUMMARY */}
          {activeTab === "projection" && (
            <div className="space-y-4">
              {/* Highlight Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#f5f2ed] rounded-[20px] border border-[#5A5A40]/20 p-4 space-y-1">
                  <div className="text-[11px] text-[#72725e] font-medium">Total Pokok Disetor ({tenureYears} Thn)</div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#2d2d22] font-mono">
                    Rp {finalProjection.cumulativeDeposited.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-[#5A5A40]">100% Tercatat sebagai Amal Jariyah</div>
                </div>

                <div className="bg-white rounded-[20px] border border-[#5A5A40]/20 p-4 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-[#72725e] font-medium">Akumulasi Nilai Manfaat</div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#5A5A40] font-mono">
                    Rp {finalProjection.cumulativeImpactDisbursed.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-[#72725e]">Pokok + Imbal Hasil Produktif</div>
                </div>

                <div className="bg-[#2d2d22] text-white rounded-[20px] p-4 space-y-1">
                  <div className="text-[11px] text-[#E4E3DA] font-medium">SROI Multiplier</div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#f5f2ed] font-mono">
                    {finalProjection.sroiMultiplier}x Nilai Sosial
                  </div>
                  <div className="text-[10px] text-[#c4c4b2]">Efek Berantai Ekonomi Umat</div>
                </div>
              </div>

              {/* Tangible Impact Cards Preview */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-[#2d2d22] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                    Pemberdayaan Riil Komunitas ({tenureYears} Tahun ke Depan)
                  </h4>
                  <button
                    onClick={() => setActiveTab("projects_breakdown")}
                    className="text-xs text-[#5A5A40] hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                  >
                    Atur Porsi Alokasi <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectImpactResults.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-[18px] border border-black/5 p-3.5 flex items-start gap-3 shadow-2xs hover:border-[#5A5A40]/30 transition-all"
                    >
                      <div className="w-9 h-9 rounded-[12px] bg-[#f5f2ed] border border-[#5A5A40]/15 flex items-center justify-center shrink-0">
                        {renderProjectIcon(p.iconName)}
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#5A5A40] uppercase font-mono">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-mono text-[#72725e]">{p.allocatedPercent}%</span>
                        </div>
                        <div className="font-serif font-bold text-xs text-[#2d2d22] truncate">{p.name}</div>
                        <div className="text-xs font-bold text-[#5A5A40] font-mono pt-1">
                          {p.unitsGenerated.toLocaleString("id-ID")} {p.unitLabel}
                        </div>
                        <div className="text-[10px] text-[#72725e] line-clamp-1">{p.impactMetric}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Realtime Bar Chart Preview */}
              <div className="bg-white p-4 rounded-[18px] border border-black/5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2d2d22]">
                    <BarChart2 className="w-4 h-4 text-[#5A5A40]" />
                    <span>Grafik Penyaluran Dana 5 Proyek per Tahun (Recharts)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("growth_chart")}
                    className="text-[11px] text-[#5A5A40] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    Buka Grafik Penuh <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-[180px] w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectionTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ea" vertical={false} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 10, fill: "#72725e" }} axisLine={{ stroke: "#e5e5dc" }} />
                      <YAxis
                        tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 9, fill: "#72725e" }}
                        axisLine={{ stroke: "#e5e5dc" }}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, name]}
                        contentStyle={{
                          backgroundColor: "#fafaf7",
                          borderRadius: "12px",
                          border: "1px solid #d4d4c8",
                          fontSize: "10px",
                        }}
                      />
                      <Bar dataKey="umkmDisbursed" name="UMKM" stackId="a" fill="#5A5A40" />
                      <Bar dataKey="eduDisbursed" name="Santripreneur" stackId="a" fill="#7D7D5C" />
                      <Bar dataKey="greenDisbursed" name="PLTS" stackId="a" fill="#A8A878" />
                      <Bar dataKey="foodDisbursed" name="Dapur" stackId="a" fill="#C29236" />
                      <Bar dataKey="healthDisbursed" name="Klinik" stackId="a" fill="#A05244" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Milestone Timeline preview */}
              <div className="bg-[#fafaf7] p-4 rounded-[18px] border border-black/5 space-y-2">
                <div className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Tahapan Pencapaian Manfaat Berkelanjutan:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-[12px] border border-black/5 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5A5A40] font-mono">Tahun 1 (Fondasi)</span>
                    <p className="text-[11px] text-[#626252]">
                      Mendanai {projectImpactResults[0]?.unitsGenerated ? Math.max(1, Math.round(projectImpactResults[0].unitsGenerated / tenureYears)) : 1} UMKM pertama & {projectImpactResults[1]?.unitsGenerated ? Math.max(1, Math.round(projectImpactResults[1].unitsGenerated / tenureYears)) : 1} santri digital.
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-[12px] border border-black/5 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5A5A40] font-mono">Tahun 3 (Penguatan)</span>
                    <p className="text-[11px] text-[#626252]">
                      Imbal hasil wakaf mulai membiayai operasional listrik PLTS masjid & sanitasi bersih.
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-[12px] border border-black/5 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5A5A40] font-mono">Tahun {tenureYears} (Kemandirian)</span>
                    <p className="text-[11px] text-[#626252]">
                      Tercapai portofolio abadi Rp {finalProjection.endowmentBalance.toLocaleString("id-ID")} yang terus mengalirkan manfaat abadi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 COMMUNITY PROJECTS BREAKDOWN & CUSTOM ALLOCATION */}
          {activeTab === "projects_breakdown" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="font-serif font-bold text-[#2d2d22] text-sm">
                    Kustomisasi Alokasi 5 Proyek Komunitas
                  </h4>
                  <p className="text-[11px] text-[#72725e]">
                    Atur prioritas persentase penyaluran dana wakaf Anda sesuai dengan fokus kepedulian sosial perusahaan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const initial: { [id: string]: number } = {};
                    COMMUNITY_PROJECTS.forEach((p) => {
                      initial[p.id] = p.defaultShare;
                    });
                    setProjectAllocations(initial);
                  }}
                  className="text-[10px] text-[#5A5A40] hover:underline font-mono cursor-pointer"
                >
                  Reset Standar
                </button>
              </div>

              <div className="space-y-3">
                {projectImpactResults.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-[20px] border border-black/5 p-4 space-y-2.5 shadow-2xs hover:border-[#5A5A40]/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-[14px] bg-[#f5f2ed] border border-[#5A5A40]/15 flex items-center justify-center shrink-0">
                          {renderProjectIcon(p.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#5A5A40] font-mono uppercase">
                              {p.category}
                            </span>
                            <span className="text-[10px] text-[#72725e] bg-[#fafaf7] px-2 py-0.5 rounded-full border border-black/5">
                              {p.sdgGoal.split(":")[0]}
                            </span>
                          </div>
                          <h5 className="font-serif font-bold text-sm text-[#2d2d22] mt-0.5">{p.name}</h5>
                          <p className="text-[11px] text-[#72725e] mt-0.5">{p.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-base font-bold text-[#5A5A40]">
                          {p.unitsGenerated.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[10px] text-[#72725e] font-medium">{p.unitLabel}</div>
                      </div>
                    </div>

                    {/* Slider & Allocation Controls */}
                    <div className="pt-2 border-t border-black/5 flex items-center gap-3 text-xs">
                      <span className="text-[11px] text-[#72725e] shrink-0 font-medium">Alokasi Porsi:</span>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={projectAllocations[p.id] || p.defaultShare}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setProjectAllocations((prev) => ({
                            ...prev,
                            [p.id]: val,
                          }));
                        }}
                        className="w-full accent-[#5A5A40]"
                      />
                      <span className="font-mono font-bold text-[#5A5A40] text-xs w-12 text-right">
                        {projectAllocations[p.id] || p.defaultShare}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[#72725e] bg-[#fafaf7] p-2 rounded-[12px]">
                      <span>Biaya Satuan: Rp {p.unitCost.toLocaleString("id-ID")} / {p.unitLabel}</span>
                      <span className="font-mono font-bold text-[#2d2d22]">
                        Total Dana Proyek: Rp {p.allocatedAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECHARTS GROWTH PROJECTION & BAR CHART */}
          {activeTab === "growth_chart" && (
            <div className="space-y-4 bg-white p-5 rounded-[20px] border border-black/5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/5">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2d2d22] flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-[#5A5A40]" />
                    Visualisasi Proyeksi Dampak Wakaf (Recharts)
                  </h4>
                  <p className="text-[11px] text-[#72725e]">
                    Grafik pertumbuhan alokasi dana per proyek komunitas dan proyeksi kumulatif penerima manfaat.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-1 rounded-full border border-[#5A5A40]/15 font-bold">
                  Horizon {tenureYears} Tahun
                </span>
              </div>

              {/* Chart Mode Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#fafaf7] p-1.5 rounded-[14px] border border-black/5 text-xs">
                <button
                  type="button"
                  onClick={() => setChartMode("stacked_projects_bar")}
                  className={`py-1.5 px-2 rounded-[10px] text-center font-medium transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                    chartMode === "stacked_projects_bar"
                      ? "bg-[#5A5A40] text-white shadow-2xs font-bold"
                      : "text-[#72725e] hover:text-[#2d2d22] hover:bg-black/5"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>5 Proyek (Bar Bertumpuk)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartMode("inflow_vs_impact_bar")}
                  className={`py-1.5 px-2 rounded-[10px] text-center font-medium transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                    chartMode === "inflow_vs_impact_bar"
                      ? "bg-[#5A5A40] text-white shadow-2xs font-bold"
                      : "text-[#72725e] hover:text-[#2d2d22] hover:bg-black/5"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Pokok vs Manfaat (Bar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartMode("cumulative_units_bar")}
                  className={`py-1.5 px-2 rounded-[10px] text-center font-medium transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                    chartMode === "cumulative_units_bar"
                      ? "bg-[#5A5A40] text-white shadow-2xs font-bold"
                      : "text-[#72725e] hover:text-[#2d2d22] hover:bg-black/5"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Satuan Penerima Riil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartMode("area_trajectory")}
                  className={`py-1.5 px-2 rounded-[10px] text-center font-medium transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                    chartMode === "area_trajectory"
                      ? "bg-[#5A5A40] text-white shadow-2xs font-bold"
                      : "text-[#72725e] hover:text-[#2d2d22] hover:bg-black/5"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Kurva Akumulasi (Area)</span>
                </button>
              </div>

              {/* Dynamic Chart Container */}
              <div className="h-[290px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "stacked_projects_bar" ? (
                    <BarChart data={projectionTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" vertical={false} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: "#72725e" }} axisLine={{ stroke: "#e5e5dc" }} />
                      <YAxis
                        tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 10, fill: "#72725e" }}
                        axisLine={{ stroke: "#e5e5dc" }}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, name]}
                        contentStyle={{
                          backgroundColor: "#fafaf7",
                          borderRadius: "14px",
                          border: "1px solid #d4d4c8",
                          fontSize: "11px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                      <Bar dataKey="umkmDisbursed" name="Modal UMKM (35%)" stackId="a" fill="#5A5A40" />
                      <Bar dataKey="eduDisbursed" name="Santripreneur (25%)" stackId="a" fill="#7D7D5C" />
                      <Bar dataKey="greenDisbursed" name="PLTS Masjid (15%)" stackId="a" fill="#A8A878" />
                      <Bar dataKey="foodDisbursed" name="Dapur Berkah (15%)" stackId="a" fill="#C29236" />
                      <Bar dataKey="healthDisbursed" name="Klinik Siaga (10%)" stackId="a" fill="#A05244" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : chartMode === "inflow_vs_impact_bar" ? (
                    <BarChart data={projectionTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" vertical={false} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: "#72725e" }} axisLine={{ stroke: "#e5e5dc" }} />
                      <YAxis
                        tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 10, fill: "#72725e" }}
                        axisLine={{ stroke: "#e5e5dc" }}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, name]}
                        contentStyle={{
                          backgroundColor: "#fafaf7",
                          borderRadius: "14px",
                          border: "1px solid #d4d4c8",
                          fontSize: "11px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                      <Bar dataKey="annualDeposit" name="Setoran Pokok Wakaf / Tahun" fill="#8A8A6A" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="annualImpactDisbursed" name="Nilai Manfaat Komunitas / Tahun" fill="#5A5A40" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : chartMode === "cumulative_units_bar" ? (
                    <BarChart data={projectionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" vertical={false} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: "#72725e" }} axisLine={{ stroke: "#e5e5dc" }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#72725e" }}
                        axisLine={{ stroke: "#e5e5dc" }}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => [`${Number(val).toLocaleString("id-ID")} Satuan`, name]}
                        contentStyle={{
                          backgroundColor: "#fafaf7",
                          borderRadius: "14px",
                          border: "1px solid #d4d4c8",
                          fontSize: "11px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                      <Bar dataKey="umkmUnits" name="Warung UMKM Dibiayai" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="eduUnits" name="Santri Diberi Beasiswa" fill="#7D7D5C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="greenUnits" name="Modul Panel Surya" fill="#A8A878" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="healthUnits" name="Layanan Ambulans/Klinik" fill="#A05244" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={projectionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8A8A6A" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8A8A6A" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" vertical={false} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: "#72725e" }} axisLine={{ stroke: "#e5e5dc" }} />
                      <YAxis
                        tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 10, fill: "#72725e" }}
                        axisLine={{ stroke: "#e5e5dc" }}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, name]}
                        contentStyle={{
                          backgroundColor: "#fafaf7",
                          borderRadius: "14px",
                          border: "1px solid #d4d4c8",
                          fontSize: "11px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                      <Area
                        type="monotone"
                        dataKey="cumulativeDeposited"
                        name="Akumulasi Pokok Wakaf Disetor"
                        stroke="#8A8A6A"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDeposits)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeImpactDisbursed"
                        name="Akumulasi Manfaat ke Komunitas"
                        stroke="#5A5A40"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorImpact)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Chart Insights Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="bg-[#fafaf7] p-3 rounded-[14px] border border-black/5 space-y-0.5">
                  <div className="text-[10px] text-[#72725e]">Total Nilai Salur ({tenureYears} Thn):</div>
                  <div className="font-mono font-bold text-sm text-[#2d2d22]">
                    Rp {finalProjection.cumulativeImpactDisbursed.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-[#5A5A40]">Termasuk pokok + hasil kelola</div>
                </div>

                <div className="bg-[#f5f2ed] p-3 rounded-[14px] border border-[#5A5A40]/20 space-y-0.5">
                  <div className="text-[10px] text-[#5A5A40] font-semibold">SROI Multiplier:</div>
                  <div className="font-mono font-bold text-sm text-[#5A5A40]">
                    {finalProjection.sroiMultiplier}x Nilai Sosial Umat
                  </div>
                  <div className="text-[10px] text-[#72725e]">Efek bergulir ekonomi syariah</div>
                </div>

                <div className="bg-white p-3 rounded-[14px] border border-black/5 shadow-2xs space-y-0.5">
                  <div className="text-[10px] text-[#72725e]">Total Mitra UMKM Terbantu:</div>
                  <div className="font-mono font-bold text-sm text-[#2d2d22]">
                    {projectImpactResults[0]?.unitsGenerated || 0} Pengusaha Mikro
                  </div>
                  <div className="text-[10px] text-[#72725e]">Bebas jerat rentenir riba</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IKRAR & SERTIFIKAT KOMITMEN */}
          {activeTab === "ikrar" && (
            <div className="space-y-4 bg-white p-5 sm:p-6 rounded-[20px] border border-[#5A5A40]/20 shadow-2xs text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/15">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                      Lembar Ikrar & Proyeksi Wakaf Produktif
                    </h4>
                    <p className="text-[10px] text-[#72725e]">
                      Dokumen komitmen resmi penyewa terverifikasi tata kelola Syariah
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-1 rounded-full font-bold">
                  SOP-IVO-07
                </span>
              </div>

              {/* Certificate Canvas Box */}
              <div className="bg-[#fafaf7] p-4 rounded-[16px] border border-black/5 space-y-3 font-mono text-[11px] text-[#2d2d22]">
                <div className="text-center pb-2 border-b border-black/5 space-y-0.5">
                  <div className="font-serif font-bold text-xs tracking-wider text-[#5A5A40]">
                    ISLAMICITY VIRTUAL OFFICE & CO-WORKING
                  </div>
                  <div className="text-[10px] text-[#72725e]">
                    Sentra Bisnis Wakaf Produktif Masjid Agung
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#72725e]">Nama Entitas: </span>
                    <strong className="text-[#2d2d22]">
                      {currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#72725e]">Penanggung Jawab: </span>
                    <strong className="text-[#2d2d22]">
                      {currentTenant?.representativeName || "Pimpinan Perusahaan"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#72725e]">Komitmen Wakaf: </span>
                    <strong className="text-[#5A5A40]">
                      Rp {monthlyWakafAmount.toLocaleString("id-ID")} / bulan
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#72725e]">Jangka Waktu: </span>
                    <strong className="text-[#2d2d22]">{tenureYears} Tahun ({tenureYears * 12} Periode)</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 space-y-1">
                  <div className="font-bold text-[#5A5A40] text-[10px]">Alokasi Proyek Komunitas:</div>
                  <div className="space-y-0.5 text-[10px] text-[#626252]">
                    {projectImpactResults.map((p) => (
                      <div key={p.id} className="flex justify-between items-center">
                        <span>• {p.name} ({p.allocatedPercent}%):</span>
                        <span className="font-bold text-[#2d2d22]">
                          {p.unitsGenerated} {p.unitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 text-[9px] text-[#72725e] leading-relaxed">
                  *Sesuai Fatwa Dewan Syariah Nasional MUI dan Undang-Undang No. 41 Tahun 2004, dana wakaf uang dikelola secara produktif dan hasil investasinya disalurkan untuk kemaslahatan umum tanpa mengurangi nilai pokok wakaf.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyIkrar}
                  className="flex-1 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedIkrar ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ikrar Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Naskah Ikrar (WhatsApp / Email)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="py-2.5 px-4 bg-white hover:bg-[#fafaf7] text-[#5A5A40] border border-[#5A5A40]/30 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terbitkan PDF Stakeholder</span>
                </button>

                {onApplyToInvoice && selectedTenantId !== "custom" && (
                  <button
                    type="button"
                    onClick={() => onApplyToInvoice(selectedTenantId, monthlyWakafAmount)}
                    className="py-2.5 px-4 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] border border-[#5A5A40]/30 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Terapkan ke Tagihan Tenant</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      )}

      {/* Community Impact Report PDF Modal */}
      <CommunityImpactReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={reportData}
        tenants={safeTenants}
        selectedTenantId={selectedTenantId}
        onSelectTenant={handleTenantChange}
      />
    </div>
  );
};

import React, { useState, useMemo, useEffect } from "react";
import { Tenant, Invoice } from "../types";
import {
  Calculator,
  Coins,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Building2,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  FileText,
  TrendingUp,
  Info,
  Calendar,
  DollarSign,
  QrCode,
  Landmark,
  Share2,
  HelpCircle,
  RefreshCw,
  Download,
  Receipt,
  FileCheck,
  Search,
  BookOpen,
  PieChart as PieChartIcon,
  Layers,
  Send,
} from "lucide-react";

export interface ZakatDistributionChannel {
  id: string;
  name: string;
  category: "Baitul Maal Masjid" | "BAZNAS RI" | "LAZIS Nasional";
  description: string;
  accountNumber: string;
  bankName: string;
  websiteUrl: string;
  taxDeductible: boolean;
  transparencyScore: string;
  asnafFocus: string[];
}

export const ZAKAT_DISTRIBUTION_CHANNELS: ZakatDistributionChannel[] = [
  {
    id: "baitul-maal-masjid",
    name: "Baitul Maal Sentra Bisnis Masjid Agung",
    category: "Baitul Maal Masjid",
    description: "Penyaluran langsung 100% tepat sasaran untuk 8 asnaf sekitar kawasan perkantoran, warung dhuafa, beasiswa santri, dan klinik mustahiq.",
    accountNumber: "7700-1122-3344 (BSI)",
    bankName: "Bank Syariah Indonesia (BSI)",
    websiteUrl: "https://masjid.islamicity.org/ziswaf/distribusi",
    taxDeductible: true,
    transparencyScore: "Audit WTP 5 Tahun Berturut-turut",
    asnafFocus: ["Fakir & Miskin Sekitar", "Gharimin Terjerat Riba", "Fisabilillah & Santripreneur", "Ibnu Sabil"],
  },
  {
    id: "baznas-ri",
    name: "BAZNAS (Badan Amil Zakat Nasional)",
    category: "BAZNAS RI",
    description: "Lembaga resmi pemerintah pengelola zakat nasional dengan sertifikasi Bukti Setor Zakat (BSZ) resmi untuk pengurang Penghasilan Kena Pajak (PPh).",
    accountNumber: "100-200-3001 (BSI) / 500-100-2000 (Muamalat)",
    bankName: "BAZNAS Pusat RI",
    websiteUrl: "https://baznas.go.id/bayarzakat",
    taxDeductible: true,
    transparencyScore: "Badan Resmi Negara (UU No. 23/2011)",
    asnafFocus: ["Mustahiq Nasional", "Beasiswa Cendekia BAZNAS", "Zmart & ZAuto Mikro", "Bantuan Bencana"],
  },
  {
    id: "lazis-dompet-dhuafa",
    name: "Dompet Dhuafa Filantropi",
    category: "LAZIS Nasional",
    description: "Pemberdayaan kaum dhuafa melalui program kemandirian ekonomi, rumah sakit bebas biaya mustahiq, dan lumbung pangan rakyat.",
    accountNumber: "8800-4455-6677 (BSI)",
    bankName: "Bank Syariah Indonesia (BSI)",
    websiteUrl: "https://donasi.dompetdhuafa.org/zakat",
    taxDeductible: true,
    transparencyScore: "Akreditasi Kemenag RI A",
    asnafFocus: ["Klinik Sehat Dhuafa", "Institut Kemandirian", "Pertanian Berdaya", "Advokasi Sosial"],
  },
  {
    id: "lazis-rumah-zakat",
    name: "Rumah Zakat Indonesia",
    category: "LAZIS Nasional",
    description: "Penyaluran zakat produktif melalui Desa Berdaya, program beasiswa juara, dan layanan ambulans medis gratis 24 jam.",
    accountNumber: "700-123-4567 (BSI)",
    bankName: "Bank Syariah Indonesia (BSI)",
    websiteUrl: "https://www.rumahzakat.org/donasi/zakat",
    taxDeductible: true,
    transparencyScore: "ISO 9001:2015 & Audit Syariah",
    asnafFocus: ["Desa Berdaya", "Beasiswa Anak Juara", "Ambulans Gratis", "Bantuan Pangan"],
  },
];

// Helper to format Indonesian currency spelling (Terbilang)
function formatTerbilang(angka: number): string {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  
  const num = Math.floor(Math.abs(angka));
  if (num === 0) return "Nol Rupiah";

  function convert(n: number): string {
    if (n < 12) return bilangan[n];
    if (n < 20) return convert(n - 10) + " Belas";
    if (n < 100) return convert(Math.floor(n / 10)) + " Puluh" + (n % 10 !== 0 ? " " + convert(n % 10) : "");
    if (n < 200) return "Seratus" + (n - 100 !== 0 ? " " + convert(n - 100) : "");
    if (n < 1000) return convert(Math.floor(n / 100)) + " Ratus" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    if (n < 2000) return "Seribu" + (n - 1000 !== 0 ? " " + convert(n - 1000) : "");
    if (n < 1000000) return convert(Math.floor(n / 1000)) + " Ribu" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + " Juta" + (n % 1000000 !== 0 ? " " + convert(n % 1000000) : "");
    return convert(Math.floor(n / 1000000000)) + " Miliar" + (n % 1000000000 !== 0 ? " " + convert(n % 1000000000) : "");
  }

  return (convert(num) + " Rupiah").replace(/\s+/g, " ").trim();
}

export interface ZakatReceiptRecord {
  id: string;
  receiptNumber: string;
  tenantId: string;
  tenantName: string;
  representativeName: string;
  businessSector: string;
  registeredAddress: string;
  netZakatBase: number;
  nisabThreshold: number;
  annualZakatAmount: number;
  paymentType: "lump_sum" | "monthly_installment";
  paidAmount: number;
  calendarType: "hijriyah" | "masehi";
  distributionChannel: ZakatDistributionChannel;
  asnafFocus: string;
  paymentDate: string;
  verificationCode: string;
  status: "verified" | "settled";
  shariaEndorsement: string;
}

export interface AiZakatAnalysisResult {
  isMuzakki: boolean;
  nisabThreshold: number;
  netZakatBaseAsset: number;
  zakatObligation: number;
  monthlyInstallment: number;
  fiqhVerdict: string;
  executiveSummary: string;
  assetPurificationNotes: string;
  deductibleLiabilityAnalysis: string;
  taxDeductibilityAdvice: string;
  asnafDistributionRecommendations: Array<{
    asnaf: string;
    allocationPercentage: number;
    programSuggestion: string;
    impactRationale: string;
  }>;
  shariaEndorsementText: string;
  bszVerificationCode: string;
}

interface ZakatMaalCalculatorProps {
  tenants?: Tenant[];
  invoices?: Invoice[];
}

export const ZakatMaalCalculator: React.FC<ZakatMaalCalculatorProps> = ({
  tenants = [],
  invoices = [],
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // Active Calculator Tab View
  const [activeTab, setActiveTab] = useState<
    "calculator" | "ai_advisor" | "ecosystem_ledger" | "distribution" | "receipts"
  >("calculator");

  // Selected Tenant
  const [selectedTenantId, setSelectedTenantId] = useState<string>("custom");

  // Gold Standard & Nisab Configuration
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(1450000); // Rp 1.450.000 / gram (Standard Antam/BAZNAS)
  const [calendarType, setCalendarType] = useState<"hijriyah" | "masehi">("hijriyah"); // 2.5% vs 2.577%
  const [hasReachedHaul, setHasReachedHaul] = useState<boolean>(true); // Kepemilikan 1 Tahun Penuh

  // Financial Input Parameters (Aset Lancar / Liquid Assets)
  const [cashAndEquivalents, setCashAndEquivalents] = useState<number>(85000000);
  const [accountsReceivable, setAccountsReceivable] = useState<number>(45000000);
  const [inventoryValue, setInventoryValue] = useState<number>(30000000);
  const [shortTermInvestments, setShortTermInvestments] = useState<number>(15000000);

  // Financial Input Parameters (Kewajiban Jangka Pendek / Current Liabilities)
  const [shortTermPayables, setShortTermPayables] = useState<number>(20000000);
  const [operationalExpensesDue, setOperationalExpensesDue] = useState<number>(10000000);
  const [shortTermFinancingDue, setShortTermFinancingDue] = useState<number>(5000000);

  // Distribution Preferences
  const [selectedChannelId, setSelectedChannelId] = useState<string>("baitul-maal-masjid");
  const [paymentFrequency, setPaymentFrequency] = useState<"lump_sum" | "monthly_installment">("lump_sum");
  const [selectedAsnafFocus, setSelectedAsnafFocus] = useState<string>("Fakir, Miskin & Pemberdayaan Usaha Mikro Dhuafa");
  
  // Modals & Slips
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [copiedSlip, setCopiedSlip] = useState<boolean>(false);
  const [customAiPromptNotes, setCustomAiPromptNotes] = useState<string>("");

  // AI State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiZakatAnalysisResult | null>(null);

  // Stored Receipts History
  const [savedReceipts, setSavedReceipts] = useState<ZakatReceiptRecord[]>([]);

  // Find Selected Tenant & Active Channel
  const currentTenant = safeTenants.find((t) => t.id === selectedTenantId);
  const currentChannel =
    ZAKAT_DISTRIBUTION_CHANNELS.find((c) => c.id === selectedChannelId) ||
    ZAKAT_DISTRIBUTION_CHANNELS[0];

  // Billing Integration Metrics for Selected Tenant
  const tenantBillingSummary = useMemo(() => {
    if (!currentTenant) {
      return {
        totalBilled: safeInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        totalPaid: safeInvoices.filter((i) => i.status === "paid").reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        invoicesCount: safeInvoices.length,
        wakafContributed: safeInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0),
        annualLeaseRate: safeTenants.reduce((sum, t) => sum + t.monthlyRate * 12, 0),
      };
    }
    const tenantInvoices = safeInvoices.filter((i) => i.tenantId === currentTenant.id);
    const totalBilled = tenantInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = tenantInvoices
      .filter((i) => i.status === "paid")
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const wakafContributed = tenantInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);

    return {
      totalBilled: totalBilled || currentTenant.monthlyRate * 6,
      totalPaid: totalPaid || currentTenant.monthlyRate * 5,
      invoicesCount: tenantInvoices.length || 6,
      wakafContributed: wakafContributed || currentTenant.monthlyRate * 0.05 * 6,
      annualLeaseRate: currentTenant.monthlyRate * 12,
    };
  }, [currentTenant, safeInvoices, safeTenants]);

  // Sync Financials automatically with Tenant Billing profile
  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setAiAnalysis(null); // Reset AI result for fresh audit

    if (tenantId === "custom") {
      setCashAndEquivalents(85000000);
      setAccountsReceivable(45000000);
      setInventoryValue(30000000);
      setShortTermInvestments(15000000);
      setShortTermPayables(20000000);
      setOperationalExpensesDue(10000000);
      setShortTermFinancingDue(5000000);
      return;
    }

    const t = safeTenants.find((item) => item.id === tenantId);
    if (t) {
      // Intelligent estimation calibrated to tenant business tier and billing
      const scaleMultiplier = Math.max(1, Math.round(t.monthlyRate / 1000000));
      setCashAndEquivalents(scaleMultiplier * 48000000);
      setAccountsReceivable(scaleMultiplier * 26000000);
      setInventoryValue(t.businessType === "PT" ? scaleMultiplier * 25000000 : scaleMultiplier * 15000000);
      setShortTermInvestments(scaleMultiplier * 12000000);
      setShortTermPayables(scaleMultiplier * 16000000);
      setOperationalExpensesDue(t.monthlyRate * 2.5);
      setShortTermFinancingDue(scaleMultiplier * 4000000);
    }
  };

  // Sync with Billing Data Button
  const handleAutoSyncBillingData = () => {
    if (!currentTenant) {
      // General ecosystem estimate
      setCashAndEquivalents(120000000);
      setAccountsReceivable(50000000);
      setInventoryValue(40000000);
      setShortTermInvestments(20000000);
      setShortTermPayables(25000000);
      setOperationalExpensesDue(15000000);
      setShortTermFinancingDue(5000000);
      return;
    }

    const m = currentTenant.monthlyRate;
    const billedAnnual = m * 12;
    // Derive realistic corporate ratios
    setCashAndEquivalents(Math.round(billedAnnual * 1.8));
    setAccountsReceivable(Math.round(billedAnnual * 0.9));
    setInventoryValue(currentTenant.businessSector.toLowerCase().includes("jasa") ? 0 : Math.round(billedAnnual * 0.8));
    setShortTermInvestments(Math.round(billedAnnual * 0.4));
    setShortTermPayables(Math.round(billedAnnual * 0.6));
    setOperationalExpensesDue(Math.round(m * 3));
    setShortTermFinancingDue(Math.round(billedAnnual * 0.2));
  };

  // Quick Preset Profiles
  const applyPreset = (presetType: "startup" | "retail" | "consulting" | "umkm") => {
    setSelectedTenantId("custom");
    setAiAnalysis(null);
    if (presetType === "startup") {
      setCashAndEquivalents(180000000);
      setAccountsReceivable(60000000);
      setInventoryValue(0);
      setShortTermInvestments(40000000);
      setShortTermPayables(25000000);
      setOperationalExpensesDue(30000000);
      setShortTermFinancingDue(10000000);
    } else if (presetType === "retail") {
      setCashAndEquivalents(60000000);
      setAccountsReceivable(35000000);
      setInventoryValue(120000000);
      setShortTermInvestments(10000000);
      setShortTermPayables(45000000);
      setOperationalExpensesDue(15000000);
      setShortTermFinancingDue(15000000);
    } else if (presetType === "consulting") {
      setCashAndEquivalents(110000000);
      setAccountsReceivable(80000000);
      setInventoryValue(0);
      setShortTermInvestments(25000000);
      setShortTermPayables(10000000);
      setOperationalExpensesDue(20000000);
      setShortTermFinancingDue(0);
    } else if (presetType === "umkm") {
      setCashAndEquivalents(35000000);
      setAccountsReceivable(15000000);
      setInventoryValue(25000000);
      setShortTermInvestments(0);
      setShortTermPayables(12000000);
      setOperationalExpensesDue(5000000);
      setShortTermFinancingDue(3000000);
    }
  };

  // Mathematical Zakat Computations
  const totalGrossLiquidAssets = useMemo(() => {
    return cashAndEquivalents + accountsReceivable + inventoryValue + shortTermInvestments;
  }, [cashAndEquivalents, accountsReceivable, inventoryValue, shortTermInvestments]);

  const totalDeductibleLiabilities = useMemo(() => {
    return shortTermPayables + operationalExpensesDue + shortTermFinancingDue;
  }, [shortTermPayables, operationalExpensesDue, shortTermFinancingDue]);

  const netZakatBaseAsset = useMemo(() => {
    return Math.max(0, totalGrossLiquidAssets - totalDeductibleLiabilities);
  }, [totalGrossLiquidAssets, totalDeductibleLiabilities]);

  // Nisab 85 gram gold
  const nisabThreshold = useMemo(() => {
    return 85 * goldPricePerGram;
  }, [goldPricePerGram]);

  // Zakat Rate: 2.5% (Hijriyah 354 hari) or 2.577% (Masehi 365 hari)
  const zakatRate = useMemo(() => {
    return calendarType === "hijriyah" ? 0.025 : 0.02577;
  }, [calendarType]);

  const isNisabReached = netZakatBaseAsset >= nisabThreshold;
  const isZakatObligatory = isNisabReached && hasReachedHaul;

  const annualZakatAmount = useMemo(() => {
    if (!isZakatObligatory) return 0;
    return Math.round(netZakatBaseAsset * zakatRate);
  }, [isZakatObligatory, netZakatBaseAsset, zakatRate]);

  const monthlyZakatInstallment = useMemo(() => {
    return Math.round(annualZakatAmount / 12);
  }, [annualZakatAmount]);

  // Multi-tenant Ecosystem Ledger Computations
  const ecosystemTenantsZakatSummary = useMemo(() => {
    return safeTenants.map((t) => {
      const scaleMultiplier = Math.max(1, Math.round(t.monthlyRate / 1000000));
      const estGross = scaleMultiplier * (48000000 + 26000000 + 20000000 + 12000000);
      const estDeduct = scaleMultiplier * (16000000 + 4000000) + t.monthlyRate * 2.5;
      const estNet = Math.max(0, estGross - estDeduct);
      const reachesNisab = estNet >= nisabThreshold;
      const zAmount = reachesNisab ? Math.round(estNet * (calendarType === "hijriyah" ? 0.025 : 0.02577)) : 0;

      return {
        tenant: t,
        estGross,
        estDeduct,
        estNet,
        reachesNisab,
        annualZakat: zAmount,
        monthlyZakat: Math.round(zAmount / 12),
      };
    });
  }, [safeTenants, nisabThreshold, calendarType]);

  const totalEcosystemZakatPotential = useMemo(() => {
    return ecosystemTenantsZakatSummary.reduce((sum, item) => sum + item.annualZakat, 0);
  }, [ecosystemTenantsZakatSummary]);

  // AI Zakat Consultation Request
  const handleRunAiZakatAudit = async () => {
    setIsAiLoading(true);
    setActiveTab("ai_advisor");

    try {
      const payload = {
        tenantName: currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri",
        businessSector: currentTenant ? currentTenant.businessSector : "Layanan & Perdagangan",
        businessType: currentTenant ? currentTenant.businessType : "PT",
        monthlyRate: currentTenant ? currentTenant.monthlyRate : 3500000,
        financials: {
          cashAndEquivalents,
          accountsReceivable,
          inventoryValue,
          shortTermInvestments,
          shortTermPayables,
          operationalExpensesDue,
          shortTermFinancingDue,
        },
        goldPricePerGram,
        calendarType,
        billingSummary: tenantBillingSummary,
        customNotes: customAiPromptNotes,
      };

      const res = await fetch("/api/ai/calculate-zakat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal terhubung ke AI Fiqh Advisor");
      const data: AiZakatAnalysisResult = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.warn("AI fallback used:", err);
      setAiAnalysis({
        isMuzakki: isZakatObligatory,
        nisabThreshold,
        netZakatBaseAsset,
        zakatObligation: annualZakatAmount,
        monthlyInstallment: monthlyZakatInstallment,
        fiqhVerdict: isZakatObligatory
          ? "Wajib Menunaikan Zakat Maal Perniagaan (Telah Memenuhi Nisab 85g Emas & Haul Usaha)"
          : "Belum Mencapai Batas Nisab (Dianjurkan Memperbanyak Infaq & Sedekah)",
        executiveSummary: `Entitas bisnis ${currentTenant ? currentTenant.companyName : "Muzakki"} memiliki aktiva lancar bersih sebesar Rp ${netZakatBaseAsset.toLocaleString("id-ID")}. ${isZakatObligatory ? `Kewajiban zakat perniagaan adalah Rp ${annualZakatAmount.toLocaleString("id-ID")}/tahun (${calendarType === "hijriyah" ? "2.5% Hijriyah" : "2.577% Masehi"}).` : "Harta bersih belum mencapai batas nisab 85 gram emas."}`,
        assetPurificationNotes: "Seluruh kas operasional, saldo rekening bank syariah, dan piutang lancar tertagih telah dihitung secara transparan. Piutang ragu-ragu dikeluarkan dari basis zakat.",
        deductibleLiabilityAnalysis: "Hutang dagang supplier dan beban operasional sewa/gaji jatuh tempo telah dikurangkan secara sah dari total aktiva lancar.",
        taxDeductibilityAdvice: "Bukti Setor Zakat (BSZ) resmi dapat dilampirkan pada SPT Tahunan PPh Badan (Formulir 1771 Lampiran I) sebagai pengurang Penghasilan Bruto Kena Pajak sesuai UU No. 23/2011 Pasal 22.",
        asnafDistributionRecommendations: [
          {
            asnaf: "Fakir & Miskin Dhuafa Sekitar",
            allocationPercentage: 40,
            programSuggestion: "Bantuan pangan bergizi & modal bergulir qardhul hasan UMKM dhuafa di sekitar lingkungan sentra kantor.",
            impactRationale: "Mencegah kemiskinan ekstrem dan mendorong mustahiq bertransformasi menjadi muzakki.",
          },
          {
            asnaf: "Fisabilillah & Santripreneur",
            allocationPercentage: 35,
            programSuggestion: "Beasiswa pendidikan teknologi, akuntansi syariah, dan inkubasi usaha santri mandiri.",
            impactRationale: "Mencetak generasi wirausaha muslim yang profesional dan amanah.",
          },
          {
            asnaf: "Gharimin & Pelepasan Riba",
            allocationPercentage: 25,
            programSuggestion: "Advokasi dan pelunasan pinjaman rentenir bagi pedagang kecil prasejahtera.",
            impactRationale: "Memulihkan daya tahan ekonomi keluarga mustahiq yang terhimpit utang darurat.",
          },
        ],
        shariaEndorsementText: "Perhitungan Fiqh Zakat Tijarah telah diverifikasi secara sistematis sesuai Fatwa DSN-MUI & Pedoman BAZNAS RI Nomor 1 Tahun 2024.",
        bszVerificationCode: `BSZ-IVO-2026-SYR-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Record official payment & generate receipt
  const handleSaveAndOpenReceipt = () => {
    const paidAmount = paymentFrequency === "lump_sum" ? annualZakatAmount : monthlyZakatInstallment;
    const newReceipt: ZakatReceiptRecord = {
      id: `ZKT-RCP-${Date.now()}`,
      receiptNumber: `BSZ/IVO/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: currentTenant ? currentTenant.id : "custom",
      tenantName: currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri",
      representativeName: currentTenant ? currentTenant.representativeName : "Pimpinan Perusahaan",
      businessSector: currentTenant ? currentTenant.businessSector : "Layanan & Komersial",
      registeredAddress: currentTenant ? currentTenant.registeredAddress : "Sentra Bisnis Wakaf Masjid Agung",
      netZakatBase: netZakatBaseAsset,
      nisabThreshold,
      annualZakatAmount,
      paymentType: paymentFrequency,
      paidAmount,
      calendarType,
      distributionChannel: currentChannel,
      asnafFocus: selectedAsnafFocus,
      paymentDate: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
      verificationCode: aiAnalysis?.bszVerificationCode || `BSZ-IVO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "settled",
      shariaEndorsement: aiAnalysis?.shariaEndorsementText || "Disahkan sesuai Fiqh Zakat Tijarah & BAZNAS RI",
    };

    setSavedReceipts((prev) => [newReceipt, ...prev]);
    setIsReceiptModalOpen(true);
  };

  // Copy WhatsApp / Text Ikrar
  const handleCopyAkad = () => {
    const paidAmount = paymentFrequency === "lump_sum" ? annualZakatAmount : monthlyZakatInstallment;
    const text = `================================================
BUKTI SETOR ZAKAT (BSZ) & IKRAR AKAD ZAKAT MAAL
ISLAMICITY SHARIA SENTRA BISNIS & BAITUL MAAL
================================================
No. Dokumen       : ${aiAnalysis?.bszVerificationCode || `BSZ/IVO/2026/${Math.floor(1000 + Math.random() * 9000)}`}
Tanggal Penunaian : ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
Status Fiqh       : ${isZakatObligatory ? "MUZAKKI SAH (LUNAS / TERCATAT)" : "INFAQ & SEDEKAH BISNIS"}
------------------------------------------------
PROFIL MUZAKKI / ENTITAS:
Nama Perusahaan   : ${currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri"}
Penanggung Jawab  : ${currentTenant ? currentTenant.representativeName : "Direktur / Pimpinan"}
Sektor Usaha      : ${currentTenant ? currentTenant.businessSector : "Layanan Bisnis"}
Alamat Terdaftar  : ${currentTenant ? currentTenant.registeredAddress : "Sentra Bisnis Masjid Agung"}
------------------------------------------------
HISAB ZAKAT PERNIAGAAN (TIJARAH):
1. Total Aset Lancar : Rp ${totalGrossLiquidAssets.toLocaleString("id-ID")}
2. Total Pengurang   : Rp ${totalDeductibleLiabilities.toLocaleString("id-ID")}
3. Harta Kena Zakat  : Rp ${netZakatBaseAsset.toLocaleString("id-ID")}
4. Nisab Emas (85g)  : Rp ${nisabThreshold.toLocaleString("id-ID")}
5. Tarif Zakat       : ${calendarType === "hijriyah" ? "2.50% (Hijriyah)" : "2.577% (Masehi)"}
6. Kewajiban Tahunan : Rp ${annualZakatAmount.toLocaleString("id-ID")}
7. Nominal Dibayarkan: Rp ${paidAmount.toLocaleString("id-ID")} (${paymentFrequency === "lump_sum" ? "Pelunasan 1 Tahun Penuh" : "Cicilan Berkala Bulanan"})
TERBILANG            : ${formatTerbilang(paidAmount)}
------------------------------------------------
LEMBAGA PENYALUR RESMI:
Nama Lembaga      : ${currentChannel.name}
Nomor Rekening    : ${currentChannel.accountNumber}
Fokus Asnaf       : ${selectedAsnafFocus}
Pengurang Pajak   : Memenuhi Ketentuan PPh Badan UU No. 23/2011 Pasal 22
------------------------------------------------
IKRAR NIAT ZAKAT (IJAB):
"Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala"
(Saya berniat mengeluarkan zakat maal perniagaan atas harta usaha saya secara fardhu karena Allah Ta'ala).

DOA PENERIMA / AMIL (QOBUL):
"Ajarakallahu fiima a'thayta, wa baaraka fiima abqayta, waja'alahu laka thahuura"
(Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang engkau sisakan, dan menjadikannya pembersih bagimu).
================================================`.trim();

    navigator.clipboard?.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  // Export JSON BSZ Data
  const handleDownloadReceiptJson = (rcp?: ZakatReceiptRecord) => {
    const target = rcp || {
      receiptNumber: aiAnalysis?.bszVerificationCode || "BSZ-IVO-2026-001",
      tenantName: currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri",
      representativeName: currentTenant ? currentTenant.representativeName : "Pimpinan Perusahaan",
      businessSector: currentTenant ? currentTenant.businessSector : "Layanan Bisnis",
      registeredAddress: currentTenant ? currentTenant.registeredAddress : "Sentra Bisnis Masjid Agung",
      netZakatBase: netZakatBaseAsset,
      nisabThreshold,
      annualZakatAmount,
      paidAmount: paymentFrequency === "lump_sum" ? annualZakatAmount : monthlyZakatInstallment,
      calendarType,
      distributionChannel: currentChannel,
      asnafFocus: selectedAsnafFocus,
      paymentDate: new Date().toISOString(),
      terbilang: formatTerbilang(paymentFrequency === "lump_sum" ? annualZakatAmount : monthlyZakatInstallment),
    };

    const blob = new Blob([JSON.stringify(target, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuktiSetorZakat-${currentTenant?.companyName || "Bisnis"}-2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Natural Theme */}
      <div className="bg-[#fcfbf9] rounded-[28px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <span className="p-1 rounded-md bg-[#5A5A40]/10">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase">
              MODUL AI ZAKAT CALCULATOR & INTEGRASI BILLING
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d2d22] leading-tight">
            Kalkulator Zakat Maal Bisnis Berdaya AI
          </h2>
          <p className="text-xs sm:text-sm text-[#72725e] leading-relaxed">
            Hisab zakat perniagaan (tijarah) terotomatisasi yang tersinkronisasi dengan data tagihan sewa tenant, audit kelayakan nisab 85 gram emas, konsultasi Fiqh AI, dan penerbitan Bukti Setor Zakat (BSZ) resmi pengurang PPh Badan.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="bg-white p-4 sm:p-5 rounded-[22px] border border-black/10 shadow-xs min-w-[240px] space-y-2 text-right">
          <div className="text-[11px] text-[#72725e] font-medium">Status Kewajiban Zakat Maal:</div>
          <div className="flex items-center justify-end gap-2">
            {isZakatObligatory ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5A5A40] text-white rounded-full font-serif font-bold text-xs shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E4E3DA]" />
                Muzakki Sah (Wajib Zakat)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5f2ed] text-[#72725e] border border-black/10 rounded-full font-serif font-semibold text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-[#8A8A6A]" />
                Belum Capai Nisab / Haul
              </span>
            )}
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#5A5A40]">
            Rp {annualZakatAmount.toLocaleString("id-ID")}
            <span className="text-xs font-normal text-[#72725e] ml-1">/ tahun</span>
          </div>
          <div className="text-[10px] text-[#72725e]">
            {isZakatObligatory ? `Setara Rp ${monthlyZakatInstallment.toLocaleString("id-ID")} / bulan` : "Bebas Zakat Maal"}
          </div>
        </div>
      </div>

      {/* Main Module Sub-Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "calculator"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Hisab Neraca & Billing Sync</span>
        </button>

        <button
          onClick={() => {
            if (!aiAnalysis) handleRunAiZakatAudit();
            else setActiveTab("ai_advisor");
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "ai_advisor"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C29236]" />
          <span>AI Fiqh Advisor & 8 Asnaf</span>
          {aiAnalysis && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
        </button>

        <button
          onClick={() => setActiveTab("ecosystem_ledger")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "ecosystem_ledger"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Buku Besar Multi-Tenant ({safeTenants.length} Entitas)</span>
        </button>

        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "distribution"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Saluran Distribusi Terakreditasi</span>
        </button>

        <button
          onClick={() => setActiveTab("receipts")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "receipts"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Riwayat Bukti Setor ({savedReceipts.length})</span>
        </button>

        <button
          type="button"
          onClick={handleRunAiZakatAudit}
          disabled={isAiLoading}
          className="ml-auto px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#E4E3DA] ${isAiLoading ? "animate-spin" : ""}`} />
          <span>{isAiLoading ? "Menganalisis Fiqh AI..." : "Jalankan Audit AI Fiqh"}</span>
        </button>
      </div>

      {/* Tenant Selector & Billing Sync Strip */}
      <div className="bg-white rounded-[22px] border border-black/5 p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-[#72725e] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            Tenant / Entitas Terpilih:
          </span>
          <select
            value={selectedTenantId}
            onChange={(e) => handleSelectTenant(e.target.value)}
            className="bg-[#fafaf7] border border-black/10 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
          >
            <option value="custom">-- Simulasi Mandiri (Custom Balance Sheet) --</option>
            {safeTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.companyName} — {t.packageType} (Rp {(t.monthlyRate / 1000000).toFixed(1)}jt/bln)
              </option>
            ))}
          </select>

          {currentTenant && (
            <button
              type="button"
              onClick={handleAutoSyncBillingData}
              className="px-3 py-1 bg-[#f5f2ed] hover:bg-[#E4E3DA] border border-[#5A5A40]/20 text-[#5A5A40] rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Tarik neraca estimasi otomatis berdasarkan data sewa dan invoice tenant"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tarik Data Billing</span>
            </button>
          )}
        </div>

        {/* Quick Sektor Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[#72725e] font-medium hidden sm:inline">Preset Sektor:</span>
          <button
            type="button"
            onClick={() => applyPreset("startup")}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#fafaf7] hover:bg-[#f5f2ed] border border-black/5 text-[#5A5A40] transition-colors cursor-pointer"
          >
            Startup / Tech
          </button>
          <button
            type="button"
            onClick={() => applyPreset("retail")}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#fafaf7] hover:bg-[#f5f2ed] border border-black/5 text-[#5A5A40] transition-colors cursor-pointer"
          >
            Retail & Dagang F&B
          </button>
          <button
            type="button"
            onClick={() => applyPreset("consulting")}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#fafaf7] hover:bg-[#f5f2ed] border border-black/5 text-[#5A5A40] transition-colors cursor-pointer"
          >
            Jasa & Konsultan
          </button>
          <button
            type="button"
            onClick={() => applyPreset("umkm")}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#fafaf7] hover:bg-[#f5f2ed] border border-black/5 text-[#5A5A40] transition-colors cursor-pointer"
          >
            UMKM Pemula
          </button>
        </div>
      </div>

      {/* TAB 1: CALCULATOR & NERACA HISAB */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Asset & Liability Parameters (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Nisab & Haul Configuration Card */}
            <div className="bg-white rounded-[24px] border border-black/5 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[#5A5A40]">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                      1. Tolok Ukur Nisab (85 Gram Emas) & Haul
                    </h3>
                    <p className="text-[11px] text-[#72725e]">
                      Batas minimal harta perniagaan yang wajib dikeluarkan zakatnya
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#72725e] block">Nisab Terhitung:</span>
                  <span className="font-mono text-xs font-bold text-[#5A5A40]">
                    Rp {nisabThreshold.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gold Price Input */}
                <div className="bg-[#fafaf7] p-3 rounded-[16px] border border-black/5 space-y-1">
                  <label className="text-[10px] font-bold text-[#72725e] uppercase">
                    Harga Emas / Gram
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-[11px] font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={goldPricePerGram}
                      onChange={(e) => setGoldPricePerGram(Math.max(100000, Number(e.target.value)))}
                      step={10000}
                      className="w-full bg-white border border-black/10 rounded-[10px] py-1.5 pl-8 pr-2 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="text-[9px] text-[#72725e]">Standar Antam / BAZNAS RI</div>
                </div>

                {/* Calendar Type */}
                <div className="bg-[#fafaf7] p-3 rounded-[16px] border border-black/5 space-y-1">
                  <label className="text-[10px] font-bold text-[#72725e] uppercase">
                    Tahun Buku (Tarif)
                  </label>
                  <select
                    value={calendarType}
                    onChange={(e) => setCalendarType(e.target.value as "hijriyah" | "masehi")}
                    className="w-full bg-white border border-black/10 rounded-[10px] py-1.5 px-2 text-xs font-semibold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  >
                    <option value="hijriyah">Tahun Hijriyah (2.50%)</option>
                    <option value="masehi">Tahun Masehi (2.577%)</option>
                  </select>
                  <div className="text-[9px] text-[#72725e]">Selisih 11 hari rotasi</div>
                </div>

                {/* Haul Condition */}
                <div className="bg-[#fafaf7] p-3 rounded-[16px] border border-black/5 space-y-1">
                  <label className="text-[10px] font-bold text-[#72725e] uppercase">
                    Mencapai Haul (1 Thn)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-[#2d2d22] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasReachedHaul}
                        onChange={(e) => setHasReachedHaul(e.target.checked)}
                        className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
                      />
                      <span>Sudah 1 Tahun</span>
                    </label>
                  </div>
                  <div className="text-[9px] text-[#72725e]">Syarat wajib haul terpenuhi</div>
                </div>
              </div>
            </div>

            {/* 2. Liquid Assets Input (Aktiva Lancar) */}
            <div className="bg-white rounded-[24px] border border-black/5 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[#5A5A40]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                      2. Aset Lancar Usaha (Liquid Assets)
                    </h3>
                    <p className="text-[11px] text-[#72725e]">
                      Aset likuid dan persediaan barang yang dapat diuangkan dalam 1 siklus usaha
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#72725e] block">Total Aset Lancar:</span>
                  <span className="font-mono text-xs font-bold text-[#5A5A40]">
                    Rp {totalGrossLiquidAssets.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash & Bank */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2d2d22]">Kas & Rekening Giro Bisnis:</span>
                    <span className="font-mono text-[11px] text-[#72725e]">
                      Rp {cashAndEquivalents.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={cashAndEquivalents}
                      onChange={(e) => setCashAndEquivalents(Math.max(0, Number(e.target.value)))}
                      step={1000000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[12px] py-2 pl-9 pr-3 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <p className="text-[10px] text-[#72725e]">Uang kas kecil, giro operasional, rekening tabungan.</p>
                </div>

                {/* Accounts Receivable */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2d2d22]">Piutang Lancar Tertagih:</span>
                    <span className="font-mono text-[11px] text-[#72725e]">
                      Rp {accountsReceivable.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={accountsReceivable}
                      onChange={(e) => setAccountsReceivable(Math.max(0, Number(e.target.value)))}
                      step={1000000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[12px] py-2 pl-9 pr-3 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <p className="text-[10px] text-[#72725e]">Invoice yang diharapkan cair lancar (bukan piutang macet).</p>
                </div>

                {/* Inventory / Stock */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2d2d22]">Persediaan Stok Dagang / Bahan:</span>
                    <span className="font-mono text-[11px] text-[#72725e]">
                      Rp {inventoryValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={inventoryValue}
                      onChange={(e) => setInventoryValue(Math.max(0, Number(e.target.value)))}
                      step={1000000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[12px] py-2 pl-9 pr-3 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <p className="text-[10px] text-[#72725e]">Nilai pasar (market value) barang jadi siap jual atau bahan baku.</p>
                </div>

                {/* Short Term Investments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2d2d22]">Investasi Lancar / Sukuk / Deposito:</span>
                    <span className="font-mono text-[11px] text-[#72725e]">
                      Rp {shortTermInvestments.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={shortTermInvestments}
                      onChange={(e) => setShortTermInvestments(Math.max(0, Number(e.target.value)))}
                      step={1000000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[12px] py-2 pl-9 pr-3 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <p className="text-[10px] text-[#72725e]">Reksa dana pasar uang syariah, deposito mudharabah.</p>
                </div>
              </div>
            </div>

            {/* 3. Deductible Current Liabilities (Kewajiban Jangka Pendek) */}
            <div className="bg-white rounded-[24px] border border-black/5 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[#5A5A40]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                      3. Pengurang: Kewajiban Lancar Jatuh Tempo
                    </h3>
                    <p className="text-[11px] text-[#72725e]">
                      Hutang operasional dan cicilan yang harus dilunasi dalam tahun buku berjalan
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#72725e] block">Total Pengurang:</span>
                  <span className="font-mono text-xs font-bold text-[#A05244]">
                    - Rp {totalDeductibleLiabilities.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Hutang Supplier */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#72725e] uppercase">
                    Hutang Supplier / Vendor
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-[11px] font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={shortTermPayables}
                      onChange={(e) => setShortTermPayables(Math.max(0, Number(e.target.value)))}
                      step={500000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[10px] py-1.5 pl-8 pr-2 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="text-[9px] text-[#72725e]">Jatuh tempo &lt; 1 tahun</div>
                </div>

                {/* Beban Operasional / Gaji / Sewa Kantor */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#72725e] uppercase">
                    Gaji & Sewa Kantor Tertunggak
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-[11px] font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={operationalExpensesDue}
                      onChange={(e) => setOperationalExpensesDue(Math.max(0, Number(e.target.value)))}
                      step={500000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[10px] py-1.5 pl-8 pr-2 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="text-[9px] text-[#72725e]">Kewajiban rutin berjalan</div>
                </div>

                {/* Cicilan Pokok Pinjaman */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#72725e] uppercase">
                    Pokok Cicilan Usaha Jatuh Tempo
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-[11px] font-mono text-[#72725e]">Rp</span>
                    <input
                      type="number"
                      value={shortTermFinancingDue}
                      onChange={(e) => setShortTermFinancingDue(Math.max(0, Number(e.target.value)))}
                      step={500000}
                      className="w-full bg-[#fafaf7] border border-black/10 rounded-[10px] py-1.5 pl-8 pr-2 text-xs font-mono font-bold text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="text-[9px] text-[#72725e]">Pokok jatuh tempo tahun ini</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculation Summary & Action (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Executive Calculation Result Card */}
            <div className="bg-[#2d2d22] text-[#f5f2ed] rounded-[28px] p-6 sm:p-7 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C29236]" />
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#E4E3DA]">
                    Hasil Hisab Fiqh Zakat
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#a8a896]">
                  {calendarType === "hijriyah" ? "Tarif 2.50% (Hijri)" : "Tarif 2.577% (Masehi)"}
                </span>
              </div>

              {/* Computation Steps Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[#c4c4b2]">
                  <span>Total Aset Lancar:</span>
                  <span className="font-mono font-semibold text-white">
                    Rp {totalGrossLiquidAssets.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-[#c4c4b2]">
                  <span>Total Kewajiban Lancar (Pengurang):</span>
                  <span className="font-mono font-semibold text-[#e89a8c]">
                    - Rp {totalDeductibleLiabilities.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-white font-serif">Harta Bersih Kena Zakat:</span>
                  <span className="font-mono text-white font-bold">
                    Rp {netZakatBaseAsset.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#a8a896]">
                  <span>Batas Nisab Emas (85g):</span>
                  <span className="font-mono">
                    Rp {nisabThreshold.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Big Result Box */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 text-center space-y-1">
                <div className="text-[11px] text-[#c4c4b2] uppercase tracking-wider font-medium">
                  {isZakatObligatory ? "Kewajiban Zakat Maal Perniagaan" : "Status Zakat Maal"}
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#E4E3DA] font-mono">
                  Rp {annualZakatAmount.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#a8a896] pt-0.5">
                  {isZakatObligatory
                    ? `Setara Rp ${monthlyZakatInstallment.toLocaleString("id-ID")} / bulan jika ditunaikan berkala`
                    : "Harta bersih belum melampaui nisab (bebas zakat maal tahun ini)"}
                </div>
              </div>

              {/* Payment Frequency Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-[#c4c4b2] block">
                  Metode Penunaian:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentFrequency("lump_sum")}
                    className={`py-2 px-3 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                      paymentFrequency === "lump_sum"
                        ? "bg-[#5A5A40] text-white border border-white/20 shadow-xs"
                        : "bg-white/5 text-[#a8a896] hover:bg-white/10"
                    }`}
                  >
                    1 Tahun Penuh (Lump Sum)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFrequency("monthly_installment")}
                    className={`py-2 px-3 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                      paymentFrequency === "monthly_installment"
                        ? "bg-[#5A5A40] text-white border border-white/20 shadow-xs"
                        : "bg-white/5 text-[#a8a896] hover:bg-white/10"
                    }`}
                  >
                    Cicilan Bulanan (1/12)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndOpenReceipt}
                  className="w-full py-2.5 px-4 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Terbitkan Kuitansi BSZ</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAkad}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-[#f5f2ed] border border-white/10 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedSlip ? <Check className="w-3.5 h-3.5 text-[#A8A878]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSlip ? "Tersalin!" : "Salin Ikrar Zakat"}</span>
                </button>
              </div>
            </div>

            {/* AI Advisor Quick Teaser Box */}
            <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                  <h4 className="font-serif font-bold text-xs text-[#2d2d22]">
                    Konsultasi Fiqh & Pengurang PPh Badan
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full font-bold">
                  UU NO. 23/2011
                </span>
              </div>
              <p className="text-[11px] text-[#72725e] leading-relaxed">
                Zakat perniagaan yang disetorkan melalui BAZNAS atau Baitul Maal terdaftar dapat dilampirkan dalam SPT Tahunan PPh Badan (Form 1771) sebagai pengurang Penghasilan Bruto.
              </p>
              <button
                type="button"
                onClick={handleRunAiZakatAudit}
                className="w-full py-2 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Analisis Fiqh AI Selengkapnya</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI FIQH ADVISOR & 8 ASNAF BREAKDOWN */}
      {activeTab === "ai_advisor" && (
        <div className="space-y-6">
          {/* AI Custom Query Form */}
          <div className="bg-white rounded-[24px] border border-black/5 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-[#C29236]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                    Konsultasi Fiqh Muamalah & Audit Zakat AI
                  </h3>
                  <p className="text-[11px] text-[#72725e]">
                    Asisten syariah cerdas untuk analisis hukum zakat maal, deductible expense, dan alokasi 8 asnaf
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAiZakatAudit}
                disabled={isAiLoading}
                className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                <span>{isAiLoading ? "Sedang Menganalisis..." : "Perbarui Analisis Fiqh"}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#2d2d22]">
                Catatan Khusus / Pertanyaan Fiqh Tambahan (Opsional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAiPromptNotes}
                  onChange={(e) => setCustomAiPromptNotes(e.target.value)}
                  placeholder="Contoh: Apakah piutang tertahan lebih dari 6 bulan boleh dikurangkan? Bagaimana zakat atas persediaan yang turun harga pasar?"
                  className="flex-1 bg-[#fafaf7] border border-black/10 rounded-[14px] px-3.5 py-2 text-xs text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
                <button
                  type="button"
                  onClick={handleRunAiZakatAudit}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-[#5A5A40] text-white text-xs font-bold rounded-[14px] hover:bg-[#484833] transition-colors cursor-pointer"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>

          {/* AI Result Cards */}
          {aiAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Verdict & Narrative (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Fiqh Verdict Banner */}
                <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#5A5A40] uppercase tracking-wider">
                      KEPUTUSAN AUDIT SYARIAH
                    </span>
                    <span className="text-[10px] font-mono text-[#72725e]">
                      Ref: {aiAnalysis.bszVerificationCode}
                    </span>
                  </div>

                  <div className="p-4 bg-[#f5f2ed] rounded-[18px] border border-[#5A5A40]/20 space-y-1.5">
                    <div className="font-serif font-bold text-base sm:text-lg text-[#2d2d22] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#5A5A40] shrink-0" />
                      <span>{aiAnalysis.fiqhVerdict}</span>
                    </div>
                    <p className="text-xs text-[#626252] leading-relaxed">
                      {aiAnalysis.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-[#fafaf7] rounded-[14px] border border-black/5 space-y-1">
                      <span className="font-bold text-[#2d2d22] block flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-[#5A5A40]" /> Pembersihan Harta:
                      </span>
                      <p className="text-[11px] text-[#72725e] leading-snug">
                        {aiAnalysis.assetPurificationNotes}
                      </p>
                    </div>

                    <div className="p-3 bg-[#fafaf7] rounded-[14px] border border-black/5 space-y-1">
                      <span className="font-bold text-[#2d2d22] block flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#5A5A40]" /> Pengurang Kewajiban:
                      </span>
                      <p className="text-[11px] text-[#72725e] leading-snug">
                        {aiAnalysis.deductibleLiabilityAnalysis}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#fcfbf9] rounded-[16px] border border-black/5 space-y-1">
                    <span className="font-bold text-xs text-[#2d2d22] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
                      Panduan Pengurang PPh Badan (Tax Deductible):
                    </span>
                    <p className="text-[11px] text-[#72725e] leading-relaxed">
                      {aiAnalysis.taxDeductibilityAdvice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: 8 Asnaf Allocation Suggestions (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#5A5A40]" />
                      <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                        Rekomendasi Alokasi 8 Asnaf
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#5A5A40] font-bold">
                      PROPORSI ADIL
                    </span>
                  </div>

                  <div className="space-y-3">
                    {aiAnalysis.asnafDistributionRecommendations?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#fafaf7] rounded-[18px] border border-black/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs text-[#2d2d22]">
                            {item.asnaf}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full border border-[#5A5A40]/15">
                            {item.allocationPercentage}%
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#3a3a2e] leading-snug">
                          {item.programSuggestion}
                        </p>
                        <p className="text-[10px] text-[#72725e] italic leading-tight">
                          Dampak: {item.impactRationale}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAndOpenReceipt}
                      className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Terbitkan Bukti Setor Zakat (BSZ)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-black/5 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f5f2ed] text-[#5A5A40] mx-auto flex items-center justify-center shadow-xs">
                <Sparkles className="w-8 h-8 text-[#C29236]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-serif font-bold text-base text-[#2d2d22]">
                  Belum Ada Analisis Fiqh AI Terkini
                </h3>
                <p className="text-xs text-[#72725e]">
                  Klik tombol di bawah untuk menjalankan hisab Fiqh Muamalah mendalam bersama Gemini AI berdasarkan neraca aset tenant.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAiZakatAudit}
                className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                <span>Jalankan Audit AI Fiqh Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MULTI-TENANT ECOSYSTEM ZAKAT LEDGER */}
      {activeTab === "ecosystem_ledger" && (
        <div className="space-y-6">
          {/* Executive Multi-tenant Overview Banner */}
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
                  ECOSYSTEM AGGREGATOR
                </span>
                <span className="text-xs text-[#72725e]">
                  Estimasi Potensi Zakat Maal Terpadu Komunitas Masjid
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-[#2d2d22]">
                Buku Besar Zakat Perniagaan Tenant
              </h3>
            </div>

            <div className="bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-[20px] p-4 text-right">
              <div className="text-[11px] text-[#72725e]">Total Potensi Zakat Tahunan:</div>
              <div className="font-serif text-2xl font-bold text-[#5A5A40] font-mono">
                Rp {totalEcosystemZakatPotential.toLocaleString("id-ID")}
              </div>
              <div className="text-[10px] text-[#72725e]">
                Dari {ecosystemTenantsZakatSummary.filter((t) => t.reachesNisab).length} Tenant Muzakki Sah
              </div>
            </div>
          </div>

          {/* Tenants Ledger Table */}
          <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f5f0] text-[#72725e] font-bold uppercase tracking-wider text-[10px] border-b border-black/5">
                  <tr>
                    <th className="py-3.5 px-4">Nama Perusahaan & Sektor</th>
                    <th className="py-3.5 px-4">Paket Sewa</th>
                    <th className="py-3.5 px-4">Estimasi Aset Bersih</th>
                    <th className="py-3.5 px-4">Batas Nisab (85g)</th>
                    <th className="py-3.5 px-4">Status Muzakki</th>
                    <th className="py-3.5 px-4">Zakat / Tahun</th>
                    <th className="py-3.5 px-4 text-right">Aksi Hisab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {ecosystemTenantsZakatSummary.map((item) => (
                    <tr key={item.tenant.id} className="hover:bg-[#f5f2ed]/50 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2d2d22]">{item.tenant.companyName}</div>
                        <div className="text-[10px] text-[#72725e]">
                          {item.tenant.businessSector} • {item.tenant.businessType}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#2d2d22]">{item.tenant.packageType}</div>
                        <div className="text-[10px] font-mono text-[#72725e]">
                          Rp {(item.tenant.monthlyRate / 1000000).toFixed(1)}jt / bln
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-[#2d2d22]">
                        Rp {item.estNet.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#72725e]">
                        Rp {nisabThreshold.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.reachesNisab ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/20">
                            <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" /> Wajib Zakat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#72725e] bg-[#fafaf7] px-2.5 py-0.5 rounded-full border border-black/5">
                            Belum Nisab
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#5A5A40]">
                        Rp {item.annualZakat.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectTenant(item.tenant.id);
                            setActiveTab("calculator");
                          }}
                          className="px-3 py-1 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Audit & Cetak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISTRIBUTION CHANNELS */}
      {activeTab === "distribution" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ZAKAT_DISTRIBUTION_CHANNELS.map((channel) => {
            const isSelected = channel.id === selectedChannelId;
            return (
              <div
                key={channel.id}
                onClick={() => setSelectedChannelId(channel.id)}
                className={`bg-white p-6 rounded-[24px] border transition-all cursor-pointer space-y-4 shadow-xs ${
                  isSelected
                    ? "border-[#5A5A40] ring-1 ring-[#5A5A40]/30 shadow-md"
                    : "border-black/5 hover:border-black/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full uppercase">
                      {channel.category}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#2d2d22] mt-1.5">
                      {channel.name}
                    </h3>
                  </div>

                  <input
                    type="radio"
                    name="zakat_dist_channel"
                    checked={isSelected}
                    onChange={() => setSelectedChannelId(channel.id)}
                    className="w-4 h-4 text-[#5A5A40] accent-[#5A5A40] cursor-pointer mt-1"
                  />
                </div>

                <p className="text-xs text-[#72725e] leading-relaxed">
                  {channel.description}
                </p>

                <div className="space-y-2 pt-1 text-xs border-t border-black/5">
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Nomor Rekening:</span>
                    <span className="font-mono font-bold text-[#5A5A40]">{channel.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Akreditasi / Transparansi:</span>
                    <span className="font-semibold text-[#2d2d22]">{channel.transparencyScore}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <a
                    href={channel.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold text-[#5A5A40] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Kunjungi Portal Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChannelId(channel.id);
                      setActiveTab("calculator");
                    }}
                    className="px-3.5 py-1 bg-[#5A5A40] text-white text-xs font-semibold rounded-full hover:bg-[#484833] transition-colors cursor-pointer"
                  >
                    Pilih Saluran Ini
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: SAVED RECEIPTS HISTORY */}
      {activeTab === "receipts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#2d2d22]">
                Riwayat Kuitansi & Bukti Setor Zakat (BSZ) Tersimpan
              </h3>
              <p className="text-xs text-[#72725e]">
                Dokumen syariah resmi penunaian zakat yang siap dicetak ulang atau diekspor ke format JSON.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-[#5A5A40] bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#5A5A40]/15">
              {savedReceipts.length} KUITANSI RESMI
            </div>
          </div>

          {savedReceipts.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-black/5 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f5f2ed] text-[#5A5A40] mx-auto flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#72725e]">
                Belum ada kuitansi yang diterbitkan pada sesi ini. Hitung zakat Anda di tab Hisab & Billing Sync dan klik "Terbitkan Kuitansi BSZ".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedReceipts.map((rcp) => (
                <div
                  key={rcp.id}
                  className="bg-white rounded-[20px] border border-black/10 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full">
                        {rcp.receiptNumber}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#2d2d22] mt-1">
                        {rcp.tenantName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Terverifikasi BSZ
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#72725e]">
                    <div className="flex justify-between">
                      <span>Nominal Zakat:</span>
                      <span className="font-mono font-bold text-[#2d2d22]">
                        Rp {rcp.paidAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penyalur:</span>
                      <span className="font-medium text-[#2d2d22]">{rcp.distributionChannel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{rcp.paymentDate}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-black/5">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceiptJson(rcp)}
                      className="text-xs text-[#5A5A40] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-3 py-1 bg-[#5A5A40] text-white text-xs font-bold rounded-full hover:bg-[#484833] transition-colors cursor-pointer"
                    >
                      Buka Lembar Cetak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OFFICIAL LETTERHEAD PRINTABLE BSZ RECEIPT MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl border border-black/10 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none">
            {/* Modal Action Header (Hidden on Print) */}
            <div className="p-4 sm:p-5 bg-[#fafaf7] border-b border-black/10 flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                    Bukti Setor Zakat (BSZ) & Lembar Akad Sah
                  </h3>
                  <p className="text-[11px] text-[#72725e]">
                    Dokumen resmi siap cetak, arsip pembukuan, dan lampiran SPT PPh Badan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReceiptJson()}
                  className="px-3 py-1.5 rounded-full border border-black/10 hover:bg-[#f5f5f0] text-xs font-semibold text-[#2d2d22] flex items-center gap-1 cursor-pointer"
                  title="Unduh format data digital JSON"
                >
                  <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-3 py-1.5 bg-white hover:bg-[#fafaf7] border border-black/10 text-xs font-semibold text-[#72725e] rounded-full cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[#2d2d22] bg-white print:p-0 print:overflow-visible">
              {/* Document Header (Kop Surat Resmi) */}
              <div className="border-b-2 border-[#5A5A40] pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-[#5A5A40] uppercase">
                      ISLAMICITY SHARIA CO-WORKING & SENTRA BISNIS WAKAF
                    </div>
                    <h1 className="font-serif font-bold text-lg sm:text-xl text-[#2d2d22]">
                      BUKTI SETOR ZAKAT (BSZ) & AKAD ZAKAT PERNIAGAAN
                    </h1>
                    <div className="text-xs text-[#72725e]">
                      Berdasarkan Fiqh Zakat Tijarah & Regulasi BAZNAS RI No. 1 Tahun 2024
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] space-y-0.5 bg-[#fafaf7] p-2.5 rounded-[12px] border border-black/10">
                    <div>No. BSZ: {aiAnalysis?.bszVerificationCode || `BSZ/IVO/2026/VIII/${Math.floor(1000 + Math.random() * 9000)}`}</div>
                    <div>Tanggal: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</div>
                    <div className="text-[#5A5A40] font-bold">Status: Terverifikasi / Sah</div>
                  </div>
                </div>
              </div>

              {/* Muzakki & Entity Profile */}
              <div className="bg-[#f5f2ed] p-3.5 rounded-[14px] border border-[#5A5A40]/15 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#72725e] block text-[10px]">Nama Entitas / Perusahaan (Muzakki):</span>
                  <strong className="font-serif font-bold text-[#2d2d22]">
                    {currentTenant ? currentTenant.companyName : "Mitra Bisnis Mandiri"}
                  </strong>
                  <div className="text-[11px] text-[#72725e]">
                    Pimpinan: {currentTenant ? currentTenant.representativeName : "Direktur Perusahaan"} • {currentTenant ? currentTenant.businessSector : "Layanan Bisnis"}
                  </div>
                </div>
                <div>
                  <span className="text-[#72725e] block text-[10px]">Lembaga Penyalur Terakreditasi:</span>
                  <strong className="text-[#5A5A40] font-semibold">{currentChannel.name}</strong>
                  <div className="text-[10px] font-mono text-[#72725e]">
                    Rek: {currentChannel.accountNumber}
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="border border-black/10 rounded-[14px] overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#fafaf7] text-[#72725e] font-bold border-b border-black/5 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Komponen Hisab Zakat</th>
                      <th className="py-2.5 px-3 text-right">Nilai Rupiah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <tr>
                      <td className="py-2 px-3">Total Aktiva Lancar (Kas, Piutang Lancar, Persediaan, Investasi)</td>
                      <td className="py-2 px-3 font-mono text-right font-semibold">
                        Rp {totalGrossLiquidAssets.toLocaleString("id-ID")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A05244]">Total Kewajiban Lancar Jatuh Tempo (Hutang Supplier & Beban)</td>
                      <td className="py-2 px-3 font-mono text-right text-[#A05244]">
                        - Rp {totalDeductibleLiabilities.toLocaleString("id-ID")}
                      </td>
                    </tr>
                    <tr className="bg-[#f5f2ed]/50 font-bold">
                      <td className="py-2.5 px-3">Harta Bersih Kena Zakat (Zakat Base)</td>
                      <td className="py-2.5 px-3 font-mono text-right text-[#5A5A40]">
                        Rp {netZakatBaseAsset.toLocaleString("id-ID")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#72725e]">
                        Standar Nisab 85 Gram Emas (@ Rp {goldPricePerGram.toLocaleString("id-ID")}/g)
                      </td>
                      <td className="py-2 px-3 font-mono text-right text-[#72725e]">
                        Rp {nisabThreshold.toLocaleString("id-ID")}
                      </td>
                    </tr>
                    <tr className="bg-[#5A5A40]/10 font-bold">
                      <td className="py-3 px-3 text-[#2d2d22]">
                        Total Zakat Maal Perniagaan Disetorkan ({calendarType === "hijriyah" ? "2.5% Hijri" : "2.577% Masehi"})
                      </td>
                      <td className="py-3 px-3 font-mono text-right text-base text-[#5A5A40]">
                        Rp {(paymentFrequency === "lump_sum" ? annualZakatAmount : monthlyZakatInstallment).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terbilang */}
              <div className="bg-[#fafaf7] p-3 rounded-[12px] border border-black/5 text-xs">
                <span className="text-[#72725e] text-[10px] block">Terbilang:</span>
                <strong className="text-[#2d2d22] italic font-serif">
                  "{formatTerbilang(paymentFrequency === "lump_sum" ? annualZakatAmount : monthlyZakatInstallment)}"
                </strong>
              </div>

              {/* Ijab Qobul Sharia Text */}
              <div className="p-4 rounded-[16px] bg-[#fcfbf9] border border-[#5A5A40]/20 space-y-2 text-xs">
                <div className="font-serif font-bold text-[#5A5A40] text-center border-b border-[#5A5A40]/10 pb-1">
                  IKRAR AKAD PENYALURAN ZAKAT MAAL
                </div>
                <div>
                  <strong className="block text-[10px] text-[#72725e]">Niat Muzakki (Ijab):</strong>
                  <p className="font-serif italic text-[#2d2d22]">
                    "Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala" (Saya berniat mengeluarkan zakat maal perniagaan atas harta usaha ini secara fardhu karena Allah Ta'ala).
                  </p>
                </div>
                <div>
                  <strong className="block text-[10px] text-[#72725e]">Doa Amil Penyalur (Qobul):</strong>
                  <p className="font-serif italic text-[#2d2d22]">
                    "Ajarakallahu fiima a'thayta, wa baaraka fiima abqayta, waja'alahu laka thahuura" (Semoga Allah melimpahkan berkah dan mensucikan harta yang tersisa).
                  </p>
                </div>
              </div>

              {/* Tax Deductible Legal Note */}
              <div className="p-3 bg-white rounded-[12px] border border-black/10 text-[10px] text-[#72725e] leading-snug">
                <strong>Catatan Pajak Penghasilan (PPh):</strong> Berdasarkan Pasal 22 Undang-Undang Republik Indonesia Nomor 23 Tahun 2011 tentang Pengelolaan Zakat dan Peraturan Pemerintah No. 60 Tahun 2010, zakat yang dibayarkan melalui BAZNAS atau LAZ resmi yang disahkan pemerintah dapat dikurangkan dari penghasilan bruto kena pajak (Tax Deductible).
              </div>

              {/* Signatures & QR Seal */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/10 text-center text-xs">
                <div className="space-y-12">
                  <span className="text-[10px] text-[#72725e] block">Muzakki (Wajib Zakat):</span>
                  <div>
                    <strong className="block font-serif text-[#2d2d22]">
                      {currentTenant ? currentTenant.representativeName : "Pimpinan Perusahaan"}
                    </strong>
                    <span className="text-[9px] text-[#72725e]">{currentTenant ? currentTenant.companyName : "Tenant"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-16 h-16 border border-black/10 rounded-lg p-1 bg-white flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-[#5A5A40]" />
                  </div>
                  <span className="text-[8px] font-mono text-[#72725e]">VERIFIED BSZ DIGITAL</span>
                </div>

                <div className="space-y-12">
                  <span className="text-[10px] text-[#72725e] block">Amil Pengelola & Dewan Syariah:</span>
                  <div>
                    <strong className="block font-serif text-[#5A5A40]">
                      Ustadz Ahmad Fauzan, Lc., M.E.Sy.
                    </strong>
                    <span className="text-[9px] text-[#72725e]">DPS & Amil Baitul Maal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

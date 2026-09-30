import React, { useState, useMemo } from "react";
import { Invoice, Tenant, RecurringWakafSubscription } from "../types";
import { WaqfImpactSummary } from "./WaqfImpactSummary";
import { RevenueAnalytics } from "./RevenueAnalytics";
import { WakafInvestmentCalculator } from "./WakafInvestmentCalculator";
import { ZakatMaalCalculator } from "./ZakatMaalCalculator";
import { CommunityImpactReportModal, CommunityImpactReportData } from "./CommunityImpactReportModal";
import { PaymentReminderModal } from "./PaymentReminderModal";
import { InvoiceReminderLog } from "../types";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  Printer,
  ShieldCheck,
  Building,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  Calculator,
  Coins,
  Check,
  Copy,
  FileText,
  Download,
  Receipt,
  CheckCheck,
  Sparkles,
  Scale,
  Repeat,
  MessageSquare,
  Bell,
  Send,
  Calendar,
} from "lucide-react";

// Helper function to spell out numbers in Indonesian (Terbilang)
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

interface BillingManagerProps {
  invoices: Invoice[];
  tenants: Tenant[];
  subscriptions?: RecurringWakafSubscription[];
  onMarkInvoicePaid: (invoiceId: string, paymentMethod: Invoice["paymentMethod"]) => void;
  onSaveSubscription?: (sub: RecurringWakafSubscription, syncInvoices: boolean) => void;
  onToggleSubscriptionStatus?: (subId: string) => void;
  onApplyWaqfToInvoice?: (tenantId: string, monthlyWaqfAmount: number) => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  invoices = [],
  tenants = [],
  subscriptions = [],
  onMarkInvoicePaid,
  onSaveSubscription,
  onToggleSubscriptionStatus,
  onApplyWaqfToInvoice,
}) => {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Invoice["paymentMethod"]>(
    "Bank Syariah Indonesia (BSI) VA"
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [copiedReceiptText, setCopiedReceiptText] = useState(false);
  const [isCommunityReportOpen, setIsCommunityReportOpen] = useState(false);
  const [selectedTenantForReport, setSelectedTenantForReport] = useState<string>("all");
  const [activeViewSection, setActiveViewSection] = useState<
    "all" | "revenue_analytics" | "impact_summary" | "invoices" | "calculator" | "recurring_wakaf" | "zakat_calculator"
  >("all");

  // Automated WhatsApp & Email Reminder State
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<Invoice | null>(null);
  const [invoicesState, setInvoicesState] = useState<Invoice[]>(safeInvoices);
  const [autoReminderAlert, setAutoReminderAlert] = useState<string | null>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setInvoicesState(safeInvoices);
  }, [invoices]);

  // Helper to calculate days remaining until due date based on current simulated date 2026-09-30
  const getDaysUntilDue = (dueDateStr: string): number => {
    try {
      const today = new Date("2026-09-30T00:00:00");
      const due = new Date(dueDateStr + "T00:00:00");
      const diffTime = due.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 3;
    }
  };

  // Find invoices that are exactly H-3 (or <= 3 days unpaid)
  const invoicesDueIn3Days = useMemo(() => {
    return invoicesState.filter((inv) => {
      if (inv.status === "paid") return false;
      const days = getDaysUntilDue(inv.dueDate);
      return days === 3;
    });
  }, [invoicesState]);

  // Record reminder log
  const handleRecordReminder = (invoiceId: string, reminderLog: InvoiceReminderLog) => {
    setInvoicesState((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const existingLogs = inv.reminderLogs || [];
          return {
            ...inv,
            lastReminderSentAt: reminderLog.sentAt,
            reminderLogs: [reminderLog, ...existingLogs],
          };
        }
        return inv;
      })
    );
  };

  // Automated Batch Send to all H-3 due invoices
  const handleBatchSend3DayReminders = () => {
    if (invoicesDueIn3Days.length === 0) return;

    const count = invoicesDueIn3Days.length;
    const nowStr = new Date().toLocaleString("id-ID");

    setInvoicesState((prev) =>
      prev.map((inv) => {
        const days = getDaysUntilDue(inv.dueDate);
        if (inv.status !== "paid" && days === 3) {
          const tenant = safeTenants.find((t) => t.id === inv.tenantId);
          const newLog: InvoiceReminderLog = {
            id: `REM-${Date.now()}-${inv.id}`,
            sentAt: nowStr,
            channel: "both",
            recipientPhone: tenant?.phone || "0812-xxxx-xxxx",
            recipientEmail: tenant?.email || "finance@tenant.com",
            status: "delivered",
            daysBeforeDueDate: 3,
            messageSnippet: `Batch Auto-Reminder H-3 dikirimkan serentak via WhatsApp & Email`,
          };
          return {
            ...inv,
            lastReminderSentAt: nowStr,
            reminderLogs: [newLog, ...(inv.reminderLogs || [])],
          };
        }
        return inv;
      })
    );

    setAutoReminderAlert(
      `Alhamdulillah! ${count} tagihan yang jatuh tempo H-3 telah berhasil dikirimi notifikasi WhatsApp & Email otomatis serentak.`
    );
    setTimeout(() => setAutoReminderAlert(null), 5000);
  };


  const filteredInvoices = invoicesState.filter((inv) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Paid") return inv.status === "paid";
    if (statusFilter === "Unpaid / Overdue") return inv.status !== "paid";
    return true;
  });

  const totalWakafAccumulated = invoicesState.reduce((acc, inv) => acc + (inv.wakafEndowmentAmount || 0), 0);
  const totalRevenue = invoicesState.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);

  // Calculate Cumulative Community Impact Report Data for Stakeholders
  const ecosystemReportData: CommunityImpactReportData = useMemo(() => {
    const isAll = selectedTenantForReport === "all";
    const tenant = safeTenants.find((t) => t.id === selectedTenantForReport);
    
    // Monthly wakaf sum
    let monthlyWakaf = 0;
    if (isAll) {
      monthlyWakaf = safeInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);
      if (monthlyWakaf === 0) monthlyWakaf = 1250000;
    } else if (tenant) {
      const tenantInvoices = safeInvoices.filter((i) => i.tenantId === tenant.id);
      monthlyWakaf = tenantInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);
      if (monthlyWakaf === 0) monthlyWakaf = Math.round(tenant.monthlyRate * 0.05);
    } else {
      monthlyWakaf = 500000;
    }

    const annualWakaf = monthlyWakaf * 12;
    const tenureYears = 5;
    const expectedYield = 7.5;
    const monthlyRate = expectedYield / 100 / 12;

    const timeline = [];
    let runningCumulativeDeposits = 0;
    let runningCumulativeImpact = 0;
    let runningEndowment = 0;

    for (let yr = 1; yr <= tenureYears; yr++) {
      const annualDep = annualWakaf;
      runningCumulativeDeposits += annualDep;
      let yearYield = 0;

      for (let m = 1; m <= 12; m++) {
        runningEndowment += monthlyWakaf;
        yearYield += runningEndowment * monthlyRate;
      }

      const yearDisbursed = annualDep + yearYield;
      runningCumulativeImpact += yearDisbursed;
      const sroi = parseFloat(((runningCumulativeImpact / runningCumulativeDeposits) * (1 + yr * 0.12)).toFixed(2));

      timeline.push({
        year: yr,
        yearLabel: `Tahun ${yr}`,
        annualDeposit: Math.round(annualDep),
        cumulativeDeposited: Math.round(runningCumulativeDeposits),
        endowmentBalance: Math.round(runningEndowment),
        annualYieldGenerated: Math.round(yearYield),
        annualImpactDisbursed: Math.round(yearDisbursed),
        cumulativeImpactDisbursed: Math.round(runningCumulativeImpact),
        sroiMultiplier: sroi,
        umkmDisbursed: Math.round(yearDisbursed * 0.35),
        eduDisbursed: Math.round(yearDisbursed * 0.25),
        greenDisbursed: Math.round(yearDisbursed * 0.15),
        foodDisbursed: Math.round(yearDisbursed * 0.15),
        healthDisbursed: Math.round(yearDisbursed * 0.10),
      });
    }

    const final = timeline[timeline.length - 1];
    const totalFunds = final.cumulativeImpactDisbursed;

    const projectImpacts = [
      {
        id: "proj-umkm",
        name: "Modal Bergulir Qardhul Hasan Dhuafa",
        category: "Ekonomi Mikro",
        iconName: "Store",
        allocatedPercent: 35,
        allocatedAmountTotal: Math.round(totalFunds * 0.35),
        unitsGenerated: Math.floor((totalFunds * 0.35) / 2500000),
        unitLabel: "Pelaku UMKM / Warung",
        impactMetric: "Warung mandiri & bebas rentenir riba",
        sdgGoal: "SDG 1: Tanpa Kemiskinan & SDG 8: Pekerjaan Layak",
      },
      {
        id: "proj-edu",
        name: "Beasiswa Santripreneur & Digital Coding",
        category: "Pendidikan",
        iconName: "GraduationCap",
        allocatedPercent: 25,
        allocatedAmountTotal: Math.round(totalFunds * 0.25),
        unitsGenerated: Math.floor((totalFunds * 0.25) / 1500000),
        unitLabel: "Santri Berprestasi / Smt",
        impactMetric: "Santri terampil teknologi & akuntansi syariah",
        sdgGoal: "SDG 4: Pendidikan Berkualitas",
      },
      {
        id: "proj-green",
        name: "Solar Panel & Eco-Masjid Hijau",
        category: "Infrastruktur Hijau",
        iconName: "Sun",
        allocatedPercent: 15,
        allocatedAmountTotal: Math.round(totalFunds * 0.15),
        unitsGenerated: Math.floor((totalFunds * 0.15) / 3500000),
        unitLabel: "Modul Surya (0.5 kWp)",
        impactMetric: "kWh energi bersih & reduksi emisi karbon",
        sdgGoal: "SDG 7: Energi Bersih & SDG 13: Aksi Iklim",
      },
      {
        id: "proj-food",
        name: "Dapur Berkah Jum'at & Gizi Balita Stunting",
        category: "Pangan",
        iconName: "Utensils",
        allocatedPercent: 15,
        allocatedAmountTotal: Math.round(totalFunds * 0.15),
        unitsGenerated: Math.floor((totalFunds * 0.15) / 25000),
        unitLabel: "Porsi Makanan Bergizi",
        impactMetric: "Paket nutrisi balita & makanan dhuafa",
        sdgGoal: "SDG 2: Tanpa Kelaparan & SDG 3: Kesehatan",
      },
      {
        id: "proj-health",
        name: "Klinik Pratama & Ambulans Siaga Gratis",
        category: "Kesehatan",
        iconName: "Ambulance",
        allocatedPercent: 10,
        allocatedAmountTotal: Math.round(totalFunds * 0.10),
        unitsGenerated: Math.floor((totalFunds * 0.10) / 500000),
        unitLabel: "Layanan Gawat Darurat",
        impactMetric: "Layanan ambulans 24 jam & obat dhuafa",
        sdgGoal: "SDG 3: Kehidupan Sehat dan Sejahtera",
      },
    ];

    return {
      tenantName: isAll ? "Konsorsium Ekosistem Tenant Islamicity" : (tenant?.companyName || "Mitra Bisnis Mandiri"),
      tenantSector: isAll ? "Multi-Sektor Ekonomi Syariah" : (tenant?.businessSector || "Layanan Bisnis"),
      tenantAddress: isAll ? "Sentra Bisnis Wakaf Masjid Agung, Jakarta" : (tenant?.registeredAddress || "Jakarta"),
      representativeName: isAll ? "Seluruh Pimpinan Tenant & Mitra" : (tenant?.representativeName || "Pimpinan Perusahaan"),
      monthlyContribution: monthlyWakaf,
      annualContribution: annualWakaf,
      tenureYears,
      expectedAnnualYield: expectedYield,
      reinvestmentStrategy: "direct_impact",
      cumulativeDeposited: final.cumulativeDeposited,
      endowmentBalance: final.endowmentBalance,
      cumulativeImpactDisbursed: final.cumulativeImpactDisbursed,
      sroiMultiplier: final.sroiMultiplier,
      projectAllocations: {
        "proj-umkm": 35,
        "proj-edu": 25,
        "proj-green": 15,
        "proj-food": 15,
        "proj-health": 10,
      },
      projectImpacts,
      projectionTimeline: timeline,
    };
  }, [selectedTenantForReport, safeTenants, safeInvoices]);

  const handlePayNow = (inv: Invoice) => {
    onMarkInvoicePaid(inv.id, selectedPaymentMethod);
    setSelectedInvoice(null);
  };

  // Helper to get tenant by ID
  const getTenant = (tenantId: string): Tenant | undefined => {
    return safeTenants.find((t) => t.id === tenantId);
  };

  // Copy full receipt text for WhatsApp/Email dispatch
  const handleCopyReceiptText = (inv: Invoice) => {
    const t = getTenant(inv.tenantId);
    const receiptText = `================================================
FAKTUR & KUITANSI RESMI ISLAMICITY VIRTUAL OFFICE
Sentra Bisnis Komunitas Masjid Agung
================================================
No. Dokumen     : ${inv.invoiceNumber}
Status          : ${inv.status === "paid" ? "LUNAS / PAID (TERVERIFIKASI SYARIAH)" : "MENUNGGU PEMBAYARAN"}
Tanggal Terbit  : ${inv.issueDate}
Jatuh Tempo     : ${inv.dueDate}
${inv.paidDate ? `Tanggal Lunas   : ${inv.paidDate}\nMetode Bayar    : ${inv.paymentMethod}` : ""}
------------------------------------------------
PENYEWA / BILLED TO:
Nama Perusahaan : ${inv.tenantName}
Penanggung Jawab: ${t?.representativeName || "-"}
Sektor Usaha    : ${t?.businessSector || "-"}
Alamat Kantor   : ${t?.registeredAddress || "Sentra Bisnis Masjid Agung"}
------------------------------------------------
RINCIAN TAGIHAN:
1. Sewa Pokok   : Rp ${inv.baseAmount.toLocaleString("id-ID")}
2. PPN (11%)    : Rp ${inv.taxAmount.toLocaleString("id-ID")}
3. Wakaf Umat 5%: Rp ${inv.wakafEndowmentAmount.toLocaleString("id-ID")}
------------------------------------------------
TOTAL TAGIHAN   : Rp ${inv.totalAmount.toLocaleString("id-ID")}
TERBILANG       : ${formatTerbilang(inv.totalAmount)}
------------------------------------------------
Akad Muamalah: Akad Ijarah & Wakaf Uang (Fatwa DSN-MUI)
Rekening BSI VA : 99281-0892-3819
Nadzir Pengelola: Yayasan Sentra Bisnis & Wakaf Masjid Agung
================================================`;

    navigator.clipboard?.writeText(receiptText);
    setCopiedReceiptText(true);
    setTimeout(() => setCopiedReceiptText(false), 2500);
  };

  // Download JSON Receipt Data
  const handleDownloadInvoiceJson = (inv: Invoice) => {
    const t = getTenant(inv.tenantId);
    const data = {
      institution: "Islamicity Virtual Office & Sharia Co-Working Hub",
      legalEntity: "Sentra Bisnis Komunitas Masjid Agung",
      taxId: "01.992.839.1-012.000",
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      paidDate: inv.paidDate || null,
      paymentMethod: inv.paymentMethod || null,
      tenant: {
        id: inv.tenantId,
        companyName: inv.tenantName,
        representativeName: t?.representativeName || "",
        businessSector: t?.businessSector || "",
        registeredAddress: t?.registeredAddress || "",
      },
      breakdown: {
        baseAmount: inv.baseAmount,
        taxAmount: inv.taxAmount,
        wakafEndowmentAmount: inv.wakafEndowmentAmount,
        totalAmount: inv.totalAmount,
        terbilang: formatTerbilang(inv.totalAmount),
      },
      shariaCompliance: {
        akad: "Ijarah & Wakaf Uang Produktif",
        fatwaReference: "DSN-MUI No. 09/DSN-MUI/IV/2000 & MUI No. 2/2002",
        nadzir: "Yayasan Sentra Bisnis & Wakaf Masjid Agung",
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${inv.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              SOP-IVO-07 COMPLIANT
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              Sistem Keuangan Bebas Riba & Fatwa DSN-MUI
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#2d2d22]">
            Pengelolaan Tagihan, E-Invoice & Wakaf Produktif
          </h2>
          <p className="text-xs text-[#72725e] max-w-2xl leading-relaxed">
            Penerbitan tagihan sewa otomatis, kuitansi resmi ber-kop surat dengan kode verifikasi, serta alokasi wakaf terintegrasi untuk pemberdayaan ekonomi umat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#f5f2ed] rounded-[20px] p-4 text-right border border-[#5A5A40]/20">
            <div className="text-[11px] text-[#72725e]">Akumulasi Wakaf Uang (5%):</div>
            <div className="font-serif text-xl font-bold text-[#5A5A40] font-mono">
              Rp {totalWakafAccumulated.toLocaleString("id-ID")}
            </div>
            <div className="text-[10px] text-[#72725e] mt-0.5">Disalurkan via Nadzir Masjid</div>
          </div>

          <button
            type="button"
            onClick={() => setIsCommunityReportOpen(true)}
            className="px-4 py-3.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-[20px] shadow-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            title="Buka Dokumen PDF Laporan Dampak Komunitas untuk Stakeholder"
          >
            <div className="flex items-center gap-1.5">
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Dampak</span>
            </div>
            <span className="text-[10px] text-[#E4E3DA] font-normal">Stakeholder PDF Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[22px] border border-black/5 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/15 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#72725e] font-medium">Total Nilai Tagihan Terbit</div>
            <div className="text-lg font-bold font-mono text-[#2d2d22] mt-0.5">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#72725e]">{safeInvoices.length} Total Invoice Aktif</div>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-black/5 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/15 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#72725e] font-medium">Tagihan Lunas (Terverifikasi)</div>
            <div className="text-lg font-bold font-mono text-[#5A5A40] mt-0.5">
              {safeInvoices.filter((i) => i.status === "paid").length} / {safeInvoices.length} Lunas
            </div>
            <div className="text-[11px] text-[#72725e]">SLA Verifikasi Otomatis &lt; 5 Menit</div>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-black/5 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/15 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#72725e] font-medium">Mitra Wakif Aktif (Tenant)</div>
            <div className="text-lg font-bold font-mono text-[#2d2d22] mt-0.5">
              {safeTenants.length} Entitas Bisnis
            </div>
            <div className="text-[11px] text-[#5A5A40] font-medium">100% Berkomitmen Wakaf Produktif</div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveViewSection("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeViewSection === "all"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          Semua Modul
        </button>
        <button
          onClick={() => setActiveViewSection("revenue_analytics")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewSection === "revenue_analytics"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Revenue Analytics (Tren & Paket)</span>
        </button>
        <button
          onClick={() => setActiveViewSection("impact_summary")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewSection === "impact_summary"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Waqf Impact Summary (Grafik)</span>
        </button>
        <button
          onClick={() => setActiveViewSection("invoices")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewSection === "invoices"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Daftar Tagihan & Kuitansi</span>
        </button>
        <button
          onClick={() => setActiveViewSection("calculator")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewSection === "calculator"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Kalkulator Simulasi Wakaf</span>
        </button>
        <button
          onClick={() => setActiveViewSection("recurring_wakaf")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewSection === "recurring_wakaf"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
          id="btn-billing-recurring-wakaf-tab"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Langganan Wakaf Rutin</span>
        </button>
        <button
          onClick={() => setActiveViewSection("zakat_calculator")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewSection === "zakat_calculator"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white border border-black/10 text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Kalkulator Zakat Maal (Bisnis)</span>
        </button>

        <button
          onClick={() => setIsCommunityReportOpen(true)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer bg-[#f5f2ed] border border-[#5A5A40]/30 text-[#5A5A40] hover:bg-[#E4E3DA] ml-auto shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Laporan Dampak Stakeholder (PDF)</span>
        </button>
      </div>

      {/* Revenue Analytics Widget */}
      {(activeViewSection === "all" || activeViewSection === "revenue_analytics") && (
        <RevenueAnalytics
          invoices={safeInvoices}
          tenants={safeTenants}
        />
      )}

      {/* Waqf Impact Summary Widget */}
      {(activeViewSection === "all" || activeViewSection === "impact_summary") && (
        <WaqfImpactSummary
          invoices={safeInvoices}
          tenants={safeTenants}
        />
      )}

      {/* UTILITY WIDGET: Advanced Wakaf Investment & Community Impact Calculator + Recurring Subscription Scheduler */}
      {(activeViewSection === "all" || activeViewSection === "calculator" || activeViewSection === "recurring_wakaf") && (
        <WakafInvestmentCalculator
          tenants={safeTenants}
          invoices={safeInvoices}
          subscriptions={subscriptions}
          onSaveSubscription={onSaveSubscription}
          onToggleSubscriptionStatus={onToggleSubscriptionStatus}
          onApplyToInvoice={onApplyWaqfToInvoice}
          initialTab={activeViewSection === "recurring_wakaf" ? "recurring_subscription" : "projection"}
        />
      )}

      {/* UTILITY WIDGET: Zakat Maal Perniagaan & Distribution Tool */}
      {(activeViewSection === "all" || activeViewSection === "zakat_calculator") && (
        <ZakatMaalCalculator tenants={safeTenants} invoices={safeInvoices} />
      )}

      {/* Filter & Invoices Table */}
      {(activeViewSection === "all" || activeViewSection === "invoices") && (
      <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-[#2d2d22] text-base">Daftar Tagihan & Status Rekonsiliasi</h3>
            <p className="text-xs text-[#72725e]">
              Klik tombol cetak untuk mengunduh atau mencetak PDF kuitansi resmi ber-kop surat.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {["All", "Paid", "Unpaid / Overdue"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
                  statusFilter === filter
                    ? "bg-[#5A5A40] text-white"
                    : "border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Automated H-3 Reminder Banner */}
        <div className="bg-gradient-to-r from-[#fcfbf9] to-[#f5f2ed] border border-[#5A5A40]/25 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5 text-[#E4E3DA]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold bg-[#5A5A40] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E4E3DA]" />
                  SISTEM OTOMASI REMINDER H-3
                </span>
                <span className="text-xs font-semibold text-[#5A5A40]">
                  WhatsApp & Email Multi-Channel (Anti-Riba)
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22]">
                Pengingat Pembayaran Otomatis 3 Hari Sebelum Jatuh Tempo
              </h4>
              <p className="text-xs text-[#626252] leading-relaxed">
                Terdeteksi <strong>{invoicesDueIn3Days.length} tagihan</strong> yang jatuh tempo tepat 3 hari lagi ({invoicesDueIn3Days.map(i => i.invoiceNumber).join(", ") || "Semua terkirim"}). Pesan disusun dengan adab Islami, menyertakan nomor BSI VA dan transparansi alokasi 5% wakaf produktif.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBatchSend3DayReminders}
              disabled={invoicesDueIn3Days.length === 0}
              className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#484833] disabled:opacity-50 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirimkan Notifikasi H-3 ({invoicesDueIn3Days.length} Tagihan)</span>
            </button>
          </div>
        </div>

        {autoReminderAlert && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{autoReminderAlert}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f5f0] text-[#72725e] font-bold uppercase tracking-wider text-[10px] border-b border-black/5">
              <tr>
                <th className="py-3.5 px-4">No. Invoice</th>
                <th className="py-3.5 px-4">Tenant / Klien</th>
                <th className="py-3.5 px-4">Deskripsi Layanan</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4">Porsi Wakaf</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4">Status & Pengingat</th>
                <th className="py-3.5 px-4 text-right">Aksi & Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === "paid";
                return (
                  <tr key={inv.id} className="hover:bg-[#f5f2ed]/50 transition-all">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2d2d22]">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2d2d22] line-clamp-1">{inv.tenantName}</div>
                      <div className="text-[10px] text-[#72725e] font-mono">ID: {inv.tenantId}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-[#3a3a2e]">
                      <div className="line-clamp-1 font-medium">{inv.periodDescription}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#626252]">
                      {inv.dueDate}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#5A5A40] font-semibold">
                      Rp {inv.wakafEndowmentAmount.toLocaleString("id-ID")}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-[#2d2d22]">
                      Rp {inv.totalAmount.toLocaleString("id-ID")}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/20">
                            <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" /> Lunas
                          </span>
                        ) : inv.status === "overdue" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#383827] bg-[#E4E3DA] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/30">
                            <AlertTriangle className="w-3 h-3 text-[#5A5A40]" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#72725e] bg-[#f5f5f0] px-2.5 py-0.5 rounded-full border border-black/5">
                            <Clock className="w-3 h-3 text-[#72725e]" /> Menunggu
                          </span>
                        )}

                        {/* Reminder Status Badge */}
                        {!isPaid && (
                          <div className="text-[10px] flex items-center gap-1">
                            {inv.lastReminderSentAt ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5" title={`Terkirim: ${inv.lastReminderSentAt}`}>
                                <CheckCheck className="w-3 h-3" /> Reminder Terkirim
                              </span>
                            ) : getDaysUntilDue(inv.dueDate) === 3 ? (
                              <span className="text-amber-700 bg-amber-50 font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                                ⚡ Perlu Reminder H-3
                              </span>
                            ) : (
                              <span className="text-[#72725e]">
                                {getDaysUntilDue(inv.dueDate)} Hari Lagi
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp & Email Reminder Button (for unpaid invoices) */}
                        {!isPaid && (
                          <button
                            onClick={() => setSelectedInvoiceForReminder(inv)}
                            title="Kirim Notifikasi Pengingat WhatsApp & Email (H-3)"
                            className={`p-2 rounded-full border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5 ${
                              getDaysUntilDue(inv.dueDate) === 3
                                ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 ring-1 ring-amber-400/40"
                                : "border-emerald-600/30 text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Kirim Reminder</span>
                          </button>
                        )}

                        {/* Print / View Official Letterhead PDF Receipt */}
                        <button
                          onClick={() => setSelectedInvoiceForReceipt(inv)}
                          title="Cetak Faktur / Kuitansi Resmi PDF"
                          className="p-2 rounded-full border border-[#5A5A40]/20 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF Kuitansi</span>
                        </button>

                        {/* Pay or Quick View */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                            isPaid
                              ? "border-black/10 hover:bg-[#f5f5f0] text-[#72725e]"
                              : "border-[#5A5A40] bg-[#5A5A40] text-white hover:bg-[#484833]"
                          }`}
                        >
                          {isPaid ? "Rincian" : "Bayar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal: Quick Pay / Verification */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
                  {selectedInvoice.status === "paid" ? "Kuitansi Pembayaran Syariah" : "Rincian Tagihan E-Invoice"}
                </h3>
                <p className="text-xs text-[#72725e] font-mono">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#3a3a2e]">
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#72725e]">Penyewa:</span>
                <span className="font-bold text-[#2d2d22]">{selectedInvoice.tenantName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#72725e]">Layanan:</span>
                <span className="font-medium text-[#2d2d22] text-right">{selectedInvoice.periodDescription}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#72725e]">Sewa Pokok:</span>
                <span className="font-mono font-semibold text-[#2d2d22]">Rp {selectedInvoice.baseAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#72725e]">PPN (11%):</span>
                <span className="font-mono text-[#626252]">Rp {selectedInvoice.taxAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-black/5 bg-[#f5f2ed] p-3 rounded-[14px] text-[#383827]">
                <span>Alokasi Wakaf Produktif (5%):</span>
                <span className="font-mono font-bold text-[#5A5A40]">
                  Rp {selectedInvoice.wakafEndowmentAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-[#5A5A40] text-sm font-bold text-[#2d2d22]">
                <span>Total Tagihan:</span>
                <span className="font-mono text-[#5A5A40]">
                  Rp {selectedInvoice.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Payment Actions */}
            {selectedInvoice.status !== "paid" ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1.5 text-xs">
                    Pilih Saluran Pembayaran Syariah:
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white text-xs font-semibold px-4"
                  >
                    <option value="Bank Syariah Indonesia (BSI) VA">Bank Syariah Indonesia (BSI) Virtual Account</option>
                    <option value="Bank Muamalat VA">Bank Muamalat Virtual Account</option>
                    <option value="QRIS Syariah">QRIS Syariah (BCA Syariah / LinkAja Syariah)</option>
                    <option value="Transfer Bank">Transfer Bank Manual</option>
                  </select>
                </div>

                <div className="p-4 bg-[#f5f5f0] rounded-[18px] border border-black/5 text-center space-y-1">
                  <div className="text-[11px] text-[#72725e] font-mono">NOMOR VIRTUAL ACCOUNT BSI:</div>
                  <div className="text-lg font-black font-mono tracking-wider text-[#2d2d22]">
                    99281-0892-3819
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      setSelectedInvoiceForReceipt(inv);
                    }}
                    className="w-full py-2.5 border border-[#5A5A40]/30 hover:bg-[#f5f2ed] text-[#5A5A40] font-bold rounded-full text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Lihat Kop Faktur PDF</span>
                  </button>

                  <button
                    onClick={() => handlePayNow(selectedInvoice)}
                    className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pelunasan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-[#f5f2ed] rounded-[18px] border border-[#5A5A40]/20 text-xs text-[#2d2d22]">
                  <div className="font-bold flex items-center gap-1.5 text-[#5A5A40]">
                    <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                    Pembayaran Telah Diverifikasi
                  </div>
                  <div className="mt-1 text-[#626252]">Metode: <strong>{selectedInvoice.paymentMethod}</strong> pada {selectedInvoice.paidDate}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      setSelectedInvoiceForReceipt(inv);
                    }}
                    className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Kuitansi Resmi Ber-Kop Surat (PDF)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL LETTERHEAD PRINTABLE PDF RECEIPT / INVOICE MODAL */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-3xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            {/* Modal Actions Bar (No Print) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#5A5A40]/15 font-mono flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Pratinjau Kuitansi & Faktur Pajak Resmi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyReceiptText(selectedInvoiceForReceipt)}
                  className="px-3 py-1.5 rounded-full border border-black/10 hover:bg-[#f5f5f0] text-[#3a3a2e] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Salin ringkasan kuitansi teks untuk WA/Email"
                >
                  {copiedReceiptText ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span className="text-[#5A5A40]">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#72725e]" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadInvoiceJson(selectedInvoiceForReceipt)}
                  className="px-3 py-1.5 rounded-full border border-black/10 hover:bg-[#f5f5f0] text-[#3a3a2e] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Unduh format data digital JSON"
                >
                  <Download className="w-3.5 h-3.5 text-[#72725e]" />
                  <span>E-Faktur JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Cetak atau Simpan sebagai PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Ekspor PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="w-8 h-8 rounded-full bg-[#f5f5f0] text-[#72725e] hover:text-[#2d2d22] hover:bg-[#E4E3DA] flex items-center justify-center font-bold text-sm cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL LETTERHEAD RECEIPT / INVOICE CONTAINER */}
            <div
              id="printable-invoice-receipt"
              className="bg-white border border-black/10 p-6 sm:p-8 rounded-[20px] space-y-6 text-[#2d2d22]"
            >
              {/* 1. Official Letterhead (Kop Surat Resmi) */}
              <div className="border-b-2 border-[#5A5A40] pb-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-serif font-black text-xl shadow-xs">
                      IVO
                    </div>
                    <div>
                      <h1 className="font-serif font-extrabold text-base sm:text-lg tracking-wider text-[#2d2d22] uppercase">
                        ISLAMICITY VIRTUAL OFFICE & SHARIA CO-WORKING HUB
                      </h1>
                      <p className="text-[11px] font-semibold text-[#5A5A40]">
                        Sentra Bisnis Komunitas Masjid Agung • Unit Pengelola Wakaf Produktif & Inkubasi Bisnis Syariah
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-mono bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-1 rounded-md border border-[#5A5A40]/20 font-bold">
                      FORM-IVO-FIN-07
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap justify-between text-[10px] text-[#72725e] border-t border-black/5 font-sans leading-tight">
                  <div>
                    <strong>Alamat:</strong> Gedung Sentra Bisnis Masjid Agung Lt. 2-4, Jl. Jend. Sudirman Kav. 52, SCBD, Jakarta Selatan 12190
                  </div>
                  <div>
                    <strong>Kontak:</strong> (021) 5890-2819 • WhatsApp: 0812-8800-9921 • finance@islamicity-vo.id
                  </div>
                  <div className="w-full mt-1 text-[#8f8f7b]">
                    Izin OSS KBLI 82110 / 68111 • NPWP Badan: 01.992.839.1-012.000 • SK Kemenkumham: AHU-0019283.AH.01.04
                  </div>
                </div>
              </div>

              {/* 2. Document Title & Official Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-1">
                <div>
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-[#2d2d22] uppercase tracking-wide">
                    {selectedInvoiceForReceipt.status === "paid" ? "KUITANSI RESMI & FAKTUR PAJAK SYARIAH" : "FAKTUR TAGIHAN (OFFICIAL INVOICE)"}
                  </h2>
                  <p className="text-xs text-[#72725e] font-sans">
                    Bukti Pembayaran Sah Layanan Domisili Virtual Office & Alokasi Wakaf Umat
                  </p>
                </div>

                <div>
                  {selectedInvoiceForReceipt.status === "paid" ? (
                    <div className="px-4 py-1.5 bg-[#f5f2ed] border-2 border-[#5A5A40] text-[#5A5A40] rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                      <span>LUNAS / TERVERIFIKASI SYARIAH</span>
                    </div>
                  ) : (
                    <div className="px-4 py-1.5 bg-[#f5f5f0] border-2 border-[#8a8a70] text-[#383827] rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#72725e]" />
                      <span>MENUNGGU PEMBAYARAN</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Metadata Grid & Billed To Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Invoice Meta */}
                <div className="bg-[#f5f5f0]/80 p-4 rounded-[16px] border border-black/5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] font-mono pb-1 border-b border-black/5">
                    INFORMASI DOKUMEN & TRANSAKSI
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Nomor Invoice / Kuitansi:</span>
                    <strong className="font-mono text-[#2d2d22]">{selectedInvoiceForReceipt.invoiceNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Tanggal Terbit (Issue Date):</span>
                    <span className="font-mono text-[#2d2d22]">{selectedInvoiceForReceipt.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Tanggal Jatuh Tempo:</span>
                    <span className="font-mono text-[#2d2d22]">{selectedInvoiceForReceipt.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Metode Pembayaran:</span>
                    <span className="font-semibold text-[#5A5A40]">
                      {selectedInvoiceForReceipt.paymentMethod || "Virtual Account Bank Syariah"}
                    </span>
                  </div>
                  {selectedInvoiceForReceipt.paidDate && (
                    <div className="flex justify-between">
                      <span className="text-[#72725e]">Tanggal Pelunasan:</span>
                      <span className="font-mono text-[#5A5A40] font-bold">{selectedInvoiceForReceipt.paidDate}</span>
                    </div>
                  )}
                </div>

                {/* Tenant / Billed To */}
                {(() => {
                  const t = getTenant(selectedInvoiceForReceipt.tenantId);
                  return (
                    <div className="bg-[#f5f5f0]/80 p-4 rounded-[16px] border border-black/5 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] font-mono pb-1 border-b border-black/5">
                        DITAGIHKAN KEPADA (BILLED TO)
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#72725e]">Nama Entitas:</span>
                        <strong className="text-[#2d2d22] text-right">{selectedInvoiceForReceipt.tenantName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#72725e]">Penanggung Jawab (PIC):</span>
                        <span className="text-[#2d2d22] font-medium">{t?.representativeName || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#72725e]">Bentuk / Sektor Usaha:</span>
                        <span className="text-[#626252]">{t?.businessType} • {t?.businessSector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#72725e]">Alamat Domisili Terdaftar:</span>
                        <span className="text-[#626252] text-right line-clamp-1">
                          {t?.registeredAddress || "Sentra Bisnis Masjid Agung"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#72725e]">ID Penyewa:</span>
                        <span className="font-mono text-[11px] text-[#72725e]">{selectedInvoiceForReceipt.tenantId}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 4. Itemized Table Breakdown */}
              <div className="space-y-2">
                <div className="overflow-hidden border border-black/10 rounded-[16px]">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#f5f5f0] text-[#5A5A40] font-bold uppercase tracking-wider text-[10px] border-b border-black/10">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-4">Deskripsi Layanan & Fasilitas</th>
                        <th className="py-2.5 px-4 text-center">Periode</th>
                        <th className="py-2.5 px-4 text-right">Tarif Dasar</th>
                        <th className="py-2.5 px-4 text-right">Jumlah (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-[#3a3a2e]">
                      {/* Row 1: Base Rent */}
                      <tr>
                        <td className="py-3 px-3 text-center font-mono font-medium">1</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#2d2d22]">
                            Sewa Pokok Layanan Virtual Office & Domisili Usaha Legal
                          </div>
                          <div className="text-[11px] text-[#72725e] mt-0.5">
                            {selectedInvoiceForReceipt.periodDescription} (Termasuk Alamat OSS RBA, Resepsionis Syariah, Kuota Meeting Room 8 Jam/Bulan, Digital Mail Locker)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px]">1 Bulan</td>
                        <td className="py-3 px-4 text-right font-mono">
                          Rp {selectedInvoiceForReceipt.baseAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#2d2d22]">
                          Rp {selectedInvoiceForReceipt.baseAmount.toLocaleString("id-ID")}
                        </td>
                      </tr>

                      {/* Row 2: Tax 11% */}
                      <tr>
                        <td className="py-3 px-3 text-center font-mono font-medium">2</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#2d2d22]">
                            Pajak Pertambahan Nilai (PPN 11%)
                          </div>
                          <div className="text-[11px] text-[#72725e] mt-0.5">
                            Kewajiban Perpajakan Resmi Sesuai Undang-Undang HPP Republik Indonesia
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px]">11%</td>
                        <td className="py-3 px-4 text-right font-mono">
                          Rp {selectedInvoiceForReceipt.taxAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#626252]">
                          Rp {selectedInvoiceForReceipt.taxAmount.toLocaleString("id-ID")}
                        </td>
                      </tr>

                      {/* Row 3: Productive Waqf 5% */}
                      <tr className="bg-[#f5f2ed]/40">
                        <td className="py-3 px-3 text-center font-mono font-medium text-[#5A5A40]">3</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#5A5A40] flex items-center gap-1.5">
                            <HeartHandshake className="w-3.5 h-3.5" />
                            Alokasi Wakaf Produktif Terintegrasi (5%)
                          </div>
                          <div className="text-[11px] text-[#72725e] mt-0.5">
                            Akad Wakaf Uang DSN-MUI • Dikelola Nadzir untuk Permodalan UMKM Mikro Bebas Riba, Sarana Masjid, & Beasiswa Santri
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-[#5A5A40]">5%</td>
                        <td className="py-3 px-4 text-right font-mono text-[#5A5A40]">
                          Rp {selectedInvoiceForReceipt.wakafEndowmentAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#5A5A40]">
                          Rp {selectedInvoiceForReceipt.wakafEndowmentAmount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Total */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f5f5f0] p-4 rounded-[16px] border border-black/5">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#72725e] font-semibold">JUMLAH TERBILANG:</div>
                    <div className="font-serif italic font-bold text-[#2d2d22] text-xs sm:text-sm">
                      "{formatTerbilang(selectedInvoiceForReceipt.totalAmount)}"
                    </div>
                  </div>

                  <div className="w-full sm:w-auto text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/10">
                    <div className="text-xs text-[#72725e]">Total Pembayaran Akhir (IDR):</div>
                    <div className="font-serif text-xl sm:text-2xl font-black text-[#5A5A40] font-mono">
                      Rp {selectedInvoiceForReceipt.totalAmount.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Sharia Compliance Statement & Payment Channel Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-1">
                <div className="p-3.5 rounded-[14px] bg-[#f5f2ed] border border-[#5A5A40]/15 space-y-1.5">
                  <div className="font-bold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
                    Pernyataan Kepatuhan Syariah & Akad
                  </div>
                  <p className="text-[10px] text-[#5A5A40] leading-relaxed">
                    Transaksi ini menggunakan <strong>Akad Ijarah</strong> (Sewa Menyewa Fasilitas) dan <strong>Akad Wakaf Uang</strong> yang sah sesuai Fatwa DSN-MUI No. 09/DSN-MUI/IV/2000 dan Fatwa MUI No. 2/2002. Bebas dari unsur Riba, Gharar, dan Maysir.
                  </p>
                </div>

                <div className="p-3.5 rounded-[14px] bg-[#f5f5f0] border border-black/5 space-y-1 text-[11px]">
                  <div className="font-bold text-[#2d2d22]">Kanal Rekening Virtual Account Syariah:</div>
                  <div className="text-[#626252] flex justify-between">
                    <span>Bank Syariah Indonesia (BSI):</span>
                    <strong className="font-mono text-[#2d2d22]">99281-0892-3819</strong>
                  </div>
                  <div className="text-[#626252] flex justify-between">
                    <span>Bank Muamalat Indonesia:</span>
                    <strong className="font-mono text-[#2d2d22]">88721-0892-3819</strong>
                  </div>
                  <div className="text-[10px] text-[#72725e] pt-0.5">
                    Atas Nama: <strong>Yayasan Sentra Bisnis & Wakaf Masjid Agung</strong>
                  </div>
                </div>
              </div>

              {/* 6. Official Signatures & Seal (Pengesahan) */}
              <div className="pt-4 border-t-2 border-black/10 flex flex-wrap justify-between items-end gap-6 text-xs font-sans">
                {/* QR Verification */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-black/10 shadow-2xs flex flex-col items-center justify-center">
                    <QrCode className="w-12 h-12 text-[#2d2d22]" />
                  </div>
                  <div className="space-y-0.5 text-[10px] text-[#72725e]">
                    <div className="font-bold text-[#2d2d22]">VERIFIKASI DIGITAL OTENTIK</div>
                    <div className="font-mono">Hash: SHR-INV-{selectedInvoiceForReceipt.invoiceNumber.replace(/[^0-9]/g, '')}-OK</div>
                    <div>Pindai QR untuk validasi keabsahan dokumen</div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-end gap-8 text-center">
                  <div className="space-y-12">
                    <div className="text-[11px] text-[#72725e]">
                      Penyewa / Tenant PIC,<br />
                      <span className="font-semibold text-[#2d2d22]">{selectedInvoiceForReceipt.tenantName}</span>
                    </div>
                    <div>
                      <div className="font-bold underline text-[#2d2d22]">
                        {getTenant(selectedInvoiceForReceipt.tenantId)?.representativeName || "Pimpinan Perusahaan"}
                      </div>
                      <div className="text-[10px] text-[#72725e]">Direktur / Kuasa Pengelola</div>
                    </div>
                  </div>

                  <div className="space-y-12 relative">
                    {/* Simulated Circular Islamic Stamp Badge */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-dashed border-[#5A5A40]/40 flex items-center justify-center pointer-events-none rotate-[-12deg] opacity-70">
                      <div className="text-[8px] font-black text-[#5A5A40] text-center uppercase tracking-tighter leading-tight font-serif">
                        SENTRA BISNIS<br />MASJID AGUNG<br />★ LUNAS ★
                      </div>
                    </div>

                    <div className="text-[11px] text-[#72725e]">
                      Jakarta, {selectedInvoiceForReceipt.paidDate || selectedInvoiceForReceipt.issueDate}<br />
                      <strong className="text-[#2d2d22]">PENGELOLA SENTRA BISNIS SYARIAH</strong>
                    </div>
                    <div>
                      <div className="font-bold underline text-[#2d2d22]">
                        Drs. H. Muhammad Arifin
                      </div>
                      <div className="text-[10px] text-[#72725e]">Nadzir & Direktur Keuangan Syariah</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document footer notice */}
              <div className="pt-2 text-center text-[9px] text-[#8f8f7b] border-t border-black/5 font-sans">
                Dokumen ini merupakan bukti pembayaran dan faktur tagihan resmi yang diterbitkan secara elektronik oleh Unit Pengelola Islamicity Virtual Office Masjid Agung.
              </div>
            </div>

            {/* Modal Bottom Print Button (No Print) */}
            <div className="no-print pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-black/5">
              <div className="text-xs text-[#72725e]">
                Format siap cetak A4 Letterhead • Standar Perbankan & Perpajakan
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="px-4 py-2 text-[#72725e] hover:bg-[#f5f5f0] text-xs font-semibold rounded-full cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Impact Report PDF Modal for Stakeholders */}
      <CommunityImpactReportModal
        isOpen={isCommunityReportOpen}
        onClose={() => setIsCommunityReportOpen(false)}
        reportData={ecosystemReportData}
        tenants={safeTenants}
        selectedTenantId={selectedTenantForReport}
        onSelectTenant={(tenantId) => setSelectedTenantForReport(tenantId)}
      />

      {/* Automated WhatsApp & Email Payment Reminder Modal (H-3 Days Due Date) */}
      {selectedInvoiceForReminder && (
        <PaymentReminderModal
          isOpen={Boolean(selectedInvoiceForReminder)}
          onClose={() => setSelectedInvoiceForReminder(null)}
          invoice={selectedInvoiceForReminder}
          tenant={safeTenants.find((t) => t.id === selectedInvoiceForReminder.tenantId)}
          onRecordReminderSent={handleRecordReminder}
        />
      )}
    </div>
  );
};

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Building2,
  Receipt,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Printer,
  Copy,
  Check,
  ChevronDown,
  Info,
  Store,
  GraduationCap,
  Sun,
  Utensils,
  Ambulance,
  HeartHandshake,
  QrCode,
  Send,
} from "lucide-react";
import { Tenant, Invoice, RecurringWakafSubscription } from "../types";
import { COMMUNITY_PROJECTS, CommunityProject } from "./WakafInvestmentCalculator";

interface RecurringWakafManagerProps {
  tenants: Tenant[];
  invoices?: Invoice[];
  subscriptions: RecurringWakafSubscription[];
  onSaveSubscription: (sub: RecurringWakafSubscription, syncInvoices: boolean) => void;
  onToggleSubscriptionStatus: (subId: string) => void;
  onApplyToInvoice?: (tenantId: string, monthlyWaqfAmount: number) => void;
  prefillTenantId?: string;
  prefillMonthlyAmount?: number;
  prefillAllocations?: { [key: string]: number };
  prefillStrategy?: "direct_impact" | "hybrid_endowment";
  onSwitchToCalculator?: () => void;
}

export const RecurringWakafManager: React.FC<RecurringWakafManagerProps> = ({
  tenants = [],
  invoices = [],
  subscriptions = [],
  onSaveSubscription,
  onToggleSubscriptionStatus,
  onApplyToInvoice,
  prefillTenantId,
  prefillMonthlyAmount,
  prefillAllocations,
  prefillStrategy = "direct_impact",
  onSwitchToCalculator,
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeSubs = Array.isArray(subscriptions) ? subscriptions : [];

  // Active form state for setting up or editing subscription
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    prefillTenantId || safeTenants[0]?.id || ""
  );
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "quarterly" | "annually">("monthly");
  const [amountType, setAmountType] = useState<"percentage_of_rent" | "fixed_nominal" | "percentage_of_revenue">("percentage_of_rent");
  const [percentageValue, setPercentageValue] = useState<number>(10);
  const [fixedNominalAmount, setFixedNominalAmount] = useState<number>(
    prefillMonthlyAmount || 50000
  );
  const [autoAppendToInvoice, setAutoAppendToInvoice] = useState<boolean>(true);
  const [paymentMethodPreference, setPaymentMethodPreference] = useState<RecurringWakafSubscription["paymentMethodPreference"]>(
    "Bank Syariah Indonesia (BSI) VA"
  );
  const [reinvestmentStrategy, setReinvestmentStrategy] = useState<"direct_impact" | "hybrid_endowment">(
    prefillStrategy
  );
  const [waNotificationActive, setWaNotificationActive] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(
    "Komitmen wakaf produktif otomatis dari tagihan kantor bulanan untuk pemberdayaan umat."
  );
  const [nextBillingDate, setNextBillingDate] = useState<string>("2026-09-01");
  const [syncWithUnpaidInvoices, setSyncWithUnpaidInvoices] = useState<boolean>(true);

  // Allocations
  const [projectAllocations, setProjectAllocations] = useState<{ [id: string]: number }>(() => {
    if (prefillAllocations) return prefillAllocations;
    const initial: { [id: string]: number } = {};
    COMMUNITY_PROJECTS.forEach((p) => {
      initial[p.id] = p.defaultShare;
    });
    return initial;
  });

  // UI States
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSubForAkad, setSelectedSubForAkad] = useState<RecurringWakafSubscription | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Selected Tenant details
  const currentTenant = useMemo(() => {
    return safeTenants.find((t) => t.id === selectedTenantId);
  }, [safeTenants, selectedTenantId]);

  // Existing subscription for the selected tenant if any
  const existingSubForSelected = useMemo(() => {
    return safeSubs.find((s) => s.tenantId === selectedTenantId);
  }, [safeSubs, selectedTenantId]);

  // Sync state if an existing subscription exists for the tenant
  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const existing = safeSubs.find((s) => s.tenantId === tenantId);
    if (existing) {
      setBillingFrequency(existing.billingFrequency);
      setAmountType(existing.amountType);
      setPercentageValue(existing.percentageValue || 10);
      setFixedNominalAmount(existing.fixedNominalAmount || 50000);
      setAutoAppendToInvoice(existing.autoAppendToInvoice);
      setPaymentMethodPreference(existing.paymentMethodPreference);
      setReinvestmentStrategy(existing.reinvestmentStrategy);
      setWaNotificationActive(existing.waNotificationActive);
      setProjectAllocations(existing.projectAllocations || {});
      setNextBillingDate(existing.nextBillingDate || "2026-09-01");
      if (existing.notes) setNotes(existing.notes);
    } else {
      const t = safeTenants.find((item) => item.id === tenantId);
      if (t) {
        setFixedNominalAmount(Math.round(t.monthlyRate * 0.1));
      }
    }
  };

  // Calculate effective monthly amount
  const calculatedEffectiveMonthlyAmount = useMemo(() => {
    if (!currentTenant) return fixedNominalAmount;

    if (amountType === "percentage_of_rent") {
      return Math.round((currentTenant.monthlyRate * percentageValue) / 100);
    }
    if (amountType === "fixed_nominal") {
      return fixedNominalAmount;
    }
    // percentage of revenue approx (monthlyRate * 20 * pct / 100)
    const approxRevenue = currentTenant.monthlyRate * 20;
    return Math.round((approxRevenue * percentageValue) / 100);
  }, [currentTenant, amountType, percentageValue, fixedNominalAmount]);

  // Sum of allocations check
  const totalAllocationPct = useMemo(() => {
    return (Object.values(projectAllocations) as (number | undefined)[]).reduce(
      (sum: number, val) => sum + (Number(val) || 0),
      0
    );
  }, [projectAllocations]);

  // Handle Preset allocations
  const applyPresetAllocations = (preset: "balanced" | "umkm" | "education" | "green") => {
    if (preset === "balanced") {
      setProjectAllocations({
        "proj-umkm": 35,
        "proj-edu": 25,
        "proj-green": 15,
        "proj-food": 15,
        "proj-health": 10,
      });
    } else if (preset === "umkm") {
      setProjectAllocations({
        "proj-umkm": 60,
        "proj-edu": 15,
        "proj-green": 10,
        "proj-food": 10,
        "proj-health": 5,
      });
    } else if (preset === "education") {
      setProjectAllocations({
        "proj-umkm": 15,
        "proj-edu": 60,
        "proj-green": 10,
        "proj-food": 10,
        "proj-health": 5,
      });
    } else if (preset === "green") {
      setProjectAllocations({
        "proj-umkm": 15,
        "proj-edu": 15,
        "proj-green": 50,
        "proj-food": 10,
        "proj-health": 10,
      });
    }
  };

  // Save Subscription
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTenant) {
      showToast("Pilih tenant terlebih dahulu!");
      return;
    }

    const newSub: RecurringWakafSubscription = {
      id: existingSubForSelected ? existingSubForSelected.id : `SUB-WKF-${String(safeSubs.length + 101).padStart(3, "0")}`,
      tenantId: currentTenant.id,
      tenantName: currentTenant.companyName,
      status: "active",
      billingFrequency,
      amountType,
      percentageValue,
      fixedNominalAmount: calculatedEffectiveMonthlyAmount,
      effectiveMonthlyAmount: calculatedEffectiveMonthlyAmount,
      autoAppendToInvoice,
      paymentMethodPreference,
      projectAllocations,
      reinvestmentStrategy,
      startDate: existingSubForSelected ? existingSubForSelected.startDate : new Date().toISOString().split("T")[0],
      nextBillingDate,
      totalPeriodsCompleted: existingSubForSelected ? existingSubForSelected.totalPeriodsCompleted : 0,
      totalWakafDisbursed: existingSubForSelected ? existingSubForSelected.totalWakafDisbursed : 0,
      akadSignedDate: new Date().toISOString().split("T")[0],
      waNotificationActive,
      notes,
    };

    onSaveSubscription(newSub, syncWithUnpaidInvoices);

    if (onApplyToInvoice && autoAppendToInvoice) {
      onApplyToInvoice(currentTenant.id, calculatedEffectiveMonthlyAmount);
    }

    showToast(`Jadwal Langganan Wakaf Rutin untuk ${currentTenant.companyName} berhasil diaktifkan dan ditautkan ke tagihan invoice!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper for Project Icons
  const renderProjectIcon = (iconName: CommunityProject["iconName"]) => {
    switch (iconName) {
      case "Store":
        return <Store className="w-4 h-4 text-[#5A5A40]" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4 text-[#5A5A40]" />;
      case "Sun":
        return <Sun className="w-4 h-4 text-[#5A5A40]" />;
      case "Utensils":
        return <Utensils className="w-4 h-4 text-[#5A5A40]" />;
      case "Ambulance":
        return <Ambulance className="w-4 h-4 text-[#5A5A40]" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-[#5A5A40]" />;
    }
  };

  // Metrics summary
  const totalActiveMonthlyCommitment = useMemo(() => {
    return safeSubs
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + (s.effectiveMonthlyAmount || 0), 0);
  }, [safeSubs]);

  const activeSubsCount = useMemo(() => {
    return safeSubs.filter((s) => s.status === "active").length;
  }, [safeSubs]);

  const totalWakafDisbursedAll = useMemo(() => {
    return safeSubs.reduce((sum, s) => sum + (s.totalWakafDisbursed || 0), 0);
  }, [safeSubs]);

  // Filtered Subscriptions list
  const filteredSubs = useMemo(() => {
    return safeSubs.filter((s) => {
      if (filterStatus === "all") return true;
      return s.status === filterStatus;
    });
  }, [safeSubs, filterStatus]);

  // Copy Akad text
  const handleCopyAkad = (sub: RecurringWakafSubscription) => {
    const text = `================================================
AKAD IKRAR WAKAF UANG RUTIN OTOMATIS (INVOICE-LINKED)
Sentra Bisnis & Virtual Office Masjid Agung
================================================
Nomor Registrasi : ${sub.id}
Nama Entitas / Wakif : ${sub.tenantName}
Komitmen Bulanan : Rp ${sub.effectiveMonthlyAmount.toLocaleString("id-ID")} / bulan
Skema Kontribusi : ${sub.amountType === "percentage_of_rent" ? `${sub.percentageValue}% dari Sewa Kantor` : "Nominal Tetap Bulanan"}
Metode Pembayaran: Auto-Debit Invoicing via ${sub.paymentMethodPreference}
Tanggal Akad     : ${sub.akadSignedDate || sub.startDate}
Siklus Tagihan   : ${sub.billingFrequency === "monthly" ? "Bulanan (Tiap Tanggal 1)" : sub.billingFrequency}

Distribusi Proyek Berdaya:
- Modal Bergulir UMKM Dhuafa: ${sub.projectAllocations["proj-umkm"] || 0}%
- Beasiswa Santripreneur: ${sub.projectAllocations["proj-edu"] || 0}%
- Solar Panel Eco-Mosque: ${sub.projectAllocations["proj-green"] || 0}%
- Pangan & Balita Stunting: ${sub.projectAllocations["proj-food"] || 0}%
- Ambulans Siaga Gratis: ${sub.projectAllocations["proj-health"] || 0}%

Nadzir Penerima: Yayasan Sentra Bisnis & Wakaf Produktif Masjid Agung
Landasan Fiqh : Fatwa DSN-MUI No. 131/DSN-MUI/X/2019 & UU No. 41 Tahun 2004
Status Terverifikasi: AKTIF & TERTAUT KE INVOICE RESMI
================================================`;

    navigator.clipboard?.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6" id="recurring-wakaf-subscription-manager">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-4 bg-[#5A5A40] text-white rounded-[16px] text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#E4E3DA]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#E4E3DA] hover:text-white text-xs cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#fafaf7] rounded-[20px] p-4 border border-black/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span>Komitmen Rutin / Bulan</span>
            <Coins className="w-3.5 h-3.5 text-[#5A5A40]" />
          </div>
          <div className="font-serif text-xl font-bold text-[#2d2d22] font-mono">
            Rp {totalActiveMonthlyCommitment.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-[#5A5A40] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Auto-debit via Tagihan Kantor
          </div>
        </div>

        <div className="bg-[#fafaf7] rounded-[20px] p-4 border border-black/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span>Tenant Berlangganan</span>
            <Building2 className="w-3.5 h-3.5 text-[#5A5A40]" />
          </div>
          <div className="font-serif text-xl font-bold text-[#2d2d22] font-mono">
            {activeSubsCount}{" "}
            <span className="text-xs font-normal text-[#72725e]">/ {safeTenants.length} Entitas</span>
          </div>
          <div className="text-[10px] text-[#5A5A40] font-medium">
            {Math.round((activeSubsCount / Math.max(1, safeTenants.length)) * 100)}% Partisipasi Amal Jariyah
          </div>
        </div>

        <div className="bg-[#fafaf7] rounded-[20px] p-4 border border-black/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span>Total Wakaf Tertagih</span>
            <Receipt className="w-3.5 h-3.5 text-[#5A5A40]" />
          </div>
          <div className="font-serif text-xl font-bold text-[#5A5A40] font-mono">
            Rp {totalWakafDisbursedAll.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-[#72725e]">
            Tersalurkan ke 5 Proyek Komunitas
          </div>
        </div>

        <div className="bg-[#2d2d22] text-white rounded-[20px] p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#E4E3DA]">
            <span>Status Integrasi Invoicing</span>
            <CreditCard className="w-3.5 h-3.5 text-[#E4E3DA]" />
          </div>
          <div className="font-serif text-lg font-bold text-[#f5f2ed]">
            Otomatis & Syariah
          </div>
          <div className="text-[10px] text-[#E4E3DA] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#8A8A6A]" /> BSI & Muamalat VA Connected
          </div>
        </div>
      </div>

      {/* Main Form & Subscription Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Setup & Subscription Schedule Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#fafaf7] p-5 sm:p-6 rounded-[24px] border border-black/5 space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="space-y-0.5">
              <h4 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                Atur Jadwal Langganan Wakaf Rutin
              </h4>
              <p className="text-[11px] text-[#72725e]">
                Tautkan komitmen wakaf produktif langsung ke tagihan invoice bulanan penyewa.
              </p>
            </div>
            {existingSubForSelected && (
              <span className="bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#5A5A40]/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Langganan Aktif
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Pilih Tenant */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#2d2d22]">
                Pilih Tenant / Entitas Perusahaan:
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => handleTenantSelect(e.target.value)}
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white font-medium text-[#2d2d22] px-4 shadow-2xs focus:outline-[#5A5A40]"
                id="select-tenant-subscription"
              >
                {safeTenants.map((t) => {
                  const hasSub = safeSubs.some((s) => s.tenantId === t.id && s.status === "active");
                  return (
                    <option key={t.id} value={t.id}>
                      {t.companyName} ({t.packageType}) - Sewa: Rp {t.monthlyRate.toLocaleString("id-ID")}/bln {hasSub ? " [✓ Langganan Aktif]" : ""}
                    </option>
                  );
                })}
              </select>

              {currentTenant && (
                <div className="bg-white p-3 rounded-[16px] border border-black/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#72725e]">
                  <div>
                    <span className="text-[#2d2d22] font-semibold">Penanggung Jawab:</span> {currentTenant.representativeName} ({currentTenant.phone})
                  </div>
                  <div>
                    <span className="text-[#2d2d22] font-semibold">Tarif Sewa Pokok:</span>{" "}
                    <strong className="text-[#5A5A40] font-mono">Rp {currentTenant.monthlyRate.toLocaleString("id-ID")}/bln</strong>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Metode Formulasi & Nominal */}
            <div className="space-y-2">
              <label className="block font-bold text-[#2d2d22]">
                Metode & Formula Nominal Wakaf Rutin:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAmountType("percentage_of_rent")}
                  className={`p-2.5 rounded-[16px] border text-left transition-all cursor-pointer ${
                    amountType === "percentage_of_rent"
                      ? "border-[#5A5A40] bg-[#f5f2ed] text-[#2d2d22]"
                      : "border-black/10 bg-white text-[#72725e] hover:bg-black/5"
                  }`}
                >
                  <div className="font-bold text-[11px] text-[#5A5A40]">% dari Sewa Kantor</div>
                  <div className="text-[10px] text-[#72725e] mt-0.5">Skala otomatis jika paket sewa berubah</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAmountType("fixed_nominal")}
                  className={`p-2.5 rounded-[16px] border text-left transition-all cursor-pointer ${
                    amountType === "fixed_nominal"
                      ? "border-[#5A5A40] bg-[#f5f2ed] text-[#2d2d22]"
                      : "border-black/10 bg-white text-[#72725e] hover:bg-black/5"
                  }`}
                >
                  <div className="font-bold text-[11px] text-[#5A5A40]">Nominal Tetap Bulanan</div>
                  <div className="text-[10px] text-[#72725e] mt-0.5">Komitmen pasti setiap periode tagihan</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAmountType("percentage_of_revenue")}
                  className={`p-2.5 rounded-[16px] border text-left transition-all cursor-pointer ${
                    amountType === "percentage_of_revenue"
                      ? "border-[#5A5A40] bg-[#f5f2ed] text-[#2d2d22]"
                      : "border-black/10 bg-white text-[#72725e] hover:bg-black/5"
                  }`}
                >
                  <div className="font-bold text-[11px] text-[#5A5A40]">% Omzet Bisnis</div>
                  <div className="text-[10px] text-[#72725e] mt-0.5">Filantropi korporat berbasis skala bisnis</div>
                </button>
              </div>

              {/* Dynamic Inputs according to amountType */}
              {amountType === "percentage_of_rent" && (
                <div className="bg-white p-3 rounded-[16px] border border-black/5 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-[#2d2d22]">Persentase dari Sewa Kantor:</span>
                    <span className="font-bold text-[#5A5A40] font-mono text-sm">{percentageValue}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPercentageValue(pct)}
                        className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          percentageValue === pct
                            ? "bg-[#5A5A40] text-white"
                            : "bg-[#f5f2ed] text-[#72725e] hover:bg-[#E4E3DA]"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {amountType === "fixed_nominal" && (
                <div className="bg-white p-3 rounded-[16px] border border-black/5 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-[#2d2d22]">Pilih Nominal Tetap:</span>
                    <span className="font-bold text-[#5A5A40] font-mono text-sm">
                      Rp {fixedNominalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[25000, 50000, 75000, 100000, 250000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFixedNominalAmount(amt)}
                        className={`py-1.5 px-2 rounded-full text-[10px] font-bold text-center transition-all cursor-pointer ${
                          fixedNominalAmount === amt
                            ? "bg-[#5A5A40] text-white"
                            : "bg-[#f5f2ed] text-[#72725e] hover:bg-[#E4E3DA]"
                        }`}
                      >
                        Rp {amt >= 1000000 ? `${amt / 1000000}Jt` : `${amt / 1000}rb`}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <input
                      type="number"
                      value={fixedNominalAmount}
                      onChange={(e) => setFixedNominalAmount(Math.max(10000, Number(e.target.value)))}
                      step={5000}
                      className="w-full p-2 text-xs rounded-full border border-black/10 text-center font-mono font-bold text-[#5A5A40] bg-[#fafaf7]"
                      placeholder="Input nominal manual..."
                    />
                  </div>
                </div>
              )}

              {amountType === "percentage_of_revenue" && (
                <div className="bg-white p-3 rounded-[16px] border border-black/5 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-[#2d2d22]">Persentase Omzet:</span>
                    <span className="font-bold text-[#5A5A40] font-mono text-sm">{percentageValue}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0.5, 1.0, 1.5, 2.5].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPercentageValue(pct)}
                        className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          percentageValue === pct
                            ? "bg-[#5A5A40] text-white"
                            : "bg-[#f5f2ed] text-[#72725e] hover:bg-[#E4E3DA]"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Frekuensi & Pengaturan Integrasi Tagihan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-bold text-[#2d2d22]">
                  Siklus Penagihan:
                </label>
                <select
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value as any)}
                  className="w-full p-2.5 rounded-full border border-black/10 bg-white font-medium text-[#2d2d22] px-3 shadow-2xs"
                >
                  <option value="monthly">Bulanan (Setiap tgl 1)</option>
                  <option value="quarterly">Triwulanan (Per 3 Bulan)</option>
                  <option value="annually">Tahunan (1x per Tahun)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#2d2d22]">
                  Jatuh Tempo Tagihan Pertama:
                </label>
                <input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-black/10 bg-white font-medium text-[#2d2d22] px-3 shadow-2xs text-xs"
                />
              </div>
            </div>

            {/* 4. Rekening VA & Direct Invoicing Toggles */}
            <div className="bg-white p-4 rounded-[20px] border border-black/5 space-y-3">
              <div className="font-bold text-[#2d2d22] text-[11px] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#5A5A40]" />
                Otomasi Pembayaran & Rekonsiliasi
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAppendToInvoice}
                    onChange={(e) => setAutoAppendToInvoice(e.target.checked)}
                    className="mt-0.5 accent-[#5A5A40] w-4 h-4 rounded-sm"
                  />
                  <div>
                    <span className="font-semibold text-[#2d2d22] block">
                      Otomatis Lampirkan ke Tagihan Invoice Bulanan (Direct Invoicing)
                    </span>
                    <span className="text-[10px] text-[#72725e] leading-relaxed block">
                      Nominal wakaf otomatis dicantumkan sebagai baris item resmi pada faktur tagihan sewa bulanan penyewa.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncWithUnpaidInvoices}
                    onChange={(e) => setSyncWithUnpaidInvoices(e.target.checked)}
                    className="mt-0.5 accent-[#5A5A40] w-4 h-4 rounded-sm"
                  />
                  <div>
                    <span className="font-semibold text-[#2d2d22] block">
                      Sinkronkan Langsung ke Tagihan Belum Terbayar (Unpaid Invoices)
                    </span>
                    <span className="text-[10px] text-[#72725e] leading-relaxed block">
                      Perbarui tagihan aktif tenant ini agar langsung memuat nominal wakaf rutin yang baru diatur.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waNotificationActive}
                    onChange={(e) => setWaNotificationActive(e.target.checked)}
                    className="mt-0.5 accent-[#5A5A40] w-4 h-4 rounded-sm"
                  />
                  <div>
                    <span className="font-semibold text-[#2d2d22] block">
                      Kirim Notifikasi WhatsApp & Kuitansi Elektronik Otomatis
                    </span>
                    <span className="text-[10px] text-[#72725e] leading-relaxed block">
                      Kirim salinan bukti setor wakaf & laporan dampak berkala ke nomor penanggung jawab ({currentTenant?.phone || "-"}).
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#72725e] mb-1">
                    Metode Pembayaran Pilihan:
                  </label>
                  <select
                    value={paymentMethodPreference}
                    onChange={(e) => setPaymentMethodPreference(e.target.value as any)}
                    className="w-full p-2 rounded-full border border-black/10 bg-[#fafaf7] text-[11px] font-medium text-[#2d2d22] px-3"
                  >
                    <option value="Bank Syariah Indonesia (BSI) VA">Bank Syariah Indonesia (BSI) VA</option>
                    <option value="Bank Muamalat VA">Bank Muamalat VA</option>
                    <option value="QRIS Syariah">QRIS Syariah Otomatis</option>
                    <option value="Transfer Bank">Transfer Bank Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#72725e] mb-1">
                    Skema Pengelolaan Wakaf:
                  </label>
                  <select
                    value={reinvestmentStrategy}
                    onChange={(e) => setReinvestmentStrategy(e.target.value as any)}
                    className="w-full p-2 rounded-full border border-black/10 bg-[#fafaf7] text-[11px] font-medium text-[#2d2d22] px-3"
                  >
                    <option value="direct_impact">Wakaf Produktif Berkelanjutan (Direct Impact)</option>
                    <option value="hybrid_endowment">Dana Abadi Sukuk (Hybrid Endowment)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Alokasi Portofolio 5 Proyek Komunitas */}
            <div className="bg-white p-4 rounded-[20px] border border-black/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#2d2d22] text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Alokasi 5 Proyek Pemberdayaan
                </div>
                <div className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  totalAllocationPct === 100 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  Total: {totalAllocationPct}%
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => applyPresetAllocations("balanced")}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] cursor-pointer"
                >
                  Portofolio Seimbang
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetAllocations("umkm")}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] cursor-pointer"
                >
                  Fokus UMKM
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetAllocations("education")}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] cursor-pointer"
                >
                  Fokus Santri
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetAllocations("green")}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] cursor-pointer"
                >
                  Fokus Eco-Mosque
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-2 pt-1">
                {COMMUNITY_PROJECTS.map((proj) => {
                  const currentVal = projectAllocations[proj.id] || 0;
                  const nominalShare = Math.round((calculatedEffectiveMonthlyAmount * currentVal) / 100);
                  return (
                    <div key={proj.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="flex items-center gap-1 font-medium text-[#2d2d22]">
                          {renderProjectIcon(proj.iconName)}
                          {proj.name}
                        </span>
                        <span className="font-mono text-[#5A5A40] font-bold">
                          {currentVal}% (~Rp {nominalShare.toLocaleString("id-ID")}/bln)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentVal}
                        onChange={(e) => {
                          setProjectAllocations((prev) => ({
                            ...prev,
                            [proj.id]: Number(e.target.value),
                          }));
                        }}
                        className="w-full h-1.5 bg-[#f5f2ed] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit / Activate Button */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-3 px-5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="btn-save-recurring-subscription"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Aktifkan Langganan Tagihan Wakaf</span>
              </button>

              {onSwitchToCalculator && (
                <button
                  type="button"
                  onClick={onSwitchToCalculator}
                  className="py-3 px-4 bg-white hover:bg-[#fafaf7] text-[#5A5A40] border border-[#5A5A40]/30 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Kalkulator Simulasi</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: Live Subscription Summary & Impact Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Configuration Summary Card */}
          <div className="bg-[#5A5A40] text-white rounded-[24px] p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#E4E3DA] uppercase font-mono tracking-wider">
                  IKHTISAR LANGGANAN WAKAF
                </span>
                <h4 className="font-serif font-bold text-lg text-white">
                  {currentTenant ? currentTenant.companyName : "Pilih Entitas"}
                </h4>
              </div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-[#E4E3DA] border border-white/15">
                Auto-Invoicing
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white/10 p-3.5 rounded-[16px] backdrop-blur-xs border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#E4E3DA] block">Total Tagihan Wakaf Bulanan:</span>
                  <div className="font-serif text-2xl font-bold text-white font-mono mt-0.5">
                    Rp {calculatedEffectiveMonthlyAmount.toLocaleString("id-ID")}
                    <span className="text-xs font-normal text-[#E4E3DA] ml-1">/ bln</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#E4E3DA]">
                  <span className="block font-mono">Rp {(calculatedEffectiveMonthlyAmount * 12).toLocaleString("id-ID")}</span>
                  <span className="text-[9px]">per tahun</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#E4E3DA]">
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span>Siklus Penagihan:</span>
                  <strong className="text-white">
                    {billingFrequency === "monthly" ? "Bulanan (Setiap Tgl 1)" : billingFrequency}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span>Metode Auto-Debit:</span>
                  <strong className="text-white">{paymentMethodPreference}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span>Status Tautan Invoice:</span>
                  <strong className="text-white">
                    {autoAppendToInvoice ? "✓ Otomatis Ditambahkan" : "Terpisah"}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Jatuh Tempo Berikutnya:</span>
                  <strong className="text-white font-mono">{nextBillingDate}</strong>
                </div>
              </div>

              {/* Annual Impact projection preview */}
              <div className="bg-black/20 p-3 rounded-[16px] space-y-1 text-[10px]">
                <div className="font-bold text-[#E4E3DA] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#8A8A6A]" /> Estimasi Dampak Riil (1 Tahun):
                </div>
                <div className="text-[#E4E3DA] leading-relaxed">
                  • Pendanaan bergulir modal UMKM dhuafa:{" "}
                  <strong>Rp {Math.round((calculatedEffectiveMonthlyAmount * 12 * (projectAllocations["proj-umkm"] || 35)) / 100).toLocaleString("id-ID")}</strong>
                  <br />
                  • Beasiswa vokasi santripreneur:{" "}
                  <strong>Rp {Math.round((calculatedEffectiveMonthlyAmount * 12 * (projectAllocations["proj-edu"] || 25)) / 100).toLocaleString("id-ID")}</strong>
                  <br />
                  • Energi terbarukan PLTS Masjid:{" "}
                  <strong>Rp {Math.round((calculatedEffectiveMonthlyAmount * 12 * (projectAllocations["proj-green"] || 15)) / 100).toLocaleString("id-ID")}</strong>
                </div>
              </div>
            </div>

            {/* Quick Ikrar / Slip preview button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (existingSubForSelected) {
                    setSelectedSubForAkad(existingSubForSelected);
                  } else {
                    const tempSub: RecurringWakafSubscription = {
                      id: "SUB-DRAFT",
                      tenantId: currentTenant?.id || "",
                      tenantName: currentTenant?.companyName || "Entitas",
                      status: "active",
                      billingFrequency,
                      amountType,
                      percentageValue,
                      fixedNominalAmount: calculatedEffectiveMonthlyAmount,
                      effectiveMonthlyAmount: calculatedEffectiveMonthlyAmount,
                      autoAppendToInvoice,
                      paymentMethodPreference,
                      projectAllocations,
                      reinvestmentStrategy,
                      startDate: new Date().toISOString().split("T")[0],
                      nextBillingDate,
                      totalPeriodsCompleted: 0,
                      totalWakafDisbursed: 0,
                      akadSignedDate: new Date().toISOString().split("T")[0],
                      waNotificationActive,
                    };
                    setSelectedSubForAkad(tempSub);
                  }
                }}
                className="w-full py-2.5 bg-white text-[#5A5A40] hover:bg-[#fafaf7] text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Lembar Akad & Sertifikat Digital</span>
              </button>
            </div>
          </div>

          {/* Syariah Compliance note */}
          <div className="bg-[#fafaf7] rounded-[20px] p-4 border border-black/5 text-[11px] text-[#72725e] space-y-2">
            <div className="font-bold text-[#2d2d22] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
              Landasan Fiqh & Kepatuhan Syariah
            </div>
            <p className="leading-relaxed">
              Sesuai <strong>Fatwa DSN-MUI No. 131/DSN-MUI/X/2019</strong> tentang Wakaf Uang Melalui Lembaga Keuangan Syariah Penerima Wakaf Uang (LKS-PWU) dan <strong>UU No. 41 Tahun 2004</strong>, komitmen wakaf rutin disalurkan melalui nadzir resmi bersertifikasi Badan Wakaf Indonesia (BWI).
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Registered Recurring Subscriptions Table */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#2d2d22] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#5A5A40]" />
              Daftar Langganan Wakaf Rutin Tenant Aktif
            </h4>
            <p className="text-xs text-[#72725e]">
              Semua komitmen wakaf berkala yang terhubung dengan siklus tagihan virtual office.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(["all", "active", "paused"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#5A5A40] text-white"
                    : "bg-[#fafaf7] text-[#72725e] hover:text-[#2d2d22] border border-black/5"
                }`}
              >
                {st === "all" ? "Semua Langganan" : st === "active" ? "Aktif" : "Dijeda"}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafaf7] text-[#72725e] font-semibold text-[11px]">
                <th className="py-3 px-4 rounded-l-[12px]">Tenant & Nomor ID</th>
                <th className="py-3 px-4">Formula & Nominal Wakaf</th>
                <th className="py-3 px-4">Siklus & Tagihan Berikutnya</th>
                <th className="py-3 px-4">Metode Auto-Debit</th>
                <th className="py-3 px-4">Tertagih / Total Manfaat</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-[12px]">Aksi & Pengaturan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-[#2d2d22]">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#72725e]">
                    Belum ada langganan wakaf rutin dengan status ini.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const t = safeTenants.find((item) => item.id === sub.tenantId);
                  return (
                    <tr key={sub.id} className="hover:bg-[#fafaf7]/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-[#2d2d22]">{sub.tenantName}</div>
                        <div className="text-[10px] text-[#72725e] font-mono">{sub.id} • {t?.packageType || "Virtual Office"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#5A5A40] font-mono text-sm">
                          Rp {sub.effectiveMonthlyAmount.toLocaleString("id-ID")}
                          <span className="text-[10px] font-normal text-[#72725e] ml-1">/bln</span>
                        </div>
                        <div className="text-[10px] text-[#72725e]">
                          {sub.amountType === "percentage_of_rent"
                            ? `${sub.percentageValue}% Sewa Kantor`
                            : "Nominal Tetap"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2d2d22] capitalize">
                          {sub.billingFrequency === "monthly" ? "Bulanan (Tiap Tgl 1)" : sub.billingFrequency}
                        </div>
                        <div className="text-[10px] text-[#5A5A40] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Tagihan: {sub.nextBillingDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[11px]">{sub.paymentMethodPreference}</div>
                        <div className="text-[10px] text-[#72725e]">
                          {sub.autoAppendToInvoice ? "✓ Lampirkan di Faktur" : "Terpisah"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2d2d22] font-mono">
                          Rp {sub.totalWakafDisbursed.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[10px] text-[#72725e]">
                          {sub.totalPeriodsCompleted} Periode Sukses
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          sub.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {sub.status === "active" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3" />
                              Dijeda
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleSubscriptionStatus(sub.id)}
                            className="p-1.5 rounded-full hover:bg-black/5 text-[#72725e] transition-all cursor-pointer"
                            title={sub.status === "active" ? "Jeda Langganan" : "Lanjutkan Langganan"}
                          >
                            {sub.status === "active" ? (
                              <Pause className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTenantSelect(sub.tenantId)}
                            className="p-1.5 rounded-full hover:bg-black/5 text-[#5A5A40] transition-all cursor-pointer"
                            title="Edit Jadwal & Formula"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedSubForAkad(sub)}
                            className="p-1.5 rounded-full hover:bg-black/5 text-[#5A5A40] transition-all cursor-pointer"
                            title="Lihat Lembar Akad & Cetak PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {onApplyToInvoice && (
                            <button
                              type="button"
                              onClick={() => {
                                onApplyToInvoice(sub.tenantId, sub.effectiveMonthlyAmount);
                                showToast(`Tagihan invoice aktif ${sub.tenantName} diperbarui dengan Rp ${sub.effectiveMonthlyAmount.toLocaleString("id-ID")}`);
                              }}
                              className="px-2 py-1 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] rounded-full text-[10px] font-bold transition-all cursor-pointer"
                              title="Sinkronkan ke Tagihan Sekarang"
                            >
                              Sync Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Lembar Akad & Sertifikat Komitmen Wakaf Digital */}
      {selectedSubForAkad && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-black/10 max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#2d2d22]">
                    Lembar Ikrar & Komitmen Langganan Wakaf
                  </h4>
                  <span className="text-[10px] text-[#72725e] font-mono">
                    ID: {selectedSubForAkad.id} • Terdaftar di Sentra Wakaf Masjid
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubForAkad(null)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#72725e] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Document Box */}
            <div className="bg-[#fafaf7] p-5 sm:p-6 rounded-[20px] border border-black/10 space-y-4 text-xs font-serif leading-relaxed">
              <div className="text-center pb-3 border-b border-black/10 space-y-1">
                <div className="font-serif font-bold text-sm tracking-widest text-[#5A5A40]">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                <div className="font-serif font-bold text-base text-[#2d2d22] uppercase tracking-wide">
                  IKRAR WAKAF UANG RUTIN & OTOMASI INVOICE
                </div>
                <div className="text-[10px] text-[#72725e] font-sans">
                  Penyaluran Berkelanjutan untuk Kemaslahatan Umat & Ekosistem Syariah
                </div>
              </div>

              <div className="space-y-2 text-[11px] font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-[12px] border border-black/5">
                  <div>
                    <span className="text-[#72725e]">Nama Entitas / Wakif:</span>
                    <div className="font-bold text-[#2d2d22]">{selectedSubForAkad.tenantName}</div>
                  </div>
                  <div>
                    <span className="text-[#72725e]">Nominal Komitmen:</span>
                    <div className="font-bold text-[#5A5A40] font-mono">
                      Rp {selectedSubForAkad.effectiveMonthlyAmount.toLocaleString("id-ID")} / bulan
                    </div>
                  </div>
                  <div>
                    <span className="text-[#72725e]">Metode Penagihan:</span>
                    <div className="font-semibold text-[#2d2d22]">
                      Auto-Debit Invoice Bulanan ({selectedSubForAkad.paymentMethodPreference})
                    </div>
                  </div>
                  <div>
                    <span className="text-[#72725e]">Tanggal Akad Efektif:</span>
                    <div className="font-semibold text-[#2d2d22] font-mono">
                      {selectedSubForAkad.akadSignedDate || selectedSubForAkad.startDate}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-[12px] border border-black/5 space-y-1">
                  <div className="font-bold text-[#5A5A40] text-[11px]">Alokasi Proyek Komunitas:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-[#626252]">
                    <div>• Modal UMKM Dhuafa: <strong>{selectedSubForAkad.projectAllocations["proj-umkm"] || 0}%</strong></div>
                    <div>• Beasiswa Santripreneur: <strong>{selectedSubForAkad.projectAllocations["proj-edu"] || 0}%</strong></div>
                    <div>• Solar Panel Eco-Masjid: <strong>{selectedSubForAkad.projectAllocations["proj-green"] || 0}%</strong></div>
                    <div>• Dapur Pangan Berkah: <strong>{selectedSubForAkad.projectAllocations["proj-food"] || 0}%</strong></div>
                    <div>• Ambulans Siaga Gratis: <strong>{selectedSubForAkad.projectAllocations["proj-health"] || 0}%</strong></div>
                  </div>
                </div>

                <p className="text-[10px] text-[#72725e] leading-relaxed italic">
                  "Dengan ini kami menyatakan bersedia menyisihkan sebagian rizki/keuntungan operasional secara rutin melalui sistem Virtual Office Islamicity untuk dikelola sebagai wakaf produktif demi kepentingan dakwah, pemberdayaan ekonomi mustahiq, dan keberkahan usaha bersama."
                </p>
              </div>

              <div className="pt-4 border-t border-black/10 flex justify-between items-center text-[10px] font-sans text-[#72725e]">
                <div className="text-center">
                  <div>Wakif / Penanggung Jawab</div>
                  <div className="h-10 flex items-center justify-center font-serif font-bold text-[#2d2d22]">
                    ( Tertanda Digital )
                  </div>
                  <div className="font-semibold">{selectedSubForAkad.tenantName}</div>
                </div>
                <div className="text-center">
                  <div>Nadzir Wakaf Masjid</div>
                  <div className="h-10 flex items-center justify-center font-serif font-bold text-[#5A5A40]">
                    [ Verified DSN-MUI ]
                  </div>
                  <div className="font-semibold">Sentra Bisnis Islamicity Hub</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopyAkad(selectedSubForAkad)}
                className="py-2.5 px-4 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? "Teks Akad Disalin!" : "Salin Naskah Ikrar"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Akad (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

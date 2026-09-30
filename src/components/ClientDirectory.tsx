import React, { useState } from "react";
import { Tenant, TenantSatisfactionSurvey } from "../types";
import { TenantSatisfactionModal } from "./TenantSatisfactionModal";
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  Printer,
  FileText,
  Award,
  Sparkles,
  Star,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  Smile,
} from "lucide-react";

interface ClientDirectoryProps {
  tenants: Tenant[];
  onAddTenant: (newTenant: Tenant) => void;
  surveys?: TenantSatisfactionSurvey[];
  onAddSurvey?: (survey: TenantSatisfactionSurvey) => void;
}

export const ClientDirectory: React.FC<ClientDirectoryProps> = ({
  tenants = [],
  onAddTenant,
  surveys = [],
  onAddSurvey = () => {},
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeSurveys = Array.isArray(surveys) ? surveys : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [selectedTenantForDomisili, setSelectedTenantForDomisili] = useState<Tenant | null>(null);

  // Tenant Satisfaction Survey Modal State
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveyTargetTenantId, setSurveyTargetTenantId] = useState<string | null>(null);

  // CSAT Metrics Calculations
  const totalSurveys = safeSurveys.length;
  const avgOverallRating = totalSurveys > 0
    ? (safeSurveys.reduce((acc, s) => acc + s.ratings.overall, 0) / totalSurveys).toFixed(1)
    : "5.0";
  const avgNpsScore = totalSurveys > 0
    ? (safeSurveys.reduce((acc, s) => acc + s.npsRecommendationScore, 0) / totalSurveys).toFixed(1)
    : "10.0";
  const resolvedCount = safeSurveys.filter((s) => s.status === "resolved").length;

  const handleOpenSurvey = (tenantId?: string) => {
    setSurveyTargetTenantId(tenantId || null);
    setIsSurveyModalOpen(true);
  };

  // New Tenant Form State
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState<Tenant["businessType"]>("PT");
  const [businessSector, setBusinessSector] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("Kompleks Masjid Agung Syariah Hub, Suite 309, Jakarta");
  const [packageType, setPackageType] = useState<Tenant["packageType"]>("Paket Pro Sharia Office");
  const [monthlyRate, setMonthlyRate] = useState(450000);
  const [shariaComplianceVerified, setShariaComplianceVerified] = useState(true);

  const filteredTenants = safeTenants.filter((t) => {
    const matchSearch =
      (t.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.representativeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.businessSector || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && t.status === "active") ||
      (statusFilter === "Expiring Soon" && t.status === "expiring_soon");
    return matchSearch && matchStatus;
  });

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !representativeName || !email) return;

    const quotaHours =
      packageType === "Paket Executive Suite"
        ? 16
        : packageType === "Paket Pro Sharia Office"
        ? 8
        : 4;

    const newTenant: Tenant = {
      id: `TNT-${String(safeTenants.length + 1).padStart(3, "0")}`,
      companyName,
      businessType,
      businessSector,
      representativeName,
      email,
      phone,
      registeredAddress,
      packageType,
      monthlyRate,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      status: "active",
      kycVerified: true,
      shariaComplianceVerified,
      meetingQuotaHours: quotaHours,
      meetingQuotaUsed: 0,
      coworkingDeskQuotaDays: 4,
      coworkingDeskQuotaUsed: 0,
      uncollectedMailsCount: 0,
      wakafEndowmentContributed: Math.round(monthlyRate * 0.05),
    };

    onAddTenant(newTenant);
    setIsOnboardingModalOpen(false);
    // Reset
    setCompanyName("");
    setBusinessSector("");
    setRepresentativeName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              SOP-IVO-04 & SOP-IVO-06
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              Verifikasi Legalitas Halal & Monitoring Mutu Layanan
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
            Direktori Tenant & Administrasi Klien Virtual Office
          </h2>
          <p className="text-xs sm:text-sm text-[#626252] max-w-2xl leading-relaxed">
            Pengelolaan data penyewa, verifikasi berkas hukum (NIB, KTP, NPWP, Akta), kepatuhan Fiqh Muamalah, monitoring kuota fasilitas, log survei kepuasan berkala, dan penerbitan Surat Keterangan Domisili.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenSurvey()}
            className="px-4 py-2.5 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] border border-[#5A5A40]/25 text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Star className="w-4 h-4 fill-[#5A5A40] text-[#5A5A40]" />
            <span>Survei Kepuasan Tenant</span>
          </button>

          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrasi Klien Baru (Onboarding)</span>
          </button>
        </div>
      </div>

      {/* CSAT Quality Summary Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                Ringkasan Mutu & Indeks Kepuasan Tenant (CSAT & NPS)
              </h3>
              <p className="text-[11px] text-[#72725e]">
                Evaluasi periodik manajer kantor terhadap SLA surat kilat, adab resepsionis, fasilitas ibadah, & nilai berkah wakaf.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenSurvey()}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#5A5A40] hover:bg-[#383827] text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Evaluasi / Feedback Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
            <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#5A5A40] fill-[#5A5A40]" />
              <span>Rata-Rata CSAT:</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                {avgOverallRating}
              </span>
              <span className="text-xs font-mono text-[#72725e]">/ 5.0</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40] ml-auto">
                Sangat Puas
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
            <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Net Promoter Score:</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                {avgNpsScore}
              </span>
              <span className="text-xs font-mono text-[#72725e]">/ 10</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/15 ml-auto">
                Promotor
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
            <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Total Feedback Terarsip:</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                {totalSurveys}
              </span>
              <span className="text-xs text-[#72725e]">Sesi Evaluasi</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
            <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Tindak Lanjut Tuntas:</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                {resolvedCount} / {totalSurveys}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40] ml-auto">
                {totalSurveys > 0 ? `${Math.round((resolvedCount / totalSurveys) * 100)}%` : "100%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[20px] border border-black/5 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#f5f5f0]/60 px-3.5 py-1.5 rounded-full border border-[#5A5A40]/15">
          <Search className="w-4 h-4 text-[#72725e]" />
          <input
            type="text"
            placeholder="Cari nama perusahaan, direktur, sektor usaha, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border-none focus:outline-hidden text-[#2d2d22] placeholder-[#72725e]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#72725e] font-medium">Filter Status:</span>
          {["All", "Active", "Expiring Soon"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-[#5A5A40] text-white"
                  : "border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTenants.map((t) => {
          const isExpiring = t.status === "expiring_soon";
          const tenantSurveysList = safeSurveys.filter((s) => s.tenantId === t.id);
          const latestSurvey = tenantSurveysList[0];

          return (
            <div
              key={t.id}
              className={`p-6 rounded-[24px] border transition-all bg-white flex flex-col justify-between shadow-xs ${
                isExpiring
                  ? "border-[#5A5A40]/40 bg-[#f5f2ed]/30"
                  : "border-black/5 hover:border-[#5A5A40]/30"
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#f5f5f0] text-[#5A5A40] border border-[#5A5A40]/15">
                    {t.id}
                  </span>
                  <div className="flex items-center gap-1">
                    {t.kycVerified && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center gap-1 border border-[#5A5A40]/15">
                        <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" /> KYC Sah
                      </span>
                    )}
                    {t.shariaComplianceVerified && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#383827] border border-[#5A5A40]/20">
                        Halal Verified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-[#2d2d22] text-base">{t.companyName}</h3>
                  <div className="text-xs text-[#72725e] font-medium mt-0.5">{t.businessSector}</div>
                </div>

                <div className="bg-[#f5f5f0]/80 rounded-[18px] p-3.5 border border-black/5 space-y-1.5 text-xs text-[#3a3a2e]">
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Pimpinan / PIC:</span>
                    <strong className="text-[#2d2d22]">{t.representativeName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Paket Layanan:</span>
                    <span className="font-semibold text-[#5A5A40]">{t.packageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72725e]">Masa Berlaku:</span>
                    <span className="font-mono text-[#626252]">{t.startDate} s/d {t.endDate}</span>
                  </div>
                </div>

                {/* Latest Survey & Feedback Pill */}
                <div className="p-2.5 rounded-[16px] bg-[#fafaf7] border border-black/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#72725e] flex items-center gap-1 font-medium">
                      <Star className="w-3 h-3 text-[#5A5A40] fill-[#5A5A40]" />
                      Indeks Kepuasan (CSAT):
                    </span>
                    {latestSurvey ? (
                      <span className="font-mono font-bold text-[#5A5A40] bg-[#E4E3DA] px-2 py-0.5 rounded-full">
                        ⭐ {latestSurvey.ratings.overall}.0 / 5 ({latestSurvey.satisfactionLevel})
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#72725e] italic">Belum Ada Sesi Log</span>
                    )}
                  </div>
                  {latestSurvey && (
                    <p className="text-[10px] text-[#626252] line-clamp-1 italic">
                      "{latestSurvey.feedbackNotes}"
                    </p>
                  )}
                </div>

                {/* Quota & Mail Pill */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-[#f5f2ed] rounded-[14px] p-2.5 text-[#383827] border border-[#5A5A40]/15">
                    <div className="text-[#72725e] text-[10px]">Kuota Meeting:</div>
                    <div className="font-bold font-mono">
                      {t.meetingQuotaHours - t.meetingQuotaUsed} / {t.meetingQuotaHours} Jam Sisa
                    </div>
                  </div>
                  <div className="bg-[#E4E3DA] rounded-[14px] p-2.5 text-[#383827] border border-[#5A5A40]/20">
                    <div className="text-[#72725e] text-[10px]">Surat di Locker:</div>
                    <div className="font-bold font-mono">{t.uncollectedMailsCount} Surat Aktif</div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between gap-2 text-xs">
                <div className="text-[10px] text-[#72725e]">
                  Wakaf: <strong>Rp {t.wakafEndowmentContributed.toLocaleString("id-ID")}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenSurvey(t.id)}
                    className="px-3 py-1.5 rounded-full bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-[#5A5A40]/20"
                    title="Catat Evaluasi & Survei Kepuasan Tenant"
                  >
                    <Star className="w-3.5 h-3.5 fill-[#5A5A40] text-[#5A5A40]" />
                    <span>Survei</span>
                  </button>

                  <button
                    onClick={() => setSelectedTenantForDomisili(t)}
                    className="px-3 py-1.5 rounded-full border border-[#5A5A40]/20 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Domisili</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Tenant Satisfaction Survey */}
      <TenantSatisfactionModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        tenants={tenants}
        surveys={surveys}
        onAddSurvey={onAddSurvey}
        preSelectedTenantId={surveyTargetTenantId}
      />

      {/* Modal: Onboarding New Client */}
      {isOnboardingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
                  Registrasi & Onboarding Client Baru
                </h3>
                <p className="text-xs text-[#72725e]">
                  SOP-IVO-04: Verifikasi KYC, Legalitas PT/CV & Kepatuhan Bisnis Syariah
                </p>
              </div>
              <button
                onClick={() => setIsOnboardingModalOpen(false)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Nama Entitas / Perusahaan:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Berkah Halal Food"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] px-4"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Bentuk Badan Usaha:
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as any)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-4"
                  >
                    <option value="PT">PT (Perseroan Terbatas)</option>
                    <option value="CV">CV</option>
                    <option value="Koperasi Syariah">Koperasi Syariah</option>
                    <option value="Yayasan">Yayasan Sosial</option>
                    <option value="UMKM Komunitas Masjid">UMKM Komunitas Masjid</option>
                    <option value="Perorangan / Freelancer">Perorangan / Freelancer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Sektor / Bidang Usaha:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: E-Commerce Busana Muslim & Fesyen"
                    value={businessSector}
                    onChange={(e) => setBusinessSector(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Nama Direktur / Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Direktur sesuai KTP"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Email Resmi:</label>
                  <input
                    type="email"
                    required
                    placeholder="direksi@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Nomor WhatsApp PIC:</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Paket Sewa:</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as any)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-4"
                  >
                    <option value="Paket Berdaya Basic">Paket Berdaya Basic (Rp 250rb)</option>
                    <option value="Paket Pro Sharia Office">Paket Pro Sharia Office (Rp 450rb)</option>
                    <option value="Paket Executive Suite">Paket Executive Suite (Rp 750rb)</option>
                    <option value="Paket Komunitas Masjid Hub">Paket Masjid Hub (Rp 150rb)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Alokasi Suite/Ruang:</label>
                  <input
                    type="text"
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
              </div>

              {/* Halal Compliance Check */}
              <div className="bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-[20px] p-4 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer text-[#2d2d22] font-semibold">
                  <input
                    type="checkbox"
                    checked={shariaComplianceVerified}
                    onChange={(e) => setShariaComplianceVerified(e.target.checked)}
                    className="rounded-sm text-[#5A5A40] mt-0.5 accent-[#5A5A40]"
                  />
                  <span className="leading-relaxed text-xs text-[#383827]">
                    Pernyataan Integritas Usaha Syariah: Klien bebas dari sektor usaha miras, perjudian/taruhan, pornografi, pinjaman berbunga (riba), dan skema penipuan keuangan.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="px-4 py-2 text-[#72725e] hover:bg-[#f5f5f0] font-semibold rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan Onboarding & Aktifkan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Certificate of Domicile (Surat Keterangan Domisili) */}
      {selectedTenantForDomisili && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#5A5A40]/15 font-mono">
                Dokumen Resmi Domisili Kantor Virtual
              </span>
              <button
                onClick={() => setSelectedTenantForDomisili(null)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border border-black/10 p-6 rounded-[20px] space-y-4 font-serif text-xs leading-relaxed text-[#2d2d22] bg-[#f5f5f0]/50">
              <div className="text-center space-y-1 pb-3 border-b-2 border-[#5A5A40]">
                <h3 className="font-bold text-base uppercase tracking-wider text-[#2d2d22]">
                  ISLAMICITY VIRTUAL OFFICE & SHARIA CO-WORKING HUB
                </h3>
                <p className="text-[11px] text-[#72725e] font-sans">
                  Gedung Sentra Bisnis Komunitas Masjid Agung, Jl. Sudirman Kav. 52, Jakarta Selatan
                </p>
                <p className="text-[10px] text-[#72725e] font-sans">
                  Izin OSS KBLI 82110 / 68111 • NPWP Pengelola: 01.992.839.1-012.000
                </p>
              </div>

              <div className="text-center py-1">
                <h4 className="font-bold text-sm uppercase underline decoration-[#5A5A40]/40">
                  SURAT KETERANGAN DOMISILI KANTOR VIRTUAL (VIRTUAL OFFICE)
                </h4>
                <div className="text-[11px] font-sans font-mono text-[#72725e]">
                  Nomor: SKD/IVO/DOM/{new Date().getFullYear()}/0892
                </div>
              </div>

              <p>
                Yang bertanda tangan di bawah ini, Pengelola Layanan Virtual Office Sentra Bisnis Masjid, menerangkan dengan sebenarnya bahwa:
              </p>

              <div className="space-y-1.5 pl-4 font-sans text-xs">
                <div className="grid grid-cols-3">
                  <span className="text-[#72725e]">Nama Perusahaan:</span>
                  <span className="col-span-2 font-bold text-[#2d2d22]">{selectedTenantForDomisili.companyName}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-[#72725e]">Bentuk Badan Usaha:</span>
                  <span className="col-span-2 text-[#3a3a2e]">{selectedTenantForDomisili.businessType}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-[#72725e]">Nama Penanggung Jawab:</span>
                  <span className="col-span-2 font-bold text-[#2d2d22]">{selectedTenantForDomisili.representativeName}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-[#72725e]">Bidang Usaha:</span>
                  <span className="col-span-2 text-[#3a3a2e]">{selectedTenantForDomisili.businessSector}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-[#72725e]">Alamat Kantor Virtual:</span>
                  <span className="col-span-2 font-bold text-[#2d2d22]">{selectedTenantForDomisili.registeredAddress}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-[#72725e]">Masa Berlaku Perjanjian:</span>
                  <span className="col-span-2 text-[#3a3a2e] font-mono">{selectedTenantForDomisili.startDate} s/d {selectedTenantForDomisili.endDate}</span>
                </div>
              </div>

              <p>
                Benar tercatat aktif sebagai penyewa resmi layanan domisili virtual office dan berhak mempergunakan alamat tersebut di atas untuk keperluan administrasi perpajakan, perbankan, dan legalitas OSS RBA.
              </p>

              <div className="pt-6 flex justify-between font-sans text-xs text-center">
                <div></div>
                <div className="space-y-12">
                  <div>Jakarta, {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}<br /><strong>PENGELOLA VIRTUAL OFFICE</strong></div>
                  <div>
                    <strong className="underline text-[#2d2d22]">Drs. H. Muhammad Arifin</strong><br />
                    <span className="text-[#72725e]">Direktur Operasional & Layanan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Keterangan Domisili Resmi (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

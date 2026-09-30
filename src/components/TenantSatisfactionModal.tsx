import React, { useState } from "react";
import { Tenant, TenantSatisfactionSurvey, SurveyRatings } from "../types";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  User,
  Calendar,
  Sparkles,
  Award,
  History,
  PlusCircle,
  TrendingUp,
  FileCheck,
  Building,
  Layers,
  Smile,
  Send,
  HelpCircle,
} from "lucide-react";

interface TenantSatisfactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  surveys: TenantSatisfactionSurvey[];
  onAddSurvey: (survey: TenantSatisfactionSurvey) => void;
  preSelectedTenantId?: string | null;
}

export const TenantSatisfactionModal: React.FC<TenantSatisfactionModalProps> = ({
  isOpen,
  onClose,
  tenants = [],
  surveys = [],
  onAddSurvey,
  preSelectedTenantId,
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeSurveys = Array.isArray(surveys) ? surveys : [];

  const [activeTab, setActiveTab] = useState<"new_survey" | "history">("new_survey");
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    preSelectedTenantId || safeTenants[0]?.id || ""
  );

  // Form States
  const [period, setPeriod] = useState<string>("Evaluasi Triwulan Q3 2026");
  const [surveyDate, setSurveyDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loggedByManager, setLoggedByManager] = useState<string>(
    "Ustadz Ahmad Fauzi (Office Manager)"
  );
  const [respondentName, setRespondentName] = useState<string>("");
  const [respondentRole, setRespondentRole] = useState<string>("Direktur Utama");

  // Rating States (1-5)
  const [ratings, setRatings] = useState<SurveyRatings>({
    overall: 5,
    mailHandling: 5,
    facilityCleanliness: 5,
    receptionistService: 5,
    shariaAtmosphere: 5,
    valueAndTransparency: 5,
  });

  const [npsScore, setNpsScore] = useState<number>(10);
  const [satisfactionLevel, setSatisfactionLevel] = useState<
    TenantSatisfactionSurvey["satisfactionLevel"]
  >("Sangat Puas");
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [actionItems, setActionItems] = useState<string>("");
  const [status, setStatus] = useState<TenantSatisfactionSurvey["status"]>("resolved");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync respondent name when tenant changes
  React.useEffect(() => {
    if (selectedTenantId) {
      const tenant = safeTenants.find((t) => t.id === selectedTenantId);
      if (tenant) {
        setRespondentName(tenant.representativeName);
      }
    }
  }, [selectedTenantId, safeTenants]);

  // Update preselected tenant if passed from prop
  React.useEffect(() => {
    if (preSelectedTenantId) {
      setSelectedTenantId(preSelectedTenantId);
    }
  }, [preSelectedTenantId]);

  if (!isOpen) return null;

  const currentTenant = safeTenants.find((t) => t.id === selectedTenantId) || safeTenants[0];
  const tenantSurveys = safeSurveys.filter((s) => s.tenantId === selectedTenantId);

  // Calculate Overall Satisfaction Level based on overall rating
  const handleRatingChange = (category: keyof SurveyRatings, value: number) => {
    const newRatings = { ...ratings, [category]: value };
    setRatings(newRatings);

    if (category === "overall") {
      if (value === 5) setSatisfactionLevel("Sangat Puas");
      else if (value === 4) setSatisfactionLevel("Puas");
      else if (value === 3) setSatisfactionLevel("Cukup");
      else setSatisfactionLevel("Perlu Perhatian");
    }
  };

  // Quick Preset Templates
  const applyPreset = (type: "sangat_puas" | "usulan_fasilitas" | "onboarding") => {
    if (type === "sangat_puas") {
      setPeriod("Evaluasi Triwulan Q3 2026");
      setRatings({
        overall: 5,
        mailHandling: 5,
        facilityCleanliness: 5,
        receptionistService: 5,
        shariaAtmosphere: 5,
        valueAndTransparency: 5,
      });
      setNpsScore(10);
      setSatisfactionLevel("Sangat Puas");
      setFeedbackNotes(
        "Sangat mengapresiasi kecepatan notifikasi surat masuk dan keramahan staf resepsionis. Musholla bersih dan suasana sangat mendukung kenyamanan meeting syariah dengan mitra bisnis kami."
      );
      setActionItems("Pertahankan standar pelayanan dan pastikan kurir ekspedisi diinfokan PIN loker otomatis.");
      setStatus("resolved");
    } else if (type === "usulan_fasilitas") {
      setPeriod("Check-in Bulanan Agustus 2026");
      setRatings({
        overall: 4,
        mailHandling: 5,
        facilityCleanliness: 4,
        receptionistService: 5,
        shariaAtmosphere: 5,
        valueAndTransparency: 4,
      });
      setNpsScore(9);
      setSatisfactionLevel("Puas");
      setFeedbackNotes(
        "Layanan surat dan penerimaan telepon sangat baik. Mengusulkan penambahan colokan listrik dan sound dampening akustik pada area Hot Desk Coworking."
      );
      setActionItems("Tim teknisi fasilitas menjadwalkan instalasi extension power socket tambahan di Meja Coworking pekan ini.");
      setStatus("in_progress");
    } else if (type === "onboarding") {
      setPeriod("Evaluasi Pasca-Onboarding (Bulan 1)");
      setRatings({
        overall: 5,
        mailHandling: 4,
        facilityCleanliness: 5,
        receptionistService: 5,
        shariaAtmosphere: 5,
        valueAndTransparency: 5,
      });
      setNpsScore(10);
      setSatisfactionLevel("Sangat Puas");
      setFeedbackNotes(
        "Proses pendaftaran domisili sangat cepat, surat keterangan domisili langsung terbit rapi sehingga berkas legalitas NIB dan rekening bank syariah perusahaan kami cepat selesai."
      );
      setActionItems("Berikan panduan booking ruang meeting via platform kepada admin PIC tenant.");
      setStatus("resolved");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !respondentName || !feedbackNotes) return;

    const newSurvey: TenantSatisfactionSurvey = {
      id: `SURV-${new Date().getFullYear()}-${String(safeSurveys.length + 1).padStart(3, "0")}`,
      tenantId: selectedTenantId,
      tenantName: currentTenant?.companyName || "Tenant",
      period,
      surveyDate,
      loggedByManager,
      respondentName,
      respondentRole,
      ratings,
      satisfactionLevel,
      npsRecommendationScore: npsScore,
      feedbackNotes,
      actionItems: actionItems || "Pencatatan evaluasi rutin operasional selesai.",
      status,
    };

    onAddSurvey(newSurvey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab("history");
    }, 1200);
  };

  // Helper Star Rating Selector
  const StarRatingRow = ({
    label,
    desc,
    value,
    onChange,
  }: {
    label: string;
    desc: string;
    value: number;
    onChange: (val: number) => void;
  }) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#fafaf7] border border-black/5 hover:border-[#5A5A40]/20 transition-all">
        <div className="space-y-0.5">
          <div className="font-serif font-bold text-xs text-[#2d2d22]">{label}</div>
          <div className="text-[10px] text-[#72725e]">{desc}</div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-115 transition-transform cursor-pointer"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= value
                    ? "fill-[#5A5A40] text-[#5A5A40]"
                    : "text-[#D0D0C0] hover:text-[#5A5A40]/50"
                }`}
              />
            </button>
          ))}
          <span className="font-mono font-bold text-xs text-[#5A5A40] w-6 text-right ml-1">
            {value}.0
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150 overflow-hidden">
        {/* Header */}
        <div className="bg-[#f5f2ed] p-5 sm:p-6 border-b border-[#5A5A40]/15 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-white">
                SOP-IVO-06 EVALUATION
              </span>
              <span className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Quality Assurance & Layanan Klien
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2d2d22]">
              Survei Kepuasan & Catatan Feedback Tenant
            </h3>
            <p className="text-xs text-[#72725e]">
              Pencatatan berkala evaluasi mutu layanan kantor virtual, ketepatan penanganan surat, dan tindak lanjut manajer kantor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs font-bold text-[#72725e] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab & Tenant Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-black/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Tenant Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Building className="w-4 h-4 text-[#5A5A40] shrink-0" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full text-xs font-semibold text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-full px-3 py-1.5 focus:ring-1 focus:ring-[#5A5A40]"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.companyName} ({t.packageType})
                </option>
              ))}
            </select>
          </div>

          {/* Navigation View Switch */}
          <div className="flex items-center gap-1 p-1 bg-[#f5f5f0] rounded-full border border-black/5">
            <button
              onClick={() => setActiveTab("new_survey")}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "new_survey"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Survei Baru</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Feedback ({tenantSurveys.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {savedSuccess && (
            <div className="bg-[#f5f2ed] border border-[#5A5A40]/30 rounded-2xl p-4 flex items-center gap-3 text-[#383827] text-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-[#5A5A40] shrink-0" />
              <div>
                <strong className="font-serif">Alhamdulillah! Survei Kepuasan Berhasil Disimpan.</strong>
                <p className="text-[11px] text-[#626252]">
                  Catatan feedback dan skor kepuasan telah masuk ke rekam jejak tenant {currentTenant?.companyName}.
                </p>
              </div>
            </div>
          )}

          {activeTab === "new_survey" ? (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Quick Template Fill Buttons */}
              <div className="bg-[#f5f5f0]/70 rounded-2xl p-3 border border-black/5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#72725e] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Isi Cepat Skenario (Template):</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPreset("sangat_puas")}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#5A5A40] hover:bg-[#E4E3DA] border border-[#5A5A40]/20 transition-all cursor-pointer"
                  >
                    ⭐ Sangat Puas (Rutin Q3)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("usulan_fasilitas")}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#5A5A40] hover:bg-[#E4E3DA] border border-[#5A5A40]/20 transition-all cursor-pointer"
                  >
                    💡 Usulan Fasilitas / Noise
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("onboarding")}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#5A5A40] hover:bg-[#E4E3DA] border border-[#5A5A40]/20 transition-all cursor-pointer"
                  >
                    🚀 Pasca Onboarding Bulan 1
                  </button>
                </div>
              </div>

              {/* General Survey Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Periode / Jenis Evaluasi:
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-3.5"
                  >
                    <option value="Evaluasi Triwulan Q3 2026">Evaluasi Triwulan Q3 2026</option>
                    <option value="Check-in Bulanan Agustus 2026">Check-in Bulanan Agustus 2026</option>
                    <option value="Evaluasi Pasca-Onboarding (Bulan 1)">Evaluasi Pasca-Onboarding (Bulan 1)</option>
                    <option value="Review Perpanjangan Kontrak (Bulan 12)">Review Perpanjangan Kontrak</option>
                    <option value="Survei Insidental / Tindak Lanjut Layanan">Survei Insidental Layanan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Tanggal Wawancara / Log:
                  </label>
                  <input
                    type="date"
                    required
                    value={surveyDate}
                    onChange={(e) => setSurveyDate(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-3.5 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Manajer Pengelola (Pewawancara):
                  </label>
                  <input
                    type="text"
                    required
                    value={loggedByManager}
                    onChange={(e) => setLoggedByManager(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-3.5 bg-white"
                  />
                </div>
              </div>

              {/* Respondent Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#f5f2ed]/50 border border-[#5A5A40]/15">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Nama Responden (PIC Tenant):
                  </label>
                  <input
                    type="text"
                    required
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Nama PIC Penyewa"
                    className="w-full p-2 rounded-full border border-[#5A5A40]/20 px-3.5 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Jabatan Responden:
                  </label>
                  <input
                    type="text"
                    required
                    value={respondentRole}
                    onChange={(e) => setRespondentRole(e.target.value)}
                    placeholder="Contoh: Direktur Utama / Operational Lead"
                    className="w-full p-2 rounded-full border border-[#5A5A40]/20 px-3.5 bg-white text-xs"
                  />
                </div>
              </div>

              {/* 5-Aspect Rating Matrix */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                    Matriks Penilaian Mutu Layanan (Skala 1 - 5 Bintang)
                  </h4>
                  <span className="text-[10px] text-[#72725e]">
                    Berdasarkan Standar SOP IVO
                  </span>
                </div>

                <div className="space-y-2">
                  <StarRatingRow
                    label="1. Layanan Surat & Notifikasi Kilat (SOP-IVO-01)"
                    desc="Kecepatan input loker, ketepatan notifikasi WA, & keamanan berkas"
                    value={ratings.mailHandling}
                    onChange={(val) => handleRatingChange("mailHandling", val)}
                  />
                  <StarRatingRow
                    label="2. Etika Resepsionis & Adab Syariah (SOP-IVO-02)"
                    desc="Keramahan salam, kesopanan busana, etika telepon & penerimaan tamu"
                    value={ratings.receptionistService}
                    onChange={(val) => handleRatingChange("receptionistService", val)}
                  />
                  <StarRatingRow
                    label="3. Fasilitas Ruangan & Kenyamanan Shalat (SOP-IVO-03)"
                    desc="Kebersihan meeting room, AC, sound adzan, musholla & wudhu"
                    value={ratings.facilityCleanliness}
                    onChange={(val) => handleRatingChange("facilityCleanliness", val)}
                  />
                  <StarRatingRow
                    label="4. Ekosistem Bisnis Halal & Bebas Riba (SOP-IVO-04)"
                    desc="Ketenangan lingkungan kerja, transparansi muamalah, & jejaring halal"
                    value={ratings.shariaAtmosphere}
                    onChange={(val) => handleRatingChange("shariaAtmosphere", val)}
                  />
                  <StarRatingRow
                    label="5. Transparansi Tagihan & Wakaf Produktif (SOP-IVO-05/07)"
                    desc="Kejelasan rincian invoice, kemudahan QRIS/VA, & laporan wakaf 5%"
                    value={ratings.valueAndTransparency}
                    onChange={(val) => handleRatingChange("valueAndTransparency", val)}
                  />
                  <StarRatingRow
                    label="6. Tingkat Kepuasan Keseluruhan (Overall CSAT)"
                    desc="Evaluasi menyeluruh terhadap manfaat virtual office bagi tenant"
                    value={ratings.overall}
                    onChange={(val) => handleRatingChange("overall", val)}
                  />
                </div>
              </div>

              {/* NPS Score & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#fafaf7] border border-black/5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#2d2d22]">
                      Net Promoter Score (NPS 1-10):
                    </label>
                    <span className="font-mono font-bold text-xs text-[#5A5A40] bg-[#E4E3DA] px-2 py-0.5 rounded-full">
                      Skor: {npsScore} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={npsScore}
                    onChange={(e) => setNpsScore(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-[#72725e] mt-1">
                    <span>1 (Tidak Rekomendasi)</span>
                    <span>5 (Netral)</span>
                    <span>10 (Sangat Rekomendasi)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Status Tindak Lanjut:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-3.5"
                  >
                    <option value="resolved">Selesai / Resolusi Tuntas (Resolved)</option>
                    <option value="in_progress">Dalam Proses Pengerjaan (In Progress)</option>
                    <option value="scheduled_followup">Terjadwal Follow-up Lanjutan</option>
                  </select>
                </div>
              </div>

              {/* Qualitative Notes Textarea */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2d2d22]">
                  Catatan Evaluasi & Masukan Kualitatif Tenant:
                </label>
                <textarea
                  required
                  rows={3}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Tuliskan apresiasi, kritik membangun, atau kebutuhan khusus yang disampaikan oleh penyewa..."
                  className="w-full p-3 rounded-2xl border border-[#5A5A40]/20 text-xs focus:ring-1 focus:ring-[#5A5A40] leading-relaxed"
                />
              </div>

              {/* Action Items Textarea */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2d2d22]">
                  Rencana Tindak Lanjut Tim Pengelola (Action Items & SLA):
                </label>
                <textarea
                  rows={2}
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  placeholder="Contoh: Jadwalkan perbaikan colokan listrik sebelum 28 Agustus atau kirimkan panduan booking ruang..."
                  className="w-full p-3 rounded-2xl border border-[#5A5A40]/20 text-xs focus:ring-1 focus:ring-[#5A5A40] leading-relaxed bg-[#f5f5f0]/40"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#72725e] hover:bg-[#f5f5f0] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#5A5A40] hover:bg-[#383827] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Log Evaluasi Kepuasan</span>
                </button>
              </div>
            </form>
          ) : (
            /* Historical Tab */
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                    Riwayat Survei & Evaluasi: {currentTenant?.companyName}
                  </h4>
                  <p className="text-[11px] text-[#72725e]">
                    Total {tenantSurveys.length} catatan feedback terarsip untuk penyewa ini.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("new_survey")}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#5A5A40] text-white hover:bg-[#383827] flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tambah Survei</span>
                </button>
              </div>

              {tenantSurveys.length === 0 ? (
                <div className="p-8 text-center bg-[#fafaf7] rounded-2xl border border-black/5 space-y-2">
                  <Smile className="w-8 h-8 text-[#A8A890] mx-auto" />
                  <div className="font-semibold text-[#2d2d22]">Belum Ada Catatan Survei Khusus</div>
                  <p className="text-[11px] text-[#72725e] max-w-sm mx-auto">
                    Penyewa ini belum memiliki riwayat survei kepuasan berkala. Klik tombol "Log Survei Baru" untuk memulai pencatatan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tenantSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="bg-white rounded-2xl border border-black/5 p-4 space-y-3 shadow-2xs hover:border-[#5A5A40]/30 transition-all"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-black/5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-xs text-[#2d2d22]">
                              {survey.period}
                            </span>
                            <span className="font-mono text-[10px] text-[#72725e] bg-[#f5f5f0] px-2 py-0.5 rounded-full">
                              {survey.surveyDate}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#72725e]">
                            Responden: <strong>{survey.respondentName}</strong> ({survey.respondentRole}) • Dicatat: {survey.loggedByManager}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold font-mono text-xs px-2.5 py-0.5 bg-[#f5f2ed] text-[#5A5A40] rounded-full border border-[#5A5A40]/20">
                            <Star className="w-3 h-3 fill-[#5A5A40]" />
                            <span>{survey.ratings.overall}.0 / 5.0</span>
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                              survey.status === "resolved"
                                ? "bg-[#E4E3DA] text-[#5A5A40]"
                                : "bg-[#f5f2ed] text-[#8A8A6A]"
                            }`}
                          >
                            {survey.status === "resolved" ? "Selesai" : "Tindak Lanjut"}
                          </span>
                        </div>
                      </div>

                      {/* Ratings Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                        <div className="bg-[#fafaf7] p-2 rounded-xl border border-black/5">
                          <span className="text-[#72725e] block">Surat/Loker:</span>
                          <strong className="text-[#2d2d22] font-mono">⭐ {survey.ratings.mailHandling}.0 / 5</strong>
                        </div>
                        <div className="bg-[#fafaf7] p-2 rounded-xl border border-black/5">
                          <span className="text-[#72725e] block">Resepsionis:</span>
                          <strong className="text-[#2d2d22] font-mono">⭐ {survey.ratings.receptionistService}.0 / 5</strong>
                        </div>
                        <div className="bg-[#fafaf7] p-2 rounded-xl border border-black/5">
                          <span className="text-[#72725e] block">Fasilitas/Ibadah:</span>
                          <strong className="text-[#2d2d22] font-mono">⭐ {survey.ratings.facilityCleanliness}.0 / 5</strong>
                        </div>
                        <div className="bg-[#fafaf7] p-2 rounded-xl border border-black/5">
                          <span className="text-[#72725e] block">Lingkungan Syariah:</span>
                          <strong className="text-[#2d2d22] font-mono">⭐ {survey.ratings.shariaAtmosphere}.0 / 5</strong>
                        </div>
                        <div className="bg-[#fafaf7] p-2 rounded-xl border border-black/5">
                          <span className="text-[#72725e] block">Wakaf & Tarif:</span>
                          <strong className="text-[#2d2d22] font-mono">⭐ {survey.ratings.valueAndTransparency}.0 / 5</strong>
                        </div>
                        <div className="bg-[#fafaf7] p-2 rounded-xl border border-black/5">
                          <span className="text-[#72725e] block">NPS Rekomendasi:</span>
                          <strong className="text-[#5A5A40] font-mono">{survey.npsRecommendationScore} / 10</strong>
                        </div>
                      </div>

                      {/* Notes & Actions */}
                      <div className="space-y-1.5 pt-1">
                        <div className="p-3 bg-[#f5f2ed]/60 rounded-xl border border-[#5A5A40]/10 text-[11px] text-[#383827] leading-relaxed">
                          <span className="font-semibold text-[#2d2d22] block mb-0.5">Catatan Masukan:</span>
                          "{survey.feedbackNotes}"
                        </div>

                        {survey.actionItems && (
                          <div className="text-[11px] text-[#72725e] flex items-start gap-1.5 pl-1">
                            <FileCheck className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                            <span>
                              <strong>Tindak Lanjut:</strong> {survey.actionItems}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

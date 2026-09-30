import React, { useState } from "react";
import { SopModule, SopStep } from "../types";
import { SOP_MODULES } from "../data/sopData";
import {
  BookOpen,
  Building2,
  Clock,
  Award,
  UserCheck,
  FileSignature,
  CalendarDays,
  CreditCard,
  MailCheck,
  Search,
  CheckCircle2,
  CircleDot,
  FileText,
  Printer,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Send,
  SlidersHorizontal,
  BookmarkCheck,
} from "lucide-react";

interface SopHubProps {
  sopModules?: SopModule[];
  onOpenContractGen?: () => void;
  onOpenMailroom?: () => void;
}

export const SopHub: React.FC<SopHubProps> = ({
  sopModules = SOP_MODULES,
  onOpenContractGen,
  onOpenMailroom,
}) => {
  const safeSopModules = Array.isArray(sopModules) && sopModules.length > 0 ? sopModules : SOP_MODULES;
  const [selectedModule, setSelectedModule] = useState<SopModule>(safeSopModules[0] || SOP_MODULES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [isAiConsultantOpen, setIsAiConsultantOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiCity, setAiCity] = useState("DKI Jakarta");
  const [aiOrgType, setAiOrgType] = useState("Sentra Bisnis Komunitas Masjid & Inkubator UMKM");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Building2":
        return <Building2 className="w-5 h-5" />;
      case "Clock":
        return <Clock className="w-5 h-5" />;
      case "Award":
        return <Award className="w-5 h-5" />;
      case "UserCheck":
        return <UserCheck className="w-5 h-5" />;
      case "FileSignature":
        return <FileSignature className="w-5 h-5" />;
      case "CalendarDays":
        return <CalendarDays className="w-5 h-5" />;
      case "CreditCard":
        return <CreditCard className="w-5 h-5" />;
      case "MailCheck":
        return <MailCheck className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const categories = [
    "All",
    "Pondasi & Legalitas Usaha",
    "Operasional Harian",
    "Paket Layanan & SLA",
    "Manajemen Klien & KYC",
    "Legal & Akad Syariah",
    "Penyewaan & Fasilitas",
    "Keuangan & Penagihan Syariah",
    "Administrasi & Mailroom",
  ];

  const filteredModules = safeSopModules.filter((mod) => {
    const matchSearch =
      (mod.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mod.summary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mod.code || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "All" || mod.category === activeCategory;
    return matchSearch && matchCat;
  });

  const toggleStep = (moduleId: string, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const current = prev[moduleId] || [];
      if (current.includes(stepNumber)) {
        return { ...prev, [moduleId]: current.filter((s) => s !== stepNumber) };
      } else {
        return { ...prev, [moduleId]: [...current, stepNumber] };
      }
    });
  };

  const isStepCompleted = (moduleId: string, stepNumber: number) => {
    return (completedSteps[moduleId] || []).includes(stepNumber);
  };

  const handlePrintSop = () => {
    window.print();
  };

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai/sop-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedModule.title,
          query: aiQuery,
          organizationType: aiOrgType,
          cityLocation: aiCity,
        }),
      });
      const data = await res.json();
      setAiResponse(data.sopGuide || "Berhasil menghasilkan rekomendasi SOP.");
    } catch (err) {
      console.error(err);
      setAiResponse("Gagal menghubungi konsultan AI. Menggunakan panduan standar SOP.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-[#4a4a35] text-[#f5f5f0] rounded-[28px] p-6 sm:p-8 shadow-md border border-[#5A5A40]/30 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A5A40] border border-[#A8A890]/30 text-[#E4E3DA] text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#E4E3DA]" />
            Paket Standard Operational Procedure (SOP) Virtual Office & Co-Working Lengkap
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Panduan & Alur Kerja Standar Manajemen Virtual Office Berdaya
          </h1>

          <p className="text-[#E4E3DA]/90 text-sm leading-relaxed max-w-3xl">
            Sistem operasional berstandar nasional (Permendag RI No. 8/2020 & KBLI OSS RBA) yang dipadukan dengan Fiqh Muamalah DSN-MUI. Membantu Pengelola Sentra Bisnis Komunitas Masjid, inkubator UMKM, dan penyedia co-working menjalankan usaha secara profesional, amanah, dan berdaya saing tinggi.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-[#383827]/80 border border-[#5A5A40]/50 rounded-[18px] p-3.5">
              <div className="font-serif text-[#E4E3DA] font-bold text-lg">8 Modul</div>
              <div className="text-[#A8A890]">SOP Alur Kerja Lengkap</div>
            </div>
            <div className="bg-[#383827]/80 border border-[#5A5A40]/50 rounded-[18px] p-3.5">
              <div className="font-serif text-[#E4E3DA] font-bold text-lg">100% Sah</div>
              <div className="text-[#A8A890]">Hukum RI & DSN-MUI</div>
            </div>
            <div className="bg-[#383827]/80 border border-[#5A5A40]/50 rounded-[18px] p-3.5">
              <div className="font-serif text-[#E4E3DA] font-bold text-lg">&lt; 15 Mnt</div>
              <div className="text-[#A8A890]">SLA Smart Mailroom</div>
            </div>
            <div className="bg-[#383827]/80 border border-[#5A5A40]/50 rounded-[18px] p-3.5">
              <div className="font-serif text-[#E4E3DA] font-bold text-lg">5% Wakaf</div>
              <div className="text-[#A8A890]">Alokasi Kas Masjid Ummat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Module Selector + Detailed Active SOP View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Module Navigation & Filter (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-[#2d2d22] text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5A5A40]" />
                Daftar 8 SOP Manajemen
              </h2>
              <span className="text-[10px] bg-[#f5f2ed] text-[#5A5A40] font-bold px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
                {filteredModules.length} Modul
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#72725e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari SOP, KBLI, Alur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-[#5A5A40]/20 focus:outline-hidden focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] bg-[#f5f5f0]/50 text-[#2d2d22]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === "All"
                    ? "bg-[#5A5A40] text-white font-semibold"
                    : "border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveCategory("Operasional Harian")}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === "Operasional Harian"
                    ? "bg-[#5A5A40] text-white font-semibold"
                    : "border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10"
                }`}
              >
                Operasional
              </button>
              <button
                onClick={() => setActiveCategory("Legal & Akad Syariah")}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === "Legal & Akad Syariah"
                    ? "bg-[#5A5A40] text-white font-semibold"
                    : "border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10"
                }`}
              >
                Akad & Legal
              </button>
            </div>
          </div>

          {/* Module List Items */}
          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredModules.map((mod) => {
              const isSelected = selectedModule.id === mod.id;
              const stepCount = (mod.steps || []).length;
              const doneCount = (completedSteps[mod.id] || []).length;
              const isFullyDone = doneCount === stepCount && stepCount > 0;

              return (
                <div
                  key={mod.id}
                  id={`sop-card-${mod.id}`}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-4 rounded-[20px] border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#f5f2ed] border-[#5A5A40] shadow-xs ring-1 ring-[#5A5A40]/20"
                      : "bg-white border-black/5 hover:border-[#5A5A40]/30 hover:bg-[#f5f2ed]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected
                            ? "bg-[#5A5A40] text-white"
                            : "bg-[#f5f5f0] text-[#5A5A40]"
                        }`}
                      >
                        {getIcon(mod.iconName)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#f5f5f0] text-[#5A5A40]">
                          {mod.code}
                        </span>
                        <div className="text-[10px] text-[#72725e] font-medium mt-0.5">
                          {mod.category}
                        </div>
                      </div>
                    </div>

                    {isFullyDone && (
                      <span className="flex items-center gap-1 text-[10px] text-[#5A5A40] font-bold bg-[#E4E3DA] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Lengkap
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-[#2d2d22] text-xs sm:text-sm mt-2.5 line-clamp-1">
                    {mod.title}
                  </h3>
                  <p className="text-[#626252] text-xs mt-1 line-clamp-2 leading-relaxed">
                    {mod.summary}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/5 text-[11px] text-[#72725e]">
                    <span className="flex items-center gap-1">
                      <CircleDot className="w-3 h-3 text-[#5A5A40]" />
                      {stepCount} Prosedur Baku
                    </span>
                    <span className="font-semibold text-[#5A5A40]">
                      {doneCount}/{stepCount} Checklist
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI SOP Consultant Trigger Card */}
          <div className="bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-[20px] p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#2d2d22] text-xs sm:text-sm">Konsultan SOP Virtual Office AI</h4>
                <p className="text-[11px] text-[#72725e]">Kustomisasi SOP sesuai lokasi & skala masjid/UMKM</p>
              </div>
            </div>
            <button
              onClick={() => setIsAiConsultantOpen(true)}
              className="w-full py-2.5 px-4 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E4E3DA]" />
              Buka Asisten Audit & Kustomisasi SOP
            </button>
          </div>
        </div>

        {/* Right Column: Active SOP Interactive Master Guide (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header of Active SOP */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-black/5">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-[#f5f2ed] text-[#5A5A40] font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
                    {selectedModule.code}
                  </span>
                  <span className="text-xs text-[#72725e] font-medium">
                    Kategori: <strong className="text-[#2d2d22]">{selectedModule.category}</strong>
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
                  {selectedModule.title}
                </h2>
                <p className="text-[#626252] text-xs sm:text-sm leading-relaxed">
                  {selectedModule.summary}
                </p>
              </div>

              {/* Action Buttons: Print & Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSop}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#5A5A40] border border-[#5A5A40]/20 hover:bg-[#5A5A40]/10 rounded-full transition-all cursor-pointer"
                  title="Cetak SOP Resmi (Print / PDF)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak SOP</span>
                </button>
                {selectedModule.id === "sop-5-kontrak-perjanjian" && onOpenContractGen && (
                  <button
                    onClick={onOpenContractGen}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full shadow-xs transition-all cursor-pointer"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>Buka Generator Akad</span>
                  </button>
                )}
                {selectedModule.id === "sop-8-manajemen-operasional-administrasi" && onOpenMailroom && (
                  <button
                    onClick={onOpenMailroom}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full shadow-xs transition-all cursor-pointer"
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>Buka Smart Mailroom</span>
                  </button>
                )}
              </div>
            </div>

            {/* Legal & Sharia Basis Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#f5f2ed] border border-[#5A5A40]/15 rounded-[18px] p-4 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2d2d22]">
                  <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
                  Dasar Fiqh Muamalah & Syariah:
                </div>
                <p className="text-[#626252] leading-relaxed">
                  {selectedModule.shariaReference}
                </p>
              </div>

              <div className="bg-[#f5f5f0] border border-black/5 rounded-[18px] p-4 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2d2d22]">
                  <FileText className="w-4 h-4 text-[#5A5A40]" />
                  Dasar Hukum Positif Indonesia:
                </div>
                <p className="text-[#626252] leading-relaxed">
                  {selectedModule.indonesianLawReference}
                </p>
              </div>
            </div>

            {/* Key Objectives & Target Audience */}
            <div className="space-y-2 bg-[#f5f5f0]/70 rounded-[20px] p-5 border border-black/5 text-xs">
              <h4 className="font-serif font-bold text-[#2d2d22] text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#5A5A40]" />
                Sasaran Mutu & Standar SLA Pelayanan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#626252] pt-1">
                {(selectedModule.keyObjectives || []).map((obj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1.5 shrink-0"></span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] font-semibold text-[#5A5A40] border-t border-black/5 mt-2 gap-2">
                <span>Standar Komitmen Waktu: <strong className="text-[#2d2d22]">{selectedModule.slaStandard}</strong></span>
                <span>Sasaran Pengguna: <strong className="text-[#2d2d22]">{selectedModule.targetAudience}</strong></span>
              </div>
            </div>

            {/* Step by Step Execution Flow & Checklists */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[#2d2d22] text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />
                  Alur Prosedur Kerja & Checklist Verifikasi Lapangan
                </h3>
                <span className="text-xs text-[#72725e]">
                  Klik lingkaran untuk menandai kepatuhan langkah
                </span>
              </div>

              <div className="space-y-3.5">
                {(selectedModule.steps || []).map((step) => {
                  const done = isStepCompleted(selectedModule.id, step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-5 rounded-[20px] border transition-all ${
                        done
                          ? "bg-[#f5f2ed] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/15"
                          : "bg-white border-black/5 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStep(selectedModule.id, step.stepNumber)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-all ${
                              done
                                ? "bg-[#5A5A40] text-white shadow-xs"
                                : "border-2 border-[#5A5A40]/30 text-[#5A5A40] hover:border-[#5A5A40]"
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4
                                className={`font-serif font-bold text-sm sm:text-base ${
                                  done ? "text-[#5A5A40] line-through decoration-[#5A5A40]/40" : "text-[#2d2d22]"
                                }`}
                              >
                                Langkah {step.stepNumber}: {step.title}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#72725e] mt-1">
                              <span>
                                Penanggung Jawab: <strong className="text-[#2d2d22]">{step.responsibleRole}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Durasi: <strong className="text-[#5A5A40] font-mono">{step.duration}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                            done
                              ? "bg-[#E4E3DA] text-[#5A5A40] font-bold"
                              : "bg-[#f5f5f0] text-[#72725e]"
                          }`}
                        >
                          {done ? "Selesai Diverifikasi" : "Belum Dijalankan"}
                        </span>
                      </div>

                      {/* Description & Action Items */}
                      <div className="mt-3.5 pl-10 space-y-3 text-xs text-[#3a3a2e]">
                        <p className="leading-relaxed text-[#626252]">{step.description}</p>

                        <div className="bg-[#f5f5f0] rounded-[16px] p-3.5 border border-black/5 space-y-2">
                          <div className="font-bold text-[#2d2d22] text-[11px] uppercase tracking-wider">
                            Item Tindakan Wajib (Action Items):
                          </div>
                          <ul className="space-y-1.5 pl-1 text-[#626252]">
                            {(step.actionItems || []).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-[#5A5A40] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Critical Points & Output */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="bg-[#f5f2ed] border border-[#5A5A40]/15 rounded-[14px] p-2.5 text-[#5A5A40]">
                            <strong>Poin Kritis / Larangan:</strong> {(step.criticalPoints || []).join("; ")}
                          </div>
                          <div className="bg-[#E4E3DA]/60 border border-[#5A5A40]/20 rounded-[14px] p-2.5 text-[#383827]">
                            <strong>Output Dokumen / Bukti:</strong> {step.outputArtifact}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Forms Included & KPI Section */}
            <div className="pt-5 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#5A5A40]" />
                  Formulir Standar Terlampir:
                </h4>
                <ul className="space-y-1 text-[#626252]">
                  {(selectedModule.formsIncluded || []).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40]"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-serif font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#5A5A40]" />
                  Key Performance Indicators (KPI):
                </h4>
                <ul className="space-y-1 text-[#626252]">
                  {(selectedModule.kpis || []).map((kpi, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8A8A6A]"></span>
                      <span>{kpi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI SOP Consultant Modal */}
      {isAiConsultantOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#E4E3DA]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
                    Konsultan & Auditor SOP Virtual Office Syariah (AI Powered)
                  </h3>
                  <p className="text-xs text-[#72725e]">
                    Kustomisasi dan optimasi alur kerja berdasarkan Perda, PTSP, dan Karakteristik Sentra Masjid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiConsultantOpen(false)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAiConsult} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Bentuk Usaha / Karakteristik Ruang:
                  </label>
                  <input
                    type="text"
                    value={aiOrgType}
                    onChange={(e) => setAiOrgType(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] px-4"
                    placeholder="Contoh: Sentra Bisnis Komunitas Masjid & Inkubator UMKM"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Wilayah / Kota Operasional:
                  </label>
                  <input
                    type="text"
                    value={aiCity}
                    onChange={(e) => setAiCity(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] px-4"
                    placeholder="Contoh: DKI Jakarta, Bandung, Surabaya, Medan"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">
                  Pertanyaan Spesifik atau Kebutuhan Kustomisasi SOP ({selectedModule.code}):
                </label>
                <textarea
                  rows={3}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full p-3 rounded-[18px] border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40]"
                  placeholder="Misal: Bagaimana tata cara penerimaan surat KPP jika direktur tenant sedang berada di luar negeri, dan bagaimana penyusunan surat kuasa scan agar sah di mata hukum?"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-[#72725e] italic">
                  *Didukung oleh Gemini 3.7 Flash Fiqh & Corporate Legal Advisor
                </div>
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] disabled:bg-stone-300 text-white font-bold rounded-full flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-[#E4E3DA]" />
                      <span>Menganalisis Regulasi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#E4E3DA]" />
                      <span>Hasilkan Panduan SOP Kustom</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {aiResponse && (
              <div className="bg-[#f5f5f0] border border-black/5 rounded-[20px] p-5 text-xs space-y-2.5 text-[#2d2d22]">
                <div className="flex items-center justify-between pb-2 border-b border-black/5 text-[#5A5A40] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
                    Rekomendasi Ahli SOP & Hukum Korporasi Syariah:
                  </span>
                  <span className="text-[10px] text-[#72725e]">Live Guidance</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-[#3a3a2e] max-h-96 overflow-y-auto pr-1">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

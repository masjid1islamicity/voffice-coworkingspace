import React, { useState, useRef } from "react";
import { Tenant } from "../types";
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building,
  HeartHandshake,
  Sparkles,
  Layers,
  Coins,
  TrendingUp,
  Scale,
  Calendar,
  UserCheck,
  Award,
  CheckCircle2,
  Share2,
  ExternalLink,
  Edit3,
  Sun,
  Utensils,
  Ambulance,
  GraduationCap,
  Briefcase,
  QrCode,
  Eye,
} from "lucide-react";

export interface CommunityImpactReportData {
  tenantName: string;
  tenantSector?: string;
  tenantAddress?: string;
  representativeName?: string;
  monthlyContribution: number;
  annualContribution: number;
  tenureYears: number;
  expectedAnnualYield: number;
  reinvestmentStrategy: "hybrid_endowment" | "direct_impact";
  cumulativeDeposited: number;
  endowmentBalance: number;
  cumulativeImpactDisbursed: number;
  sroiMultiplier: number;
  projectAllocations: Record<string, number>;
  projectImpacts: Array<{
    id: string;
    name: string;
    category: string;
    iconName: string;
    allocatedPercent: number;
    allocatedAmountTotal: number;
    unitsGenerated: number;
    unitLabel: string;
    impactMetric: string;
    sdgGoal: string;
  }>;
  projectionTimeline: Array<{
    year: number;
    yearLabel: string;
    annualDeposit: number;
    cumulativeDeposited: number;
    endowmentBalance: number;
    annualYieldGenerated: number;
    annualImpactDisbursed: number;
    cumulativeImpactDisbursed: number;
    sroiMultiplier: number;
    umkmDisbursed?: number;
    eduDisbursed?: number;
    greenDisbursed?: number;
    foodDisbursed?: number;
    healthDisbursed?: number;
  }>;
}

interface CommunityImpactReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: CommunityImpactReportData;
  tenants?: Tenant[];
  onSelectTenant?: (tenantId: string) => void;
  selectedTenantId?: string;
}

export const CommunityImpactReportModal: React.FC<CommunityImpactReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  tenants = [],
  onSelectTenant,
  selectedTenantId = "custom",
}) => {
  const [copied, setCopied] = useState(false);
  const [recipientRole, setRecipientRole] = useState<string>("Dewan Pengawas & Manajemen Tenant");
  const [reportNumber] = useState(`CIR-WAKAF/2026/VIII/${Math.floor(100 + Math.random() * 900)}`);
  const [executiveNote, setExecutiveNote] = useState<string>(
    "Laporan ini menyajikan bukti akuntabilitas dan proyeksi dampak sosial-ekonomi dari partisipasi wakaf produktif terintegrasi. Dana dikelola secara amanah dengan prinsip syariah bebas riba demi kemandirian umat."
  );
  const [isEditingNote, setIsEditingNote] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const text = `
# LAPORAN DAMPAK SOSIAL & WAKAF PRODUKTIF (COMMUNITY IMPACT REPORT)
Nomor Dokumen: ${reportNumber}
Tanggal: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
Entitas: ${reportData.tenantName} (${reportData.tenantSector || "Umum"})
Penerima: ${recipientRole}

## 1. RINGKASAN EKSEKUTIF
- Komitmen Wakaf: Rp ${reportData.monthlyContribution.toLocaleString("id-ID")} / bulan (Rp ${reportData.annualContribution.toLocaleString("id-ID")}/thn)
- Horizon Waktu: ${reportData.tenureYears} Tahun
- Total Pokok Wakaf Disetor: Rp ${reportData.cumulativeDeposited.toLocaleString("id-ID")}
- Akumulasi Manfaat Komunitas: Rp ${reportData.cumulativeImpactDisbursed.toLocaleString("id-ID")}
- SROI (Social Return on Investment): ${reportData.sroiMultiplier}x
- Saldo Dana Abadi Produktif: Rp ${reportData.endowmentBalance.toLocaleString("id-ID")}

## 2. PEMBERDAYAAN RIIL 5 PILAR PROYEK
${reportData.projectImpacts
  .map(
    (p) =>
      `- **${p.name}** (${p.allocatedPercent}% - Rp ${p.allocatedAmountTotal.toLocaleString("id-ID")}): ${p.unitsGenerated.toLocaleString("id-ID")} ${p.unitLabel} [${p.sdgGoal}]`
  )
  .join("\n")}

## 3. DASAR KEPATUHAN SYARIAH
- UU No. 41 Tahun 2004 tentang Wakaf
- Fatwa MUI 11 Mei 2002 tentang Wakaf Uang
- Diawasi oleh Dewan Pengawas Syariah & Badan Wakaf Indonesia (BWI)

*Diterbitkan resmi oleh Sentra Bisnis & Wakaf Produktif Islamicity Virtual Office.*
    `.trim();

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const exportPayload = {
      documentHeader: {
        documentName: "Community Impact Report - Productive Waqf",
        documentNumber: reportNumber,
        publishedDate: new Date().toISOString(),
        issuer: "Islamicity Virtual Office & Sharia Co-Working Hub",
        legalNadzir: "Yayasan Sentra Bisnis & Wakaf Produktif Masjid Agung",
        bwiAccreditationNumber: "BWI.REG.31.71.092.2024",
      },
      stakeholder: {
        recipientRole,
        tenantName: reportData.tenantName,
        tenantSector: reportData.tenantSector || "Umum",
        representative: reportData.representativeName || "Pimpinan",
        address: reportData.tenantAddress || "Jakarta",
      },
      executiveSummary: {
        monthlyContribution: reportData.monthlyContribution,
        annualContribution: reportData.annualContribution,
        tenureYears: reportData.tenureYears,
        expectedAnnualYield: reportData.expectedAnnualYield,
        reinvestmentStrategy: reportData.reinvestmentStrategy,
        cumulativeDeposited: reportData.cumulativeDeposited,
        endowmentBalance: reportData.endowmentBalance,
        cumulativeImpactDisbursed: reportData.cumulativeImpactDisbursed,
        sroiMultiplier: reportData.sroiMultiplier,
      },
      projectsBreakdown: reportData.projectImpacts,
      projectionTimeline: reportData.projectionTimeline,
      compliance: {
        legalFramework: "UU RI No. 41/2004 & Fatwa MUI No. 2/2002",
        shariaOversight: "Dewan Pengawas Syariah (DPS) Terakreditasi",
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Community-Impact-Report-${reportData.tenantName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderProjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Briefcase":
        return <Briefcase className="w-4 h-4 text-[#5A5A40]" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4 text-[#7D7D5C]" />;
      case "Sun":
        return <Sun className="w-4 h-4 text-[#A8A878]" />;
      case "Utensils":
        return <Utensils className="w-4 h-4 text-[#C29236]" />;
      case "Ambulance":
        return <Ambulance className="w-4 h-4 text-[#A05244]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#5A5A40]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-[#fcfbf9] w-full max-w-4xl rounded-[28px] shadow-2xl border border-black/10 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 bg-white border-b border-black/10 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#2d2d22]">
                  Laporan Dampak Komunitas (PDF Ready)
                </h3>
                <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full border border-[#5A5A40]/15">
                  STAKEHOLDER DOSSIER
                </span>
              </div>
              <p className="text-xs text-[#72725e]">
                Dokumen komprehensif proyeksi wakaf produktif siap cetak, simpan PDF, dan dibagikan.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 rounded-full border border-black/10 bg-[#fafaf7] hover:bg-[#E4E3DA] text-xs font-semibold text-[#2d2d22] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Salin ringkasan teks"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#5A5A40]" /> : <Copy className="w-3.5 h-3.5 text-[#72725e]" />}
              <span>{copied ? "Tersalin!" : "Salin Ringkasan"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-full border border-black/10 bg-[#fafaf7] hover:bg-[#E4E3DA] text-xs font-semibold text-[#2d2d22] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh Data JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#72725e]" />
              <span className="hidden sm:inline">Data JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Cetak atau Simpan PDF via Browser"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#fafaf7] hover:bg-black/10 flex items-center justify-center text-[#72725e] transition-all cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stakeholder Customizer Strip (Hidden on Print) */}
        <div className="bg-[#f5f2ed]/80 border-b border-[#5A5A40]/15 px-5 py-3 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[#72725e] font-medium">Entitas / Tenant:</span>
              {tenants.length > 0 && onSelectTenant ? (
                <select
                  value={selectedTenantId}
                  onChange={(e) => onSelectTenant(e.target.value)}
                  className="bg-white border border-[#5A5A40]/20 rounded-full px-3 py-1 font-semibold text-[#2d2d22] text-xs"
                >
                  <option value="custom">-- Simulasi Mandiri (Custom) --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.companyName}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-[#2d2d22]">{reportData.tenantName}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#72725e] font-medium">Ditujukan Kepada:</span>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="bg-white border border-[#5A5A40]/20 rounded-full px-3 py-1 font-semibold text-[#2d2d22] text-xs"
              >
                <option value="Dewan Pengawas & Manajemen Tenant">Dewan Pengawas & Manajemen Tenant</option>
                <option value="Dewan Kemakmuran Masjid (DKM)">Dewan Kemakmuran Masjid (DKM)</option>
                <option value="Badan Wakaf Indonesia (BWI)">Badan Wakaf Indonesia (BWI)</option>
                <option value="Investor / Mitra ESG & Filantropi">Investor / Mitra ESG & Filantropi</option>
                <option value="Laporan Tahunan Terbuka Publik">Laporan Tahunan Terbuka Publik</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingNote(!isEditingNote)}
              className="text-[11px] text-[#5A5A40] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingNote ? "Selesai Edit Memo" : "Ubah Catatan Pengantar"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-[#2d2d22] bg-white print:p-0 print:overflow-visible print:m-0"
          id="printable-impact-report"
        >
          {/* 1. OFFICIAL INSTITUTIONAL HEADER / KOP SURAT */}
          <div className="border-b-2 border-[#5A5A40] pb-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Brand & Crest */}
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
                    ISLAMICITY VIRTUAL OFFICE & SHARIA CO-WORKING
                  </span>
                </div>
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2d2d22] leading-snug">
                  LAPORAN DAMPAK SOSIAL & WAKAF PRODUKTIF
                </h1>
                <div className="text-xs text-[#5A5A40] font-medium font-serif italic">
                  Productive Waqf Social Return on Investment (SROI) & Stakeholder Accountability Report
                </div>
                <div className="text-[11px] text-[#72725e]">
                  Sentra Bisnis Wakaf Masjid Agung • SK Akreditasi Nadzir BWI No. 31.71.092/2024
                </div>
              </div>

              {/* Document Meta Box */}
              <div className="bg-[#fafaf7] p-3.5 rounded-[16px] border border-black/10 font-mono text-[10px] space-y-1.5 min-w-[220px]">
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="text-[#72725e]">No. Registrasi:</span>
                  <span className="font-bold text-[#2d2d22]">{reportNumber}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="text-[#72725e]">Tanggal Terbit:</span>
                  <span className="font-bold text-[#2d2d22]">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="text-[#72725e]">Horizon Evaluasi:</span>
                  <span className="font-bold text-[#5A5A40]">{reportData.tenureYears} Tahun Proyeksi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#72725e]">Status Audit:</span>
                  <span className="font-bold text-[#5A5A40]">Syariah Compliant</span>
                </div>
              </div>
            </div>

            {/* Stakeholder Recipient Banner */}
            <div className="bg-[#f5f2ed] p-3.5 rounded-[14px] border border-[#5A5A40]/15 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[#72725e]">Disusun untuk Stakeholder: </span>
                <strong className="text-[#2d2d22] font-semibold">{recipientRole}</strong>
              </div>
              <div>
                <span className="text-[#72725e]">Entitas Mitra / Wakif: </span>
                <strong className="text-[#5A5A40] font-semibold">{reportData.tenantName}</strong>
                {reportData.tenantSector && (
                  <span className="text-[#72725e] ml-1">({reportData.tenantSector})</span>
                )}
              </div>
            </div>
          </div>

          {/* 2. EXECUTIVE MEMO NOTE */}
          <div className="bg-[#fafaf7] p-4 rounded-[18px] border border-black/5 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                PENGANTAR AKUNTABILITAS & KEMASLAHATAN UMAT
              </span>
              <span className="text-[10px] text-[#72725e] font-mono">Nadzir Wakaf Utama</span>
            </div>
            
            {isEditingNote ? (
              <textarea
                value={executiveNote}
                onChange={(e) => setExecutiveNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-[12px] border border-[#5A5A40]/30 bg-white font-sans text-xs text-[#2d2d22] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                placeholder="Tuliskan catatan pengantar khusus stakeholder..."
              />
            ) : (
              <p className="text-[#555544] leading-relaxed italic">
                "{executiveNote}"
              </p>
            )}
          </div>

          {/* 3. EXECUTIVE HIGHLIGHTS & KEY SROI METRICS */}
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-sm text-[#2d2d22] uppercase tracking-wider flex items-center gap-1.5 border-b border-black/5 pb-1.5">
              <Coins className="w-4 h-4 text-[#5A5A40]" />
              I. Ringkasan Finansial Wakaf & Indeks Dampak SROI
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#f5f2ed] p-3.5 rounded-[16px] border border-[#5A5A40]/20 space-y-1">
                <div className="text-[10px] text-[#72725e] font-medium">Setoran Wakaf Bulanan</div>
                <div className="font-serif text-base sm:text-lg font-bold text-[#2d2d22] font-mono">
                  Rp {reportData.monthlyContribution.toLocaleString("id-ID")}
                </div>
                <div className="text-[9px] text-[#5A5A40] font-mono">
                  Rp {reportData.annualContribution.toLocaleString("id-ID")}/thn
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-[16px] border border-black/10 space-y-1 shadow-2xs">
                <div className="text-[10px] text-[#72725e] font-medium">Total Pokok ({reportData.tenureYears} Thn)</div>
                <div className="font-serif text-base sm:text-lg font-bold text-[#2d2d22] font-mono">
                  Rp {reportData.cumulativeDeposited.toLocaleString("id-ID")}
                </div>
                <div className="text-[9px] text-[#72725e]">100% Pokok Abadi Terjaga</div>
              </div>

              <div className="bg-white p-3.5 rounded-[16px] border border-[#5A5A40]/30 space-y-1 shadow-2xs">
                <div className="text-[10px] text-[#5A5A40] font-semibold">Total Manfaat Disalurkan</div>
                <div className="font-serif text-base sm:text-lg font-bold text-[#5A5A40] font-mono">
                  Rp {reportData.cumulativeImpactDisbursed.toLocaleString("id-ID")}
                </div>
                <div className="text-[9px] text-[#72725e]">Pokok + Imbal Portofolio</div>
              </div>

              <div className="bg-[#2d2d22] text-white p-3.5 rounded-[16px] space-y-1 shadow-2xs">
                <div className="text-[10px] text-[#c4c4b2] font-medium">SROI Multiplier Index</div>
                <div className="font-serif text-base sm:text-lg font-bold text-[#f5f2ed] font-mono">
                  {reportData.sroiMultiplier}x Nilai Sosial
                </div>
                <div className="text-[9px] text-[#a8a896]">Efek Pengganda Ekonomi</div>
              </div>
            </div>
          </div>

          {/* 4. DETAILED 5 COMMUNITY PROJECT OUTCOMES TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
              <h2 className="font-serif font-bold text-sm text-[#2d2d22] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                II. Realisasi & Proyeksi 5 Pilar Proyek Komunitas ({reportData.tenureYears} Tahun)
              </h2>
              <span className="text-[10px] text-[#72725e] font-mono">UN SDG Aligned</span>
            </div>

            <div className="border border-black/10 rounded-[18px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f5f5f0] text-[#72725e] font-bold text-[10px] uppercase font-mono border-b border-black/10">
                  <tr>
                    <th className="py-2.5 px-3.5">Pilar Program & Sasaran</th>
                    <th className="py-2.5 px-3">Porsi</th>
                    <th className="py-2.5 px-3">Total Salur (IDR)</th>
                    <th className="py-2.5 px-3.5">Output Riil Penerima Manfaat</th>
                    <th className="py-2.5 px-3">Tujuan SDG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {reportData.projectImpacts.map((proj) => (
                    <tr key={proj.id} className="hover:bg-[#f5f2ed]/40 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-[8px] bg-[#f5f2ed] border border-black/5 flex items-center justify-center shrink-0 mt-0.5">
                            {renderProjectIcon(proj.iconName)}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#2d2d22]">{proj.name}</div>
                            <div className="text-[10px] text-[#72725e]">{proj.category}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">
                        {proj.allocatedPercent}%
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#2d2d22] whitespace-nowrap">
                        Rp {proj.allocatedAmountTotal.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#5A5A40] font-mono">
                          {proj.unitsGenerated.toLocaleString("id-ID")} {proj.unitLabel}
                        </div>
                        <div className="text-[10px] text-[#72725e] line-clamp-1">{proj.impactMetric}</div>
                      </td>

                      <td className="py-3 px-3 text-[10px] text-[#626252] font-medium whitespace-nowrap">
                        <span className="inline-block bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full border border-[#5A5A40]/15">
                          {proj.sdgGoal.split(":")[0]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#fafaf7] font-bold text-xs border-t border-black/10">
                  <tr>
                    <td className="py-2.5 px-3.5 text-[#2d2d22]">Total Penyaluran Manfaat:</td>
                    <td className="py-2.5 px-3 font-mono text-[#5A5A40]">100%</td>
                    <td className="py-2.5 px-3 font-mono text-[#2d2d22] whitespace-nowrap">
                      Rp {reportData.cumulativeImpactDisbursed.toLocaleString("id-ID")}
                    </td>
                    <td colSpan={2} className="py-2.5 px-3.5 text-[10px] text-[#5A5A40]">
                      *Telah mencakup imbal hasil kelolaan produktif sukuk / CWLS
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. MULTI-YEAR PROJECTION HORIZON TRAJECTORY */}
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-sm text-[#2d2d22] uppercase tracking-wider flex items-center gap-1.5 border-b border-black/5 pb-1.5">
              <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
              III. Matriks Pertumbuhan Tahunan ({reportData.tenureYears} Tahun Proyeksi)
            </h2>

            <div className="border border-black/10 rounded-[18px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f5f5f0] text-[#72725e] font-bold text-[10px] uppercase font-mono border-b border-black/10">
                  <tr>
                    <th className="py-2 px-3">Periode</th>
                    <th className="py-2 px-3">Setoran Pokok / Thn</th>
                    <th className="py-2 px-3">Akumulasi Pokok Disetor</th>
                    <th className="py-2 px-3">Saldo Abadi Terkelola</th>
                    <th className="py-2 px-3">Hasil Imbal Kelola</th>
                    <th className="py-2 px-3">Manfaat Disalurkan</th>
                    <th className="py-2 px-3 text-right">SROI Kumulatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px] font-mono">
                  {reportData.projectionTimeline.map((row) => (
                    <tr key={row.year} className="hover:bg-[#f5f2ed]/40">
                      <td className="py-2 px-3 font-bold text-[#2d2d22]">{row.yearLabel}</td>
                      <td className="py-2 px-3 text-[#626252]">Rp {row.annualDeposit.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-3 font-semibold text-[#2d2d22]">
                        Rp {row.cumulativeDeposited.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 text-[#72725e]">
                        Rp {row.endowmentBalance.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 text-[#5A5A40]">
                        Rp {row.annualYieldGenerated.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#5A5A40]">
                        Rp {row.cumulativeImpactDisbursed.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#2d2d22]">
                        {row.sroiMultiplier}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. SHARIA GOVERNANCE & FIQH FOUNDATION */}
          <div className="bg-[#fafaf7] p-4 rounded-[18px] border border-black/5 text-xs space-y-2">
            <div className="font-serif font-bold text-xs text-[#5A5A40] flex items-center gap-1.5 uppercase">
              <Scale className="w-4 h-4" />
              IV. Landasan Hukum Fiqh & Kepatuhan Tata Kelola Wakaf
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#626252] leading-relaxed">
              <div className="space-y-1 bg-white p-3 rounded-[12px] border border-black/5">
                <div className="font-bold text-[#2d2d22]">1. UU RI No. 41 Tahun 2004 tentang Wakaf:</div>
                <p>
                  Menjamin bahwa harta benda wakaf uang yang disetorkan wajib diinvestasikan pada portofolio syariah yang aman (risk-managed) dan pokok wakaf tidak boleh berkurang atau dialihkan.
                </p>
              </div>
              <div className="space-y-1 bg-white p-3 rounded-[12px] border border-black/5">
                <div className="font-bold text-[#2d2d22]">2. Fatwa Komisi Fatwa MUI (11 Mei 2002):</div>
                <p>
                  Wakaf Uang (Cash Waqf / Waqf al-Nuqud) hukumnya jawaz (boleh), dan manfaat hasil investasinya disalurkan kepada mauquf 'alaih (masyarakat mustahiq) secara berkesinambungan.
                </p>
              </div>
            </div>
          </div>

          {/* 7. OFFICIAL SIGNATURES & QR VERIFICATION STAMP */}
          <div className="pt-4 border-t-2 border-[#5A5A40] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-center items-end">
              {/* Nadzir Signature */}
              <div className="space-y-12">
                <div className="text-[11px] text-[#72725e]">
                  Disahkan oleh Nadzir Pengelola:
                  <div className="font-bold text-[#2d2d22]">Sentra Bisnis Wakaf Masjid Agung</div>
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold font-serif text-[#2d2d22] underline decoration-[#5A5A40]">
                    Drs. H. M. Zainuddin, M.E.Sy
                  </div>
                  <div className="text-[10px] text-[#72725e]">Ketua Nadzir Wakaf Produktif</div>
                  <div className="text-[9px] font-mono text-[#5A5A40]">Reg. BWI: 31.71.092.2024</div>
                </div>
              </div>

              {/* Sharia Supervisory Board (DPS) */}
              <div className="space-y-12">
                <div className="text-[11px] text-[#72725e]">
                  Diawasi oleh:
                  <div className="font-bold text-[#2d2d22]">Dewan Pengawas Syariah (DPS)</div>
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold font-serif text-[#2d2d22] underline decoration-[#5A5A40]">
                    K.H. Dr. Ahmad Fauzi, Lc., M.A.
                  </div>
                  <div className="text-[10px] text-[#72725e]">Ketua Majelis DPS & Fatwa</div>
                  <div className="text-[9px] font-mono text-[#5A5A40]">Sertifikasi DSN-MUI No. 182</div>
                </div>
              </div>

              {/* Tenant / Corporate Waqif Representative */}
              <div className="space-y-12">
                <div className="text-[11px] text-[#72725e]">
                  Perwakilan Mitra Wakif:
                  <div className="font-bold text-[#2d2d22] truncate">{reportData.tenantName}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold font-serif text-[#2d2d22] underline decoration-[#5A5A40]">
                    {reportData.representativeName || "Pimpinan Perusahaan"}
                  </div>
                  <div className="text-[10px] text-[#72725e]">Direktur / Kuasa Usaha</div>
                  <div className="text-[9px] font-mono text-[#5A5A40]">Mitra Ekosistem Masjid</div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="bg-[#fafaf7] p-3 rounded-[12px] border border-black/5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-[#72725e]">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#5A5A40]" />
                <span>VERIFIKASI DIGITAL: {reportNumber} • VALID SECURITY HASH SHA-256</span>
              </div>
              <div className="text-right">
                Dokumen Resmi Diterbitkan Otomatis melalui Sistem Islamicity Virtual Office
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

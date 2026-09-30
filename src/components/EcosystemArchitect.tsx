import React, { useState } from "react";
import { Tenant, EcosystemProposal } from "../types";
import {
  Sparkles,
  Globe,
  Users,
  Truck,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Download,
  Lightbulb,
  HeartHandshake,
  TrendingUp,
  FileSignature,
  Calendar,
  Compass,
  Briefcase,
  Award,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  FileText,
} from "lucide-react";

interface EcosystemArchitectProps {
  tenants?: Tenant[];
  proposals?: EcosystemProposal[];
  onAddProposal: (proposal: EcosystemProposal) => void;
  onNavigateTab?: (tab: string) => void;
}

export const EcosystemArchitect: React.FC<EcosystemArchitectProps> = ({
  tenants = [],
  proposals = [],
  onAddProposal,
  onNavigateTab,
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeProposals = Array.isArray(proposals) ? proposals : [];

  // Input form state
  const [selectedTenantId, setSelectedTenantId] = useState<string>(safeTenants[0]?.id || "custom");
  const [tenantName, setTenantName] = useState<string>(safeTenants[0]?.companyName || "Inisiatif Kolaborasi Berdaya");
  const [targetSector, setTargetSector] = useState<string>(safeTenants[0]?.businessSector || "Agri-Halal & Food Security");
  const [businessIdea, setBusinessIdea] = useState<string>(
    "Kami ingin mengembangkan rantai pasok beras organik dan pupuk hayati dengan mengoptimalkan sawah wakaf pesantren di Jawa Barat. Produk beras ini ingin dipasarkan secara berlangganan bulanan langsung ke jamaah 30 masjid di Jabodetabek, lengkap dengan sistem titik jemput (pick-up hub) di loker virtual office masjid dan sebagian keuntungan dialokasikan untuk beasiswa santri tani."
  );
  const [communityContext, setCommunityContext] = useState<string>(
    "Jaringan 30 DKM Masjid Jabodetabek, 15 Pondok Pesantren Pertanian, dan Komunitas Pengajian Keluarga Muslim"
  );
  const [socialImpactGoal, setSocialImpactGoal] = useState<string>(
    "Kemandirian pangan pesantren, stabilisasi harga beras jamaah tanpa tengkulak, dan 10% marjin untuk dana abadi wakaf sawah produktif."
  );

  // Analysis & Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeProposal, setActiveProposal] = useState<EcosystemProposal | null>(safeProposals[0] || null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [selectedPillarTab, setSelectedPillarTab] = useState<"all" | "islamicity" | "upic" | "logistics">("all");
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});

  // Preset Idea Templates
  const PRESET_IDEAS = [
    {
      title: "Rantai Pasok Beras Organik & Sawah Wakaf Santri",
      sector: "Agri-Halal & Ketahanan Pangan",
      tenantId: "TNT-002",
      idea: "Pengembangan rantai pasok beras organik dan pupuk hayati dengan mengoptimalkan sawah wakaf pesantren di Jawa Barat, terdistribusi ke jamaah 30 masjid via smart lockers virtual office.",
      context: "30 DKM Masjid, 15 Pesantren Santri Preneur, dan Komunitas Pengajian Muslim",
      impact: "Kemandirian pangan pesantren dan alokasi 10% marjin untuk dana abadi wakaf sawah produktif.",
    },
    {
      title: "Green Cold-Chain & Micro-Fulfillment UMKM Kuliner Halal",
      sector: "Halal Logistics & Cold Chain",
      tenantId: "TNT-001",
      idea: "Penyediaan infrastruktur rantai dingin mikro (cold-chain) dan smart locker pendingin di basement masjid untuk menyerap produk frozen food halal UMKM binaan dan disalurkan same-day ke jamaah.",
      context: "200+ UMKM kuliner halal binaan UPIC, jaringan kurir armada motor listrik dhuafa",
      impact: "Penyerapan tenaga kerja pemuda masjid dan pengurangan food waste pangan halal.",
    },
    {
      title: "Fintech Koperasi Syariah & Supply Chain Financing Berjamaah",
      sector: "Keuangan Syariah & Permodalan Berdaya",
      tenantId: "TNT-003",
      idea: "Platform pembiayaan rantai pasok berbasis akad Mudharabah/Musyarakah untuk toko kelontong dan pedagang pasar binaan masjid, didanai dari modal simpanan jamaah koperasi syariah.",
      context: "500 anggota koperasi aktif, 80 pedagang pasar binaan, asosiasi pedagang muslim",
      impact: "Bebas jeratan rentenir riba dan pembagian dividen berkah bagi penabung anggota koperasi.",
    },
    {
      title: "Sustainable Modest Fashion & Ekspor Global Halal",
      sector: "Modest Fashion & Industri Kreatif Muslim",
      tenantId: "TNT-005",
      idea: "Inkubasi konveksi busana muslimah ramah lingkungan karya santriwati, dikurasi dengan sertifikasi halal global, dan didistribusikan ke pasar diaspora via kanal pameran digital Global Islamicity.",
      context: "Komunitas desainer syar'i, workshop menjahit pondok pesantren putri",
      impact: "Pemberdayaan ekonomi muslimah dan alokasi infak seragam sekolah santri yatim.",
    },
  ];

  const handleApplyPreset = (preset: (typeof PRESET_IDEAS)[0]) => {
    setSelectedTenantId(preset.tenantId);
    const tenant = safeTenants.find((t) => t.id === preset.tenantId);
    setTenantName(tenant ? tenant.companyName : "Inisiator Ekosistem Berdaya");
    setTargetSector(preset.sector);
    setBusinessIdea(preset.idea);
    setCommunityContext(preset.context);
    setSocialImpactGoal(preset.impact);
  };

  const handleTenantChange = (tId: string) => {
    setSelectedTenantId(tId);
    if (tId === "custom") {
      setTenantName("Inisiator Ekosistem Baru");
      setTargetSector("Ekonomi Syariah Terpadu");
    } else {
      const tenant = safeTenants.find((t) => t.id === tId);
      if (tenant) {
        setTenantName(tenant.companyName);
        setTargetSector(tenant.businessSector);
      }
    }
  };

  // Trigger Ecosystem AI Analysis
  const handleGenerateProposal = async () => {
    if (!businessIdea.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/ecosystem-matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIdea,
          tenantName: tenantName || "Inisiatif Kolaborasi Berdaya",
          targetSector,
          communityContext,
          socialImpactGoal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menghasilkan proposal sinergi.");
      }

      const newProposal: EcosystemProposal = {
        id: `PROP-2026-${String(safeProposals.length + 101).padStart(3, "0")}`,
        tenantId: selectedTenantId !== "custom" ? selectedTenantId : undefined,
        tenantName: tenantName || "Inisiatif Kolaborasi Berdaya",
        businessIdea,
        targetSector,
        coreValueProposition: data.coreValueProposition || "Membangun sinergi ekosistem bisnis halal berbasis 3 pilar platform.",
        platformIntegrationMap: {
          islamicity: data.platformIntegrationMap?.islamicity || "Penyusunan kurikulum literasi muamalah dan eksposur pasar global.",
          upic: data.platformIntegrationMap?.upic || "Inkubasi komunitas dan mobilisasi pre-order berjamaah.",
          logisticsHub: data.platformIntegrationMap?.logisticsHub || "Konsolidasi distribusi dan titik transit smart fulfillment.",
        },
        fastTrackAction: Array.isArray(data.fastTrackAction) && data.fastTrackAction.length > 0 ? data.fastTrackAction : [
          "Hari 1-10: Sinkronisasi blueprint kolaborasi & kurasi standar halal.",
          "Hari 11-20: Pembukaan program percontohan inkubasi di sentra masjid UPIC.",
          "Hari 21-30: Integrasi pengiriman logistik dan aktivasi transaksi perdana.",
        ],
        monetizationAndSustainability: Array.isArray(data.monetizationAndSustainability) && data.monetizationAndSustainability.length > 0 ? data.monetizationAndSustainability : [
          "Skema Bagi Hasil Musyarakah (Revenue Sharing) yang berkeadilan.",
          "Alokasi Dana Wakaf Produktif 5-10% untuk keberlanjutan sarana umat.",
        ],
        synergyScore: typeof data.synergyScore === "number" ? data.synergyScore : 96,
        multiplierBerkahIndex: data.multiplierBerkahIndex || "Sangat Tinggi (1:4.8 Social ROI)",
        tags: [targetSector, "Sinergi 3 Pilar", "Ekonomi Berjamaah"],
        createdAt: new Date().toISOString().split("T")[0],
        status: "Review Sinergi",
      };

      onAddProposal(newProposal);
      setActiveProposal(newProposal);
      setCompletedSteps({});
    } catch (err: any) {
      console.error("Matchmaker analysis error:", err);
      // Fallback proposal
      const fallbackProposal: EcosystemProposal = {
        id: `PROP-2026-${String(safeProposals.length + 101).padStart(3, "0")}`,
        tenantId: selectedTenantId !== "custom" ? selectedTenantId : undefined,
        tenantName: tenantName || "Inisiatif Kolaborasi Berdaya",
        businessIdea,
        targetSector,
        coreValueProposition: `Mentransformasikan inisiatif ${tenantName} menjadi penggerak ekonomi syariah berdaya saing tinggi melalui konvergensi ilmu, jamaah, dan logistik terpadu.`,
        platformIntegrationMap: {
          islamicity: "Standarisasi kurikulum literasi Fiqh Muamalah, penyusunan studi kelayakan syariah, dan pembukaan akses showcase ke jaringan global Islamicity.",
          upic: "Pelaksanaan inkubasi terstruktur, pengorganisasian pre-order berjamaah warga masjid, dan fasilitasi forum kolaborasi antar pengusaha muslim binaan.",
          logisticsHub: "Pemanfaatan loker pintar transit 24/7 di sentra virtual office, optimalisasi rute last-mile distribution bebas emisi, dan pengelolaan persediaan sirkular.",
        },
        fastTrackAction: [
          "Hari 1-10: Penyusunan Nota Kesepahaman (MoU) Sinergi 3 Pilar & kurasi standar produk.",
          "Hari 11-20: Pembukaan pendaftaran pilot project bagi 50 peserta percontohan di 3 masjid binaan UPIC.",
          "Hari 21-30: Integrasi sistem logistik dan peluncuran batch pemesanan perdana dengan jaminan amanah.",
        ],
        monetizationAndSustainability: [
          "Skema Bagi Hasil Musyarakah Mutanaqisah (MMQ) / Ujrah Layanan Terkelola dengan pembagian proporsional yang transparan.",
          "Alokasi Dana Abadi Wakaf Produktif 5% dari surplus operasional untuk mendukung beasiswa santri dan permodalan bergulir.",
        ],
        synergyScore: 95,
        multiplierBerkahIndex: "Sangat Tinggi (1:4.7 Social ROI)",
        tags: [targetSector, "Sinergi 3 Pilar", "Berkah Berkelanjutan"],
        createdAt: new Date().toISOString().split("T")[0],
        status: "Review Sinergi",
      };

      onAddProposal(fallbackProposal);
      setActiveProposal(fallbackProposal);
      setCompletedSteps({});
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Full Proposal text
  const handleCopyProposal = () => {
    if (!activeProposal) return;

    const fastTrackList = Array.isArray(activeProposal.fastTrackAction) ? activeProposal.fastTrackAction : [];
    const monList = Array.isArray(activeProposal.monetizationAndSustainability) ? activeProposal.monetizationAndSustainability : [];

    const textToCopy = `=== PROPOSAL KOLABORASI STRATEGIS EKOSISTEM ISLAMICITY ===
Inisiator: ${activeProposal.tenantName}
Sektor Usaha: ${activeProposal.targetSector || "Ekonomi Syariah"}
Tanggal: ${activeProposal.createdAt}
Indeks Sinergi: ${activeProposal.synergyScore || 95}% | Multiplier Berkah: ${activeProposal.multiplierBerkahIndex || "Tinggi"}

1. CORE VALUE PROPOSITION:
${activeProposal.coreValueProposition}

2. PLATFORM INTEGRATION MAP (3 PILAR SINERGI):
- Global Islamicity (Knowledge, Education, & Global Exposure):
  ${activeProposal.platformIntegrationMap?.islamicity || "-"}

- UPIC (Community Network, Program Incubator, & Citizen Engagement):
  ${activeProposal.platformIntegrationMap?.upic || "-"}

- Logistics Hub (Supply Chain, Circular Economy, & Distribution):
  ${activeProposal.platformIntegrationMap?.logisticsHub || "-"}

3. FAST-TRACK ACTION (QUICK WINS - 30 HARI PERTAMA):
${fastTrackList.map((step, idx) => `  ${idx + 1}. ${step}`).join("\n")}

4. MONETIZATION & SUSTAINABILITY MODEL:
${monList.map((model, idx) => `  ${idx + 1}. ${model}`).join("\n")}

---
Diterbitkan oleh Strategic Business Matchmaker & Ecosystem Architect
Islamicity Virtual Office & Co-Working Platform
Prinsip: Ekonomi BerDakwah, BerSyariah, Berjamaah & Berkelanjutan.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // WhatsApp Share Pitch
  const handleShareWhatsApp = () => {
    if (!activeProposal) return;
    const islText = activeProposal.platformIntegrationMap?.islamicity || "";
    const upicText = activeProposal.platformIntegrationMap?.upic || "";
    const logText = activeProposal.platformIntegrationMap?.logisticsHub || "";
    const firstMon = (activeProposal.monetizationAndSustainability && activeProposal.monetizationAndSustainability[0]) || "-";

    const waText = encodeURIComponent(
      `*PROPOSAL SINERGI 3 PILAR ISLAMICITY VIRTUAL OFFICE*\n\n` +
      `*Inisiator*: ${activeProposal.tenantName}\n` +
      `*Core Value Proposition*:\n"${activeProposal.coreValueProposition}"\n\n` +
      `*Integrasi 3 Pilar*:\n` +
      `1️⃣ *Global Islamicity*: ${islText.slice(0, 120)}...\n` +
      `2️⃣ *UPIC Incubator*: ${upicText.slice(0, 120)}...\n` +
      `3️⃣ *Logistics Hub*: ${logText.slice(0, 120)}...\n\n` +
      `*Skema Pendanaan Halal*:\n${firstMon}\n\n` +
      `_Mari kita diskusikan langkah fast-track 30 hari untuk eksekusi pilot bersama!_`
    );
    window.open(`https://api.whatsapp.com/send?text=${waText}`, "_blank");
  };

  // Download Proposal File
  const handleDownloadFile = () => {
    if (!activeProposal) return;
    const fastTrackList = Array.isArray(activeProposal.fastTrackAction) ? activeProposal.fastTrackAction : [];
    const monList = Array.isArray(activeProposal.monetizationAndSustainability) ? activeProposal.monetizationAndSustainability : [];

    const content = `# PROPOSAL KOLABORASI STRATEGIS EKOSISTEM ISLAMICITY
**Inisiator:** ${activeProposal.tenantName}  
**Sektor Usaha:** ${activeProposal.targetSector || "Ekonomi Syariah"}  
**Status Sinergi:** ${activeProposal.status || "Review Sinergi"}  
**Tanggal Penerbitan:** ${activeProposal.createdAt}  
**Skor Sinergi Ekosistem:** ${activeProposal.synergyScore || 96}%  

---

## 1. Core Value Proposition
> "${activeProposal.coreValueProposition}"

---

## 2. Platform Integration Map (3 Pilar Platform)

### A. Global Islamicity (Knowledge, Education, & Global Exposure)
${activeProposal.platformIntegrationMap?.islamicity || "-"}

### B. UPIC (Community Network, Program Incubator, & Citizen Engagement)
${activeProposal.platformIntegrationMap?.upic || "-"}

### C. Logistics Hub (Supply Chain, Circular Economy, & Distribution)
${activeProposal.platformIntegrationMap?.logisticsHub || "-"}

---

## 3. Fast-Track Action (Quick Wins 30 Hari Pertama)
${fastTrackList.map((step, idx) => `${idx + 1}. **${step.split(":")[0] || `Langkah ${idx + 1}`}**: ${step.split(":")[1] || step}`).join("\n")}

---

## 4. Monetization & Sustainability Model
${monList.map((model, idx) => `${idx + 1}. ${model}`).join("\n\n")}

---
*Dibuat otomatis oleh Strategic Business Matchmaker & Ecosystem Architect - Islamicity Virtual Office.*
*Berlandaskan prinsip Ekonomi BerDakwah, BerSyariah, Berjamaah & Berkelanjutan.*
`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Proposal_Sinergi_${(activeProposal.tenantName || "Ecosystem").replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleStepCompleted = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategic Role Persona Header */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#5A5A40] text-white text-xs font-bold px-3 py-1 rounded-full font-mono shadow-xs flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                STRATEGIC BUSINESS MATCHMAKER & ECOSYSTEM ARCHITECT
              </span>
              <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
                3 Pilar Sinergi Platform
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2d2d22] tracking-tight">
              Arsitek Ekosistem & Akselerator Bisnis Berdaya Syariah
            </h2>

            <p className="text-xs sm:text-sm text-[#626252] leading-relaxed">
              Mentransformasikan percakapan dan ide bisnis menjadi <strong>proposal kolaborasi konkret</strong> yang mengintegrasikan 3 pilar platform: <strong>Global Islamicity</strong> (Knowledge & Exposure), <strong>UPIC</strong> (Community & Incubation), dan <strong>Logistics Hub</strong> (Supply Chain & Circular Economy).
            </p>
          </div>

          {/* 3 Pillars Visual Mini Badge Grid */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 flex items-center gap-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#2d2d22]">Global Islamicity</div>
                <div className="text-[10px] text-[#72725e]">Knowledge & Global</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 flex items-center gap-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-[#8A8A6A] text-white flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#2d2d22]">UPIC Incubator</div>
                <div className="text-[10px] text-[#72725e]">Community Network</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 flex items-center gap-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-[#383827] text-white flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#2d2d22]">Logistics Hub</div>
                <div className="text-[10px] text-[#72725e]">Supply & Circular</div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Philosophy Strip */}
        <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#72725e]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            <span>Prinsip Utama: <strong>Ekonomi BerDakwah, BerSyariah, Berjamaah & Berkelanjutan</strong></span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-[#5A5A40] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Bebas Riba & Gharar
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#5A5A40] font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" /> Sinergi Multi-Pihak Berkeadilan
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Ideation Workbench & Live Generated Proposal Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Workbench & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Preset Ideas Card */}
          <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Preset Inspirasi Sinergi 3 Pilar
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#72725e] bg-[#f5f5f0] px-2 py-0.5 rounded-full">
                4 Kasus Nyata
              </span>
            </div>
            <p className="text-[11px] text-[#72725e]">
              Pilih contoh inisiatif bisnis untuk menguji formulasi proposal kolaborasi 3 pilar platform secara instan:
            </p>

            <div className="space-y-2">
              {PRESET_IDEAS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full text-left p-3 rounded-2xl bg-[#fafaf7] hover:bg-[#f5f2ed] border border-black/5 hover:border-[#5A5A40]/30 transition-all text-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between font-semibold text-[#2d2d22] group-hover:text-[#5A5A40]">
                    <span>{preset.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#72725e] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-[#72725e] mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-black/5 font-mono">
                      {preset.sector}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workbench Form */}
          <div className="bg-white rounded-[24px] border border-black/5 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <Briefcase className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-base text-[#2d2d22]">
                Input Ide Bisnis & Konteks Sinergi
              </h3>
            </div>

            {/* Select Tenant / Inisiator */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#383827]">
                Penyewa / Inisiator Bisnis:
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="w-full text-xs font-semibold text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-[#5A5A40] cursor-pointer"
              >
                <option value="custom">-- Kustom / Inisiator Baru Luar Tenant --</option>
                {safeTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.companyName} ({t.businessSector})
                  </option>
                ))}
              </select>
            </div>

            {selectedTenantId === "custom" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#383827]">
                  Nama Entitas / Usaha Inisiator:
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Misal: Startup Halal AI Agrotech Nusantara"
                  className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>
            )}

            {/* Target Sector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#383827]">
                Sektor & Bidang Industri:
              </label>
              <input
                type="text"
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                placeholder="Misal: Pangan Halal, Logistics, Edutech Syariah"
                className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>

            {/* Business Idea / Conversation Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#383827]">
                  Deskripsi Ide Bisnis / Ringkasan Percakapan:
                </label>
                <span className="text-[10px] text-[#72725e]">Bahan Analisis AI</span>
              </div>
              <textarea
                rows={5}
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="Ceritakan ide bisnis, potensi pasar, mitra yang dicari, produk/jasa yang ingin diinkubasi..."
                className="w-full text-xs text-[#2d2d22] bg-[#fafaf7] border border-[#5A5A40]/20 rounded-xl p-3.5 focus:ring-1 focus:ring-[#5A5A40] leading-relaxed"
              />
            </div>

            {/* Community & Social Impact Goals */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#383827]">
                  Jaringan Komunitas & Target Jamaah:
                </label>
                <input
                  type="text"
                  value={communityContext}
                  onChange={(e) => setCommunityContext(e.target.value)}
                  placeholder="Misal: Jaringan DKM Masjid, Koperasi Pesantren"
                  className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#383827]">
                  Target Dampak Sosial & Wakaf Produktif:
                </label>
                <input
                  type="text"
                  value={socialImpactGoal}
                  onChange={(e) => setSocialImpactGoal(e.target.value)}
                  placeholder="Misal: 10% marjin untuk beasiswa santri & wakaf sawah"
                  className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateProposal}
              disabled={isLoading || !businessIdea.trim()}
              className="w-full py-3.5 bg-[#5A5A40] hover:bg-[#484833] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#5A5A40]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menganalisis & Merancang Proposal 3 Pilar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                  <span>Transformasikan Sinergi 3 Pilar AI</span>
                </>
              )}
            </button>
          </div>

          {/* Archived Proposals Selector */}
          {safeProposals.length > 0 && (
            <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xs text-[#2d2d22] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Portofolio Sinergi Terarsip ({safeProposals.length})</span>
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {safeProposals.map((p) => {
                  const isCurrent = activeProposal?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveProposal(p);
                        setCompletedSteps({});
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                          : "bg-[#fafaf7] hover:bg-[#f5f2ed] border-black/5 text-[#2d2d22]"
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold truncate">{p.tenantName}</div>
                        <div className={`text-[10px] truncate ${isCurrent ? "text-white/80" : "text-[#72725e]"}`}>
                          {p.coreValueProposition}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${
                        isCurrent ? "bg-white/20 text-white" : "bg-[#E4E3DA] text-[#5A5A40]"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Strategic Proposal Deck (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {activeProposal ? (
            <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Proposal Header & Action Bar */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-black/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40] border border-[#5A5A40]/15">
                      {activeProposal.id}
                    </span>
                    <span className="text-xs text-[#72725e] flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-[#5A5A40]" />
                      {activeProposal.createdAt}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#383827] border border-[#5A5A40]/15">
                      Status: {activeProposal.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                    Proposal Sinergi: {activeProposal.tenantName}
                  </h3>
                  <p className="text-xs text-[#72725e]">
                    Sektor: <strong>{activeProposal.targetSector || "Ekonomi Syariah"}</strong>
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleCopyProposal}
                    className="px-3 py-1.5 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border border-[#5A5A40]/20 cursor-pointer"
                    title="Salin Naskah Lengkap Proposal"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-700" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Teks</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3 py-1.5 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#2d2d22] rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border border-black/10 cursor-pointer"
                    title="Bagikan Ringkasan ke WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Unduh Berkas Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .MD</span>
                  </button>
                </div>
              </div>

              {/* Ecosystem Synergy KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                  <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Skor Sinergi 3 Pilar:</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-2xl font-bold text-[#2d2d22]">
                      {activeProposal.synergyScore || 96}%
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40]">
                      Tinggi
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                  <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Multiplier Berkah:</span>
                  </div>
                  <div className="font-serif text-sm sm:text-base font-bold text-[#383827] truncate">
                    {activeProposal.multiplierBerkahIndex || "1:4.8 Social ROI"}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                  <div className="text-[11px] text-[#72725e] font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Kepatuhan Syariah:</span>
                  </div>
                  <div className="text-xs font-bold text-[#5A5A40] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Tervalidasi Fiqh Muamalah</span>
                  </div>
                </div>
              </div>

              {/* 1. Core Value Proposition (Section 1) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-xs font-bold font-mono">
                    1
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                    Core Value Proposition
                  </h4>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/20 space-y-1.5">
                  <p className="font-serif text-base sm:text-lg font-bold text-[#2d2d22] leading-snug italic">
                    "{activeProposal.coreValueProposition}"
                  </p>
                  <p className="text-[11px] text-[#72725e]">
                    Pernyataan nilai kunci yang menjadi pembeda strategis dan pengikat kolaborasi lintas entitas.
                  </p>
                </div>
              </div>

              {/* 2. Platform Integration Map (Section 2) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-xs font-bold font-mono">
                      2
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                      Platform Integration Map (3 Pilar Utama)
                    </h4>
                  </div>

                  {/* Pillar Filter Pills */}
                  <div className="flex items-center gap-1 bg-[#f5f5f0] p-1 rounded-full border border-black/5 text-[11px]">
                    <button
                      onClick={() => setSelectedPillarTab("all")}
                      className={`px-3 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                        selectedPillarTab === "all" ? "bg-[#5A5A40] text-white" : "text-[#72725e]"
                      }`}
                    >
                      Semua Pilar
                    </button>
                    <button
                      onClick={() => setSelectedPillarTab("islamicity")}
                      className={`px-3 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                        selectedPillarTab === "islamicity" ? "bg-[#5A5A40] text-white" : "text-[#72725e]"
                      }`}
                    >
                      Islamicity
                    </button>
                    <button
                      onClick={() => setSelectedPillarTab("upic")}
                      className={`px-3 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                        selectedPillarTab === "upic" ? "bg-[#5A5A40] text-white" : "text-[#72725e]"
                      }`}
                    >
                      UPIC
                    </button>
                    <button
                      onClick={() => setSelectedPillarTab("logistics")}
                      className={`px-3 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                        selectedPillarTab === "logistics" ? "bg-[#5A5A40] text-white" : "text-[#72725e]"
                      }`}
                    >
                      Logistics
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* Pillar 1: Global Islamicity */}
                  {(selectedPillarTab === "all" || selectedPillarTab === "islamicity") && (
                    <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2 relative overflow-hidden group hover:border-[#5A5A40]/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-serif font-bold text-sm text-[#2d2d22]">
                              1. Global Islamicity
                            </h5>
                            <span className="text-[10px] text-[#72725e]">
                              Knowledge, Education, & Global Exposure
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40]">
                          Fokus Edukasi & Pasar
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#3a3a2e] leading-relaxed pl-10">
                        {activeProposal.platformIntegrationMap?.islamicity || "Penyusunan kurikulum literasi muamalah dan kurasi showcase produk ke jaringan diaspora global."}
                      </p>

                      <div className="pl-10 pt-1 flex flex-wrap items-center gap-2 text-[10px]">
                        <a
                          href="http://voffice.islamicity.tv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5A5A40] hover:underline font-mono"
                        >
                          voffice.islamicity.tv ↗
                        </a>
                        <span>•</span>
                        <a
                          href="http://virtualoffice.islamicity.tv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5A5A40] hover:underline font-mono"
                        >
                          virtualoffice.islamicity.tv ↗
                        </a>
                        <span>•</span>
                        <a
                          href="http://global.tecs.islamicity.tv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5A5A40] hover:underline font-mono"
                        >
                          global.tecs.islamicity.tv ↗
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Pillar 2: UPIC */}
                  {(selectedPillarTab === "all" || selectedPillarTab === "upic") && (
                    <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2 relative overflow-hidden group hover:border-[#5A5A40]/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#8A8A6A] text-white flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-serif font-bold text-sm text-[#2d2d22]">
                              2. UPIC (Urban/Pondok Incubator Community)
                            </h5>
                            <span className="text-[10px] text-[#72725e]">
                              Community Network, Program Incubator, & Citizen Engagement
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/15">
                          Inkubasi & Komunitas
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#3a3a2e] leading-relaxed pl-10">
                        {activeProposal.platformIntegrationMap?.upic || "Inkubasi program pendampingan usaha dan mobilisasi pre-order berjamaah warga masjid."}
                      </p>

                      <div className="pl-10 pt-1 flex flex-wrap items-center gap-2 text-[10px]">
                        <a
                          href="http://coworking.islamicity.tv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5A5A40] hover:underline font-mono"
                        >
                          coworking.islamicity.tv ↗
                        </a>
                        <span>•</span>
                        <a
                          href="http://potensi.islamicity.tv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5A5A40] hover:underline font-mono"
                        >
                          potensi.islamicity.tv ↗
                        </a>
                        <span>•</span>
                        <a
                          href="http://register.islamicity.tv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5A5A40] hover:underline font-mono"
                        >
                          register.islamicity.tv ↗
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Pillar 3: Logistics Hub */}
                  {(selectedPillarTab === "all" || selectedPillarTab === "logistics") && (
                    <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2 relative overflow-hidden group hover:border-[#5A5A40]/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#383827] text-white flex items-center justify-center">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-serif font-bold text-sm text-[#2d2d22]">
                              3. Logistics Hub
                            </h5>
                            <span className="text-[10px] text-[#72725e]">
                              Supply Chain, Circular Economy, & Distribution
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#383827]">
                          Rantai Pasok Sirkular
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#3a3a2e] leading-relaxed pl-10">
                        {activeProposal.platformIntegrationMap?.logisticsHub || "Penyediaan loker pintar transit 24/7 dan konsolidasi rute pengiriman bebas emisi."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Fast-Track Action (Quick Wins - 30 Hari Pertama) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-xs font-bold font-mono">
                      3
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                      Fast-Track Action (Quick Wins - 30 Hari Pertama)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#72725e]">
                    Klik untuk menandai progres langkah:
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(Array.isArray(activeProposal.fastTrackAction) ? activeProposal.fastTrackAction : []).map((step, idx) => {
                    const isDone = Boolean(completedSteps[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStepCompleted(idx)}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isDone
                            ? "bg-[#f5f2ed] border-[#5A5A40]/40 text-[#5A5A40]"
                            : "bg-[#fafaf7] hover:bg-white border-black/5 text-[#2d2d22]"
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#5A5A40] fill-[#E4E3DA]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-[#72725e]/40" />
                          )}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className={`text-xs font-bold ${isDone ? "line-through text-[#72725e]" : "text-[#2d2d22]"}`}>
                            Langkah {idx + 1}: {step.split(":")[0] || `Tahap ${idx + 1}`}
                          </div>
                          <p className={`text-xs leading-relaxed ${isDone ? "text-[#72725e]" : "text-[#4a4a3a]"}`}>
                            {step.split(":")[1] || step}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Monetization & Sustainability Model */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-xs font-bold font-mono">
                    4
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                    Monetization & Sustainability Model (Pendapatan & Wakaf Berkelanjutan)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(Array.isArray(activeProposal.monetizationAndSustainability) ? activeProposal.monetizationAndSustainability : []).map((model, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2 hover:border-[#5A5A40]/20 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold font-serif text-[#2d2d22] flex items-center gap-1.5">
                          <HeartHandshake className="w-3.5 h-3.5 text-[#5A5A40]" />
                          Skema {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40]">
                          Halal & Berdaya
                        </span>
                      </div>
                      <p className="text-xs text-[#3a3a2e] leading-relaxed">
                        {model}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps: Cross link to Contract Generator */}
              <div className="p-4 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/20 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h5 className="font-serif font-bold text-xs text-[#2d2d22]">
                    Siap Memformalkan Kolaborasi ke Akad Ijarah / Syirkah?
                  </h5>
                  <p className="text-[11px] text-[#72725e]">
                    Gunakan AI Legal Assistant untuk menyusun Surat Perjanjian Sinergi sesuai standar Fatwa DSN-MUI.
                  </p>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab("contract_generator")}
                    className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>Buat Akad Ijarah AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-black/5 p-12 text-center space-y-3">
              <Compass className="w-12 h-12 text-[#5A5A40] mx-auto opacity-40" />
              <h3 className="font-serif font-bold text-lg text-[#2d2d22]">
                Belum Ada Proposal Sinergi Terpilih
              </h3>
              <p className="text-xs text-[#72725e] max-w-md mx-auto">
                Ketikkan ide bisnis Anda di formulir sebelah kiri atau pilih salah satu preset inspirasi untuk merancang proposal 3 pilar platform.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

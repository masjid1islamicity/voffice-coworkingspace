import React, { useState } from "react";
import {
  ISLAMICITY_DOMAIN_PILLARS,
  MOSQUE_COMMUNITY_HUBS,
  GLOBAL_TECS_COURSES,
  INITIAL_POTENSI_REGISTRATIONS,
  VIRTUAL_CITIES,
  BANK_BROKER_VOUCHERS,
} from "../data/islamicity4Data";
import {
  MosqueCommunityHub,
  TrainingCourseGlobalTecs,
  PotensiRegistrationForm,
  VirtualCity,
  BankBrokerVoucherPool,
  IslamicityVaQuery,
} from "../types";
import { VirtualCityView } from "./VirtualCityView";
import { BankBrokerView } from "./BankBrokerView";
import { IslamicityAssistantView } from "./IslamicityAssistantView";
import { ExecutiveSummaryView } from "./ExecutiveSummaryView";
import {
  Building2,
  Globe2,
  Users,
  Database,
  UserCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Search,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  ShieldCheck,
  Send,
  BookOpen,
  Calendar,
  Award,
  Clock,
  ChevronRight,
  Check,
  RefreshCw,
  Sliders,
  DollarSign,
  Share2,
  Bot,
  Layers,
  Coins,
  Recycle,
  Radio,
  FileCheck,
  Scale,
  MessageSquare,
  HelpCircle,
  Copy,
  FileText,
} from "lucide-react";

interface VirtualOffice4EcosystemProps {
  onNavigateTab?: (tab: string) => void;
}

export const VirtualOffice4Ecosystem: React.FC<VirtualOffice4EcosystemProps> = ({
  onNavigateTab,
}) => {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    "overview_pillars" | "executive_summary" | "virtual_cities" | "bank_broker" | "islamicity_va" | "mosque_network" | "potensi_register" | "global_tecs"
  >("overview_pillars");

  // VirtualCity & Collateral Management State
  const [selectedVirtualCity, setSelectedVirtualCity] = useState<VirtualCity>(VIRTUAL_CITIES[0]);
  const [citySearch, setCitySearch] = useState<string>("");

  // Islamicity Virtual Assistant (VA) State
  const [vaUserPrompt, setVaUserPrompt] = useState<string>("");
  const [isVaLoading, setIsVaLoading] = useState<boolean>(false);
  const [vaMessages, setVaMessages] = useState<IslamicityVaQuery[]>([
    {
      id: "VA-INIT-01",
      timestamp: "09:00 WIB",
      sender: "assistant",
      text: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Ahlan wa sahlan! Saya adalah Islamicity Virtual Assistant (VA), asisten perangkat lunak AI khusus untuk membimbing Fiqh Muamalah, legalitas aset manajemen, kolateral syariah, dan pemanfaatan ekosistem VirtualOffice 4.0 bagi 800.000+ Masjid di 8.000 Kecamatan. Ada yang bisa saya bantu hari ini?",
      topic: "virtual_office_guide",
      quranReference: "QS. Al-Baqarah: 282 (Pencatatan Transaksi & Keadilan Muamalah)",
      hadithReference: "HR. Tirmidzi No. 1209 (Pedagang yang amanah bersama para Nabi)",
      actionRecommendation: "Pilih topik seputar legalitas, jaminan kolateral aset, atau sensus potensi UKM masjid.",
    },
  ]);

  // Mosque Search & Filter
  const [searchKecamatan, setSearchKecamatan] = useState<string>("");
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("all");
  const [selectedHub, setSelectedHub] = useState<MosqueCommunityHub>(MOSQUE_COMMUNITY_HUBS[0]);

  // Global TECS Courses State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourseGlobalTecs>(
    GLOBAL_TECS_COURSES[0]
  );
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);

  // Potensi Registration Form State
  const [registrations, setRegistrations] = useState<PotensiRegistrationForm[]>(
    INITIAL_POTENSI_REGISTRATIONS
  );
  const [applicantName, setApplicantName] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [businessLegalForm, setBusinessLegalForm] = useState<
    PotensiRegistrationForm["businessLegalForm"]
  >("UMKM Komunitas Masjid");
  const [sector, setSector] = useState<string>("Agri-Halal & Pangan Thayyib");
  const [mosqueName, setMosqueName] = useState<string>("Masjid Agung Syariah Sentra Menteng Hub");
  const [kecamatanCity, setKecamatanCity] = useState<string>("Kecamatan Menteng, Jakarta Pusat");
  const [assetEstimate, setAssetEstimate] = useState<number>(75000000);
  const [monthlyTurnoverEstimate, setMonthlyTurnoverEstimate] = useState<number>(25000000);
  const [currentEmployeesCount, setCurrentEmployeesCount] = useState<number>(3);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    "Alamat Domisili Virtual Office",
    "Sertifikasi Halal Mandiri",
    "Pelatihan Fiqh Muamalah 4.0",
  ]);

  // AI Assessment Result State
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    scorePotensi: number;
    competitivenessLevel: string;
    recommendedGlobalTecsCourse: string;
    courseReasoning: string;
    accelerationRoadmap: string[];
    spiritualWisdom: string;
    portalRecommendation: string;
  } | null>(null);

  // Available needs options
  const NEED_OPTIONS = [
    "Alamat Domisili Virtual Office",
    "Sertifikasi Halal Mandiri",
    "Izin Berusaha OSS-RBA & NIB",
    "Hot Desk Coworking Masjid",
    "Smart Mailroom Locker Terverifikasi",
    "Pelatihan Fiqh Muamalah 4.0",
    "Permodalan Syariah / BMT Tanpa Riba",
    "Ekspor Halal ke Pasar Dunia",
  ];

  const toggleNeed = (item: string) => {
    if (selectedNeeds.includes(item)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== item));
    } else {
      setSelectedNeeds([...selectedNeeds, item]);
    }
  };

  // Submit Potensi Registration & Trigger AI
  const handleSubmitPotensi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !businessName || !mosqueName) return;

    setIsAssessing(true);
    setAssessmentResult(null);

    try {
      const res = await fetch("/api/ai/potensi-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName,
          businessName,
          businessLegalForm,
          sector,
          mosqueName,
          kecamatanCity,
          assetEstimate,
          monthlyTurnoverEstimate,
          currentEmployeesCount,
          mainNeeds: selectedNeeds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses penilaian");

      setAssessmentResult(data);

      // Append to list
      const newEntry: PotensiRegistrationForm = {
        id: `POT-2026-${String(registrations.length + 101).padStart(3, "0")}`,
        applicantName,
        whatsappNumber,
        email,
        businessName,
        businessLegalForm,
        sector,
        mosqueName,
        kecamatanCity,
        assetEstimate,
        monthlyTurnoverEstimate,
        currentEmployeesCount,
        mainNeeds: selectedNeeds,
        submittedAt: new Date().toISOString().split("T")[0],
        status: "assessment_scheduled",
        scorePotensi: data.scorePotensi || 92,
      };

      setRegistrations([newEntry, ...registrations]);
    } catch {
      // Fallback result
      const fallback = {
        scorePotensi: 91,
        competitivenessLevel: "Taraf Nasional Berdaya",
        recommendedGlobalTecsCourse: "Fiqh Muamalah 4.0 & Adab Bisnis Syariah Digital Modern",
        courseReasoning:
          "Memperkuat kepatuhan syariah dan pondasi legalitas sebelum membuka akses permodalan BMT.",
        accelerationRoadmap: [
          "Langkah 1: Aktivasi Alamat Domisili Resmi di voffice.islamicity.tv",
          "Langkah 2: Pendampingan Sertifikasi Halal BPJPH melalui SiHalal",
          "Langkah 3: Pemanfaatan Meja Kerja di coworking.islamicity.tv cabang kecamatan",
          "Langkah 4: Mengikuti Coach Course intensif di global.tecs.islamicity.tv",
        ],
        spiritualWisdom:
          "Mari belajar kepada Allah SWT bahwa perniagaan yang jujur adalah jalan dakwah yang meninggikan derajat umat di pentas nasional dan internasional.",
        portalRecommendation: "http://voffice.islamicity.tv",
      };
      setAssessmentResult(fallback);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleEnrollCourse = (course: TrainingCourseGlobalTecs) => {
    if (!enrolledCourses.includes(course.id)) {
      setEnrolledCourses([...enrolledCourses, course.id]);
    }
    setEnrollSuccessMessage(
      `Alhamdulillah! Anda berhasil terdaftar di "${course.title}". Undangan Zoom & Modul diakses via ${course.linkUrl}`
    );
    setTimeout(() => {
      setEnrollSuccessMessage(null);
    }, 4500);
  };

  // Filtered Hubs
  const filteredHubs = MOSQUE_COMMUNITY_HUBS.filter((h) => {
    const matchesSearch =
      h.mosqueName.toLowerCase().includes(searchKecamatan.toLowerCase()) ||
      h.subdistrictKecamatan.toLowerCase().includes(searchKecamatan.toLowerCase()) ||
      h.regencyKota.toLowerCase().includes(searchKecamatan.toLowerCase());
    const matchesProv =
      selectedProvinceFilter === "all" || h.province === selectedProvinceFilter;
    return matchesSearch && matchesProv;
  });

  // Filtered Courses
  const filteredCourses = GLOBAL_TECS_COURSES.filter((c) => {
    if (selectedCategory === "all") return true;
    return c.category === selectedCategory;
  });

  // Filtered Virtual Cities
  const filteredCities = VIRTUAL_CITIES.filter((vc) => {
    return (
      vc.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      vc.province.toLowerCase().includes(citySearch.toLowerCase()) ||
      vc.capNodeId.toLowerCase().includes(citySearch.toLowerCase())
    );
  });

  // Handle Send to Islamicity Virtual Assistant (VA)
  const handleSendVaQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaUserPrompt.trim() || isVaLoading) return;

    const userMsg: IslamicityVaQuery = {
      id: `USR-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      sender: "user",
      text: vaUserPrompt,
    };

    setVaMessages((prev) => [...prev, userMsg]);
    const currentPrompt = vaUserPrompt;
    setVaUserPrompt("");
    setIsVaLoading(true);

    try {
      const res = await fetch("/api/ai/islamicity-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: currentPrompt,
          virtualCityContext: selectedVirtualCity.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses jawaban");

      const aiMsg: IslamicityVaQuery = {
        id: `VA-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        sender: "assistant",
        text: data.assistantResponse || "Alhamdulillah, kami telah mencatat pertanyaan Anda.",
        topic: data.topic,
        quranReference: data.quranReference,
        hadithReference: data.hadithReference,
        actionRecommendation: data.actionRecommendation,
      };

      setVaMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackAiMsg: IslamicityVaQuery = {
        id: `VA-FB-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        sender: "assistant",
        text: `Assalamu'alaikum Warahmatullahi Wabarakatuh. Terkait inisiatif "${currentPrompt.slice(0, 80)}...", VirtualOffice 4.0 di setiap VirtualCity (didukung CAP, UPIC, dan Koperasi Bank Broker DUIT Voucher) siap memfasilitasi legalitas domisili hukum, pendaftaran NIB di voffice.islamicity.tv, pendampingan sertifikasi halal di register.islamicity.tv, dan pembelajaran muamalah di global.tecs.islamicity.tv.`,
        topic: "virtual_office_guide",
        quranReference: "QS. Al-Ma'idah: 2 (Tolong-menolonglah kamu dalam kebajikan dan taqwa)",
        hadithReference: "HR. Muslim No. 2699 (Barangsiapa menempuh jalan menuntut ilmu, Allah mudahkan jalannya menuju surga)",
        actionRecommendation: "Daftarkan potensi UKM Anda di http://potensi.islamicity.tv atau eksplorasi VirtualCity yang relevan.",
      };
      setVaMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsVaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: VirtualOffice 4.0 & Islamicity Ecosystem */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#3a3a29] p-6 sm:p-8 text-[#f5f5f0] shadow-md border border-[#5A5A40]/30">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A5A40] border border-[#A8A890]/30 text-[#E4E3DA] text-xs font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E4E3DA]" />
            <span>VirtualOffice 4.0 Software • Penunjang 800.000+ Masjid & 8.000 Kota Kecamatan</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-[#f5f5f0]">
            Infrastruktur Aplikasi & Ekosistem Terpadu Komunitas Masjid Indonesia ke Dunia
          </h1>

          <p className="text-[#E4E3DA]/90 text-xs sm:text-sm leading-relaxed max-w-3xl font-normal">
            Menghubungkan <strong>http://voffice.islamicity.tv</strong>, <strong>http://virtualoffice.islamicity.tv</strong>, dan <strong>http://coworking.islamicity.tv</strong> agar ribuan Usaha Komunitas Masjid (UKM) dan Usaha Mikro Kecil Menengah (UMKM) jamaah di lebih dari 800.000 Masjid & 8.000 Kecamatan dapat berkembang, naik kelas, dan berlomba-lomba dalam kebaikan (fastabiqul khairat) di tingkat nasional maupun internasional.
          </p>

          {/* Spiritual Verse Callout */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f0]">
              <HeartHandshake className="w-4 h-4 text-[#A8A890]" />
              <span>Yuk Semua Belajar Kepada Allah SWT: Menjemput Kemakmuran Umat</span>
            </div>
            <p className="text-[#E4E3DA]/80 leading-relaxed text-[11px]">
              Daftarkan potensi usaha Anda melalui <strong>http://potensi.islamicity.tv</strong> dan <strong>http://register.islamicity.tv</strong> serta ikuti pembelajaran jarak jauh (eLearning, Training, Education, Coach Course, Seminar, Workshop) di <strong>http://global.tecs.islamicity.tv</strong>.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab("overview_pillars")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "overview_pillars"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>6 Portal Ekosistem TV</span>
            </button>

            <button
              onClick={() => setActiveSubTab("executive_summary")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "executive_summary"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Ringkasan Eksekutif</span>
            </button>

            <button
              onClick={() => setActiveSubTab("virtual_cities")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "virtual_cities"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>VirtualCity & Kolateral Aset</span>
            </button>

            <button
              onClick={() => setActiveSubTab("bank_broker")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "bank_broker"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-emerald-300" />
              <span>Koperasi Bank Broker DUIT</span>
            </button>

            <button
              onClick={() => setActiveSubTab("islamicity_va")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "islamicity_va"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              <span>Islamicity Virtual Assistant (VA)</span>
            </button>

            <button
              onClick={() => setActiveSubTab("mosque_network")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "mosque_network"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>800.000 Masjid (8.000 Kec)</span>
            </button>

            <button
              onClick={() => setActiveSubTab("potensi_register")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "potensi_register"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sensus Potensi & Registrasi</span>
            </button>

            <button
              onClick={() => setActiveSubTab("global_tecs")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "global_tecs"
                  ? "bg-[#f5f5f0] text-[#383827] shadow-sm"
                  : "bg-black/20 text-[#E4E3DA] hover:bg-black/30 border border-white/10"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Global TECS Learning</span>
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Building2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* SUB-TAB 1: 6 PORTAL EKOSISTEM DOMAIN */}
      {activeSubTab === "overview_pillars" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                Arsitektur 6 Pintu Gerbang VirtualOffice 4.0 Islamicity
              </h2>
              <p className="text-xs text-[#72725e]">
                Infrastruktur perangkat lunak terintegrasi untuk menjangkau rantai ekonomi umat dari tingkat DKM musholla/masjid hingga pasar ekspor dunia.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] px-3.5 py-1.5 rounded-full border border-[#5A5A40]/15">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Bebas Riba, Bebas Gharar, Mandiri Berkelanjutan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ISLAMICITY_DOMAIN_PILLARS.map((portal) => (
              <div
                key={portal.domain}
                className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs hover:border-[#5A5A40]/40 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/10">
                      {portal.category}
                    </span>
                    <a
                      href={portal.domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#72725e] group-hover:text-[#5A5A40] transition-colors p-1"
                      title={`Kunjungi ${portal.domain}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-[#2d2d22] group-hover:text-[#5A5A40] transition-colors flex items-center gap-1.5">
                      <span>{portal.name}</span>
                    </h3>
                    <p className="text-xs font-semibold text-[#5A5A40] mt-0.5">
                      {portal.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-[#626252] leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#72725e]">Jangkauan:</span>
                    <span className="font-semibold text-[#2d2d22]">{portal.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#72725e]">Cakupan:</span>
                    <span className="font-bold text-[#5A5A40]">{portal.primaryMetric}</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (portal.domain.includes("potensi") || portal.domain.includes("register")) {
                          setActiveSubTab("potensi_register");
                        } else if (portal.domain.includes("global.tecs")) {
                          setActiveSubTab("global_tecs");
                        } else {
                          setActiveSubTab("mosque_network");
                        }
                      }}
                      className="w-full py-2 bg-[#f5f2ed] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Fitur Software</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Matrix: 800,000 Mosques in 8,000 Subdistricts */}
          <div className="bg-[#fcfbf9] rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-[#2d2d22]">
                  Pemberdayaan 800.000+ Masjid di Kurang Lebih 8.000 Kota Kecamatan
                </h3>
                <p className="text-xs text-[#72725e]">
                  Potensi perputaran ekonomi jamaah masjid jika tiap kecamatan mengaktifkan minimal 1 Sentra Virtual Office & Coworking Hub:
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab("mosque_network")}
                className="px-4 py-2 bg-[#5A5A40] text-white text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-[#484833] transition-all cursor-pointer"
              >
                <span>Lihat Peta Sentra Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
                <div className="text-[11px] text-[#72725e]">Total Masjid Terdata</div>
                <div className="font-serif text-2xl font-bold text-[#2d2d22]">812.450</div>
                <div className="text-[10px] text-[#5A5A40] font-medium">Kemenag & DMI Validated</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
                <div className="text-[11px] text-[#72725e]">Kecamatan Terkoneksi</div>
                <div className="font-serif text-2xl font-bold text-[#5A5A40]">8.140</div>
                <div className="text-[10px] text-[#72725e]">Seluruh Indonesia</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
                <div className="text-[11px] text-[#72725e]">UKM Komunitas Binaan</div>
                <div className="font-serif text-2xl font-bold text-[#2d2d22]">142.500+</div>
                <div className="text-[10px] text-[#5A5A40] font-medium">NIB & Halal Onboarding</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
                <div className="text-[11px] text-[#72725e]">Wakaf Produktif Berputar</div>
                <div className="font-serif text-2xl font-bold text-[#383827]">Rp 48.2 M</div>
                <div className="text-[10px] text-[#72725e]">5% Otomatis dari Ijarah</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: RINGKASAN EKSEKUTIF */}
      {activeSubTab === "executive_summary" && (
        <ExecutiveSummaryView onNavigateSubTab={(tab) => setActiveSubTab(tab as any)} />
      )}

      {/* SUB-TAB: VIRTUAL CITIES & COLLATERAL ASSET MANAGEMENT */}
      {activeSubTab === "virtual_cities" && (
        <VirtualCityView
          onNavigateTab={onNavigateTab}
          onSelectCity={(vc) => setSelectedVirtualCity(vc)}
        />
      )}

      {/* SUB-TAB: KOPERASI BANK BROKER DUIT VOUCHER */}
      {activeSubTab === "bank_broker" && <BankBrokerView />}

      {/* SUB-TAB: ISLAMICITY VIRTUAL ASSISTANT (VA) */}
      {activeSubTab === "islamicity_va" && (
        <IslamicityAssistantView onNavigateTab={onNavigateTab} />
      )}

      {/* SUB-TAB 2: JARINGAN SENTRA MASJID KECAMATAN */}
      {activeSubTab === "mosque_network" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                Direktori Sentra Virtual Office & Coworking Komunitas Masjid
              </h2>
              <p className="text-xs text-[#72725e]">
                Menghubungkan fasilitas fisik masjid (aula, meeting room, loker surat, coworking desk) sebagai simpul operasional UKM di tiap kecamatan.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#72725e] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kecamatan / nama masjid..."
                  value={searchKecamatan}
                  onChange={(e) => setSearchKecamatan(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-[#5A5A40]/20 rounded-full text-xs text-[#2d2d22] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <select
                value={selectedProvinceFilter}
                onChange={(e) => setSelectedProvinceFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#5A5A40]/20 rounded-full text-xs text-[#2d2d22]"
              >
                <option value="all">Semua Provinsi</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="D.I. Yogyakarta">D.I. Yogyakarta</option>
                <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                <option value="Sumatera Utara">Sumatera Utara</option>
                <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                <option value="Kepulauan Riau">Kepulauan Riau</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left List: Mosque Hubs */}
            <div className="lg:col-span-6 space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredHubs.map((hub) => {
                const isSelected = selectedHub.id === hub.id;
                return (
                  <div
                    key={hub.id}
                    onClick={() => setSelectedHub(hub)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#5A5A40] shadow-sm ring-1 ring-[#5A5A40]/30"
                        : "bg-white border-black/5 hover:border-[#5A5A40]/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full">
                            {hub.subdistrictKecamatan}
                          </span>
                          <span className="text-[10px] text-[#72725e]">
                            {hub.regencyKota}, {hub.province}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22]">
                          {hub.mosqueName}
                        </h4>
                        <p className="text-xs text-[#72725e]">
                          Ketua DKM: <strong>{hub.dkmLeader}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-1 rounded-full border border-[#5A5A40]/15">
                          ⭐ {hub.potensiRating}/100
                        </span>
                        <div className="text-[10px] text-[#72725e] mt-1">
                          {hub.totalUmkmAssisted} UKM Binaan
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-xs text-[#626252]">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span>🖥️ {hub.coworkingDesksCapacity} Meja Coworking</span>
                        <span>📦 {hub.smartLockersCount} Loker Pintar</span>
                      </div>
                      <span className="text-[#5A5A40] font-semibold text-[11px] flex items-center gap-1">
                        Detail Hub <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Panel: Selected Mosque Details & Software Gateway */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-5 sticky top-24">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40]">
                        {selectedHub.id}
                      </span>
                      <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi DSN & Kemenag
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2d2d22] mt-1">
                      {selectedHub.mosqueName}
                    </h3>
                    <p className="text-xs text-[#72725e] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>{selectedHub.subdistrictKecamatan}, {selectedHub.regencyKota}, {selectedHub.province} ({selectedHub.postalCode})</span>
                    </p>
                  </div>

                  <a
                    href={selectedHub.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#f5f2ed] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] transition-colors"
                    title={`Akses portal ${selectedHub.portalUrl}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Facilities Matrix */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5">
                    <div className="text-lg font-serif font-bold text-[#2d2d22]">
                      {selectedHub.coworkingDesksCapacity}
                    </div>
                    <div className="text-[10px] text-[#72725e]">Kapasitas Meja Coworking</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5">
                    <div className="text-lg font-serif font-bold text-[#2d2d22]">
                      {selectedHub.meetingRoomsAvailable}
                    </div>
                    <div className="text-[10px] text-[#72725e]">Ruang Rapat Al-Fatih</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5">
                    <div className="text-lg font-serif font-bold text-[#2d2d22]">
                      {selectedHub.smartLockersCount}
                    </div>
                    <div className="text-[10px] text-[#72725e]">Smart Loker Mailroom</div>
                  </div>
                </div>

                {/* Key Sectors & Wakaf Info */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-[#2d2d22]">Sektor Unggulan Jamaah Sekitar:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHub.keySectors.map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#f5f2ed] text-[#5A5A40] rounded-full text-[11px] font-semibold"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/15 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#2d2d22]">
                    <span>Kas Wakaf Produktif Terkumpul:</span>
                    <span className="font-mono text-sm text-[#5A5A40]">
                      Rp {selectedHub.monthlyWakafRevenue.toLocaleString("id-ID")}/bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-[#72725e] leading-relaxed">
                    Alokasi sewa 5% otomatis dialirkan ke kas wakaf operasional masjid dan subsidi silang permodalan pedagang dhuafa sekitar kecamatan.
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setMosqueName(selectedHub.mosqueName);
                      setKecamatanCity(`${selectedHub.subdistrictKecamatan}, ${selectedHub.regencyKota}`);
                      setActiveSubTab("potensi_register");
                    }}
                    className="flex-1 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Daftarkan UKM ke Hub Ini</span>
                  </button>

                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab("facility_booking")}
                      className="px-4 py-2.5 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] text-xs font-bold rounded-full transition-all border border-[#5A5A40]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Booking Fasilitas</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REGISTRASI & SENSUS POTENSI UKM */}
      {activeSubTab === "potensi_register" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                Formulir Sensus Potensi & Registrasi Terpadu UKM / UMKM Masjid
              </h2>
              <p className="text-xs text-[#72725e]">
                Mengintegrasikan <strong>http://potensi.islamicity.tv</strong> dan <strong>http://register.islamicity.tv</strong> dengan AI Assessment & Rekomendasi Kursus.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#5A5A40] bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#5A5A40]/20">
              Gerbang Pendaftaran 8.000 Kecamatan
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 cols: Form Input */}
            <form
              onSubmit={handleSubmitPotensi}
              className="lg:col-span-6 bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4"
            >
              <div className="border-b border-black/5 pb-3">
                <h3 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#5A5A40]" />
                  <span>Biodata Wirausaha & Profil Usaha Jamaah</span>
                </h3>
                <p className="text-[11px] text-[#72725e]">
                  Data ini disinkronkan ke sensus potensi nasional dan diterbitkan KTA Digital Wirausaha Masjid.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#383827]">
                    Nama Lengkap Pemilik / Pengelola: *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Contoh: H. Ahmad Zulfikar"
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#383827]">
                    Nomor WhatsApp Aktif: *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#383827]">
                    Nama Usaha / Merek Produk: *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Madu Berkah Al-Ittihad"
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#383827]">
                    Bentuk Usaha / Legalitas:
                  </label>
                  <select
                    value={businessLegalForm}
                    onChange={(e) =>
                      setBusinessLegalForm(
                        e.target.value as PotensiRegistrationForm["businessLegalForm"]
                      )
                    }
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                  >
                    <option value="UMKM Komunitas Masjid">UMKM Komunitas Masjid</option>
                    <option value="Koperasi Syariah">Koperasi Syariah</option>
                    <option value="CV">CV</option>
                    <option value="PT">PT</option>
                    <option value="Yayasan">Yayasan</option>
                    <option value="Perorangan / Freelancer">Perorangan / Freelancer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#383827]">
                    Masjid Rujukan / Basis Jamaah: *
                  </label>
                  <input
                    type="text"
                    required
                    value={mosqueName}
                    onChange={(e) => setMosqueName(e.target.value)}
                    placeholder="Nama Masjid di lingkungan Anda"
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#383827]">
                    Kecamatan & Kota: *
                  </label>
                  <input
                    type="text"
                    required
                    value={kecamatanCity}
                    onChange={(e) => setKecamatanCity(e.target.value)}
                    placeholder="Kecamatan, Kota/Kabupaten"
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#383827]">
                    Estimasi Aset (Rp):
                  </label>
                  <input
                    type="number"
                    value={assetEstimate}
                    onChange={(e) => setAssetEstimate(Number(e.target.value))}
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#383827]">
                    Omzet / Bulan (Rp):
                  </label>
                  <input
                    type="number"
                    value={monthlyTurnoverEstimate}
                    onChange={(e) => setMonthlyTurnoverEstimate(Number(e.target.value))}
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#383827]">
                    Jumlah Karyawan:
                  </label>
                  <input
                    type="number"
                    value={currentEmployeesCount}
                    onChange={(e) => setCurrentEmployeesCount(Number(e.target.value))}
                    className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Needs Checklist */}
              <div className="space-y-2 pt-2 border-t border-black/5">
                <label className="block text-xs font-bold text-[#383827]">
                  Fasilitas & Pendampingan yang Paling Dibutuhkan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NEED_OPTIONS.map((item) => {
                    const isChecked = selectedNeeds.includes(item);
                    return (
                      <div
                        key={item}
                        onClick={() => toggleNeed(item)}
                        className={`p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all flex items-center gap-2 ${
                          isChecked
                            ? "bg-[#f5f2ed] border-[#5A5A40] text-[#2d2d22] font-semibold"
                            : "bg-[#fafaf7] border-black/5 text-[#626252]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-white ${
                            isChecked ? "bg-[#5A5A40]" : "border border-[#5A5A40]/30"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isAssessing || !applicantName || !businessName}
                className="w-full py-3.5 bg-[#5A5A40] hover:bg-[#484833] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#5A5A40]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAssessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Skor Potensi & Rekomendasi Global TECS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                    <span>Kirim Formulir & Jalankan AI Potensi Assessment</span>
                  </>
                )}
              </button>
            </form>

            {/* Right 6 cols: AI Assessment Results & Recent Registrations */}
            <div className="lg:col-span-6 space-y-4">
              {/* If assessment result exists */}
              {assessmentResult && (
                <div className="bg-[#fcfbf9] rounded-[24px] border border-[#5A5A40]/30 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#5A5A40] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#E4E3DA]" />
                      HASIL ANALISIS POTENSI AI
                    </span>
                    <span className="text-xs font-bold text-[#5A5A40]">
                      {assessmentResult.competitivenessLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/5">
                    <div>
                      <div className="text-[11px] text-[#72725e]">Skor Potensi Keberdayaan:</div>
                      <div className="font-serif text-3xl font-bold text-[#2d2d22]">
                        {assessmentResult.scorePotensi} / 100
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#72725e]">Pintu Akses:</div>
                      <span className="text-xs font-mono font-bold text-[#5A5A40]">
                        {assessmentResult.portalRecommendation}
                      </span>
                    </div>
                  </div>

                  {/* Spiritual Wisdom */}
                  <div className="p-3.5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/20 text-xs space-y-1">
                    <div className="font-bold text-[#383827] flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-[#5A5A40]" />
                      <span>Belajar Kepada Allah SWT:</span>
                    </div>
                    <p className="text-[#626252] leading-relaxed italic">
                      "{assessmentResult.spiritualWisdom}"
                    </p>
                  </div>

                  {/* Recommended Global TECS Course */}
                  <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-2">
                    <div className="text-[11px] text-[#72725e] font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Rekomendasi Modul di http://global.tecs.islamicity.tv:</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                      {assessmentResult.recommendedGlobalTecsCourse}
                    </h4>
                    <p className="text-xs text-[#72725e]">
                      {assessmentResult.courseReasoning}
                    </p>

                    <button
                      onClick={() => setActiveSubTab("global_tecs")}
                      className="mt-2 text-xs font-bold text-[#5A5A40] hover:text-[#383827] flex items-center gap-1 cursor-pointer"
                    >
                      Buka Silabus Kursus Ini <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 4 Step Roadmap */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#2d2d22]">
                      Rencana Akselerasi 4 Langkah Keberdayaan:
                    </div>
                    <div className="space-y-1.5">
                      {assessmentResult.accelerationRoadmap.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-black/5 text-xs text-[#3a3a2e] flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Submissions List */}
              <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-xs text-[#2d2d22] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Sensus Potensi Masuk Terkini ({registrations.length})</span>
                  </h4>
                  <span className="text-[10px] text-[#72725e]">Update Real-time</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {registrations.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2d2d22]">{item.businessName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#f5f2ed] text-[#5A5A40] rounded-full font-bold">
                          Skor {item.scorePotensi}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#72725e]">
                        {item.applicantName} • {item.mosqueName} ({item.kecamatanCity})
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.mainNeeds.slice(0, 2).map((n, i) => (
                          <span
                            key={i}
                            className="text-[9px] bg-white border border-black/5 px-2 py-0.5 rounded-full text-[#5A5A40]"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: GLOBAL TECS DISTANCE LEARNING */}
      {activeSubTab === "global_tecs" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
                Global TECS: Distant eLearning, Training, Education, Coach Course & Seminar Workshop
              </h2>
              <p className="text-xs text-[#72725e]">
                Portal: <strong>http://global.tecs.islamicity.tv</strong> • Belajar langsung kepada instruktur Fiqh Muamalah, legalitas, ekspor, dan standarisasi halal.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#f5f5f0] p-1 rounded-full border border-black/5 text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                Semua Program
              </button>
              <button
                onClick={() => setSelectedCategory("Coach Course")}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === "Coach Course"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                Coach Course
              </button>
              <button
                onClick={() => setSelectedCategory("Training")}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === "Training"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                Training Legalitas
              </button>
              <button
                onClick={() => setSelectedCategory("Education")}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === "Education"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                Education Halal
              </button>
              <button
                onClick={() => setSelectedCategory("Seminar Workshop")}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === "Seminar Workshop"
                    ? "bg-[#5A5A40] text-white"
                    : "text-[#72725e] hover:text-[#2d2d22]"
                }`}
              >
                Seminar Workshop
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {enrollSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{enrollSuccessMessage}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 cols: Course Cards */}
            <div className="lg:col-span-6 space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredCourses.map((crs) => {
                const isSelected = selectedCourse.id === crs.id;
                const isEnrolled = enrolledCourses.includes(crs.id);
                return (
                  <div
                    key={crs.id}
                    onClick={() => setSelectedCourse(crs)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#5A5A40] shadow-sm ring-1 ring-[#5A5A40]/30"
                        : "bg-white border-black/5 hover:border-[#5A5A40]/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full">
                            {crs.category}
                          </span>
                          <span className="text-[10px] font-bold text-[#72725e]">
                            Tingkat: {crs.level}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22]">
                          {crs.title}
                        </h4>

                        <p className="text-xs text-[#72725e]">
                          Instruktur: <strong>{crs.instructorName}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-[#5A5A40]">
                          ⭐ {crs.rating}
                        </div>
                        <div className="text-[10px] text-[#72725e]">
                          {crs.totalEnrolled.toLocaleString("id-ID")} Peserta
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-[11px] text-[#72725e]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {crs.durationHours} Jam ({crs.modulesCount} Modul)
                        </span>
                        <span className="text-emerald-700 font-semibold">{crs.priceNote}</span>
                      </div>

                      {isEnrolled ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terdaftar
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#5A5A40] font-semibold flex items-center gap-1">
                          Detail Silabus <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 6 cols: Course Details, Syllabus & Enrollment */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-5 sticky top-24">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-0.5 rounded-full">
                      {selectedCourse.code} • {selectedCourse.category}
                    </span>
                    <a
                      href={selectedCourse.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#5A5A40] hover:text-[#383827] font-semibold flex items-center gap-1"
                    >
                      <span>{selectedCourse.linkUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2d2d22]">
                    {selectedCourse.title}
                  </h3>

                  <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 text-xs space-y-0.5">
                    <div className="font-bold text-[#2d2d22]">{selectedCourse.instructorName}</div>
                    <div className="text-[11px] text-[#72725e]">{selectedCourse.instructorTitle}</div>
                  </div>

                  <p className="text-xs text-[#626252] leading-relaxed pt-1">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* Course Metadata Strip */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#f5f2ed]">
                    <div className="text-[10px] text-[#72725e]">Durasi</div>
                    <div className="font-bold text-[#2d2d22]">{selectedCourse.durationHours} Jam</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f5f2ed]">
                    <div className="text-[10px] text-[#72725e]">Jadwal Batch</div>
                    <div className="font-bold text-[#2d2d22] truncate text-[11px]">
                      {selectedCourse.nextBatchDate}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f5f2ed]">
                    <div className="text-[10px] text-[#72725e]">Biaya Kursus</div>
                    <div className="font-bold text-emerald-800 text-[11px]">100% Wakaf</div>
                  </div>
                </div>

                {/* Syllabus List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Silabus & Materi Kurikulum Pembelajaran:</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedCourse.curriculumSyllabus.map((modul, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#fafaf7] border border-black/5 text-xs text-[#3a3a2e] flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{modul}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enroll button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleEnrollCourse(selectedCourse)}
                    className="w-full py-3.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-md shadow-[#5A5A40]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-[#E4E3DA]" />
                    <span>Daftar Pembelajaran Jarak Jauh (Global TECS)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

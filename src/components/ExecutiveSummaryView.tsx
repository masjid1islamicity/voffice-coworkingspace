import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Building2,
  Globe2,
  Users,
  CheckCircle2,
  Lock,
  KeyRound,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  HeartHandshake,
  Bot,
  Layers,
  Coins,
  Recycle,
  Radio,
  FileCheck,
  Scale,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  Download,
  Printer,
  Copy,
  Check,
} from "lucide-react";

interface ExecutiveSummaryViewProps {
  onNavigateSubTab?: (tab: string) => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  onNavigateSubTab,
}) => {
  const [activeDocument, setActiveDocument] = useState<"asset_legal" | "umkm_empowerment" | "assistant_terms">("asset_legal");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyGithub = () => {
    navigator.clipboard.writeText("https://islamicity.github.io/VirtualOffice");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-white flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#E4E3DA]" />
              DOKUMEN RESMI EKSEKUTIF
            </span>
            <span className="text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
              Standar Legalitas, Kolateral & Pemberdayaan 800.000+ Masjid
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-1">
            Ringkasan Eksekutif Virtual Office Islamicity
          </h2>
          <p className="text-xs text-[#72725e]">
            Panduan strategis tata kelola aset manajemen syariah, kolateral berkeadilan, dan akselerasi UKM/UMKM di 8.000 kecamatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyGithub}
            className="px-3.5 py-2 bg-white hover:bg-[#f5f2ed] text-[#2d2d22] border border-black/10 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#5A5A40]" />}
            <span>{copiedLink ? "Link Tersalin!" : "Salin Link GitHub"}</span>
          </button>

          <a
            href="https://islamicity.github.io/VirtualOffice"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E4E3DA]" />
            <span>Open in Browser</span>
          </a>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveDocument("asset_legal")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeDocument === "asset_legal"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white text-[#72725e] hover:bg-[#f5f2ed] border border-black/5"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>1. Solusi Legalitas Aset & Kolateral Syariah</span>
        </button>

        <button
          onClick={() => setActiveDocument("umkm_empowerment")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeDocument === "umkm_empowerment"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white text-[#72725e] hover:bg-[#f5f2ed] border border-black/5"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>2. Pemberdayaan 800.000+ UKM & UMKM Masjid</span>
        </button>

        <button
          onClick={() => setActiveDocument("assistant_terms")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeDocument === "assistant_terms"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-white text-[#72725e] hover:bg-[#f5f2ed] border border-black/5"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>3. Services of Terms (VA vs Google vs Islamicity)</span>
        </button>
      </div>

      {/* DOCUMENT 1: Solusi Legalitas Aset Manajemen, Kolateral, dan Tatanan Islami */}
      {activeDocument === "asset_legal" && (
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-black/10 pb-4">
            <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-0.5 rounded-full">
              RINGKASAN EKSEKUTIF I
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-2">
              Virtual Office Islamicity - Solusi Legalitas Aset Manajemen, Kolateral, dan Tatanan Islami
            </h3>
            <p className="text-xs text-[#72725e] mt-1">
              Menghadirkan landasan hukum syariah yang kuat, transparansi tanpa riba, dan kepastian perlindungan hukum.
            </p>
          </div>

          {/* Pendahuluan */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center text-xs">
                I
              </span>
              <span>Pendahuluan</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#3a3a2e] leading-relaxed pl-8">
              Virtual Office Islamicity adalah konsep inovatif yang menggabungkan prinsip-prinsip syariah dengan teknologi modern untuk menciptakan solusi manajemen aset, kolateral, dan tatanan bisnis yang sesuai dengan nilai-nilai Islam. Proyek ini bertujuan untuk memberikan landasan hukum yang kuat, efisiensi operasional, dan kepatuhan terhadap prinsip-prinsip Islam dalam pengelolaan aset dan bisnis.
            </p>
          </div>

          {/* Landasan Hukum dan Syariah */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center text-xs">
                II
              </span>
              <span>Landasan Hukum dan Syariah</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#626252] pl-8">
              Virtual Office Islamicity didasarkan pada empat pilar prinsip syariah utama:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
              <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#2d2d22] text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                  <span>1. Kepemilikan yang Jelas (*Milkiah Tammah*)</span>
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Aset-aset yang dikelola memiliki kepemilikan yang jelas dan transparan, sesuai dengan prinsip-prinsip syariah tentang kepemilikan dan hak guna usaha (*Ijarah*).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#2d2d22] text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                  <span>2. Transaksi yang Sah (*Sihhatul 'Aqd*)</span>
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Semua transaksi yang dilakukan melalui platform ini harus sesuai dengan hukum Islam, termasuk akad-akad yang sah serta menghindari riba, gharar (ketidakpastian), dan maysir (spekulasi).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#2d2d22] text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                  <span>3. Keadilan dan Transparansi (*'Adalah wa Shafafiyah*)</span>
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Sistem ini memastikan keadilan dan transparansi dalam semua transaksi dan interaksi antara pihak-pihak yang terlibat, dilengkapi pembukuan otomatis surplus wakaf 5%.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#2d2d22] text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                  <span>4. Kepatuhan terhadap Fatwa (*Iltizam bil-Fatwa*)</span>
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Keputusan dan kebijakan yang diambil dalam platform ini sesuai dengan fatwa Dewan Syariah Nasional (DSN-MUI) dan fatwa dewan syariah yang kompeten.
                </p>
              </div>
            </div>
          </div>

          {/* Manfaat Virtual Office Islamicity */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center text-xs">
                III
              </span>
              <span>Manfaat Virtual Office Islamicity</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-8">
              <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
                <div className="font-bold text-xs text-[#2d2d22]">Efisiensi Operasional</div>
                <p className="text-xs text-[#626252]">Proses manajemen aset, kolateral, dan bisnis menjadi lebih efisien dan terotomatisasi secara digital.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
                <div className="font-bold text-xs text-[#2d2d22]">Kepatuhan Syariah</div>
                <p className="text-xs text-[#626252]">Memastikan seluruh rantai transaksi dan kegiatan bisnis berjalan sesuai kaidah syariat Islam.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
                <div className="font-bold text-xs text-[#2d2d22]">Transparansi & Akuntabilitas</div>
                <p className="text-xs text-[#626252]">Meningkatkan transparansi dan akuntabilitas dalam pengelolaan aset wakaf dan bisnis jamaah.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
                <div className="font-bold text-xs text-[#2d2d22]">Aksesibilitas Global</div>
                <p className="text-xs text-[#626252]">Memungkinkan akses global terhadap layanan domisili, perizinan, dan peluang investasi halal.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
                <div className="font-bold text-xs text-[#2d2d22]">Pengembangan Ekonomi Islam</div>
                <p className="text-xs text-[#626252]">Berkontribusi nyata pada kemajuan dan ekspansi ekonomi Islam baik di tanah air maupun dunia internasional.</p>
              </div>
            </div>
          </div>

          {/* Aspek Teknis dan Keamanan */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center text-xs">
                IV
              </span>
              <span>Aspek Teknis dan Keamanan</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#626252] pl-8">
              Virtual Office Islamicity dibangun dengan teknologi mutakhir untuk memastikan keamanan, keandalan, dan skalabilitas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-8">
              <div className="p-3.5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/15 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#5A5A40]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enkripsi Data</span>
                </div>
                <p className="text-xs text-[#5A5A40]">Semua data sensitif dienkripsi end-to-end untuk melindungi privasi dan keamanan informasi tenant.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/15 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#5A5A40]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Otentikasi Multi-Faktor (MFA)</span>
                </div>
                <p className="text-xs text-[#5A5A40]">MFA diterapkan untuk mencegah akses tidak sah ke panel administratif dan berkas legalitas.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/15 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#5A5A40]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit Keamanan Rutin</span>
                </div>
                <p className="text-xs text-[#5A5A40]">Audit berkala dilakukan guna mengidentifikasi dan memitigasi celah kerentanan secara proaktif.</p>
              </div>
            </div>
          </div>

          {/* Tim Ahli & Kesimpulan */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center text-xs">
                V
              </span>
              <span>Tim Ahli, Profesional & Kesimpulan</span>
            </h4>
            <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2 pl-8">
              <p className="text-xs sm:text-sm text-[#3a3a2e] leading-relaxed">
                <strong>Kolaborasi Multi-Disiplin:</strong> Proyek ini didukung oleh tim ahli yang terdiri dari para ulama, pakar hukum Islam, praktisi keuangan syariah, dan profesional teknologi rekayasa perangkat lunak. Kolaborasi ini menjamin platform senantiasa selaras dengan prinsip syariah dan standar industri terbaik.
              </p>
              <p className="text-xs sm:text-sm text-[#3a3a2e] leading-relaxed">
                <strong>Kesimpulan:</strong> Virtual Office Islamicity adalah solusi inovatif yang menggabungkan nilai-nilai Islam dengan teknologi modern untuk menciptakan platform yang efisien, transparan, dan sesuai syariah dalam manajemen aset, kolateral, dan tatanan bisnis. Proyek ini memiliki potensi besar mendorong kebangkitan ekonomi umat secara global.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 2: Pemberdayaan UKM & UMKM Masjid di Indonesia */}
      {activeDocument === "umkm_empowerment" && (
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-black/10 pb-4">
            <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-0.5 rounded-full">
              RINGKASAN EKSEKUTIF II
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-2">
              Virtual Office Islamicity - Pemberdayaan UKM & UMKM Masjid di Indonesia
            </h3>
            <p className="text-xs text-[#72725e] mt-1">
              Memberdayakan lebih dari 800.000 Usaha Komunitas Masjid (UKM) dan UMKM di 8.000 kota kecamatan di Indonesia.
            </p>
          </div>

          {/* Pendahuluan, Visi & Misi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#2d2d22] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <span>Pendahuluan & Basis Jangkauan</span>
              </h4>
              <p className="text-xs text-[#626252] leading-relaxed">
                Platform digital inovatif yang bertujuan memberdayakan lebih dari <strong>800.000 Usaha Komunitas Masjid (UKM)</strong> dan <strong>Usaha Masyarakat & Komunitas Masjid (UMKM)</strong> di <strong>8.000 kota kecamatan</strong> di Indonesia. Menggabungkan prinsip syariah dan teknologi modern untuk mendorong pertumbuhan ekonomi berbasis masjid.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#2d2d22] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#5A5A40]" />
                <span>Visi dan Misi</span>
              </h4>
              <div className="text-xs text-[#626252] space-y-1">
                <div><strong>Visi:</strong> Menjadi platform terkemuka dalam pemberdayaan ekonomi umat Islam di Indonesia melalui pengembangan UKM & UMKM berbasis masjid.</div>
                <div><strong>Misi:</strong> Menyediakan akses mudah terhadap sumber daya, pelatihan, pendampingan, permodalan syariah tanpa bunga, dan ekosistem inklusif berkelanjutan.</div>
              </div>
            </div>
          </div>

          {/* 3 Aplikasi Pendukung */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#2d2d22]">
              Tiga Aplikasi Utama Pendukung
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#5A5A40]/20 shadow-2xs space-y-2">
                <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full">
                  PLATFORM UTAMA
                </span>
                <div className="font-serif font-bold text-sm text-[#2d2d22]">
                  http://voffice.islamicity.tv
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Platform utama yang menyediakan layanan virtual office, manajemen aset, dan kolateral syariah, serta informasi legalitas perizinan usaha (OSS-RBA, NIB).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#5A5A40]/20 shadow-2xs space-y-2">
                <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full">
                  DOMISILI & RESEPSIONIS
                </span>
                <div className="font-serif font-bold text-sm text-[#2d2d22]">
                  http://virtualoffice.islamicity.tv
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Platform khusus layanan kantor virtual lengkap: alamat bisnis prestisius, penanganan surat/paket cerdas, penerimaan telepon beradab syariah, dan ruang rapat virtual.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#5A5A40]/20 shadow-2xs space-y-2">
                <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full">
                  RUANG KOLABORASI
                </span>
                <div className="font-serif font-bold text-sm text-[#2d2d22]">
                  http://coworking.islamicity.tv
                </div>
                <p className="text-xs text-[#626252] leading-relaxed">
                  Platform coworking space bersama bagi UKM & UMKM masjid untuk berkolaborasi, berjejaring, dan tumbuh bersama di ruang kerja yang mengutamakan waktu shalat berjamaah.
                </p>
              </div>
            </div>
          </div>

          {/* Strategi Pemberdayaan */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#2d2d22]">
              Strategi Pemberdayaan Berbasis Masjid
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="font-bold text-[#2d2d22]">1. Pelatihan dan Pendampingan (Global TECS)</div>
                <p className="text-[#626252]">Menyediakan pelatihan bisnis online & offline melalui <strong>http://global.tecs.islamicity.tv</strong> (eLearning, Training, Education, Coach Course, Seminar, Workshop).</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="font-bold text-[#2d2d22]">2. Akses Permodalan (Koperasi DUIT Voucher)</div>
                <p className="text-[#626252]">Memfasilitasi pembiayaan syariah tanpa riba melalui Koperasi - Bank Broker DUIT Voucher (Voucher Modal Kerja, Data, Iklan, dan Sirkular Sampah).</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="font-bold text-[#2d2d22]">3. Pemasaran dan Promosi Terpadu</div>
                <p className="text-[#626252]">Membantu kurasi dan promosi produk unggulan halal jamaah ke jaringan virtual office nasional dan pembeli global.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="font-bold text-[#2d2d22]">4. Kolaborasi dan Jejaring Masjid</div>
                <p className="text-[#626252]">Membangun sinergi antar sesama pelaku usaha komunitas masjid melalui coworking virtual dan program pre-order berjamaah.</p>
              </div>
            </div>
          </div>

          {/* Dampak Sosial & Ajakan Bergabung */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#fcfbf9] to-[#f5f2ed] border border-[#5A5A40]/25 space-y-3">
            <div className="font-serif font-bold text-sm text-[#2d2d22]">
              Dampak Sosial Ekonomi & Ajakan Bergabung
            </div>
            <p className="text-xs text-[#3a3a2e] leading-relaxed">
              Inisiatif ini menargetkan penciptaan lapangan kerja baru, pengentasan rentenir riba, peningkatan daya saing ekspor produk halal masjid, dan kemakmuran baitullah yang berkelanjutan.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="http://potensi.islamicity.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#5A5A40] text-white text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-[#484833] transition-all shadow-2xs"
              >
                <span>Isi Formulir Potensi (potensi.islamicity.tv)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="http://register.islamicity.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-[#2d2d22] border border-black/10 text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-[#f5f2ed] transition-all shadow-2xs"
              >
                <span>Pendaftaran UKM Masjid (register.islamicity.tv)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 3: Services of Terms (VA vs Google vs Islamicity) */}
      {activeDocument === "assistant_terms" && (
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-black/10 pb-4">
            <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-0.5 rounded-full">
              KLARIFIKASI DEFINISI & PERAN
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-2">
              Services of the Terms: Perbedaan Virtual Assistant, Google Assistant, dan Islamicity Virtual Assistant
            </h3>
            <p className="text-xs text-[#72725e] mt-1">
              Memahami fungsi peran manusia (human remote staff) vs perangkat lunak AI umum vs AI spesialis muamalah Islam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Virtual Assistant (VA) */}
            <div className="p-5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Virtual Assistant (VA)
                </h4>
              </div>
              <p className="text-xs text-[#626252] leading-relaxed">
                Istilah luas yang merujuk pada <strong>seseorang (manusia)</strong> yang memberikan bantuan kepada klien dari lokasi jarak jauh (remote). VA menangani tugas administratif, teknis, atau kreatif, umumnya berstatus kontraktor independen atau staf perusahaan agen virtual assistant.
              </p>
            </div>

            {/* 2. Virtual Office Assistant */}
            <div className="p-5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Virtual Office Assistant (VOA)
                </h4>
              </div>
              <p className="text-xs text-[#626252] leading-relaxed">
                Sangat mirip dengan VA, namun secara spesifik menekankan tugas administrasi kantor dan pengorganisasian: penjadwalan rapat, pengelolaan korespondensi email, input data, penyiapan dokumen, dan pembukuan dasar. Berfungsi sebagai <em>remote office support staff</em>.
              </p>
            </div>

            {/* 3. Google Assistant */}
            <div className="p-5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Google Assistant
                </h4>
              </div>
              <p className="text-xs text-[#626252] leading-relaxed">
                Asisten virtual <strong>berbasis perangkat lunak (AI software)</strong> yang dikembangkan oleh Google. Merupakan AI voice assistant untuk perintah suara di ponsel, smart speaker (Nest), dan mobil. Fokus fungsinya: alarm, pengingat, musik, panggilan telepon, navigasi peta, dan kontrol perangkat IoT.
              </p>
            </div>

            {/* 4. Islamicity Virtual Assistant */}
            <div className="p-5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h4 className="font-serif font-bold text-sm text-[#383827]">
                  Islamicity Virtual Assistant (Islamic AI)
                </h4>
              </div>
              <p className="text-xs text-[#3a3a2e] leading-relaxed">
                Asisten perangkat lunak AI berfokus spesifik pada <strong>pengetahuan dan praktik Islam & Fiqh Muamalah</strong>. Mampu:
              </p>
              <ul className="text-xs text-[#5A5A40] space-y-1 list-disc pl-4 font-medium">
                <li>Menjawab hukum akad syariah, legalitas aset, dan jaminan kolateral bebas riba.</li>
                <li>Menyediakan jadwal shalat akurat untuk 8.000 kecamatan di Indonesia.</li>
                <li>Menampilkan rujukan ayat Al-Qur'an dan Hadits shahih.</li>
                <li>Membimbing adab muamalah dan tata cara perizinan UMKM masjid.</li>
                <li>Mengarahkan ke ekosistem voffice, virtualoffice, coworking, potensi, register, dan global.tecs.</li>
              </ul>
            </div>
          </div>

          {/* Key Differences Table */}
          <div className="space-y-2 pt-2">
            <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
              Tabel Matriks Perbedaan Utama
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-black/10 rounded-2xl overflow-hidden">
                <thead className="bg-[#f5f5f0] text-[#72725e] font-bold text-[11px]">
                  <tr>
                    <th className="p-3">Dimensi</th>
                    <th className="p-3">Human VA / Office VA</th>
                    <th className="p-3">Google Assistant</th>
                    <th className="p-3 bg-[#f5f2ed] text-[#5A5A40]">Islamicity Virtual Assistant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[#3a3a2e]">
                  <tr>
                    <td className="p-3 font-bold">Bentuk Dasar</td>
                    <td className="p-3">Manusia (Remote Worker)</td>
                    <td className="p-3">Software AI (Google Engine)</td>
                    <td className="p-3 bg-[#f5f2ed]/50 font-semibold text-[#5A5A40]">Software AI Terlatih (Islamicity Engine)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Fokus Domain</td>
                    <td className="p-3">Administrasi & Tugas Kantor</td>
                    <td className="p-3">Perintah Suara Harian Umum</td>
                    <td className="p-3 bg-[#f5f2ed]/50 font-semibold text-[#5A5A40]">Fiqh Muamalah, Syariah & UKM Masjid</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Integrasi Khusus</td>
                    <td className="p-3">Email, Kalender, Spreadsheet</td>
                    <td className="p-3">Google Workspace, Smart Devices</td>
                    <td className="p-3 bg-[#f5f2ed]/50 font-semibold text-[#5A5A40]">voffice, virtualoffice, coworking, TECS, DSN-MUI</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Anti-Riba & Wakaf</td>
                    <td className="p-3">Tergantung Instruksi Klien</td>
                    <td className="p-3">Netral / Sekuler</td>
                    <td className="p-3 bg-[#f5f2ed]/50 font-semibold text-[#5A5A40]">Terasosiasi Otomatis & Terpelihara</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

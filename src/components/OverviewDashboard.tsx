import React from "react";
import { Tenant, MailItem, FacilityBooking, Invoice, SopModule, RecurringWakafSubscription } from "../types";
import { CumulativeWaqfImpactTracker } from "./CumulativeWaqfImpactTracker";
import {
  Building2,
  Users,
  Mail,
  Calendar,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileSignature,
  BookOpen,
  Bot,
  Compass,
  Scale,
  Truck,
  Leaf,
  Globe2,
} from "lucide-react";

interface OverviewDashboardProps {
  tenants: Tenant[];
  mails: MailItem[];
  bookings: FacilityBooking[];
  invoices: Invoice[];
  sopModules: SopModule[];
  subscriptions?: RecurringWakafSubscription[];
  onNavigateTab: (tabId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  tenants = [],
  mails = [],
  bookings = [],
  invoices = [],
  sopModules = [],
  subscriptions = [],
  onNavigateTab,
}) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeMails = Array.isArray(mails) ? mails : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeSopModules = Array.isArray(sopModules) ? sopModules : [];
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  const activeTenantsCount = safeTenants.filter((t) => t.status === "active").length;
  const inLockerMailsCount = safeMails.filter((m) => m.status !== "picked_up").length;
  const totalWakaf = safeInvoices.reduce((acc, i) => acc + (i.wakafEndowmentAmount || 0), 0);
  const totalRevenue = safeInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Islamic Mission & Hub Welcome Banner - Natural Tones Theme */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#4a4a35] p-6 sm:p-10 text-[#f5f5f0] shadow-md border border-[#5A5A40]/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A5A40] border border-[#A8A890]/30 text-[#E4E3DA] text-xs font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E4E3DA]" />
            <span>Platform Virtual Office Cerdas Berdaya Terpadu Masjid & UMKM</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-[#f5f5f0]">
            Infrastruktur Kantor Virtual Syariah Terlengkap & Terpercaya
          </h1>

          <p className="text-[#E4E3DA]/90 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Solusi alamat domisili hukum resmi, smart mailroom locker dengan verifikasi PIN WhatsApp, reservasi ruang rapat ramah waktu sholat, penyusunan Akad Ijarah AI, dan pengelolaan 8 SOP operasional berstandar Permendag & DSN-MUI.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium">
            <button
              onClick={() => onNavigateTab("voffice_4")}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400/40"
            >
              <Globe2 className="w-4 h-4 text-emerald-100" />
              <span>VirtualOffice 4.0 (800k Masjid)</span>
            </button>

            <button
              onClick={() => onNavigateTab("ecosystem_architect")}
              className="px-5 py-2.5 bg-[#f5f5f0] hover:bg-[#E4E3DA] text-[#383827] font-bold rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#5A5A40]" />
              <span>Ecosystem Matchmaker AI (3 Pilar)</span>
            </button>

            <button
              onClick={() => onNavigateTab("sop_hub")}
              className="px-5 py-2.5 bg-[#5A5A40]/80 hover:bg-[#5A5A40] text-[#f5f5f0] font-semibold rounded-full border border-[#A8A890]/40 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#E4E3DA]" />
              <span>8 Modul SOP Lengkap</span>
            </button>

            <button
              onClick={() => onNavigateTab("contract_generator")}
              className="px-5 py-2.5 bg-[#5A5A40]/80 hover:bg-[#5A5A40] text-[#f5f5f0] font-semibold rounded-full border border-[#A8A890]/40 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSignature className="w-4 h-4 text-[#E4E3DA]" />
              <span>Akad Ijarah AI</span>
            </button>

            <button
              onClick={() => onNavigateTab("zakat_calculator")}
              className="px-5 py-2.5 bg-[#5A5A40]/80 hover:bg-[#5A5A40] text-[#f5f5f0] font-semibold rounded-full border border-[#A8A890]/40 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Scale className="w-4 h-4 text-[#E4E3DA]" />
              <span>Kalkulator Zakat AI & BSZ</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Building2 className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Islamic Principle Daily Verse Banner */}
      <div className="bg-[#f5f2ed] border border-[#5A5A40]/15 rounded-[24px] p-5 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs">
          <HeartHandshake className="w-5 h-5 text-[#E4E3DA]" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-serif font-bold text-[#2d2d22] text-sm sm:text-base flex flex-wrap items-center gap-2">
            <span>Prinsip Amanah & Kejujuran Transaksi (Muamalah Fiqh)</span>
            <span className="text-[10px] font-sans font-medium px-2 py-0.5 bg-[#E4E3DA] rounded-full text-[#5A5A40]">
              QS. Al-Baqarah: 282 & Fatwa DSN No. 09
            </span>
          </div>
          <p className="text-[#626252] leading-relaxed">
            "Hai orang-orang yang beriman, apabila kamu bermu'amalah tidak secara tunai untuk waktu yang ditentukan, hendaklah kamu menuliskannya dengan benar." Sistem ini menjamin transparansi, pencatatan otomatis, bebas riba/bunga keterlambatan, dan penyisihan 5% wakaf produktif untuk kemakmuran masjid.
          </p>
        </div>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab("clients")}
          className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs hover:border-[#5A5A40]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#72725e]">Tenant Aktif</span>
            <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center group-hover:bg-[#5A5A40] group-hover:text-white transition-all">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2d2d22] mt-2">
            {activeTenantsCount}
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" /> 100% KYC & Halal Verified
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("mailroom")}
          className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs hover:border-[#5A5A40]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#72725e]">Surat di Smart Locker</span>
            <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center group-hover:bg-[#5A5A40] group-hover:text-white transition-all">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#5A5A40] mt-2">
            {inLockerMailsCount}
          </div>
          <div className="text-[11px] text-[#72725e] font-medium mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#5A5A40]" /> SLA Notifikasi &lt; 15 Menit
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("facility_booking")}
          className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs hover:border-[#5A5A40]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#72725e]">Reservasi Fasilitas</span>
            <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center group-hover:bg-[#5A5A40] group-hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2d2d22] mt-2">
            {safeBookings.length}
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">Ruang Rapat & Studio Podcast</div>
        </div>

        <div
          onClick={() => onNavigateTab("billing")}
          className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs hover:border-[#5A5A40]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#72725e]">Kas Wakaf Produktif</span>
            <div className="w-8 h-8 rounded-full bg-[#383827] text-[#E4E3DA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#383827] mt-2">
            Rp {totalWakaf.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            5% Otomatis dari Tiap Sewa
          </div>
        </div>
      </div>

      {/* Cumulative Waqf Impact Tracker & Community Project Distribution Widget */}
      <CumulativeWaqfImpactTracker
        invoices={safeInvoices}
        tenants={safeTenants}
        subscriptions={safeSubscriptions}
        onNavigateTab={onNavigateTab}
      />

      {/* VirtualOffice 4.0 & 800.000 Masjid Multi-Portal Ecosystem Card */}
      <div className="bg-gradient-to-r from-[#3e3e2c] to-[#2c2c1e] text-white rounded-[24px] p-6 shadow-md border border-[#5A5A40]/40 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <Globe2 className="w-6 h-6 text-emerald-100" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-white/20 text-[#E4E3DA] px-2.5 py-0.5 rounded-full border border-white/10">
                VIRTUALOFFICE 4.0
              </span>
              <span className="text-xs text-[#A8A890]">
                voffice • virtualoffice • coworking • potensi • register • global.tecs
              </span>
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">
              Software Penunjang 800.000+ Masjid di 8.000 Kecamatan Se-Indonesia
            </h3>
            <p className="text-xs text-[#E4E3DA]/90 leading-relaxed">
              Dukung UKM Komunitas Masjid dan UMKM jamaah bersaing di tingkat nasional & dunia. Terhubung dengan distant eLearning, Training, Education, Coach Course, Seminar & Workshop Global TECS Islamicity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab("voffice_4")}
            className="px-5 py-2.5 bg-[#f5f5f0] hover:bg-white text-[#2d2d22] text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Jelajahi Ekosistem 4.0</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* AI Zakat Maal & Fiqh Consultation Quick Card */}
      <div className="bg-[#fcfbf9] rounded-[24px] border border-black/5 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Scale className="w-6 h-6 text-[#E4E3DA]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#f5f2ed] text-[#5A5A40] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
                AI FIQH MUAMALAH
              </span>
              <span className="text-xs font-semibold text-[#72725e]">
                Nisab 85g Emas & Standar BAZNAS RI
              </span>
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2d2d22]">
              Kalkulator Zakat Maal Perniagaan (Tijarah) Terintegrasi Billing
            </h3>
            <p className="text-xs text-[#72725e] leading-relaxed">
              Otomasi hisab zakat 2.5% atas aset lancar bersih tenant, audit pengurangan biaya operasional sah, dan penerbitan Bukti Setor Zakat (BSZ) resmi untuk pengurang PPh Badan Pasal 22.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab("zakat_calculator")}
            className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E4E3DA]" />
            <span>Hitung Zakat Maal AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Access Matrix to All 8 SOP Functions */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
              Akses Cepat 8 Alur Kerja & SOP Standar Operasional V-Office
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("sop_hub")}
            className="text-xs font-semibold text-[#5A5A40] hover:text-[#383827] flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua SOP <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {safeSopModules.map((sop) => (
            <div
              key={sop.id}
              onClick={() => onNavigateTab("sop_hub")}
              className="p-4 rounded-[20px] border border-black/5 hover:border-[#5A5A40]/30 hover:bg-[#f5f2ed]/50 transition-all cursor-pointer flex flex-col justify-between group bg-white shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                    {sop.code}
                  </span>
                  <span className="text-[10px] text-[#72725e] font-medium">
                    {(sop.steps || (sop as any).workflowSteps || []).length} Langkah
                  </span>
                </div>
                <h4 className="font-serif font-bold text-[#2d2d22] text-xs sm:text-sm line-clamp-1">{sop.title}</h4>
                <p className="text-[11px] text-[#72725e] line-clamp-2 leading-relaxed">{sop.summary || (sop as any).purpose || ""}</p>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-black/5 flex items-center justify-between text-[10px] text-[#5A5A40] font-medium">
                <span>{(sop.shariaReference || "").split(":")[0]}</span>
                <span className="text-[#A8A890] group-hover:text-[#5A5A40] transition-colors">➔</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Recent Mail Inflow & Today's Facility Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mails in Locker */}
        <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-[#2d2d22] text-base">Surat & Paket Baru Masuk</h3>
            </div>
            <button
              onClick={() => onNavigateTab("mailroom")}
              className="text-xs text-[#5A5A40] font-semibold hover:underline cursor-pointer"
            >
              Buka Mailroom
            </button>
          </div>

          <div className="divide-y divide-black/5 text-xs">
            {safeMails.slice(0, 3).map((m) => (
              <div key={m.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2d2d22]">{m.tenantName}</span>
                    <span className="text-[10px] font-mono text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full">
                      {m.lockerNumber}
                    </span>
                  </div>
                  <div className="text-[#626252] text-[11px] mt-0.5 line-clamp-1">
                    <strong>Dari:</strong> {m.sender} ({m.senderType})
                  </div>
                  <div className="text-[#72725e] text-[10px] mt-0.5">{m.subject}</div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                      m.urgency === "Sangat Mendesak"
                        ? "bg-[#E4E3DA] text-[#5A5A40] font-bold"
                        : "bg-[#f5f2ed] text-[#5A5A40]"
                    }`}
                  >
                    {m.urgency}
                  </span>
                  <div className="text-[10px] text-[#72725e] mt-1 font-mono">{m.receivedTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Facility Bookings */}
        <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-[#2d2d22] text-base">Jadwal Penggunaan Ruang Rapat</h3>
            </div>
            <button
              onClick={() => onNavigateTab("facility_booking")}
              className="text-xs text-[#5A5A40] font-semibold hover:underline cursor-pointer"
            >
              Kelola Jadwal
            </button>
          </div>

          <div className="divide-y divide-black/5 text-xs">
            {safeBookings.slice(0, 3).map((b) => (
              <div key={b.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-[#2d2d22]">{b.roomName}</div>
                  <div className="text-[#626252] text-[11px] mt-0.5">
                    Penyewa: <strong className="text-[#5A5A40]">{b.tenantName}</strong> • {b.purpose}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-[#5A5A40] text-[11px]">
                    {b.startTime} - {b.endTime}
                  </div>
                  <div className="text-[10px] text-[#72725e] mt-0.5">{b.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

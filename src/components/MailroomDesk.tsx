import React, { useState } from "react";
import { MailItem, Tenant } from "../types";
import {
  Mail,
  Package,
  Sparkles,
  Search,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  KeyRound,
  FileSearch,
  FileText,
  User,
  ShieldCheck,
  Building,
  Printer,
  Camera,
  ExternalLink,
} from "lucide-react";

interface MailroomDeskProps {
  mails: MailItem[];
  tenants: Tenant[];
  onAddMail: (newMail: MailItem) => void;
  onUpdateMailStatus: (mailId: string, status: MailItem["status"], extra?: Partial<MailItem>) => void;
}

export const MailroomDesk: React.FC<MailroomDeskProps> = ({
  mails = [],
  tenants = [],
  onAddMail,
  onUpdateMailStatus,
}) => {
  const safeMails = Array.isArray(mails) ? mails : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);

  // New Mail Form State
  const [selectedTenantId, setSelectedTenantId] = useState(safeTenants[0]?.id || "");
  const [senderName, setSenderName] = useState("");
  const [senderType, setSenderType] = useState<MailItem["senderType"]>("KPP Pajak / DJP");
  const [subject, setSubject] = useState("");
  const [packageType, setPackageType] = useState<MailItem["packageType"]>("Surat Resmi Tercatat");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [lockerNumber, setLockerNumber] = useState("LCK-03");
  const [receptionistName, setReceptionistName] = useState("Aisyah Nabila");
  const [summarySnippet, setSummarySnippet] = useState("");

  // AI OCR / Letter Analyzer State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    urgency: "Sangat Mendesak" | "Penting" | "Normal";
    summary: string;
    recommendedAction: string;
    whatsappDraft: string;
    deadlineWarning?: string;
  } | null>(null);

  // Handover state
  const [handoverPinInput, setHandoverPinInput] = useState("");
  const [receiverNameInput, setReceiverNameInput] = useState("");
  const [handoverError, setHandoverError] = useState("");
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  const filteredMails = safeMails.filter((m) => {
    const matchQuery =
      (m.tenantName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.sender || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.lockerNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "In Locker" && m.status !== "picked_up") ||
      (statusFilter === "Picked Up" && m.status === "picked_up");
    return matchQuery && matchStatus;
  });

  const handleAnalyzeWithAI = async () => {
    if (!senderName || !subject) return;
    setAiAnalyzing(true);
    const tenant = safeTenants.find((t) => t.id === selectedTenantId);
    try {
      const res = await fetch("/api/ai/analyze-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: senderName,
          subject: subject,
          senderCategory: senderType,
          summarySnippet: summarySnippet,
          clientName: tenant?.companyName || "Klien Terdaftar",
        }),
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSaveNewMail = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = safeTenants.find((t) => t.id === selectedTenantId);
    if (!tenant || !senderName || !subject) return;

    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newMail: MailItem = {
      id: `MAIL-2026-${String(safeMails.length + 90).padStart(3, "0")}`,
      tenantId: tenant.id,
      tenantName: tenant.companyName,
      sender: senderName,
      senderType: senderType,
      subject: subject,
      receivedDate: new Date().toISOString().split("T")[0],
      receivedTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      receptionistName: receptionistName,
      trackingNumber: trackingNumber || `KURIR-${Math.floor(Math.random() * 9000 + 1000)}`,
      lockerNumber: lockerNumber,
      packageType: packageType,
      urgency: aiAnalysisResult?.urgency || "Penting",
      status: "stored_in_locker",
      pickupCodePin: randomPin,
      summaryNotes: aiAnalysisResult?.summary || summarySnippet || "Dokumen resmi tersimpan di Smart Locker.",
    };

    onAddMail(newMail);
    setIsLogModalOpen(false);
    // Reset form
    setSenderName("");
    setSubject("");
    setSummarySnippet("");
    setAiAnalysisResult(null);
  };

  const handleConfirmHandover = (mail: MailItem) => {
    if (handoverPinInput.trim() !== mail.pickupCodePin) {
      setHandoverError("PIN Pengambilan salah! Masukkan 6 digit PIN valid dari WhatsApp klien.");
      return;
    }
    if (!receiverNameInput.trim()) {
      setHandoverError("Nama pihak pengambil / kuasa direktur wajib diisi.");
      return;
    }

    onUpdateMailStatus(mail.id, "picked_up", {
      pickedUpBy: receiverNameInput,
      pickedUpDate: new Date().toLocaleString("id-ID"),
      digitalSignatureReceived: true,
    });

    setHandoverSuccess(true);
    setTimeout(() => {
      setSelectedMail(null);
      setHandoverSuccess(false);
      setHandoverPinInput("");
      setReceiverNameInput("");
      setHandoverError("");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              SOP-IVO-08 COMPLIANT
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              Smart Locker & Mailroom Desk
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
            Pusat Penerimaan Surat, Dokumen Dinas & Paket Ekspedisi
          </h2>
          <p className="text-xs sm:text-sm text-[#626252] max-w-2xl leading-relaxed">
            Pencatatan real-time surat masuk dari instansi pemerintah (KPP Pajak, OSS, Kemenkumham) dan kurir. Notifikasi instan WhatsApp terenkripsi dengan PIN 6-digit & verifikasi serah terima tanda tangan digital.
          </p>
        </div>

        <button
          onClick={() => {
            setIsLogModalOpen(true);
            setAiAnalysisResult(null);
          }}
          className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Input Surat / Paket Masuk Baru</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-xs">
          <div className="text-[#72725e] text-xs font-medium">Tersimpan di Locker</div>
          <div className="font-serif text-2xl font-bold text-[#5A5A40] mt-1">
            {safeMails.filter((m) => m.status !== "picked_up").length} Item
          </div>
          <div className="text-[11px] text-[#72725e] mt-1">Menunggu diambil / scan</div>
        </div>

        <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-xs">
          <div className="text-[#72725e] text-xs font-medium">Surat Pemerintah / KPP</div>
          <div className="font-serif text-2xl font-bold text-[#2d2d22] mt-1">
            {safeMails.filter((m) => m.senderType === "KPP Pajak / DJP" || m.senderType === "Instansi Pemerintah / OSS").length} Surat
          </div>
          <div className="text-[11px] text-[#5A5A40] mt-1">Prioritas tinggi & confidential</div>
        </div>

        <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-xs">
          <div className="text-[#72725e] text-xs font-medium">SLA Kecepatan Notifikasi</div>
          <div className="font-serif text-2xl font-bold text-[#383827] mt-1">&lt; 8 Menit</div>
          <div className="text-[11px] text-[#5A5A40] mt-1">Standar SLA max 15 menit</div>
        </div>

        <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-xs">
          <div className="text-[#72725e] text-xs font-medium">Serah Terima Selesai</div>
          <div className="font-serif text-2xl font-bold text-[#5A5A40] mt-1">
            {safeMails.filter((m) => m.status === "picked_up").length} Dokumen
          </div>
          <div className="text-[11px] text-[#72725e] mt-1">Verifikasi PIN & E-Sign lunas</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-[20px] border border-black/5 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#f5f5f0]/60 px-3.5 py-1.5 rounded-full border border-[#5A5A40]/15">
          <Search className="w-4 h-4 text-[#72725e]" />
          <input
            type="text"
            placeholder="Cari nama tenant, pengirim (KPP, Bank), no. resi, locker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border-none focus:outline-hidden text-[#2d2d22] placeholder-[#72725e]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#72725e] font-medium">Status:</span>
          {["All", "In Locker", "Picked Up"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
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

      {/* Mail Items Table / Cards */}
      <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f5f0] text-[#72725e] font-bold uppercase tracking-wider text-[10px] border-b border-black/5">
              <tr>
                <th className="py-3.5 px-4">Kode & Locker</th>
                <th className="py-3.5 px-4">Penerima (Tenant)</th>
                <th className="py-3.5 px-4">Pengirim & Kategori</th>
                <th className="py-3.5 px-4">Perihal / Isi Ringkas</th>
                <th className="py-3.5 px-4">Waktu Terima</th>
                <th className="py-3.5 px-4">Urgensi</th>
                <th className="py-3.5 px-4">Status & PIN</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredMails.map((mail) => {
                const isStored = mail.status !== "picked_up";
                return (
                  <tr
                    key={mail.id}
                    className="hover:bg-[#f5f2ed]/50 transition-all cursor-pointer"
                    onClick={() => setSelectedMail(mail)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#2d2d22]">{mail.id}</div>
                      <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] mt-1 border border-[#5A5A40]/15">
                        📦 {mail.lockerNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2d2d22] text-xs line-clamp-1">
                        {mail.tenantName}
                      </div>
                      <div className="text-[11px] text-[#72725e]">ID: {mail.tenantId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#2d2d22] line-clamp-1">{mail.sender}</div>
                      <span className="text-[10px] text-[#5A5A40] font-medium bg-[#f5f2ed] px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {mail.senderType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-[#2d2d22] line-clamp-2">{mail.subject}</div>
                      {mail.trackingNumber && (
                        <div className="text-[10px] text-[#72725e] font-mono mt-0.5">
                          Resi: {mail.trackingNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-[#2d2d22] font-medium">{mail.receivedDate}</div>
                      <div className="text-[10px] text-[#72725e]">{mail.receivedTime}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          mail.urgency === "Sangat Mendesak"
                            ? "bg-[#E4E3DA] text-[#383827] border border-[#5A5A40]/30"
                            : mail.urgency === "Penting"
                            ? "bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/20"
                            : "bg-[#f5f5f0] text-[#72725e]"
                        }`}
                      >
                        {mail.urgency}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isStored ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/20">
                            <Clock className="w-3 h-3 text-[#5A5A40]" /> Tersimpan di Locker
                          </span>
                          <div className="text-[10px] text-[#72725e] font-mono">
                            PIN: <strong className="text-[#2d2d22]">{mail.pickupCodePin}</strong>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] bg-[#E4E3DA] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/20">
                          <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" /> Diambil: {mail.pickedUpBy}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMail(mail);
                        }}
                        className="px-3 py-1.5 rounded-full border border-[#5A5A40]/20 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Input New Mail Log */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#E4E3DA]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
                    Pencatatan Surat & Paket Masuk (Smart Mailroom)
                  </h3>
                  <p className="text-xs text-[#72725e]">
                    SOP-IVO-08: Pencatatan, Verifikasi OCR & Notifikasi Otomatis WhatsApp Klien
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewMail} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">
                  Pilih Perusahaan Tenant Penerima:
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 font-medium text-[#2d2d22] focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] bg-white px-4"
                >
                  {safeTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.companyName} ({t.businessType}) - {t.registeredAddress}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Instansi / Nama Pengirim:
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: KPP Pratama Jakarta Kebayoran"
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] px-4"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Kategori Pengirim:
                  </label>
                  <select
                    value={senderType}
                    onChange={(e) => setSenderType(e.target.value as any)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-4"
                  >
                    <option value="KPP Pajak / DJP">KPP Pajak / DJP</option>
                    <option value="Instansi Pemerintah / OSS">Instansi Pemerintah / OSS / PTSP</option>
                    <option value="Perbankan Syariah">Perbankan Syariah / Lembaga Keuangan</option>
                    <option value="Notaris & Legal">Notaris & Legal Konsultan</option>
                    <option value="Ekspedisi / Kurir">Ekspedisi / JNE / J&T / Pos / GoSend</option>
                    <option value="Klien / Partner Bisnis">Klien / Partner Bisnis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">
                  Perihal / Judul Surat / Keterangan Label:
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Surat Permintaan Penjelasan SP2DK / Faktur Pajak 2026"
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] px-4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Jenis Kiriman:
                  </label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as any)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-4"
                  >
                    <option value="Surat Resmi Tercatat">Surat Resmi Tercatat</option>
                    <option value="Dokumen Berharga">Dokumen Berharga</option>
                    <option value="Paket / Box Barang">Paket / Box Barang</option>
                    <option value="Faktur Pajak">Faktur Pajak</option>
                    <option value="Kartu / Brosur">Kartu / Brosur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    No. Resi Kurir:
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="POS-JKT-881923"
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">
                    Nomor Locker:
                  </label>
                  <input
                    type="text"
                    value={lockerNumber}
                    onChange={(e) => setLockerNumber(e.target.value)}
                    placeholder="LCK-03"
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
              </div>

              {/* AI OCR & Letter Analyzer Button */}
              <div className="bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-[20px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2d2d22]">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                    AI Smart OCR & Analisis Urgensi Surat:
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={aiAnalyzing || !senderName || !subject}
                    className="px-4 py-1.5 bg-[#5A5A40] hover:bg-[#484833] disabled:bg-stone-300 text-white font-bold rounded-full text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    {aiAnalyzing ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#E4E3DA]" />
                        <span>Menganalisis...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#E4E3DA]" />
                        <span>Analisis & Generate Draf WA</span>
                      </>
                    )}
                  </button>
                </div>

                {aiAnalysisResult && (
                  <div className="bg-white rounded-[16px] p-4 border border-[#5A5A40]/20 text-xs space-y-2 text-[#2d2d22]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5A5A40]">Hasil Analisis Gemini:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E4E3DA] text-[#383827]">
                        Tingkat Urgensi: {aiAnalysisResult.urgency}
                      </span>
                    </div>
                    <p className="text-[#626252]"><strong>Ringkasan:</strong> {aiAnalysisResult.summary}</p>
                    <p className="text-[#626252]"><strong>Rekomendasi Tindakan:</strong> {aiAnalysisResult.recommendedAction}</p>
                    <div className="bg-[#f5f5f0] p-3 rounded-[12px] border border-black/5 text-[11px] font-mono text-[#2d2d22] whitespace-pre-wrap">
                      {aiAnalysisResult.whatsappDraft}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-[#72725e] hover:bg-[#f5f5f0] font-semibold rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan ke Locker & Kirim Notifikasi WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mail Detail & Handover PIN Verification */}
      {selectedMail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold">
                  📦
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
                    Detail Dokumen / Paket: {selectedMail.id}
                  </h3>
                  <p className="text-xs text-[#72725e]">
                    Locker: <strong className="text-[#2d2d22]">{selectedMail.lockerNumber}</strong> • Penerima: <strong className="text-[#5A5A40]">{selectedMail.tenantName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMail(null)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f5f5f0] rounded-[20px] p-4 border border-black/5">
                <div>
                  <span className="text-[#72725e] text-[10px] uppercase font-semibold">Pengirim:</span>
                  <div className="font-bold text-[#2d2d22] text-xs mt-0.5">{selectedMail.sender}</div>
                </div>
                <div>
                  <span className="text-[#72725e] text-[10px] uppercase font-semibold">Kategori:</span>
                  <div className="font-bold text-[#2d2d22] text-xs mt-0.5">{selectedMail.senderType}</div>
                </div>
                <div>
                  <span className="text-[#72725e] text-[10px] uppercase font-semibold">Waktu Penerimaan:</span>
                  <div className="font-bold text-[#2d2d22] text-xs mt-0.5">{selectedMail.receivedDate} ({selectedMail.receivedTime})</div>
                </div>
                <div>
                  <span className="text-[#72725e] text-[10px] uppercase font-semibold">Resepsionis:</span>
                  <div className="font-bold text-[#2d2d22] text-xs mt-0.5">{selectedMail.receptionistName}</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#2d2d22]">Perihal / Deskripsi Dokumen:</span>
                <p className="p-3.5 rounded-[16px] bg-[#f5f5f0] border border-black/5 text-[#3a3a2e] leading-relaxed font-medium">
                  {selectedMail.subject}
                </p>
              </div>

              {selectedMail.summaryNotes && (
                <div className="space-y-1">
                  <span className="font-bold text-[#2d2d22]">Catatan Smart OCR:</span>
                  <p className="p-3.5 rounded-[16px] bg-[#f5f2ed] border border-[#5A5A40]/15 text-[#383827] leading-relaxed">
                    {selectedMail.summaryNotes}
                  </p>
                </div>
              )}

              {/* Handover & PIN Verification Form */}
              {selectedMail.status !== "picked_up" ? (
                <div className="bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-[20px] p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[#2d2d22] flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#5A5A40]" />
                      Verifikasi Pengambilan / Serah Terima Dokumen:
                    </h4>
                    <span className="font-mono text-xs font-bold text-[#5A5A40] bg-white px-3 py-1 rounded-full border border-[#5A5A40]/20">
                      PIN Resmi: {selectedMail.pickupCodePin}
                    </span>
                  </div>

                  {handoverError && (
                    <div className="p-3 rounded-[14px] bg-[#E4E3DA] border border-[#5A5A40]/30 text-[#383827] font-medium">
                      {handoverError}
                    </div>
                  )}

                  {handoverSuccess && (
                    <div className="p-3 rounded-[14px] bg-[#E4E3DA] border border-[#5A5A40]/40 text-[#2d2d22] font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                      Serah terima berhasil diverifikasi dan tersimpan dalam audit log!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#2d2d22] mb-1">
                        Masukkan PIN 6-Digit dari Klien:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Contoh: 782910"
                        value={handoverPinInput}
                        onChange={(e) => setHandoverPinInput(e.target.value)}
                        className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 font-mono text-sm tracking-widest text-center font-bold focus:ring-1 focus:ring-[#5A5A40] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2d2d22] mb-1">
                        Nama Penerima / Kuasa:
                      </label>
                      <input
                        type="text"
                        placeholder="Nama PIC pengambil"
                        value={receiverNameInput}
                        onChange={(e) => setReceiverNameInput(e.target.value)}
                        className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] bg-white px-4"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleConfirmHandover(selectedMail)}
                    className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Serah Terima Fisik (Digital Sign Off)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-[20px] p-4 space-y-2 text-[#2d2d22]">
                  <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#5A5A40]">
                    <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />
                    Status: Telah Diserahkan Resmi
                  </div>
                  <p>
                    Diserahkan kepada: <strong>{selectedMail.pickedUpBy}</strong> pada <strong>{selectedMail.pickedUpDate}</strong>.
                  </p>
                  <p className="text-[11px] text-[#72725e]">
                    *Tanda tangan digital telah terverifikasi dan diarsip sesuai UU ITE No. 1/2024.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

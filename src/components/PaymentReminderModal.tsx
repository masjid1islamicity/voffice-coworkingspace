import React, { useState, useEffect } from "react";
import { Invoice, Tenant, InvoiceReminderLog } from "../types";
import {
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  X,
  Phone,
  Calendar,
  DollarSign,
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
  Sliders,
  SendHorizontal,
} from "lucide-react";

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  tenant?: Tenant;
  onRecordReminderSent?: (invoiceId: string, reminderLog: InvoiceReminderLog) => void;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  isOpen,
  onClose,
  invoice,
  tenant,
  onRecordReminderSent,
}) => {
  if (!isOpen) return null;

  // Calculate days before due date based on current simulated date (2026-09-30)
  const calculateDaysRemaining = (dueDateStr: string): number => {
    try {
      const today = new Date("2026-09-30T00:00:00");
      const due = new Date(dueDateStr + "T00:00:00");
      const diffTime = due.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 3;
    }
  };

  const daysRemaining = calculateDaysRemaining(invoice.dueDate);

  // States
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email" | "history">("whatsapp");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [whatsappText, setWhatsappText] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailHtml, setEmailHtml] = useState<string>("");
  const [emailText, setEmailText] = useState<string>("");
  const [spiritualReminder, setSpiritualReminder] = useState<string>("");
  const [copiedWA, setCopiedWA] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [sentSuccessNotification, setSentSuccessNotification] = useState<string | null>(null);

  // Editable recipient info
  const [recipientPhone, setRecipientPhone] = useState<string>(tenant?.phone || "0812-8899-2311");
  const [recipientEmail, setRecipientEmail] = useState<string>(tenant?.email || "finance@tenant.com");

  // Fetch or generate reminder draft
  const generateDraft = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/billing/generate-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          tenantName: invoice.tenantName,
          representativeName: tenant?.representativeName || "Pimpinan",
          tenantPhone: recipientPhone,
          tenantEmail: recipientEmail,
          dueDate: invoice.dueDate,
          daysRemaining: daysRemaining,
          totalAmount: invoice.totalAmount,
          baseAmount: invoice.baseAmount,
          wakafAmount: invoice.wakafEndowmentAmount,
          periodDescription: invoice.periodDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat draf pengingat");

      setWhatsappText(data.whatsappMessage || "");
      setEmailSubject(data.emailSubject || `[Pengingat Pembayaran H-${daysRemaining}] ${invoice.invoiceNumber}`);
      setEmailHtml(data.emailHtml || "");
      setEmailText(data.emailText || "");
      setSpiritualReminder(data.spiritualReminder || "Penuhilah akad-akadmu (QS. Al-Ma'idah: 1)");
    } catch {
      // Local fallback
      const waFallback = `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\nKepada Yth. Pimpinan *${invoice.tenantName}*,\n\nSemoga limpahan rahmat dan rezeki berkah dari Allah SWT senantiasa menyertai Anda.\n\nKami menginformasikan bahwa tagihan sewa bulanan Virtual Office Anda akan jatuh tempo dalam *${daysRemaining} hari ke depan*:\n\n📄 *No. Invoice*: ${invoice.invoiceNumber}\n📋 *Layanan*: ${invoice.periodDescription}\n📅 *Jatuh Tempo*: ${invoice.dueDate}\n💰 *Total Pembayaran*: Rp ${invoice.totalAmount.toLocaleString("id-ID")}\n🤲 *Porsi Wakaf Produktif (5%)*: Rp ${invoice.wakafEndowmentAmount.toLocaleString("id-ID")}\n\n💳 *Metode Pembayaran Resmi*:\n• Bank Syariah Indonesia (BSI) VA: 9888-0012-3456-7890\n• Bank Muamalat VA: 7711-0023-4567-8901\n• QRIS Syariah (Tersedia di Portal Billing)\n\n_Sistem kami bebas dari denda bunga (Bebas Riba). Konfirmasikan pembayaran melalui WhatsApp ini setelah transfer._\n\nJazakumullah Khairan Katsiran.\n*Tim Keuangan Islamicity Virtual Office Hub*`;
      
      setWhatsappText(waFallback);
      setEmailSubject(`[Pengingat Pembayaran H-${daysRemaining}] Invoice ${invoice.invoiceNumber} - ${invoice.tenantName}`);
      setEmailText(`Assalamu'alaikum Wr. Wb.\nTagihan ${invoice.invoiceNumber} sebesar Rp ${invoice.totalAmount.toLocaleString("id-ID")} jatuh tempo pada ${invoice.dueDate}. Terima kasih.`);
      setSpiritualReminder("Hai orang-orang yang beriman, penuhilah janji-janji akad (QS. Al-Ma'idah: 1)");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateDraft();
  }, [invoice.id]);

  // Actions
  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailText}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendWhatsAppWeb = () => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(whatsappText)}`;
    window.open(url, "_blank");

    // Record log
    const newLog: InvoiceReminderLog = {
      id: `REM-${Date.now()}`,
      sentAt: new Date().toLocaleString("id-ID"),
      channel: "whatsapp",
      recipientPhone,
      recipientEmail,
      status: "delivered",
      daysBeforeDueDate: daysRemaining,
      messageSnippet: whatsappText.slice(0, 100) + "...",
    };

    if (onRecordReminderSent) {
      onRecordReminderSent(invoice.id, newLog);
    }

    setSentSuccessNotification(`Notifikasi WhatsApp berhasil dikirim ke ${recipientPhone}!`);
    setTimeout(() => setSentSuccessNotification(null), 4000);
  };

  const handleSendAutomatedEmail = () => {
    // Simulate real backend email dispatch
    const newLog: InvoiceReminderLog = {
      id: `REM-${Date.now()}`,
      sentAt: new Date().toLocaleString("id-ID"),
      channel: "email",
      recipientPhone,
      recipientEmail,
      status: "delivered",
      daysBeforeDueDate: daysRemaining,
      messageSnippet: `Subject: ${emailSubject}`,
    };

    if (onRecordReminderSent) {
      onRecordReminderSent(invoice.id, newLog);
    }

    setSentSuccessNotification(`Email pengingat resmi berhasil dikirim ke ${recipientEmail}!`);
    setTimeout(() => setSentSuccessNotification(null), 4000);
  };

  const handleSendBothChannels = () => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(whatsappText)}`;
    window.open(url, "_blank");

    const newLog: InvoiceReminderLog = {
      id: `REM-${Date.now()}`,
      sentAt: new Date().toLocaleString("id-ID"),
      channel: "both",
      recipientPhone,
      recipientEmail,
      status: "delivered",
      daysBeforeDueDate: daysRemaining,
      messageSnippet: `Omnichannel: WA & Email sent to ${invoice.tenantName}`,
    };

    if (onRecordReminderSent) {
      onRecordReminderSent(invoice.id, newLog);
    }

    setSentSuccessNotification(`Kedua kanal (WhatsApp & Email) berhasil diproses dan dikirim serentak!`);
    setTimeout(() => setSentSuccessNotification(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-3xl w-full border border-black/10 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#444431] to-[#2e2e21] text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-white/20 text-[#E4E3DA] px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                OTOMASI NOTIFIKASI PENGINGAT PEMBAYARAN
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                daysRemaining === 3
                  ? "bg-amber-500 text-white"
                  : daysRemaining < 3
                  ? "bg-rose-500 text-white"
                  : "bg-emerald-600 text-white"
              }`}>
                H-{daysRemaining} Jatuh Tempo ({invoice.dueDate})
              </span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
              Kirim Pengingat Pembayaran: {invoice.tenantName}
            </h3>
            <p className="text-xs text-[#E4E3DA]/80">
              Invoice #{invoice.invoiceNumber} • Total: <strong>Rp {invoice.totalAmount.toLocaleString("id-ID")}</strong> (Termasuk 5% Wakaf Rp {invoice.wakafEndowmentAmount.toLocaleString("id-ID")})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {sentSuccessNotification && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 px-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sentSuccessNotification}</span>
          </div>
        )}

        {/* Recipient Quick Controls Strip */}
        <div className="bg-[#f5f2ed] border-b border-black/5 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#383827]">
              <Phone className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-[#72725e]">WhatsApp:</span>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="bg-white border border-[#5A5A40]/30 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-[#2d2d22] w-36"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[#383827]">
              <Mail className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-[#72725e]">Email:</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="bg-white border border-[#5A5A40]/30 rounded-lg px-2 py-0.5 text-xs font-bold text-[#2d2d22] w-48"
              />
            </div>
          </div>

          <button
            onClick={generateDraft}
            disabled={isLoading}
            className="text-xs font-semibold text-[#5A5A40] hover:text-[#383827] flex items-center gap-1 cursor-pointer"
            title="Muat ulang teks draf AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Generate Ulang AI</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-black/5 px-6 bg-white">
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "whatsapp"
                ? "border-[#5A5A40] text-[#5A5A40]"
                : "border-transparent text-[#72725e] hover:text-[#2d2d22]"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Reminder (H-3)</span>
          </button>

          <button
            onClick={() => setActiveTab("email")}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "email"
                ? "border-[#5A5A40] text-[#5A5A40]"
                : "border-transparent text-[#72725e] hover:text-[#2d2d22]"
            }`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Email Reminder Resmi (HTML)</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "history"
                ? "border-[#5A5A40] text-[#5A5A40]"
                : "border-transparent text-[#72725e] hover:text-[#2d2d22]"
            }`}
          >
            <Clock className="w-4 h-4 text-[#72725e]" />
            <span>Riwayat Pengiriman ({invoice.reminderLogs?.length || 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: WHATSAPP */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2d2d22]">
                    Pratinjau Draf Pesan WhatsApp Resmi
                  </span>
                  <span className="text-[10px] font-mono text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full">
                    Gaya Fiqh Santun & Tanpa Denda Riba
                  </span>
                </div>

                <button
                  onClick={handleCopyWhatsApp}
                  className="px-3 py-1 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border border-[#5A5A40]/20 cursor-pointer"
                >
                  {copiedWA ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Textarea preview */}
              <div className="relative">
                <textarea
                  rows={11}
                  value={whatsappText}
                  onChange={(e) => setWhatsappText(e.target.value)}
                  className="w-full text-xs font-mono text-[#2d2d22] bg-[#fafaf7] border border-[#5A5A40]/20 rounded-2xl p-4 leading-relaxed focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Spiritual reminder badge */}
              <div className="p-3 rounded-xl bg-[#f5f2ed] border border-[#5A5A40]/15 text-xs text-[#5A5A40] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Adab Muamalah:</strong> {spiritualReminder}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL */}
          {activeTab === "email" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#383827]">
                  Subjek Email Resmi:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="flex-1 text-xs text-[#2d2d22] bg-[#fafaf7] border border-[#5A5A40]/20 rounded-xl px-3.5 py-2 font-semibold"
                  />
                  <button
                    onClick={handleCopyEmail}
                    className="px-3 py-2 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-[#5A5A40]/20 cursor-pointer shrink-0"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
              </div>

              {/* HTML Email Card Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#383827]">
                  <span>Visual Preview Kop Surat Email:</span>
                  <span className="text-[10px] text-[#72725e]">Standard Sharia Responsive HTML</span>
                </div>
                <div
                  className="border border-black/10 rounded-2xl p-4 bg-[#fcfbf9] max-h-72 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailHtml }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: RIWAYAT REMINDER LOGS */}
          {activeTab === "history" && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#2d2d22]">
                Log Riwayat Notifikasi Pembayaran Invoice #{invoice.invoiceNumber}:
              </div>

              {invoice.reminderLogs && invoice.reminderLogs.length > 0 ? (
                <div className="space-y-2">
                  {invoice.reminderLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-[#fafaf7] border border-black/5 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            log.channel === "whatsapp"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.channel === "email"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {log.channel}
                          </span>
                          <span className="text-[#72725e] text-[11px]">{log.sentAt}</span>
                        </div>
                        <p className="text-[#3a3a2e] text-xs font-medium">
                          {log.messageSnippet}
                        </p>
                        <div className="text-[10px] text-[#72725e]">
                          Tujuan: {log.recipientPhone} / {log.recipientEmail}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Berhasil Terkirim
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#fafaf7] rounded-2xl border border-black/5 space-y-2">
                  <Clock className="w-8 h-8 text-[#72725e] mx-auto opacity-50" />
                  <p className="text-xs font-semibold text-[#2d2d22]">
                    Belum ada riwayat pengingat terkirim untuk invoice ini.
                  </p>
                  <p className="text-[11px] text-[#72725e]">
                    Pilih kanal WhatsApp atau Email di atas untuk mengirim pengingat perdana H-{daysRemaining}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#fafaf7] border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#72725e] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            <span>Format baku berstandar DSN-MUI (Bebas Denda Keterlambatan Ribawi)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendWhatsAppWeb}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp Sekarang</span>
            </button>

            <button
              onClick={handleSendAutomatedEmail}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirim Email Otomatis</span>
            </button>

            <button
              onClick={handleSendBothChannels}
              className="px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <SendHorizontal className="w-3.5 h-3.5 text-[#E4E3DA]" />
              <span>Kirim Serentak (WA + Email)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

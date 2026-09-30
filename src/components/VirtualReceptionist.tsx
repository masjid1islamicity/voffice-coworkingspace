import React, { useState } from "react";
import { Tenant } from "../types";
import {
  PhoneCall,
  Sparkles,
  Bot,
  Send,
  MessageSquare,
  ShieldCheck,
  Building,
  User,
  Clock,
  CheckCircle2,
  PhoneForwarded,
  Volume2,
} from "lucide-react";

interface VirtualReceptionistProps {
  tenants: Tenant[];
}

export const VirtualReceptionist: React.FC<VirtualReceptionistProps> = ({ tenants = [] }) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const [selectedTenantId, setSelectedTenantId] = useState(safeTenants[0]?.id || "");
  const [callerName, setCallerName] = useState("Bapak Hendra (KPP Pratama)");
  const [callerOrganization, setCallerOrganization] = useState("Kantor Pelayanan Pajak");
  const [purpose, setPurpose] = useState("Konfirmasi jadwal verifikasi lapangan terkait pengajuan PKP");
  const [callScenario, setCallScenario] = useState<"Tamu Penting / Dinas Pajak" | "Prospek Bisnis Klien" | "Kurir / Pengantar Surat" | "Pertanyaan Umum Layanan">("Tamu Penting / Dinas Pajak");

  const [loading, setLoading] = useState(false);
  const [receptionistOutput, setReceptionistOutput] = useState<{
    greetingScript: string;
    handlingNote: string;
    whatsappNotificationDraft: string;
    escalationLevel: "Urgent" | "Standard" | "Info";
  } | null>(null);

  const [callLogs, setCallLogs] = useState<
    Array<{
      id: string;
      time: string;
      caller: string;
      tenantName: string;
      summary: string;
      escalation: string;
    }>
  >([
    {
      id: "CALL-891",
      time: "10:15 WIB",
      caller: "Ibu Ratna (Bank BSI Cabang Sudirman)",
      tenantName: "PT Halal Food Nusantara",
      summary: "Konfirmasi pembukaan rekening giro perusahaan syariah.",
      escalation: "Standard",
    },
    {
      id: "CALL-892",
      time: "11:40 WIB",
      caller: "Petugas Verifikasi DJP",
      tenantName: "CV Berkah Mandiri Sejahtera",
      summary: "Permintaan konfirmasi surat permohonan PKP di gedung sentra.",
      escalation: "Urgent",
    },
  ]);

  const handleSimulateReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReceptionistOutput(null);

    const tenant = safeTenants.find((t) => t.id === selectedTenantId);

    try {
      const res = await fetch("/api/ai/virtual-receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerName,
          callerOrganization,
          targetClient: tenant?.companyName || "PT Klien",
          purpose,
          scenario: callScenario,
        }),
      });
      const data = await res.json();
      setReceptionistOutput(data);

      if (tenant) {
        setCallLogs((prev) => [
          {
            id: `CALL-${Math.floor(Math.random() * 900 + 100)}`,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
            caller: `${callerName} (${callerOrganization})`,
            tenantName: tenant.companyName,
            summary: data.handlingNote || purpose,
            escalation: data.escalationLevel || "Standard",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              AI TELEPHONY & SECRETARY DESK
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              SOP Layanan Resepsionis & Adab Komunikasi Islami
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
            Asisten Resepsionis Virtual AI & Call Answering Syariah
          </h2>
          <p className="text-xs sm:text-sm text-[#626252] max-w-2xl leading-relaxed">
            Menjawab panggilan telepon masuk dengan salam dan keramahan Islami, mencatat pesan rahasia, meneruskan instruksi ke direksi via WhatsApp, dan memfilter panggilan spam/telemarketing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/20 text-xs font-bold flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-[#5A5A40]" />
            Gemini Reception Agent Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call Simulator Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="font-serif font-bold text-[#2d2d22] text-sm flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#5A5A40]" />
              Simulasi Panggilan Masuk Klien
            </h3>
            <span className="text-[11px] text-[#72725e]">Live Agent Tester</span>
          </div>

          <form onSubmit={handleSimulateReceptionist} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">
                Perusahaan Tenant yang Dituju:
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-[#f5f5f0]/60 font-medium text-[#2d2d22] px-4"
              >
                {safeTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.companyName} ({t.representativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Nama Penelepon:</label>
                <input
                  type="text"
                  required
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Instansi / Asal:</label>
                <input
                  type="text"
                  required
                  value={callerOrganization}
                  onChange={(e) => setCallerOrganization(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">Skenario Telepon:</label>
              <select
                value={callScenario}
                onChange={(e) => setCallScenario(e.target.value as any)}
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white font-medium text-[#2d2d22] px-4"
              >
                <option value="Tamu Penting / Dinas Pajak">Tamu Penting / Instansi Dinas Pajak / Bank</option>
                <option value="Prospek Bisnis Klien">Calon Klien / Prospek Bisnis Tenant</option>
                <option value="Kurir / Pengantar Surat">Kurir Dokumen Resmi / Paket Berharga</option>
                <option value="Pertanyaan Umum Layanan">Pertanyaan Umum Alamat & Jam Kantor</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">
                Pesan / Maksud Panggilan:
              </label>
              <textarea
                rows={3}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Contoh: Mengabarkan bahwa tim auditor pajak akan visit besok pukul 10.00 WIB."
                className="w-full p-3 rounded-[16px] border border-[#5A5A40]/20 text-[#2d2d22]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !callerName || !purpose}
              className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] disabled:bg-stone-300 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#E4E3DA]" />
                  <span>Resepsionis AI Menjawab...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 text-[#E4E3DA]" />
                  <span>Jawab Panggilan dengan Adab Islami</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Output & Response Scripts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {receptionistOutput ? (
            <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#E4E3DA]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#2d2d22] text-sm">Respon Skrip Resepsionis AI</h3>
                    <p className="text-[11px] text-[#72725e]">Standar keramahan & etika Islami</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    receptionistOutput.escalationLevel === "Urgent"
                      ? "bg-[#E4E3DA] text-[#383827] border border-[#5A5A40]/30"
                      : "bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/20"
                  }`}
                >
                  Tingkat Eskalasi: {receptionistOutput.escalationLevel}
                </span>
              </div>

              {/* Spoken Script */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#5A5A40] text-xs">
                  <Volume2 className="w-4 h-4 text-[#5A5A40]" />
                  Skrip Percakapan Telepon yang Diucapkan:
                </div>
                <div className="p-4 rounded-[18px] bg-[#f5f2ed] border border-[#5A5A40]/20 text-[#2d2d22] font-medium text-xs leading-relaxed">
                  "{receptionistOutput.greetingScript}"
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#2d2d22]">Catatan Internal Resepsionis:</span>
                <p className="p-3.5 rounded-[16px] bg-[#f5f5f0] border border-black/5 text-[#3a3a2e]">
                  {receptionistOutput.handlingNote}
                </p>
              </div>

              {/* WhatsApp Notification Draft */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2d2d22] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Draf Notifikasi WhatsApp Instan ke Direktur Tenant:
                  </span>
                </div>
                <div className="p-3.5 rounded-[16px] bg-[#383827] text-[#E4E3DA] font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  {receptionistOutput.whatsappNotificationDraft}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-black/5 p-10 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 text-[#5A5A40] flex items-center justify-center mx-auto">
                <Bot className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-[#2d2d22] text-sm">Resepsionis AI Siap Melayani</h4>
              <p className="text-[#72725e] text-xs max-w-sm mx-auto">
                Pilih skenario panggilan dan klik <strong>Jawab Panggilan dengan Adab Islami</strong> untuk melihat bagaimana AI menangani percakapan telepon dengan etika profesional syariah.
              </p>
            </div>
          )}

          {/* Recent Call Logs Table */}
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-3">
            <h4 className="font-serif font-bold text-[#2d2d22] text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#72725e]" />
              Log Panggilan & Pesan Telepon Terkini
            </h4>
            <div className="divide-y divide-black/5 text-xs">
              {callLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2d2d22]">{log.caller}</span>
                      <span className="text-[10px] text-[#72725e] font-mono">{log.time}</span>
                    </div>
                    <div className="text-[11px] text-[#5A5A40] font-medium">
                      Ditujukan ke: {log.tenantName}
                    </div>
                    <div className="text-[11px] text-[#626252] mt-0.5">{log.summary}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      log.escalation === "Urgent" ? "bg-[#E4E3DA] text-[#383827] border border-[#5A5A40]/30" : "bg-[#f5f5f0] text-[#72725e]"
                    }`}
                  >
                    {log.escalation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

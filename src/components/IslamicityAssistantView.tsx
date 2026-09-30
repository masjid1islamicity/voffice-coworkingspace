import React, { useState } from "react";
import { IslamicityVaQuery, VirtualCity } from "../types";
import { VIRTUAL_CITIES } from "../data/islamicity4Data";
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  ShieldCheck,
  Building2,
  HeartHandshake,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface IslamicityAssistantViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const IslamicityAssistantView: React.FC<IslamicityAssistantViewProps> = ({
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<IslamicityVaQuery[]>([
    {
      id: "VA-WELCOME",
      timestamp: "09:00 WIB",
      sender: "assistant",
      text: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Saya adalah Islamicity Virtual Assistant (VA), asisten perangkat lunak AI yang dirancang khusus untuk memandu pemahaman Fiqh Muamalah, legalitas aset, jaminan kolateral, dan pemanfaatan ekosistem VirtualOffice 4.0 bagi lebih dari 800.000 Usaha Komunitas Masjid (UKM) dan UMKM di 8.000 kota kecamatan se-Indonesia serta dunia internasional.\n\nBerbeda dengan Virtual Assistant manusia yang menangani pekerjaan kantor jarak jauh umum, maupun Google Assistant untuk perintah perangkat harian, Islamicity VA difokuskan pada tatanan nilai Islam, kepatuhan Fatwa DSN-MUI, dan pemberdayaan ekonomi berbasis masjid.",
      topic: "virtual_office_guide",
      quranReference: "QS. Al-Baqarah: 282 (Perintah mencatat muamalah secara transparan dan adil)",
      hadithReference: "HR. Tirmidzi No. 1209 ('Pedagang yang jujur dan amanah akan bersama para Nabi, orang-orang shiddiq, dan para syuhada')",
      actionRecommendation: "Ajukan pertanyaan seputar akad sewa Ijarah, permodalan syariah tanpa riba, kolateral tanah wakaf, atau cara pendaftaran di http://potensi.islamicity.tv dan http://register.islamicity.tv.",
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>(VIRTUAL_CITIES[0].name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Suggested Prompts
  const SUGGESTED_PROMPTS = [
    "Bagaimana hukum syariah sewa virtual office dan coworking space di masjid?",
    "Apa peran Koperasi - Bank Broker DUIT Voucher dalam permodalan tanpa bunga?",
    "Bagaimana cara UKM mendaftarkan potensi di http://potensi.islamicity.tv?",
    "Jelaskan jaminan kolateral aset dan kepemilikan yang sah sesuai Fatwa DSN-MUI.",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: IslamicityVaQuery = {
      id: `USER-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/islamicity-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: textToSend,
          virtualCityContext: selectedCity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses jawaban");

      const aiMessage: IslamicityVaQuery = {
        id: `VA-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        sender: "assistant",
        text: data.assistantResponse || "Alhamdulillah, kami telah mencatat pertanyaan Anda.",
        topic: data.topic,
        quranReference: data.quranReference,
        hadithReference: data.hadithReference,
        actionRecommendation: data.actionRecommendation,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Fallback
      const fallbackAi: IslamicityVaQuery = {
        id: `VA-FALLBACK-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        sender: "assistant",
        text: `Assalamu'alaikum Warahmatullahi Wabarakatuh. Terkait inisiatif "${textToSend.slice(0, 80)}...", platform VirtualOffice 4.0 di ${selectedCity} menyediakan landasan hukum perizinan OSS-RBA di http://voffice.islamicity.tv, fasilitas coworking ramah waktu shalat di http://coworking.islamicity.tv, serta permodalan syariah melalui Koperasi Bank Broker DUIT Voucher. Seluruh transaksi wajib mencerminkan transparansi dan bebas riba.`,
        topic: "fiqh_muamalah",
        quranReference: "QS. Al-Ma'idah: 2 (Tolong-menolonglah dalam kebajikan dan taqwa)",
        hadithReference: "HR. Bukhari No. 2076 (Allah merahmati orang yang memudahkan saat menjual, membeli, dan menuntut hak)",
        actionRecommendation: "Yuk semua belajar kepada Allah SWT dengan mengisi sensus di http://potensi.islamicity.tv dan http://register.islamicity.tv.",
      };
      setMessages((prev) => [...prev, fallbackAi]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Concept Comparison Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-white flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              ISLAMICITY VIRTUAL ASSISTANT (VA)
            </span>
            <span className="text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
              Software-Based AI for Islamic & Muamalah Knowledge
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-1">
            Asisten Cerdas Fiqh Muamalah, Aset Manajemen & Ekosistem Masjid
          </h2>
          <p className="text-xs text-[#72725e]">
            Membimbing para pengurus DKM, pelaku UKM komunitas masjid, dan UMKM di 8.000 kecamatan dalam menerapkan tata kelola bisnis Islami, manajemen kolateral, dan pendaftaran kursus Global TECS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#5A5A40]/20 rounded-full text-xs font-bold text-[#2d2d22]"
          >
            {VIRTUAL_CITIES.map((vc) => (
              <option key={vc.id} value={vc.name}>
                📍 {vc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix: Human VA vs Google Assistant vs Islamicity VA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-1.5">
          <div className="font-bold text-[#2d2d22] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8A8A6A]"></span>
            <span>Virtual Assistant (VA) & Office VA</span>
          </div>
          <span className="text-[10px] text-[#72725e] font-medium block">
            Staf Manusia (Human Remote Staff)
          </span>
          <p className="text-[11px] text-[#626252] leading-relaxed">
            Menangani tugas administratif kantor jarak jauh: manajemen email, jadwal temu, pembukuan dasar, dan input data.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-1.5">
          <div className="font-bold text-[#2d2d22] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Google Assistant</span>
          </div>
          <span className="text-[10px] text-[#72725e] font-medium block">
            AI Voice Assistant Umum
          </span>
          <p className="text-[11px] text-[#626252] leading-relaxed">
            Membantu perintah suara harian perangkat: pengingat waktu, navigasi jalan, putar lagu, dan informasi umum.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/30 shadow-2xs space-y-1.5">
          <div className="font-bold text-[#383827] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
            <span>Islamicity Virtual Assistant (VA)</span>
          </div>
          <span className="text-[10px] text-[#5A5A40] font-bold block">
            AI Khusus Pengetahuan Islam & Muamalah
          </span>
          <p className="text-[11px] text-[#3a3a2e] leading-relaxed">
            Menjawab Fiqh Muamalah, legalitas kolateral syariah, jadwal shalat, rujukan Al-Qur'an/Hadits, dan ekosistem 800.000 masjid.
          </p>
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="bg-white rounded-[28px] border border-black/5 shadow-xs overflow-hidden flex flex-col h-[580px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#fafaf7]/50">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    isUser ? "bg-[#383827]" : "bg-[#5A5A40] shadow-xs"
                  }`}
                >
                  {isUser ? "Anda" : <Bot className="w-4 h-4 text-cyan-200" />}
                </div>

                <div
                  className={`p-4 rounded-2xl space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[#5A5A40] text-white rounded-tr-none"
                      : "bg-white border border-black/10 text-[#2d2d22] shadow-2xs rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Quran & Hadith Callouts for AI responses */}
                  {!isUser && (msg.quranReference || msg.hadithReference) && (
                    <div className="mt-2 pt-2 border-t border-black/5 space-y-1 bg-[#f5f2ed] p-2.5 rounded-xl text-[11px] text-[#383827]">
                      {msg.quranReference && (
                        <div className="flex items-start gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                          <span><strong>Dalil Al-Qur'an:</strong> {msg.quranReference}</span>
                        </div>
                      )}
                      {msg.hadithReference && (
                        <div className="flex items-start gap-1.5">
                          <HeartHandshake className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                          <span><strong>Rujukan Hadits:</strong> {msg.hadithReference}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isUser && msg.actionRecommendation && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{msg.actionRecommendation}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-[#72725e]">
              <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-2xs">
                Sedang mengkaji rujukan Fiqh Muamalah dan tatanan syariah...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Strip */}
        <div className="p-3 bg-[#f5f2ed] border-t border-black/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-bold text-[#72725e] uppercase shrink-0 px-2">
            Inspirasi Topik:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-white hover:bg-[#E4E3DA] text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-black/5 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Tanyakan Fiqh Muamalah, legalitas aset, atau cara daftar UKM di ${selectedCity}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-full px-4 py-3 focus:ring-1 focus:ring-[#5A5A40]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-3 bg-[#5A5A40] hover:bg-[#484833] disabled:opacity-50 text-white rounded-full transition-all cursor-pointer shadow-xs"
            title="Kirim Pertanyaan"
          >
            <Send className="w-4 h-4 text-[#E4E3DA]" />
          </button>
        </form>
      </div>
    </div>
  );
};

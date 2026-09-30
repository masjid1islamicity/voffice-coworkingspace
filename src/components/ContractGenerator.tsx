import React, { useState } from "react";
import { Tenant } from "../types";
import {
  FileSignature,
  Sparkles,
  Printer,
  Copy,
  Check,
  Building,
  ShieldCheck,
  Scale,
  HeartHandshake,
  Download,
  Share2,
} from "lucide-react";

interface ContractGeneratorProps {
  tenants: Tenant[];
}

export const ContractGenerator: React.FC<ContractGeneratorProps> = ({ tenants = [] }) => {
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const [selectedTenantId, setSelectedTenantId] = useState(safeTenants[0]?.id || "");
  const [tenantName, setTenantName] = useState(safeTenants[0]?.companyName || "");
  const [businessType, setBusinessType] = useState(safeTenants[0]?.businessType || "PT");
  const [representativeName, setRepresentativeName] = useState(safeTenants[0]?.representativeName || "");
  const [tenantAddress, setTenantAddress] = useState(safeTenants[0]?.registeredAddress || "Jakarta");
  const [packageType, setPackageType] = useState(safeTenants[0]?.packageType || "Paket Pro Sharia Office");
  const [durationMonths, setDurationMonths] = useState(12);
  const [monthlyRate, setMonthlyRate] = useState(450000);
  const [masjidLocation, setMasjidLocation] = useState("Kompleks Pusat Bisnis & Wakaf Masjid Agung, Jakarta");
  const [wakafPercentage, setWakafPercentage] = useState(5);
  const [customClauses, setCustomClauses] = useState(
    "Standar operasional Islami, penyediaan kuota ruang rapat 8 jam/bulan, garansi notifikasi surat < 15 menit, dan bebas dari aktivitas riba/perjudian."
  );

  const [loading, setLoading] = useState(false);
  const [contractText, setContractText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectExistingTenant = (id: string) => {
    setSelectedTenantId(id);
    const t = safeTenants.find((item) => item.id === id);
    if (t) {
      setTenantName(t.companyName);
      setBusinessType(t.businessType);
      setRepresentativeName(t.representativeName);
      setTenantAddress(t.registeredAddress);
      setPackageType(t.packageType);
      setMonthlyRate(t.monthlyRate);
    }
  };

  const handleGenerateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContractText(null);

    try {
      const res = await fetch("/api/ai/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName,
          businessType,
          packageType,
          durationMonths,
          monthlyRate,
          representativeName,
          tenantAddress,
          masjidLocation,
          wakafPercentage,
          customClauses,
        }),
      });
      const data = await res.json();
      setContractText(data.contractText || "Dokumen kontrak berhasil dibuat.");
    } catch (err) {
      console.error(err);
      setContractText("Gagal menghasilkan kontrak melalui AI. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!contractText) return;
    navigator.clipboard.writeText(contractText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              SOP-IVO-05 COMPLIANT
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-[#5A5A40]" />
              Generator Naskah Akad Ijarah Syariah Berbasis AI (Gemini 3.7 Flash)
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
            Surat Perjanjian Sewa Virtual Office & Ruang Kerja Berdaya
          </h2>
          <p className="text-xs sm:text-sm text-[#626252] max-w-2xl leading-relaxed">
            Menghasilkan dokumen perjanjian hukum yang sah menurut KUHPerdata, Permendag No. 8/2020, dan Fatwa DSN-MUI tentang Akad Ijarah (bebas denda riba, alokasi wakaf produktif 5%, dan komitmen SLA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/20 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            DSN-MUI No. 09/2000
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="font-serif font-bold text-[#2d2d22] text-sm flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[#5A5A40]" />
              Parameter Akad & Identitas Pihak
            </h3>
            <span className="text-[11px] text-[#72725e]">Isi Formulir</span>
          </div>

          <form onSubmit={handleGenerateContract} className="space-y-3.5">
            {/* Quick Load Tenant */}
            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">
                Pilih dari Klien Terdaftar (Opsional):
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => handleSelectExistingTenant(e.target.value)}
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-[#f5f5f0]/60 font-medium text-[#2d2d22] px-4"
              >
                <option value="">-- Buat untuk Klien Baru / Kustom --</option>
                {safeTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.companyName} ({t.businessType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">
                Nama Perusahaan / Entitas Penyewa (Pihak II):
              </label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Contoh: PT Berkah Pangan Mandiri"
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 focus:ring-1 focus:ring-[#5A5A40] font-medium px-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Bentuk Usaha:</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-4"
                >
                  <option value="PT">PT (Perseroan Terbatas)</option>
                  <option value="CV">CV (Commanditaire Vennootschap)</option>
                  <option value="Koperasi Syariah">Koperasi Syariah</option>
                  <option value="Yayasan">Yayasan / Lembaga Sosial</option>
                  <option value="UMKM Komunitas Masjid">UMKM Komunitas Masjid</option>
                  <option value="Perorangan / Freelancer">Perorangan / Freelancer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Nama Direktur / PIC:</label>
                <input
                  type="text"
                  required
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  placeholder="H. Ahmad Fauzi, S.E."
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">
                Alamat Domisili Klien / KTP:
              </label>
              <input
                type="text"
                value={tenantAddress}
                onChange={(e) => setTenantAddress(e.target.value)}
                placeholder="Jl. H. Rasuna Said No. 45, Jakarta Selatan"
                className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Paket Layanan:</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as any)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white px-4"
                >
                  <option value="Paket Berdaya Basic">Paket Berdaya Basic (Rp 250rb)</option>
                  <option value="Paket Pro Sharia Office">Paket Pro Sharia Office (Rp 450rb)</option>
                  <option value="Paket Executive Suite">Paket Executive Suite (Rp 750rb)</option>
                  <option value="Paket Komunitas Masjid Hub">Paket Masjid Hub (Rp 150rb)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Durasi Sewa (Bulan):</label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 font-bold font-mono px-4 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Biaya Sewa / Bulan (Rp):</label>
                <input
                  type="number"
                  step={50000}
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 font-bold font-mono px-4 text-center"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">Porsi Wakaf (%):</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={wakafPercentage}
                  onChange={(e) => setWakafPercentage(Number(e.target.value))}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 font-bold font-mono text-[#5A5A40] px-4 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2d2d22] mb-1">
                Klausul Khusus / Catatan Layanan:
              </label>
              <textarea
                rows={2}
                value={customClauses}
                onChange={(e) => setCustomClauses(e.target.value)}
                className="w-full p-3 rounded-[16px] border border-[#5A5A40]/20 text-[#2d2d22]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !tenantName}
              className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] disabled:bg-stone-300 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#E4E3DA]" />
                  <span>Menyusun Akad Ijarah AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                  <span>Generate Dokumen Akad Ijarah Sah</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Contract Document Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="font-serif font-bold text-[#2d2d22] text-sm">
                  Naskah Resmi Perjanjian Sewa Virtual Office
                </h3>
              </div>

              {contractText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#5A5A40]/20 hover:bg-[#f5f5f0] text-[#5A5A40] text-xs font-semibold cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#5A5A40]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Tersalin!" : "Salin"}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Document Content View */}
            {contractText ? (
              <div
                id="printable-contract"
                className="bg-[#f5f5f0]/70 border border-black/5 rounded-[18px] p-6 font-serif text-[#2d2d22] text-xs leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto"
              >
                {contractText}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 text-[#5A5A40] flex items-center justify-center mx-auto">
                  <FileSignature className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-bold text-[#2d2d22] text-sm">Belum Ada Dokumen Akad Dibuat</h4>
                <p className="text-[#72725e] text-xs max-w-sm mx-auto">
                  Lengkapi parameter formulir di sisi kiri dan klik tombol <strong>Generate Dokumen Akad Ijarah Sah</strong> untuk memproses perjanjian legal otomatis.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-[11px] text-[#72725e]">
            <span className="flex items-center gap-1 text-[#5A5A40] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Fiqh Muamalah DSN-MUI Compliant
            </span>
            <span>Bebas Gharar, Maysir & Riba</span>
          </div>
        </div>
      </div>
    </div>
  );
};

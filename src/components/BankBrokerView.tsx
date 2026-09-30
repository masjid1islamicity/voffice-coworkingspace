import React, { useState } from "react";
import { BANK_BROKER_VOUCHERS, VIRTUAL_CITIES } from "../data/islamicity4Data";
import { BankBrokerVoucherPool, VirtualCity } from "../types";
import {
  Coins,
  ShieldCheck,
  Building,
  Recycle,
  Radio,
  FileCheck,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Layers,
  Copy,
  Check,
} from "lucide-react";

export const BankBrokerView: React.FC = () => {
  const [selectedVoucher, setSelectedVoucher] = useState<BankBrokerVoucherPool>(
    BANK_BROKER_VOUCHERS[0]
  );
  const [redeemQuantity, setRedeemQuantity] = useState<number>(5);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const totalNominal = redeemQuantity * selectedVoucher.nominalValueRp;
    setRedeemSuccess(
      `Alhamdulillah! Pengajuan klaim ${redeemQuantity} unit ${selectedVoucher.title} (Senilai Rp ${totalNominal.toLocaleString(
        "id-ID"
      )}) berhasil dicatat dalam buku besar Koperasi Syariah. Kolateral: ${selectedVoucher.collateralAssetGuarantee}.`
    );
    setTimeout(() => setRedeemSuccess(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-white flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-300" />
              KOPERASI - BANK BROKER DUIT VOUCHER
            </span>
            <span className="text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
              Voucher, Data, Iklan & Sisa (Sampah) Sirkular
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-1">
            Ekosistem Likuiditas & Pertukaran Nilai Komunitas Masjid
          </h2>
          <p className="text-xs text-[#72725e]">
            Menghubungkan <strong>Bank Voucher</strong>, <strong>Kredit Data</strong>, <strong>Slot Iklan Syariah</strong>, dan <strong>Penyerapan Sisa (Sampah) Sirkular</strong> dengan jaminan aset riil tanpa bunga riba.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://voffice.islamicity.tv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-[#f5f2ed] text-[#2d2d22] border border-black/10 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>voffice.islamicity.tv</span>
          </a>
        </div>
      </div>

      {/* 4 Categories Card Grid: Bank Voucher, Data, Iklan, Sisa Sampah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BANK_BROKER_VOUCHERS.map((voucher) => {
          const isSelected = selectedVoucher.id === voucher.id;
          return (
            <div
              key={voucher.id}
              onClick={() => setSelectedVoucher(voucher)}
              className={`p-5 rounded-[24px] border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-white border-[#5A5A40] shadow-md ring-1 ring-[#5A5A40]/30"
                  : "bg-white border-black/5 hover:border-[#5A5A40]/30 shadow-2xs"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40]">
                    {voucher.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {voucher.shariaAkad}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-[#2d2d22] line-clamp-2">
                  {voucher.title}
                </h3>

                <div className="text-xs font-mono font-bold text-[#5A5A40]">
                  Rp {voucher.nominalValueRp.toLocaleString("id-ID")} / unit
                </div>

                <p className="text-[11px] text-[#72725e]">
                  Kolateral: <strong>{voucher.collateralAssetGuarantee}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 text-[10px] flex items-center justify-between text-[#72725e]">
                <span>Entitas: <strong>{voucher.supportingEntity}</strong></span>
                <span className="font-mono text-[#5A5A40] font-bold">
                  {voucher.availableUnits.toLocaleString("id-ID")} Tersedia
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Redeem & Sharia Guarantee Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Simulator (6 cols) */}
        <form
          onSubmit={handleRedeem}
          className="lg:col-span-6 bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4"
        >
          <div className="border-b border-black/5 pb-3">
            <h3 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#5A5A40]" />
              <span>Simulasi & Penukaran Nilai DUIT Voucher</span>
            </h3>
            <p className="text-[11px] text-[#72725e]">
              Gunakan voucher untuk belanja bahan baku UMKM, slot iklan digital masjid, kredit riset data, atau penyerapan limbah organik sirkular.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#383827]">
              Pilihan Voucher Pool:
            </label>
            <select
              value={selectedVoucher.id}
              onChange={(e) => {
                const found = BANK_BROKER_VOUCHERS.find((v) => v.id === e.target.value);
                if (found) setSelectedVoucher(found);
              }}
              className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3.5 py-2.5"
            >
              {BANK_BROKER_VOUCHERS.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.category}] {v.title} - Rp {v.nominalValueRp.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#383827]">
                Kuantitas Unit Voucher:
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={redeemQuantity}
                onChange={(e) => setRedeemQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-xl px-3 py-2 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#383827]">
                Akad Muamalah:
              </label>
              <div className="text-xs font-bold text-[#5A5A40] bg-[#f5f2ed] border border-[#5A5A40]/20 rounded-xl px-3 py-2">
                {selectedVoucher.shariaAkad}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#72725e]">
              <span>Nominal per Unit:</span>
              <span className="font-mono">Rp {selectedVoucher.nominalValueRp.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between text-[#72725e]">
              <span>Total Nilai Manfaat:</span>
              <span className="font-serif font-bold text-base text-[#2d2d22]">
                Rp {(redeemQuantity * selectedVoucher.nominalValueRp).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#5A5A40]">
              <span>Jaminan Kolateral:</span>
              <span className="font-medium text-right line-clamp-1">{selectedVoucher.collateralAssetGuarantee}</span>
            </div>
          </div>

          {redeemSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{redeemSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-md shadow-[#5A5A40]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-emerald-200" />
            <span>Klaim & Alokasikan Voucher DUIT ke Usaha Masjid</span>
          </button>
        </form>

        {/* Right Column: Governance, Asset Verification & Circular Economy (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#fcfbf9] rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="font-serif font-bold text-base text-[#2d2d22]">
                Sistem Jaminan Kolateral & Legalitas Bebas Riba
              </h3>
            </div>

            <p className="text-xs text-[#626252] leading-relaxed">
              Virtual Office Islamicity mengintegrasikan manajemen kolateral dengan aset riil produktif. Tidak ada pinjaman berbunga atau sekuritisasi fiktif. Seluruh transaksi diikat oleh akad syariah yang sah dan terdaftar di akta notaris Koperasi Syariah.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-black/5 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2d2d22]">Aset Kolateral Tanah Wakaf & Bangunan</div>
                  <p className="text-[11px] text-[#72725e]">
                    Pemanfaatan hak kelola produktif sesuai sertifikat Badan Wakaf Indonesia (BWI).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-black/5 flex items-start gap-2.5">
                <Recycle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2d2d22]">Ekonomi Sirkular: Sisa (Sampah) Masjid</div>
                  <p className="text-[11px] text-[#72725e]">
                    Konversi sisa makanan jamaah menjadi pakan ternak & pupuk organik melalui maggot biokonversi pesantren santri.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-black/5 flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-[#8A8A6A] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2d2d22]">Data & Iklan Berdaulat Umat</div>
                  <p className="text-[11px] text-[#72725e]">
                    Slot promosi etis di layar digital masjid dan jaringan media Islamicity TV tanpa iklan produk non-halal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

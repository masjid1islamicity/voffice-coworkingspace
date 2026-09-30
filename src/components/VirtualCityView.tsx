import React, { useState } from "react";
import { VIRTUAL_CITIES, BANK_BROKER_VOUCHERS } from "../data/islamicity4Data";
import { VirtualCity, BankBrokerVoucherPool } from "../types";
import {
  Layers,
  Building2,
  ShieldCheck,
  Search,
  MapPin,
  Coins,
  Recycle,
  Radio,
  FileCheck,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface VirtualCityViewProps {
  onNavigateTab?: (tab: string) => void;
  onSelectCity?: (city: VirtualCity) => void;
}

export const VirtualCityView: React.FC<VirtualCityViewProps> = ({
  onNavigateTab,
  onSelectCity,
}) => {
  const [selectedCity, setSelectedCity] = useState<VirtualCity>(VIRTUAL_CITIES[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");

  const filteredCities = VIRTUAL_CITIES.filter((vc) => {
    const matchesSearch =
      vc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vc.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vc.capNodeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProv = selectedProvince === "all" || vc.province === selectedProvince;
    return matchesSearch && matchesProv;
  });

  return (
    <div className="space-y-6">
      {/* Header & Executive Summary Callout */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-white flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              VIRTUALOFFICE 4.0 IN EVERY VIRTUALCITY
            </span>
            <span className="text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
              Legalitas Aset Manajemen & Kolateral Syariah
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-1">
            Peta VirtualCity & Solusi Kolateral Aset Berdaya
          </h2>
          <p className="text-xs text-[#72725e]">
            Didukung oleh <strong>CAP (Central Access Point)</strong>, <strong>UPIC (Unit Pelayanan Islamicity)</strong>, dan <strong>Koperasi - Bank Broker DUIT Voucher</strong> untuk 800.000+ Masjid di 8.000 Kecamatan.
          </p>
        </div>

        <a
          href="https://islamicity.github.io/VirtualOffice"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white hover:bg-[#f5f2ed] text-[#2d2d22] border border-black/10 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>Open in Browser (GitHub Pages)</span>
        </a>
      </div>

      {/* 4 Pillars of Sharia Collateral & Asset Governance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-1">
          <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center font-bold font-serif">
            1
          </div>
          <div className="font-bold text-[#2d2d22]">Kepemilikan yang Jelas</div>
          <p className="text-[11px] text-[#72725e]">
            Aset tanah wakaf, gedung, dan fasilitas kantor terdaftar transparan sesuai hukum kepemilikan Islam (*Milkiah Tammah*).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-1">
          <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center font-bold font-serif">
            2
          </div>
          <div className="font-bold text-[#2d2d22]">Transaksi yang Sah</div>
          <p className="text-[11px] text-[#72725e]">
            Semua akad sewa (Ijarah), bagi hasil (Mudharabah/Musyarakah), dan kolateral bebas dari bunga riba dan spekulasi judi.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-1">
          <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center font-bold font-serif">
            3
          </div>
          <div className="font-bold text-[#2d2d22]">Keadilan & Transparansi</div>
          <p className="text-[11px] text-[#72725e]">
            Otomasi pencatatan pembagian surplus sewa 5% wakaf produktif, jejak audit publik, dan kesetaraan hak antar tenant.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-1">
          <div className="w-8 h-8 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center font-bold font-serif">
            4
          </div>
          <div className="font-bold text-[#2d2d22]">Kepatuhan Fatwa DSN-MUI</div>
          <p className="text-[11px] text-[#72725e]">
            SOP, kontrak, dan operasional diverifikasi berkala oleh dewan pengawas syariah dan pakar hukum ekonomi Islam.
          </p>
        </div>
      </div>

      {/* Main Grid: VirtualCity Directory & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: VirtualCities List (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#72725e] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari VirtualCity, provinsi, atau CAP Node..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#5A5A40]/20 rounded-full text-xs text-[#2d2d22] focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2 bg-white border border-[#5A5A40]/20 rounded-full text-xs text-[#2d2d22]"
            >
              <option value="all">Semua Wilayah</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Timur">Jawa Timur</option>
              <option value="D.I. Yogyakarta">D.I. Yogyakarta</option>
              <option value="Sulawesi Selatan">Sulawesi Selatan</option>
              <option value="Sumatera Utara">Sumatera Utara</option>
              <option value="Kepulauan Riau">Kepulauan Riau</option>
              <option value="Kalimantan Selatan">Kalimantan Selatan</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredCities.map((vc) => {
              const isSelected = selectedCity.id === vc.id;
              return (
                <div
                  key={vc.id}
                  onClick={() => {
                    setSelectedCity(vc);
                    if (onSelectCity) onSelectCity(vc);
                  }}
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
                          {vc.id}
                        </span>
                        <span className="text-[10px] text-[#72725e]">{vc.province}</span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                        {vc.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-[#72725e] pt-0.5">
                        <span>🏛️ {vc.totalKecamatan} Kecamatan</span>
                        <span>🕌 {vc.totalMosques.toLocaleString("id-ID")} Masjid</span>
                        <span>👥 {vc.activeUmkm.toLocaleString("id-ID")} UKM</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {vc.koperasiBrokerStatus}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-[#5A5A40] mt-1.5">
                        Rp {(vc.voucherCirculationRp / 1000000000).toFixed(1)} M Voucher
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px] text-[#626252]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#5A5A40]">CAP: {vc.capNodeId}</span>
                      <span>•</span>
                      <span className="font-mono text-[#72725e]">UPIC: {vc.upicUnitId}</span>
                    </div>
                    <span className="text-[#5A5A40] font-semibold flex items-center gap-1">
                      Detail Simpul <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected VirtualCity Dashboard & Support Entities (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40]">
                    {selectedCity.id}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Node Aktif 8.000 Kecamatan
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#2d2d22] mt-1">
                  {selectedCity.name}
                </h3>
                <p className="text-xs text-[#72725e] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Provinsi {selectedCity.province} • Jaringan Komunitas Masjid</span>
                </p>
              </div>

              <a
                href={selectedCity.githubRepositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#f5f2ed] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] transition-colors"
                title="Buka Repositori GitHub VirtualOffice"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* 3 Pillars Support Breakdown: CAP, UPIC, Koperasi */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="w-7 h-7 rounded-full bg-[#5A5A40] text-white flex items-center justify-center mx-auto text-xs font-bold">
                  CAP
                </div>
                <div className="font-bold text-[#2d2d22] text-[11px]">Central Access Point</div>
                <div className="text-[10px] font-mono text-[#72725e] truncate">{selectedCity.capNodeId}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="w-7 h-7 rounded-full bg-[#8A8A6A] text-white flex items-center justify-center mx-auto text-xs font-bold">
                  UPIC
                </div>
                <div className="font-bold text-[#2d2d22] text-[11px]">Unit Pelayanan</div>
                <div className="text-[10px] font-mono text-[#72725e] truncate">{selectedCity.upicUnitId}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1">
                <div className="w-7 h-7 rounded-full bg-[#383827] text-white flex items-center justify-center mx-auto text-xs font-bold">
                  BMT
                </div>
                <div className="font-bold text-[#2d2d22] text-[11px]">Bank Broker DUIT</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{selectedCity.koperasiBrokerStatus}</div>
              </div>
            </div>

            {/* Metrics Matrix: Assets, Collateral, Circular Economy */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#f5f2ed] border border-[#5A5A40]/15 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#72725e]">Jaminan Kolateral Terverifikasi:</span>
                  <span className="font-mono font-bold text-sm text-[#2d2d22]">
                    Rp {selectedCity.collateralVerifiedTotalRp.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#72725e]">Sirkulasi Voucher DUIT:</span>
                  <span className="font-mono font-bold text-sm text-[#5A5A40]">
                    Rp {selectedCity.voucherCirculationRp.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#72725e]">Daur Ulang Sisa/Sampah Sirkular:</span>
                  <span className="font-mono font-bold text-xs text-emerald-800">
                    {selectedCity.sisaSampahSirkularKg.toLocaleString("id-ID")} Kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#72725e]">Pengguna Islamicity VA Aktif:</span>
                  <span className="font-mono font-bold text-xs text-[#383827]">
                    {selectedCity.islamicityVaActiveUsers.toLocaleString("id-ID")} Jamaah
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="http://voffice.islamicity.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Buka voffice.islamicity.tv</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="http://coworking.islamicity.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 border border-[#5A5A40]/20"
              >
                <span>coworking.islamicity.tv</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

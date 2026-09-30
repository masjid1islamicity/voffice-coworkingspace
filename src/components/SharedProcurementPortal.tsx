import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  TrendingDown,
  Layers,
  Truck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  DollarSign,
  Leaf,
  Filter,
  Search,
  ExternalLink,
  Info,
  Calendar,
  ChevronRight,
  Package,
  FileSpreadsheet,
  Check,
  Zap,
  Star,
  Award,
  Scale,
} from "lucide-react";
import {
  Tenant,
  ProcurementPoolItem,
  ProcurementCategory,
  ProcurementOrderEntry,
} from "../types";
import { INITIAL_PROCUREMENT_POOLS } from "../data/procurementData";
import { VendorShariahRatingView } from "./VendorShariahRatingView";

interface SharedProcurementPortalProps {
  tenants: Tenant[];
}

export const SharedProcurementPortal: React.FC<SharedProcurementPortalProps> = ({
  tenants,
}) => {
  const [activeMainView, setActiveMainView] = useState<
    "pools_catalog" | "vendor_shariah_ratings"
  >("pools_catalog");
  const [selectedVendorForRating, setSelectedVendorForRating] = useState<
    string | null
  >(null);

  const [pools, setPools] = useState<ProcurementPoolItem[]>(
    INITIAL_PROCUREMENT_POOLS
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePoolDetailId, setActivePoolDetailId] = useState<string | null>(
    pools[0]?.id || null
  );

  // New order modal
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [joiningPoolItem, setJoiningPoolItem] =
    useState<ProcurementPoolItem | null>(null);
  const [orderTenantId, setOrderTenantId] = useState<string>(
    tenants[0]?.id || "t-1"
  );
  const [orderQuantity, setOrderQuantity] = useState<number>(20);
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [joinSuccessMsg, setJoinSuccessMsg] = useState<string | null>(null);

  // Filtered pools
  const filteredPools = useMemo(() => {
    return pools.filter((p) => {
      const matchCat =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchQuery =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [pools, selectedCategory, searchQuery]);

  // Active pool detail object
  const activePool = useMemo(() => {
    return pools.find((p) => p.id === activePoolDetailId) || pools[0];
  }, [pools, activePoolDetailId]);

  // Aggregate stats across all shared pools
  const aggregatedStats = useMemo(() => {
    const totalPoolsCount = pools.length;
    let totalNominalSavingsRp = 0;
    let totalItemsPooled = 0;
    let totalIndividualDeliveriesAvoided = 0;
    let totalCO2AvoidedSupplierKg = 0;

    pools.forEach((p) => {
      totalItemsPooled += p.currentQuantity;
      // Find current active tier
      let currentTierPrice = p.baseUnitPrice;
      p.tiers.forEach((t) => {
        if (p.currentQuantity >= t.minQuantity) {
          currentTierPrice = t.unitPrice;
        }
      });
      const savingsPerItem = Math.max(0, p.baseUnitPrice - currentTierPrice);
      totalNominalSavingsRp += savingsPerItem * p.currentQuantity;

      // Each order entry represents an order that would otherwise require a separate supplier delivery
      const separateDeliveries = p.orders.length;
      totalIndividualDeliveriesAvoided += Math.max(0, separateDeliveries - 1);
    });

    // Transport avoided: ~14.5 kg CO2 per avoided LTL supplier delivery
    totalCO2AvoidedSupplierKg = Number(
      (totalIndividualDeliveriesAvoided * 14.5).toFixed(1)
    );

    return {
      totalPoolsCount,
      totalNominalSavingsRp,
      totalItemsPooled,
      totalIndividualDeliveriesAvoided,
      totalCO2AvoidedSupplierKg,
    };
  }, [pools]);

  // Helper to get active tier for a pool item
  const getActiveTier = (pool: ProcurementPoolItem) => {
    let active = pool.tiers[0];
    for (const tier of pool.tiers) {
      if (pool.currentQuantity >= tier.minQuantity) {
        active = tier;
      }
    }
    return active;
  };

  // Helper to get next tier
  const getNextTier = (pool: ProcurementPoolItem) => {
    const currentTier = getActiveTier(pool);
    const nextIdx = pool.tiers.findIndex((t) => t === currentTier) + 1;
    if (nextIdx < pool.tiers.length) {
      return pool.tiers[nextIdx];
    }
    return null;
  };

  const getSupplierVendorId = (supplierName: string) => {
    if (supplierName.includes("Kemasan Hijau")) return "vnd-sup-01";
    if (supplierName.includes("Barcode")) return "vnd-sup-02";
    if (supplierName.includes("Rantai Dingin")) return "vnd-sup-03";
    if (supplierName.includes("Paperindo")) return "vnd-sup-04";
    if (supplierName.includes("Bio Nabati")) return "vnd-sup-05";
    return "vnd-sup-01";
  };

  // Handle open modal
  const handleOpenJoinModal = (pool: ProcurementPoolItem) => {
    setJoiningPoolItem(pool);
    setOrderQuantity(Math.min(50, Math.max(10, Math.round(pool.targetMaxTierQuantity * 0.1))));
    setOrderNotes("");
    setIsJoinModalOpen(true);
  };

  // Handle submit order to pool
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningPoolItem || orderQuantity <= 0) return;

    const tenantObj =
      tenants.find((t) => t.id === orderTenantId) ||
      tenants[0] || { id: "t-custom", companyName: "Tenant Virtual Office" };

    const newOrder: ProcurementOrderEntry = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      tenantId: tenantObj.id,
      tenantName: tenantObj.companyName,
      quantity: orderQuantity,
      orderTimestamp: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      notes: orderNotes || "Pesanan konsolidasi kebutuhan operasional tenant",
      paidStatus: "confirmed",
    };

    setPools((prev) =>
      prev.map((item) => {
        if (item.id === joiningPoolItem.id) {
          const updatedOrders = [newOrder, ...item.orders];
          const updatedQty = item.currentQuantity + orderQuantity;
          return {
            ...item,
            currentQuantity: updatedQty,
            orders: updatedOrders,
          };
        }
        return item;
      })
    );

    setIsJoinModalOpen(false);
    setJoinSuccessMsg(
      `Alhamdulillah! ${orderQuantity} ${joiningPoolItem.unitMeasurement} untuk "${joiningPoolItem.title}" berhasil ditambahkan ke agregasi ${tenantObj.companyName}.`
    );
    setTimeout(() => setJoinSuccessMsg(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Shared Procurement Explanation */}
      <div className="bg-gradient-to-br from-[#2D3325] via-[#3E4733] to-[#252C1F] text-white rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8A9A65]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4E3DA]/15 text-[#E4E3DA] text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sinergi Jamaah: Economies of Scale & Konsolidasi Rantai Pasok</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#fbfbfa]">
              Portal Pengadaan Bersama Tenant
            </h2>

            <p className="text-sm text-[#E4E3DA]/90 leading-relaxed font-sans">
              Agregasi pesanan kebutuhan rutin (karton ramah lingkungan, resi thermal, kantong cold-chain, kertas kantor, sanitasi) antar-tenant. Raih diskon grosir pabrik Tier-4 dan pangkas frekuensi kedatangan kurir supplier dari belasan trip terpisah menjadi 1 pengiriman terpadu ke Central Hub.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#E4E3DA]/80">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Akad Wakalah bi Al-Ujrah (Transparan & Tanpa Riba)
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                <Truck className="w-3.5 h-3.5 text-sky-300" />
                Ongkir Supplier Dibagi Rata (Cost-Sharing)
              </span>
            </div>
          </div>

          {/* Aggregated Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-300" />
                Total Hemat Biaya
              </div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                Rp {aggregatedStats.totalNominalSavingsRp.toLocaleString("id-ID")}
              </div>
              <div className="text-[10px] text-[#E4E3DA]/75 mt-0.5">
                Penghematan Kolektif dari Harga Eceran
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-sky-300" />
                Trip Kurir Dipangkas
              </div>
              <div className="text-xl font-bold font-mono text-sky-300 mt-1">
                {aggregatedStats.totalIndividualDeliveriesAvoided} Perjalanan
              </div>
              <div className="text-[10px] text-[#E4E3DA]/75 mt-0.5">
                {aggregatedStats.totalCO2AvoidedSupplierKg} kg CO₂e Emisi Supplier Ditekan
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                Volume Terkonsolidasi
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {aggregatedStats.totalItemsPooled.toLocaleString("id-ID")} Unit
              </div>
              <div className="text-[10px] text-[#E4E3DA]/75 mt-0.5">
                Dalam {aggregatedStats.totalPoolsCount} Kampanye Aktif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainView("pools_catalog")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeMainView === "pools_catalog"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#72725e] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog Pengadaan Bersama ({pools.length})</span>
          </button>

          <button
            onClick={() => setActiveMainView("vendor_shariah_ratings")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeMainView === "vendor_shariah_ratings"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#72725e] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Rapor Kinerja & Kepatuhan Syariah Vendor</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              4.9
            </span>
          </button>
        </div>

        <div className="text-[11px] text-[#72725e] flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Akreditasi Terbuka Antar-Tenant Komunitas</span>
        </div>
      </div>

      {activeMainView === "vendor_shariah_ratings" ? (
        <VendorShariahRatingView
          tenants={tenants}
          initialSelectedVendorId={selectedVendorForRating}
        />
      ) : (
        <>
          {joinSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="font-medium flex-1">{joinSuccessMsg}</div>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
            }`}
          >
            Semua Pengadaan ({pools.length})
          </button>
          <button
            onClick={() => setSelectedCategory("eco_packaging")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "eco_packaging"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
            }`}
          >
            📦 Kemasan Ramah Lingkungan
          </button>
          <button
            onClick={() => setSelectedCategory("thermal_labels")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "thermal_labels"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
            }`}
          >
            🏷️ Resi & Label Thermal
          </button>
          <button
            onClick={() => setSelectedCategory("cold_chain_supplies")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "cold_chain_supplies"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
            }`}
          >
            ❄️ Cold-Chain & Ice Gel
          </button>
          <button
            onClick={() => setSelectedCategory("office_stationery")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "office_stationery"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
            }`}
          >
            📄 Kertas & ATK Kantor
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barang, SKU, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#fbfbfa] border border-black/10 rounded-xl text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>
      </div>

      {/* Main Grid: Pool Items Cards & Active Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Pools (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#5A5A40]" />
              Katalog Pool Terbuka ({filteredPools.length} Item)
            </h3>
            <span className="text-[11px] text-[#72725e]">
              Klik item untuk rincian tier & daftar tenant bergabung
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPools.map((pool) => {
              const activeTier = getActiveTier(pool);
              const nextTier = getNextTier(pool);
              const progressPercent = Math.min(
                100,
                Math.round(
                  (pool.currentQuantity / pool.targetMaxTierQuantity) * 100
                )
              );
              const isSelected = activePool?.id === pool.id;

              return (
                <div
                  key={pool.id}
                  onClick={() => setActivePoolDetailId(pool.id)}
                  className={`bg-white rounded-[20px] p-5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/15"
                      : "border-black/5 hover:border-black/15 shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {pool.categoryLabel}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        SKU: {pool.sku}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#2d2d22] leading-snug line-clamp-2">
                        {pool.title}
                      </h4>
                      <p className="text-xs text-[#72725e] mt-1 line-clamp-2">
                        {pool.description}
                      </p>
                    </div>

                    {/* Supplier & Shariah Rating Quick Chip */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-[#72725e] truncate max-w-[150px]">
                        Vendor: <strong>{pool.supplierName.split(" ")[1] || pool.supplierName}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVendorForRating(getSupplierVendorId(pool.supplierName));
                          setActiveMainView("vendor_shariah_ratings");
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>★ 4.9 Mumtaz</span>
                      </button>
                    </div>

                    {/* Pricing Tier Status Badge */}
                    <div className="bg-[#fcfbf9] rounded-xl p-3 border border-black/5 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-[#72725e]">
                          Harga Terkini ({activeTier.label}):
                        </span>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-[#5A5A40]">
                            Rp {activeTier.unitPrice.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            /{pool.unitMeasurement}
                          </span>
                        </div>
                      </div>

                      {activeTier.discountPercent > 0 && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-rose-400 line-through">
                            Rp {pool.baseUnitPrice.toLocaleString("id-ID")} (Retail)
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Hemat {activeTier.discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar towards Max Tier */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#2d2d22]">
                          Terkumpul:{" "}
                          <strong className="text-[#5A5A40]">
                            {pool.currentQuantity} {pool.unitMeasurement}
                          </strong>
                        </span>
                        <span className="text-[#72725e]">
                          Target Tier-4: {pool.targetMaxTierQuantity}{" "}
                          {pool.unitMeasurement}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8A9A65] to-[#5A5A40] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>

                      {nextTier ? (
                        <div className="text-[10px] text-amber-700 flex items-center gap-1 pt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>
                            Kurang{" "}
                            <strong>
                              {nextTier.minQuantity - pool.currentQuantity}{" "}
                              {pool.unitMeasurement}
                            </strong>{" "}
                            lagi untuk unlock diskon {nextTier.discountPercent}%!
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                          <Check className="w-3 h-3" />
                          <span>Maksimal Diskon Tier Pabrik Terbuka Penuh!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Deadline & Join Button */}
                  <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-[#72725e] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Tutup: {pool.deadlineDate}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenJoinModal(pool);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#5A5A40] hover:bg-[#454530] text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Gabung Pool</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Breakdown of Selected Pool */}
        {activePool && (
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {activePool.categoryLabel}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2d2d22] mt-1.5">
                    {activePool.title}
                  </h3>
                  <p className="text-xs text-[#72725e] mt-1">
                    Vendor: <strong>{activePool.supplierName}</strong> ({activePool.supplierOrigin})
                  </p>
                </div>
              </div>

              {/* Eco & Sharia Credentials */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5 text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Kredensial Hijau & Standarisasi Halal:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-950/80">
                  {activePool.ecoCredential}. Terverifikasi halal dan ramah lingkungan untuk seluruh tenant komunitas.
                </p>
              </div>

              {/* Tiered Discount Progression Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2d2d22] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Struktur Diskon Berjenjang (Tiered Volume)
                </h4>

                <div className="border border-black/5 rounded-2xl overflow-hidden divide-y divide-black/5 text-xs">
                  {activePool.tiers.map((tier, idx) => {
                    const isUnlocked = activePool.currentQuantity >= tier.minQuantity;
                    const isCurrent = getActiveTier(activePool) === tier;

                    return (
                      <div
                        key={idx}
                        className={`p-3 flex items-center justify-between transition-colors ${
                          isCurrent
                            ? "bg-[#5A5A40]/10 font-semibold"
                            : isUnlocked
                            ? "bg-emerald-50/30 text-[#2d2d22]"
                            : "bg-white text-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isUnlocked
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {isUnlocked ? <Check className="w-3 h-3" /> : idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-[#2d2d22]">
                              {tier.label}
                            </div>
                            <div className="text-[10px] text-[#72725e]">
                              Min. {tier.minQuantity} {activePool.unitMeasurement}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-[#2d2d22]">
                            Rp {tier.unitPrice.toLocaleString("id-ID")}
                          </div>
                          {tier.discountPercent > 0 ? (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              Diskon {tier.discountPercent}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              Harga Retail
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inbound Shipping Consolidation Breakdown */}
              <div className="bg-[#fcfbf9] rounded-2xl p-4 border border-black/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2d2d22] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Konsolidasi Ongkos Kirim Supplier:
                  </span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    Rp {activePool.supplierConsolidatedFreightFee.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-[#72725e] leading-relaxed">
                  Alih-alih {activePool.orders.length} tenant membayar ongkir kurir terpisah (~Rp 35.000 x {activePool.orders.length} = Rp {(activePool.orders.length * 35000).toLocaleString("id-ID")}), ongkir supplier dipukul rata hanya ~Rp {Math.round(activePool.supplierConsolidatedFreightFee / Math.max(1, activePool.orders.length)).toLocaleString("id-ID")} per tenant, diantar langsung ke Hub.
                </p>
              </div>

              {/* Shariah Vendor Rating & Transparency Quick Card */}
              <div className="bg-[#fcfbf9] rounded-2xl p-4 border border-black/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Rapor & Kepatuhan Syariah Vendor:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Mumtaz (Tier-A)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="font-bold text-[#2d2d22] font-mono">4.9 / 5.0</span>
                    <span className="text-[10px] text-gray-500">• 98.8% Transparansi Biaya</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVendorForRating(getSupplierVendorId(activePool.supplierName));
                      setActiveMainView("vendor_shariah_ratings");
                    }}
                    className="text-[11px] text-[#5A5A40] hover:text-[#333322] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Buka Rapor & Ulasan</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[10px] text-[#72725e] leading-snug">
                  Akad Wakalah/Murabahah bebas klausul tersembunyi, jaminan tanpa denda riba, dan garansi penggantian barang cacat 1x24 jam.
                </p>
              </div>

              {/* List of Participating Tenants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2d2d22] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Tenant yang Sudah Bergabung ({activePool.orders.length})
                  </span>
                  <span className="text-[11px] text-[#72725e]">
                    Total: {activePool.currentQuantity} {activePool.unitMeasurement}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activePool.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 bg-white border border-black/5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#2d2d22]">
                          {ord.tenantName}
                        </div>
                        <div className="text-[10px] text-[#72725e]">
                          {ord.orderTimestamp} • {ord.notes}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-[#5A5A40]">
                          {ord.quantity} {activePool.unitMeasurement}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Terkonfirmasi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-black/5 flex items-center gap-3">
              <button
                onClick={() => handleOpenJoinModal(activePool)}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ikut Pesan untuk Tenant Saya</span>
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Modal: Join Pool / Add Tenant Order */}
      {isJoinModalOpen && joiningPoolItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-black/5 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2.5 py-0.5 rounded-full uppercase">
                  Agregasi Kebutuhan Bersama
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2d2d22] mt-1">
                  Gabung Pesanan Kolektif
                </h3>
                <p className="text-xs text-[#72725e] mt-0.5">
                  {joiningPoolItem.title}
                </p>
              </div>

              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Select Tenant */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Pilih Perusahaan Tenant Anda
                </label>
                <select
                  value={orderTenantId}
                  onChange={(e) => setOrderTenantId(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.companyName} ({t.businessSector})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#2d2d22]">
                    Jumlah Pesanan ({joiningPoolItem.unitMeasurement})
                  </label>
                  <span className="text-[#72725e] text-[11px]">
                    Total saat ini: {joiningPoolItem.currentQuantity}{" "}
                    {joiningPoolItem.unitMeasurement}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] font-mono font-bold focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d22]">
                  Catatan Keperluan / Penyerahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Titip di Smart Locker No. 12 / Kirim ke outlet"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              {/* Live Cost Calculation preview */}
              {(() => {
                const projectedQty = joiningPoolItem.currentQuantity + orderQuantity;
                let projectedTier = joiningPoolItem.tiers[0];
                joiningPoolItem.tiers.forEach((t) => {
                  if (projectedQty >= t.minQuantity) projectedTier = t;
                });
                const estTotalRp = projectedTier.unitPrice * orderQuantity;
                const estSavingsRp =
                  (joiningPoolItem.baseUnitPrice - projectedTier.unitPrice) *
                  orderQuantity;

                return (
                  <div className="bg-[#fcfbf9] rounded-2xl p-4 border border-black/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#72725e]">
                        Estimasi Harga Satuan Terkini:
                      </span>
                      <span className="font-mono font-bold text-[#5A5A40]">
                        Rp {projectedTier.unitPrice.toLocaleString("id-ID")} /
                        {joiningPoolItem.unitMeasurement}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#72725e]">
                        Total Biaya Pesanan Anda:
                      </span>
                      <span className="font-mono font-bold text-base text-[#2d2d22]">
                        Rp {estTotalRp.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {estSavingsRp > 0 && (
                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
                        <span>Hemat berkat pesanan kolektif:</span>
                        <span>+ Rp {estSavingsRp.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#72725e] hover:bg-black/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Ikut Agregasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

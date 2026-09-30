import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  Filter,
  Search,
  Plus,
  ThumbsUp,
  Leaf,
  Scale,
  DollarSign,
  AlertCircle,
  Eye,
  ChevronRight,
  MessageSquare,
  Sparkles,
  FileCheck,
  HeartHandshake,
  Check,
  Compass,
  TrendingUp,
} from "lucide-react";
import {
  Tenant,
  CollaborativeVendorPartner,
  VendorReview,
  ShariahComplianceMetrics,
  VendorPerformanceMetrics,
  TransparencyAuditScore,
} from "../types";
import {
  INITIAL_VENDOR_PARTNERS,
  INITIAL_VENDOR_REVIEWS,
  SHARIAH_REVIEW_BADGES,
} from "../data/vendorRatingData";

interface VendorShariahRatingViewProps {
  tenants: Tenant[];
  initialSelectedVendorId?: string | null;
  onSelectVendorForOrder?: (vendorName: string) => void;
}

export const VendorShariahRatingView: React.FC<VendorShariahRatingViewProps> = ({
  tenants,
  initialSelectedVendorId,
}) => {
  const [partners, setPartners] = useState<CollaborativeVendorPartner[]>(
    INITIAL_VENDOR_PARTNERS
  );
  const [reviews, setReviews] = useState<VendorReview[]>(INITIAL_VENDOR_REVIEWS);

  // Filters
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("all");
  const [shariahTierFilter, setShariahTierFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    initialSelectedVendorId || partners[0]?.id || null
  );

  // Review List Filters
  const [reviewBadgeFilter, setReviewBadgeFilter] = useState<string>("all");
  const [reviewPartnerFilter, setReviewPartnerFilter] = useState<string>("all");
  const [reviewMinStar, setReviewMinStar] = useState<number>(0);

  // Active Tab inside the view: "directory" | "reviews_feed" | "transparency_audit"
  const [activeTab, setActiveTab] = useState<
    "directory" | "reviews_feed" | "transparency_audit"
  >("directory");

  // New Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedVendorForReview, setSelectedVendorForReview] = useState<string>(
    partners[0]?.id || ""
  );
  const [reviewTenantId, setReviewTenantId] = useState<string>(
    tenants[0]?.id || "t-1"
  );
  const [reviewerRole, setReviewerRole] = useState<string>(
    "Operations & Supply Chain Lead"
  );
  const [reviewBatchCode, setReviewBatchCode] = useState<string>(
    "BATCH-CLB-2026-081"
  );
  const [reviewTransactionType, setReviewTransactionType] = useState<
    "shared_procurement_order" | "collaborative_shipping_batch"
  >("collaborative_shipping_batch");

  // Sliders for Shariah Metrics
  const [ratingAkad, setRatingAkad] = useState<number>(5.0);
  const [ratingHalal, setRatingHalal] = useState<number>(5.0);
  const [ratingFee, setRatingFee] = useState<number>(5.0);
  const [ratingLabor, setRatingLabor] = useState<number>(4.9);

  // Sliders for Performance Metrics
  const [ratingPunctuality, setRatingPunctuality] = useState<number>(98);
  const [ratingCondition, setRatingCondition] = useState<number>(5.0);
  const [ratingResponse, setRatingResponse] = useState<number>(4.8);
  const [ratingEcoPackaging, setRatingEcoPackaging] = useState<number>(5.0);

  // Sliders for Transparency Metrics
  const [ratingCostTransparency, setRatingCostTransparency] = useState<number>(5.0);
  const [ratingRouteTraceability, setRatingRouteTraceability] = useState<number>(4.9);
  const [ratingGpsAccuracy, setRatingGpsAccuracy] = useState<number>(5.0);
  const [ratingTareAccuracy, setRatingTareAccuracy] = useState<number>(5.0);

  // Review text & badges
  const [reviewComment, setReviewComment] = useState<string>("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([
    "Akad Sangat Transparan & Adil",
    "100% Halal Thayyib Verified",
    "Jadwal Shalat Driver Terjaga",
  ]);
  const [isRecommended, setIsRecommended] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchType =
        partnerTypeFilter === "all" || p.type === partnerTypeFilter;
      const matchTier =
        shariahTierFilter === "all" ||
        (shariahTierFilter === "mumtaz" &&
          p.shariahAuditLevel.includes("Mumtaz")) ||
        (shariahTierFilter === "jayyid" &&
          p.shariahAuditLevel.includes("Jayyid"));
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.coverageArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialties.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchType && matchTier && matchSearch;
    });
  }, [partners, partnerTypeFilter, shariahTierFilter, searchQuery]);

  // Selected Active Partner Object
  const activePartner = useMemo(() => {
    return (
      partners.find((p) => p.id === selectedPartnerId) ||
      filteredPartners[0] ||
      partners[0]
    );
  }, [partners, selectedPartnerId, filteredPartners]);

  // Reviews for the active partner
  const activePartnerReviews = useMemo(() => {
    if (!activePartner) return [];
    return reviews.filter((r) => r.vendorId === activePartner.id);
  }, [reviews, activePartner]);

  // Filtered all reviews for the reviews feed tab
  const filteredAllReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchVendor =
        reviewPartnerFilter === "all" || r.vendorId === reviewPartnerFilter;
      const matchBadge =
        reviewBadgeFilter === "all" || r.badges.includes(reviewBadgeFilter);
      const matchStars = r.overallRating >= reviewMinStar;
      return matchVendor && matchBadge && matchStars;
    });
  }, [reviews, reviewPartnerFilter, reviewBadgeFilter, reviewMinStar]);

  // High level aggregated stats
  const communityStats = useMemo(() => {
    const totalP = partners.length;
    const totalRev = reviews.length;
    const avgShariah =
      partners.reduce((acc, p) => acc + p.shariahIndexPercent, 0) / (totalP || 1);
    const avgTransparency =
      partners.reduce((acc, p) => acc + p.transparencyIndexPercent, 0) /
      (totalP || 1);
    const avgOnTime =
      partners.reduce((acc, p) => acc + p.onTimeRatePercent, 0) / (totalP || 1);
    const totalCarbonSaved = partners.reduce(
      (acc, p) => acc + (p.carbonSavedKgTotal || 0),
      0
    );

    return {
      totalP,
      totalRev,
      avgShariah: avgShariah.toFixed(1),
      avgTransparency: avgTransparency.toFixed(1),
      avgOnTime: avgOnTime.toFixed(1),
      totalCarbonSaved,
    };
  }, [partners, reviews]);

  // Handle open review modal for a specific vendor
  const handleOpenReviewModal = (vendorId?: string) => {
    if (vendorId) {
      setSelectedVendorForReview(vendorId);
    } else if (activePartner) {
      setSelectedVendorForReview(activePartner.id);
    }
    setReviewComment("");
    setIsReviewModalOpen(true);
  };

  // Toggle badge selection
  const handleToggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  // Submit new review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const vendorObj = partners.find((p) => p.id === selectedVendorForReview);
    if (!vendorObj) return;

    const tenantObj =
      tenants.find((t) => t.id === reviewTenantId) || tenants[0];

    // Compute sub ratings
    const calculatedShariahRating = Number(
      ((ratingAkad + ratingHalal + ratingFee + ratingLabor) / 4).toFixed(2)
    );
    const calculatedPerfRating = Number(
      (
        (ratingCondition +
          ratingResponse +
          ratingEcoPackaging +
          ratingPunctuality / 20) /
        4
      ).toFixed(2)
    );
    const calculatedTransRating = Number(
      (
        (ratingCostTransparency +
          ratingRouteTraceability +
          ratingGpsAccuracy +
          ratingTareAccuracy) /
        4
      ).toFixed(2)
    );

    const calculatedOverall = Number(
      (
        (calculatedShariahRating * 0.4 +
          calculatedPerfRating * 0.35 +
          calculatedTransRating * 0.25)
      ).toFixed(2)
    );

    const newReview: VendorReview = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      vendorId: vendorObj.id,
      vendorName: vendorObj.name,
      vendorType: vendorObj.type,
      tenantId: tenantObj.id,
      tenantName: tenantObj.companyName,
      reviewerRole: reviewerRole || "Supply Chain Lead",
      batchOrOrderId: reviewBatchCode || "TRX-COLAB-2026",
      transactionType: reviewTransactionType,
      date: new Date().toISOString().split("T")[0],
      overallRating: calculatedOverall,
      shariahScore: {
        akadClarityScore: ratingAkad,
        halalIntegrityScore: ratingHalal,
        feeTransparencyScore: ratingFee,
        ethicalLaborScore: ratingLabor,
        overallShariahRating: calculatedShariahRating,
      },
      performanceScore: {
        onTimeDeliveryRatePercent: ratingPunctuality,
        goodsConditionRating: ratingCondition,
        responsivenessRating: ratingResponse,
        packagingEcoRating: ratingEcoPackaging,
        overallPerformanceRating: calculatedPerfRating,
      },
      transparencyScore: {
        costBreakdownTransparency: ratingCostTransparency,
        routeCarbonTraceability: ratingRouteTraceability,
        liveGpsAuditAccuracy: ratingGpsAccuracy,
        tareWeightAccuracy: ratingTareAccuracy,
        overallTransparencyScore: calculatedTransRating,
      },
      badges:
        selectedBadges.length > 0
          ? selectedBadges
          : ["Akad Sangat Transparan & Adil"],
      comment:
        reviewComment ||
        "Layanan pengiriman sangat amanah, kepatuhan syariah terjaga, waktu shalat driver diperhatikan, dan rincian biaya transparan.",
      isRecommended: isRecommended,
      verifiedTransaction: true,
      shariahAuditStatus:
        calculatedShariahRating >= 4.8 ? "mumtaz_verified" : "jayyid_jiddan",
    };

    // Add to reviews state
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate partner live metrics
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === vendorObj.id) {
          const partnerReviews = [newReview, ...reviews.filter((r) => r.vendorId === p.id)];
          const newAvgRating = Number(
            (
              partnerReviews.reduce((sum, r) => sum + r.overallRating, 0) /
              partnerReviews.length
            ).toFixed(2)
          );
          const newShariahIndex = Number(
            (
              (partnerReviews.reduce(
                (sum, r) => sum + r.shariahScore.overallShariahRating,
                0
              ) /
                (partnerReviews.length * 5)) *
              100
            ).toFixed(1)
          );
          const newTransIndex = Number(
            (
              (partnerReviews.reduce(
                (sum, r) => sum + r.transparencyScore.overallTransparencyScore,
                0
              ) /
                (partnerReviews.length * 5)) *
              100
            ).toFixed(1)
          );

          return {
            ...p,
            totalReviewsCount: p.totalReviewsCount + 1,
            averageRating: newAvgRating,
            shariahIndexPercent: newShariahIndex,
            transparencyIndexPercent: newTransIndex,
          };
        }
        return p;
      })
    );

    setIsReviewModalOpen(false);
    setSuccessToast(
      `Alhamdulillah! Penilaian & transparansi untuk ${vendorObj.name} berhasil diverifikasi dan dipublikasikan.`
    );
    setTimeout(() => setSuccessToast(null), 6000);
  };

  // Helper render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              rating >= star
                ? "fill-amber-400 text-amber-400"
                : rating >= star - 0.5
                ? "fill-amber-300/50 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Shariah & Performance Rating System Overview */}
      <div className="bg-gradient-to-br from-[#1F271B] via-[#2A3423] to-[#1A2216] text-white rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4E3DA] text-xs font-semibold backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sistem Rapor & Akreditasi Kepatuhan Syariah Terbuka</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#fbfbfa]">
              Kinerja Vendor & Mitra Logistik Syariah
            </h2>

            <p className="text-sm text-[#E4E3DA]/90 leading-relaxed font-sans">
              Transparansi penuh rantai pasok kolaboratif. Tenant saling mengevaluasi kejelasan akad (Wakalah bi Al-Ujrah tanpa biaya siluman), integritas penanganan halal, waktu shalat armada, ketepatan waktu pengiriman, hingga kejujuran audit emisi karbon.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <button
                onClick={() => handleOpenReviewModal()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-[#5A5A40] hover:from-emerald-500 hover:to-[#4a4a33] text-white rounded-full font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Beri Review & Skor Transparansi</span>
              </button>

              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-[#E4E3DA]">
                <FileCheck className="w-3.5 h-3.5 text-sky-300" />
                Akreditasi DSN-MUI & BPJPH Terverifikasi
              </span>
            </div>
          </div>

          {/* Quick Benchmark Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA]/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Indeks Kepatuhan Syariah
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {communityStats.avgShariah}%
              </div>
              <div className="text-[10px] text-[#E4E3DA]/70 mt-0.5">
                Standar Mumtaz Terbuka
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA]/80 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                Indeks Transparansi
              </div>
              <div className="text-xl font-bold font-mono text-sky-300 mt-1">
                {communityStats.avgTransparency}%
              </div>
              <div className="text-[10px] text-[#E4E3DA]/70 mt-0.5">
                Audit Biaya, GPS & Tara
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA]/80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Ketepatan Waktu (SLA)
              </div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {communityStats.avgOnTime}%
              </div>
              <div className="text-[10px] text-[#E4E3DA]/70 mt-0.5">
                Ketepatan Kedatangan Hub
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA]/80 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Review Tenant
              </div>
              <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                {reviews.length} Ulasan
              </div>
              <div className="text-[10px] text-[#E4E3DA]/70 mt-0.5">
                100% Transaksi Riil Hub
              </div>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium flex-1">{successToast}</div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-black/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#72725e] hover:bg-[#f5f2ed]"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Direktori Rapor Mitra ({filteredPartners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews_feed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "reviews_feed"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#72725e] hover:bg-[#f5f2ed]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ulasan & Audit Tenant ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("transparency_audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "transparency_audit"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#72725e] hover:bg-[#f5f2ed]"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Pilar Audit Syariah & Transparansi</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenReviewModal()}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tulis Ulasan Baru</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DIRECTORY & SCORECARD INSPECTOR */}
      {/* ========================================================= */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPartnerTypeFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  partnerTypeFilter === "all"
                    ? "bg-[#5A5A40] text-white shadow-xs"
                    : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
                }`}
              >
                Semua Mitra ({partners.length})
              </button>
              <button
                onClick={() => setPartnerTypeFilter("shipping_partner")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  partnerTypeFilter === "shipping_partner"
                    ? "bg-[#5A5A40] text-white shadow-xs"
                    : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
                }`}
              >
                🚚 Kurir & Ekspedisi Kolaboratif (3)
              </button>
              <button
                onClick={() => setPartnerTypeFilter("procurement_supplier")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  partnerTypeFilter === "procurement_supplier"
                    ? "bg-[#5A5A40] text-white shadow-xs"
                    : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
                }`}
              >
                📦 Supplier Pengadaan Bersama (5)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={shariahTierFilter}
                onChange={(e) => setShariahTierFilter(e.target.value)}
                className="text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-2.5 py-1.5 text-[#2d2d22] focus:outline-none"
              >
                <option value="all">Semua Tingkat Akreditasi</option>
                <option value="mumtaz">Hanya Mumtaz (Tier-A Shariah)</option>
                <option value="jayyid">Jayyid Jiddan (Tier-B)</option>
              </select>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari mitra / keahlian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#fbfbfa] border border-black/10 rounded-xl text-[#2d2d22] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Master Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Partners Grid List (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPartners.map((partner) => {
                  const isSelected = activePartner?.id === partner.id;

                  return (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className={`bg-white rounded-[22px] p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/15"
                          : "border-black/5 hover:border-black/15 shadow-xs"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              partner.type === "shipping_partner"
                                ? "bg-sky-50 text-sky-800 border border-sky-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {partner.type === "shipping_partner"
                              ? "🚚 Ekspedisi Kolaboratif"
                              : "📦 Supplier Pengadaan"}
                          </span>

                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            {partner.shariahAuditLevel.split(" ")[0]}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#2d2d22] leading-snug line-clamp-1">
                            {partner.name}
                          </h4>
                          <p className="text-[11px] text-[#72725e] mt-0.5 line-clamp-2">
                            {partner.shortDesc}
                          </p>
                        </div>

                        {/* Ratings & Certifications Badge */}
                        <div className="bg-[#fcfbf9] rounded-xl p-3 border border-black/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {renderStars(partner.averageRating)}
                              <span className="font-mono font-bold text-xs text-[#2d2d22]">
                                {partner.averageRating}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#72725e]">
                              ({partner.totalReviewsCount} review tenant)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5 text-[10px]">
                            <div>
                              <span className="text-gray-500">Skor Syariah:</span>
                              <div className="font-bold text-emerald-700 font-mono">
                                {partner.shariahIndexPercent}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Transparansi:</span>
                              <div className="font-bold text-sky-700 font-mono">
                                {partner.transparencyIndexPercent}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Ketepatan SLA:</span>
                              <div className="font-bold text-[#5A5A40] font-mono">
                                {partner.onTimeRatePercent}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Sengketa/Klaim:</span>
                              <div className="font-bold text-emerald-600 font-mono">
                                {partner.disputeRatePercent}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Specialties Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {partner.specialties.slice(0, 2).map((spec, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-black/5 text-[#5A5A40] px-2 py-0.5 rounded-md truncate max-w-full"
                            >
                              • {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#72725e] truncate">
                          📍 {partner.coverageArea.split(" ")[0]}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReviewModal(partner.id);
                          }}
                          className="px-3 py-1 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-[11px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Beri Skor</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Selected Partner Deep Inspection */}
            {activePartner && (
              <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-black/5 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {activePartner.shariahAuditLevel}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {activePartner.shariahCertNumber}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2d2d22] mt-1.5">
                        {activePartner.name}
                      </h3>
                      <p className="text-xs text-[#72725e] mt-1">
                        {activePartner.category} • Wilayah: {activePartner.coverageArea}
                      </p>
                    </div>
                  </div>

                  {/* Shariah Audit Scorecard Meters */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#2d2d22] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Rapor 4 Pilar Kepatuhan Syariah
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#2d2d22]">Kejelasan Akad & Tanpa Gharar</span>
                          <span className="font-bold text-emerald-700">
                            {activePartner.shariahIndexPercent}% (Amanah)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${activePartner.shariahIndexPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#2d2d22]">Integritas Halal & Bebas Najis</span>
                          <span className="font-bold text-emerald-700">100% (Mutlak)</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#2d2d22]">Bebas Biaya Siluman & Denda Riba</span>
                          <span className="font-bold text-emerald-700">
                            {activePartner.transparencyIndexPercent}% (Transparan)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${activePartner.transparencyIndexPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#2d2d22]">Kesejahteraan & Jadwal Shalat Driver</span>
                          <span className="font-bold text-emerald-700">
                            {activePartner.onTimeRatePercent}% (Terjaga)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${activePartner.onTimeRatePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transparency Audit Index Panel */}
                  <div className="bg-[#fcfbf9] rounded-2xl p-4 border border-black/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#5A5A40]" />
                        Indeks Transparansi Rantai Pasok:
                      </span>
                      <span className="font-mono font-bold text-sm text-[#5A5A40]">
                        {activePartner.transparencyIndexPercent}%
                      </span>
                    </div>

                    <p className="text-[11px] text-[#72725e] leading-relaxed">
                      Mitra ini membagikan rincian komponen ongkir secara terbuka, menyajikan telemetri GPS rute riil, dan menerapkan kalibrasi timbangan berkala untuk mencegah kecurangan takaran.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Rute GPS Riil
                      </span>
                      <span className="text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                        ✓ Tara Berat Terbuka
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                        ✓ Audit Emisi Karbon
                      </span>
                    </div>
                  </div>

                  {/* Recent Verified Reviews for This Partner */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2d2d22] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#5A5A40]" />
                        Ulasan Terbaru Tenant ({activePartnerReviews.length})
                      </span>
                      <span className="text-[11px] text-[#72725e]">
                        Rata-rata: ★ {activePartner.averageRating}
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {activePartnerReviews.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
                          Belum ada ulasan untuk mitra ini. Jadilah tenant pertama yang memberikan review!
                        </div>
                      ) : (
                        activePartnerReviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-3 bg-white border border-black/5 rounded-xl space-y-1.5 text-xs shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-[#2d2d22]">
                                {rev.tenantName}
                              </div>
                              <div className="flex items-center gap-1">
                                {renderStars(rev.overallRating)}
                                <span className="font-mono font-bold text-[11px]">
                                  {rev.overallRating}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-[#72725e] leading-snug line-clamp-2">
                              "{rev.comment}"
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-black/5">
                              <span>{rev.reviewerRole}</span>
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-black/5 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReviewModal(activePartner.id)}
                    className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tulis Ulasan & Beri Nilai Transparansi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TENANT REVIEWS FEED & BADGES */}
      {/* ========================================================= */}
      {activeTab === "reviews_feed" && (
        <div className="space-y-6">
          {/* Review Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={reviewPartnerFilter}
                onChange={(e) => setReviewPartnerFilter(e.target.value)}
                className="text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-1.5 text-[#2d2d22] focus:outline-none"
              >
                <option value="all">Semua Mitra & Supplier ({reviews.length})</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={reviewBadgeFilter}
                onChange={(e) => setReviewBadgeFilter(e.target.value)}
                className="text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-1.5 text-[#2d2d22] focus:outline-none"
              >
                <option value="all">Semua Lencana Syariah</option>
                {SHARIAH_REVIEW_BADGES.slice(0, 6).map((b, i) => (
                  <option key={i} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={reviewMinStar}
                onChange={(e) => setReviewMinStar(Number(e.target.value))}
                className="text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-1.5 text-[#2d2d22] focus:outline-none"
              >
                <option value={0}>Semua Rating Bintang</option>
                <option value={4.5}>★ 4.5 Bintang ke Atas</option>
                <option value={4.9}>★ 4.9 - 5.0 (Sempurna)</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenReviewModal()}
              className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Ulasan</span>
            </button>
          </div>

          {/* Reviews Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAllReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-[22px] p-5 border border-black/5 shadow-xs space-y-4 flex flex-col justify-between hover:border-black/15 transition-all"
              >
                <div className="space-y-3">
                  {/* Review Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 font-bold font-serif flex items-center justify-center border border-emerald-200 text-sm">
                        {rev.tenantName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2d2d22]">
                          {rev.tenantName}
                        </div>
                        <div className="text-[11px] text-[#72725e]">
                          {rev.reviewerRole} • {rev.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {renderStars(rev.overallRating)}
                        <span className="font-bold font-mono text-sm text-[#2d2d22]">
                          {rev.overallRating}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Mumtaz Syariah Verified
                      </span>
                    </div>
                  </div>

                  {/* Target Partner & Transaction Badge */}
                  <div className="bg-[#fcfbf9] rounded-xl p-2.5 border border-black/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span className="font-medium text-[#2d2d22]">
                        Mitra: <strong>{rev.vendorName}</strong>
                      </span>
                    </div>
                    {rev.batchOrOrderId && (
                      <span className="text-[10px] text-gray-500 font-mono">
                        Ref: {rev.batchOrOrderId}
                      </span>
                    )}
                  </div>

                  {/* Rating Breakdown Sub-meters */}
                  <div className="grid grid-cols-3 gap-2 bg-[#f9f8f5] p-2.5 rounded-xl text-[10px]">
                    <div>
                      <span className="text-gray-500 block">Kepatuhan Syariah:</span>
                      <strong className="text-emerald-700 font-mono text-xs">
                        ★ {rev.shariahScore.overallShariahRating.toFixed(1)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Performa Kirim:</span>
                      <strong className="text-[#5A5A40] font-mono text-xs">
                        ★ {rev.performanceScore.overallPerformanceRating.toFixed(1)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Skor Transparansi:</span>
                      <strong className="text-sky-700 font-mono text-xs">
                        ★ {rev.transparencyScore.overallTransparencyScore.toFixed(1)}
                      </strong>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-[#2d2d22] leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  {/* Badges Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.badges.map((b, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-emerald-50/80 text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium"
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#72725e]">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Transaksi Terverifikasi Hub
                  </span>
                  {rev.isRecommended && (
                    <span className="flex items-center gap-1 text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-md">
                      <ThumbsUp className="w-3 h-3" /> Direkomendasikan
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SHARIAH & TRANSPARENCY AUDIT STANDARDS */}
      {/* ========================================================= */}
      {activeTab === "transparency_audit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-[20px] p-5 border border-black/5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                1. Kejelasan Akad (Shighat)
              </h4>
              <p className="text-xs text-[#72725e] leading-relaxed">
                Akad Wakalah bi Al-Ujrah atau Ijarah disepakati di muka tanpa pasal rancu (*gharar*), tanpa denda bunga riba jika terjadi keterlambatan macet, dan bagi hasil logistik terinci.
              </p>
            </div>

            <div className="bg-white rounded-[20px] p-5 border border-black/5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                2. Kesejahteraan Driver & Shalat
              </h4>
              <p className="text-xs text-[#72725e] leading-relaxed">
                Sistem rute mewajibkan jeda otomatis shalat fardhu berjamaah di masjid terdekat, upah ujrah layak yang transparan, dan jaminan keselamatan kerja tanpa target delivery zalim.
              </p>
            </div>

            <div className="bg-white rounded-[20px] p-5 border border-black/5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center">
                <Scale className="w-5 h-5 text-sky-600" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                3. Transparansi Timbangan & Rute
              </h4>
              <p className="text-xs text-[#72725e] leading-relaxed">
                Timbangan tara digital terkalibrasi menghindari pengurangan takaran berat/volume, dengan audit live GPS terbuka untuk memvalidasi efisiensi rute dan konsumsi energi.
              </p>
            </div>

            <div className="bg-white rounded-[20px] p-5 border border-black/5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                4. Integritas Halal & Ekologi
              </h4>
              <p className="text-xs text-[#72725e] leading-relaxed">
                Pemisahan kompartemen mutlak dari kargo non-halal/najis, pembersihan wadah sesuai syariat, dan komitmen kemasan daur ulang bebas plastik sekali pakai.
              </p>
            </div>
          </div>

          {/* Audit Verification Table */}
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#2d2d22] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#5A5A40]" />
              Status Audit Sertifikasi & Dewan Pengawas Syariah (DPS) Hub
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fcfbf9] text-[#72725e] border-y border-black/5">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Nama Mitra & Armada</th>
                    <th className="py-3 px-4 font-semibold">Jenis Layanan</th>
                    <th className="py-3 px-4 font-semibold">No. Sertifikasi / Regulasi</th>
                    <th className="py-3 px-4 font-semibold">Tingkat Akreditasi</th>
                    <th className="py-3 px-4 font-semibold">Indeks Transparansi</th>
                    <th className="py-3 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[#2d2d22]">
                  {partners.map((p) => (
                    <tr key={p.id} className="hover:bg-[#fbfbfa]">
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {p.type === "shipping_partner"
                          ? "Armada Pengiriman"
                          : "Penyedia Barang"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {p.shariahCertNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                          {p.shariahAuditLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#5A5A40]">
                        {p.transparencyIndexPercent}%
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSelectedPartnerId(p.id);
                            setActiveTab("directory");
                          }}
                          className="text-[#5A5A40] hover:underline font-semibold cursor-pointer"
                        >
                          Lihat Rapor →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBMIT NEW REVIEW & TRANSPARENCY SCORE */}
      {/* ========================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-black/5 pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  Ulasan Tenant Transparan
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2d2d22] mt-1">
                  Beri Penilaian & Skor Kepatuhan Syariah
                </h3>
                <p className="text-xs text-[#72725e] mt-0.5">
                  Bantu tenant lain memilih mitra logistik & pengadaan terbaik dengan evaluasi jujur dan berimbang.
                </p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5 text-xs">
              {/* Row 1: Reviewer Tenant & Target Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#2d2d22] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Perusahaan Tenant Anda
                  </label>
                  <select
                    value={reviewTenantId}
                    onChange={(e) => setReviewTenantId(e.target.value)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#2d2d22] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Mitra / Vendor yang Dinilai
                  </label>
                  <select
                    value={selectedVendorForReview}
                    onChange={(e) => setSelectedVendorForReview(e.target.value)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22] font-semibold focus:outline-none focus:border-[#5A5A40]"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type === "shipping_partner" ? "Kurir" : "Supplier"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Role & Batch Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#2d2d22]">
                    Jabatan Reviewer
                  </label>
                  <input
                    type="text"
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    placeholder="Contoh: Manajer Operasional / Logistik"
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#2d2d22]">
                    Kode Batch / Ref Transaksi
                  </label>
                  <input
                    type="text"
                    value={reviewBatchCode}
                    onChange={(e) => setReviewBatchCode(e.target.value)}
                    placeholder="Contoh: BATCH-CLB-2026-081"
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22] font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 1: Shariah Compliance Metrics Sliders */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Penilaian Kepatuhan Syariah (Skala 1 - 5)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-950 font-medium">
                        Kejelasan Akad & Transparansi Biaya
                      </span>
                      <span className="font-bold font-mono text-emerald-800">
                        {ratingAkad} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingAkad}
                      onChange={(e) => setRatingAkad(parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-950 font-medium">
                        Integritas Halal & Higienitas Wadah
                      </span>
                      <span className="font-bold font-mono text-emerald-800">
                        {ratingHalal} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingHalal}
                      onChange={(e) => setRatingHalal(parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-950 font-medium">
                        Bebas Denda Bunga Riba / Biaya Siluman
                      </span>
                      <span className="font-bold font-mono text-emerald-800">
                        {ratingFee} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingFee}
                      onChange={(e) => setRatingFee(parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-950 font-medium">
                        Kesejahteraan & Jadwal Shalat Driver
                      </span>
                      <span className="font-bold font-mono text-emerald-800">
                        {ratingLabor} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingLabor}
                      onChange={(e) => setRatingLabor(parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Transparency & Operational Sliders */}
              <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 space-y-3">
                <h4 className="font-bold text-sky-950 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-sky-700" />
                  Penilaian Transparansi & Performa Operasional
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-sky-950 font-medium">
                        Ketepatan Waktu Kedatangan (SLA)
                      </span>
                      <span className="font-bold font-mono text-sky-800">
                        {ratingPunctuality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="100"
                      step="1"
                      value={ratingPunctuality}
                      onChange={(e) => setRatingPunctuality(parseInt(e.target.value))}
                      className="w-full accent-sky-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-sky-950 font-medium">
                        Akurasi Timbangan & Berat Tara
                      </span>
                      <span className="font-bold font-mono text-sky-800">
                        {ratingTareAccuracy} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingTareAccuracy}
                      onChange={(e) => setRatingTareAccuracy(parseFloat(e.target.value))}
                      className="w-full accent-sky-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-sky-950 font-medium">
                        Kejujuran GPS & Audit Emisi Karbon
                      </span>
                      <span className="font-bold font-mono text-sky-800">
                        {ratingRouteTraceability} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingRouteTraceability}
                      onChange={(e) => setRatingRouteTraceability(parseFloat(e.target.value))}
                      className="w-full accent-sky-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-sky-950 font-medium">
                        Kondisi Kargo / Ramah Lingkungan
                      </span>
                      <span className="font-bold font-mono text-sky-800">
                        {ratingCondition} / 5.0
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={ratingCondition}
                      onChange={(e) => setRatingCondition(parseFloat(e.target.value))}
                      className="w-full accent-sky-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Badges Selection */}
              <div className="space-y-2">
                <label className="font-bold text-[#2d2d22] block">
                  Pilih Lencana Kepatuhan & Keunggulan Mitra:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SHARIAH_REVIEW_BADGES.map((badge, idx) => {
                    const isSelected = selectedBadges.includes(badge);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleToggleBadge(badge)}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs"
                            : "bg-[#f5f2ed] text-[#5A5A40] border-black/5 hover:bg-[#e8e4dc]"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Narrative Review */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2d2d22] block">
                  Ulasan & Catatan Pengalaman Anda
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman pengiriman, kejelasan akad, sikap kurir, suhu cold-chain, atau kondisi barang saat tiba..."
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl p-3 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              {/* Recommendation toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recommendToggle"
                  checked={isRecommended}
                  onChange={(e) => setIsRecommended(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="recommendToggle"
                  className="text-xs font-semibold text-[#2d2d22] cursor-pointer"
                >
                  Rekomendasikan mitra ini kepada seluruh tenant komunitas
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#72725e] hover:bg-black/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-[#5A5A40] hover:from-emerald-500 hover:to-[#4a4a33] text-white rounded-full text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Kirim Review & Verifikasi Skor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

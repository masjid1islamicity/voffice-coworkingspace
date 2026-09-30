export interface SopStep {
  stepNumber: number;
  title: string;
  responsibleRole: string; // e.g. "Front Desk / Resepsionis", "Manager Operasional", "Tim Legal Syariah"
  duration: string; // e.g. "5 - 15 Menit"
  description: string;
  actionItems: string[];
  documentsRequired?: string[];
  outputArtifact: string;
  criticalPoints: string[];
}

export interface SopModule {
  id: string;
  code: string;
  title: string;
  category: string;
  iconName: string;
  summary: string;
  shariaReference: string;
  indonesianLawReference: string;
  targetAudience: string;
  keyObjectives: string[];
  slaStandard: string;
  steps: SopStep[];
  formsIncluded: string[];
  kpis: string[];
}

export interface Tenant {
  id: string;
  companyName: string;
  businessType: "PT" | "CV" | "Koperasi Syariah" | "Yayasan" | "UMKM Komunitas Masjid" | "Perorangan / Freelancer";
  businessSector: string;
  representativeName: string;
  email: string;
  phone: string;
  registeredAddress: string;
  packageType: "Paket Berdaya Basic" | "Paket Pro Sharia Office" | "Paket Executive Suite" | "Paket Komunitas Masjid Hub";
  monthlyRate: number;
  startDate: string;
  endDate: string;
  status: "active" | "expiring_soon" | "renewal_pending" | "onboarding";
  kycVerified: boolean;
  shariaComplianceVerified: boolean;
  meetingQuotaHours: number;
  meetingQuotaUsed: number;
  coworkingDeskQuotaDays: number;
  coworkingDeskQuotaUsed: number;
  uncollectedMailsCount: number;
  wakafEndowmentContributed: number;
}

export interface MailItem {
  id: string;
  tenantId: string;
  tenantName: string;
  sender: string;
  senderType: "KPP Pajak / DJP" | "Instansi Pemerintah / OSS" | "Perbankan Syariah" | "Notaris & Legal" | "Ekspedisi / Kurir" | "Klien / Partner Bisnis";
  subject: string;
  receivedDate: string;
  receivedTime: string;
  receptionistName: string;
  trackingNumber?: string;
  lockerNumber: string;
  packageType: "Surat Resmi Tercatat" | "Dokumen Berharga" | "Paket / Box Barang" | "Faktur Pajak" | "Kartu / Brosur";
  urgency: "Sangat Mendesak" | "Penting" | "Normal";
  status: "stored_in_locker" | "notified_wa" | "scanned_uploaded" | "picked_up" | "forwarded_by_courier";
  pickupCodePin: string;
  pickedUpBy?: string;
  pickedUpDate?: string;
  digitalSignatureReceived?: boolean;
  summaryNotes?: string;
}

export interface FacilityBooking {
  id: string;
  roomName: "Ruang Al-Fatih (Meeting 10 Pax)" | "Ruang Cordoba (Executive 6 Pax)" | "Ruang Al-Quds (Boardroom 16 Pax)" | "Studio Podcast Sharia Creative" | "Hot Desk Coworking Area" | "Aula Serbaguna Masjid";
  tenantId: string;
  tenantName: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount: number;
  purpose: string;
  amenities: string[];
  status: "confirmed" | "in_session" | "completed" | "cancelled";
  prayerBreakFriendly: boolean;
  costPerHour: number;
  totalCost: number;
  paidWithQuota: boolean;
}

export interface InvoiceReminderLog {
  id: string;
  sentAt: string;
  channel: "whatsapp" | "email" | "both";
  recipientPhone: string;
  recipientEmail: string;
  status: "delivered" | "sent" | "failed";
  daysBeforeDueDate: number; // e.g. 3
  messageSnippet: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  issueDate: string;
  dueDate: string;
  periodDescription: string;
  baseAmount: number;
  taxAmount: number;
  wakafEndowmentAmount: number;
  totalAmount: number;
  status: "paid" | "unpaid" | "overdue";
  paymentMethod?: "Bank Syariah Indonesia (BSI) VA" | "Bank Muamalat VA" | "QRIS Syariah" | "Transfer Bank";
  paidDate?: string;
  lastReminderSentAt?: string;
  reminderLogs?: InvoiceReminderLog[];
  autoReminderEnabled?: boolean;
}

export interface TelephoneLog {
  id: string;
  timestamp: string;
  callerName: string;
  callerCompany: string;
  targetTenantId: string;
  targetTenantName: string;
  callPurpose: string;
  urgency: "Tinggi" | "Normal" | "Rendah";
  receptionistName: string;
  waNotificationSent: boolean;
}

export interface SurveyRatings {
  overall: number; // 1 to 5
  mailHandling: number; // 1 to 5 (Layanan Surat & Notifikasi WA)
  facilityCleanliness: number; // 1 to 5 (Kenyamanan Ruang & Ibadah Tepat Waktu)
  receptionistService: number; // 1 to 5 (Resepsionis & Adab Syariah)
  shariaAtmosphere: number; // 1 to 5 (Suasana Ekosistem Bisnis Halal & Barokah)
  valueAndTransparency: number; // 1 to 5 (Transparansi Wakaf & Kelayakan Tarif)
}

export interface TenantSatisfactionSurvey {
  id: string;
  tenantId: string;
  tenantName: string;
  period: string; // e.g. "Q3 2026", "Agustus 2026", "Evaluasi Triwulan II 2026"
  surveyDate: string;
  loggedByManager: string;
  respondentName: string;
  respondentRole: string;
  ratings: SurveyRatings;
  satisfactionLevel: "Sangat Puas" | "Puas" | "Cukup" | "Perlu Perhatian";
  npsRecommendationScore: number; // 1 to 10
  feedbackNotes: string;
  actionItems: string;
  status: "resolved" | "in_progress" | "scheduled_followup";
}

export interface EcosystemProposal {
  id: string;
  tenantId?: string;
  tenantName?: string;
  businessIdea: string;
  targetSector?: string;
  coreValueProposition: string;
  platformIntegrationMap: {
    islamicity: string; // Knowledge, Education, & Global Exposure
    upic: string; // Community Network, Program Incubator, & Citizen Engagement
    logisticsHub: string; // Supply Chain, Circular Economy, & Distribution
  };
  fastTrackAction: string[]; // 3 Langkah konkret dalam 30 hari pertama
  monetizationAndSustainability: string[]; // 2 Skema pendanaan/pendapatan halal & berdaya
  synergyScore?: number; // e.g. 96%
  multiplierBerkahIndex?: string; // e.g. "Sangat Tinggi (1:4.8 Social ROI)"
  tags?: string[];
  createdAt: string;
  status: "Draft" | "Review Sinergi" | "MoU Terjalin" | "Eksekusi Pilot";
}

export interface RecurringWakafSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  status: "active" | "paused" | "cancelled";
  billingFrequency: "monthly" | "quarterly" | "annually";
  amountType: "percentage_of_rent" | "fixed_nominal" | "percentage_of_revenue";
  percentageValue?: number; // e.g. 5%
  fixedNominalAmount: number; // e.g. Rp 500.000
  effectiveMonthlyAmount: number;
  autoAppendToInvoice: boolean;
  paymentMethodPreference: "Bank Syariah Indonesia (BSI) VA" | "Bank Muamalat VA" | "QRIS Syariah" | "Transfer Bank";
  projectAllocations: { [projectId: string]: number }; // e.g. { 'proj-umkm': 35, ... }
  reinvestmentStrategy: "direct_impact" | "hybrid_endowment";
  startDate: string;
  nextBillingDate: string;
  totalPeriodsCompleted: number;
  totalWakafDisbursed: number;
  akadSignedDate: string;
  waNotificationActive: boolean;
  notes?: string;
}

export type DeliveryZoneId =
  | "jakpus"
  | "jaksel"
  | "jakbar"
  | "jaktim"
  | "jakut"
  | "tangerang"
  | "bekasi"
  | "depok"
  | "bogor";

export interface LogisticsShipment {
  id: string;
  trackingCode: string;
  tenantId: string;
  tenantName: string;
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;
  destinationZone: DeliveryZoneId;
  zoneLabel: string;
  lat: number;
  lng: number;
  packageCategory: "Halal F&B / Frozen" | "Herbal & Skincare" | "Dokumen & Arsip Legal" | "Modest Fashion / Apparel" | "Paket Wakaf / Sembako" | "Elektronik & Gadget";
  weightKg: number;
  volumeM3: number;
  itemDescription: string;
  declaredValue: number;
  priority: "same_day" | "next_day" | "eco_standard";
  requiresColdChain: boolean;
  isFragile: boolean;
  isHalalCertifiedPackage: boolean;
  status: "pending_pool" | "scheduled" | "in_transit" | "delivered";
  individualEstimatedCost: number; // cost if sent alone via on-demand courier
  pooledEstimatedCost: number; // cost in collaborative shared run
  registeredAt: string;
}

export interface VehicleFleetOption {
  id: string;
  name: string;
  vehicleType: "EV Van (Zero Emission)" | "Blind Van Euro-4" | "Electric Cargo Trike" | "Eco-Hybrid Light Truck";
  capacityKg: number;
  capacityM3: number;
  emissionFactorGPerKm: number; // g CO2e / km
  costPerKm: number;
  costPerStop: number;
  isElectric: boolean;
  efficiencyRating: string;
  recommendedZone: string;
}

export interface RouteWaypoint {
  stopIndex: number;
  type: "hub_origin" | "delivery_stop" | "prayer_break_station" | "hub_return";
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  shipmentId?: string;
  tenantName?: string;
  recipientName?: string;
  phone?: string;
  category?: string;
  weightKg?: number;
  etaTime: string;
  distanceFromPrevKm: number;
  durationFromPrevMin: number;
  co2EmittedG: number;
  specialInstructions?: string;
  isCompleted?: boolean;
}

export interface OptimizedDispatchRun {
  id: string;
  batchCode: string;
  dispatchDate: string;
  departureTime: string;
  vehicle: VehicleFleetOption;
  waypoints: RouteWaypoint[];
  shipments: LogisticsShipment[];
  totalDistanceKm: number;
  totalDurationMin: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  capacityWeightUtilizedPercent: number;
  capacityVolumeUtilizedPercent: number;
  
  // Collaborative Optimization Metrics
  baselineIndividualTotalKm: number;
  distanceSavedKm: number;
  distanceSavedPercent: number;
  
  baselineIndividualTotalCost: number;
  pooledTotalCost: number;
  costSavedTotal: number;
  costSavedPercent: number;
  
  baselineIndividualCo2Kg: number;
  pooledCo2Kg: number;
  co2AvoidedKg: number;
  co2ReductionPercent: number;
  equivalentTreesPlanted: number;
  
  ecoScoreGrade: "A+ Zero Emission" | "A Eco-Optimized" | "B Consolidated Low-Carbon";
  prayerStopsIncluded: string[];
  aiBriefingNotes: string;
  driverName: string;
  driverPhone: string;
  qrManifestHash: string;
  status: "draft_optimized" | "manifest_locked" | "dispatched" | "completed";
}

// ==========================================
// SHARED PROCUREMENT TYPES
// ==========================================
export type ProcurementCategory =
  | "eco_packaging"
  | "thermal_labels"
  | "cold_chain_supplies"
  | "office_stationery"
  | "halal_hygiene";

export interface ProcurementTier {
  minQuantity: number;
  unitPrice: number;
  discountPercent: number;
  label: string;
}

export interface ProcurementOrderEntry {
  id: string;
  tenantId: string;
  tenantName: string;
  quantity: number;
  orderTimestamp: string;
  notes?: string;
  paidStatus: "confirmed" | "pending_settlement";
}

export interface ProcurementPoolItem {
  id: string;
  title: string;
  category: ProcurementCategory;
  categoryLabel: string;
  sku: string;
  description: string;
  specifications: string[];
  supplierName: string;
  supplierOrigin: string;
  ecoCredential: string;
  halalCertified: boolean;
  baseUnitPrice: number;
  currentQuantity: number;
  targetMaxTierQuantity: number;
  unitMeasurement: string;
  deadlineDate: string;
  deliveryEstimatedDate: string;
  supplierConsolidatedFreightFee: number;
  status: "open_pool" | "locked_aggregating" | "ordered_from_supplier" | "arrived_at_hub" | "distributed_to_lockers";
  tiers: ProcurementTier[];
  orders: ProcurementOrderEntry[];
}

// ==========================================
// REAL-TIME BATCH TRACKING & MAP TYPES
// ==========================================
export interface LiveTelemetry {
  currentSpeedKmH: number;
  batteryPercent: number;
  estimatedRemainingKm: number;
  cargoTempCelsius?: number;
  cargoHumidityPercent?: number;
  lastGpsPingTime: string;
  trafficStatus: "lancar" | "padat_merayap" | "macet";
}

export interface LiveTrackingLog {
  id: string;
  timestamp: string;
  event: string;
  type: "status_update" | "waypoint_reached" | "proof_of_delivery" | "prayer_break" | "traffic_reroute";
  notes?: string;
}

export interface CollaborativeTrackingBatch {
  id: string;
  batchCode: string;
  corridorName: string;
  vehicle: VehicleFleetOption;
  driverName: string;
  driverPhone: string;
  departureTime: string;
  estimatedArrivalTime: string;
  currentStopIndex: number;
  status: "preparing" | "in_transit" | "prayer_break" | "completed";
  currentPosition: {
    lat: number;
    lng: number;
    nearestRoad: string;
    headingDeg: number;
  };
  telemetry: LiveTelemetry;
  waypoints: RouteWaypoint[];
  shipments: LogisticsShipment[];
  totalDistanceKm: number;
  completedDistanceKm: number;
  totalDurationMin: number;
  co2AvoidedKg: number;
  costSavedTotal: number;
  logs: LiveTrackingLog[];
  podSignaturesCount: number;
}

// ==========================================
// VIRTUALOFFICE 4.0 & ISLAMICITY ECOSYSTEM TYPES
// ==========================================

export interface MosqueCommunityHub {
  id: string;
  mosqueName: string;
  subdistrictKecamatan: string;
  regencyKota: string;
  province: string;
  postalCode: string;
  dkmLeader: string;
  contactPhone: string;
  contactEmail: string;
  totalUmkmAssisted: number;
  coworkingDesksCapacity: number;
  meetingRoomsAvailable: number;
  smartLockersCount: number;
  status: "verified_active" | "candidate_onboarding" | "coaching_in_progress";
  potensiRating: number; // 1 to 100
  coordinates: {
    lat: number;
    lng: number;
  };
  keySectors: string[];
  monthlyWakafRevenue: number;
  portalUrl: string; // e.g. "http://voffice.islamicity.tv"
}

export interface PotensiRegistrationForm {
  id: string;
  applicantName: string;
  whatsappNumber: string;
  email: string;
  businessName: string;
  businessLegalForm: "UMKM Komunitas Masjid" | "Koperasi Syariah" | "CV" | "PT" | "Yayasan" | "Perorangan / Freelancer";
  sector: string;
  mosqueName: string;
  kecamatanCity: string;
  assetEstimate: number;
  monthlyTurnoverEstimate: number;
  currentEmployeesCount: number;
  mainNeeds: string[]; // e.g. ["Legalitas & NIB", "Sertifikasi Halal", "Alamat Domisili Virtual Office", "Pelatihan Fiqh Muamalah", "Permodalan Syariah / BMT"]
  selectedCourseId?: string;
  submittedAt: string;
  status: "pending_review" | "assessment_scheduled" | "admitted_training" | "graduated_hub";
  scorePotensi: number; // calculated 0-100
}

export interface TrainingCourseGlobalTecs {
  id: string;
  code: string;
  title: string;
  category: "eLearning" | "Training" | "Education" | "Coach Course" | "Seminar Workshop";
  level: "Dasar / Muallim" | "Menengah / Musyrif" | "Mahir / Muamalah Expert";
  instructorName: string;
  instructorTitle: string;
  durationHours: number;
  modulesCount: number;
  totalEnrolled: number;
  rating: number;
  nextBatchDate: string;
  priceNote: string; // e.g. "Beasiswa 100% Wakaf Umat"
  description: string;
  curriculumSyllabus: string[];
  linkUrl: string; // "http://global.tecs.islamicity.tv"
}

export interface IslamicityDomainPillar {
  domain: string;
  name: string;
  tagline: string;
  category: "VirtualOffice" | "CoWorking" | "Potensi & Registrasi" | "Global Distance Learning";
  description: string;
  activeUsers: string;
  primaryMetric: string;
  iconName: string;
}

export interface VirtualCity {
  id: string;
  name: string;
  province: string;
  totalKecamatan: number;
  totalMosques: number;
  activeUmkm: number;
  capNodeId: string; // Central Access Point
  upicUnitId: string; // Unit Pelayanan Islamicity
  koperasiBrokerStatus: "Operasional Penuh" | "Aktivasi Batch" | "Kemitraan BMT";
  voucherCirculationRp: number;
  sisaSampahSirkularKg: number;
  adDataUnits: number;
  collateralVerifiedTotalRp: number;
  islamicityVaActiveUsers: number;
  githubRepositoryUrl: string; // "https://islamicity.github.io/VirtualOffice"
}

export interface IslamicityVaQuery {
  id: string;
  timestamp: string;
  sender: "user" | "assistant";
  text: string;
  topic?: "fiqh_muamalah" | "asset_collateral" | "prayer_schedule" | "quran_hadith" | "virtual_office_guide" | "koperasi_voucher";
  quranReference?: string;
  hadithReference?: string;
  actionRecommendation?: string;
}

export interface BankBrokerVoucherPool {
  id: string;
  code: string;
  category: "Bank Voucher" | "Data" | "Iklan" | "Sisa (Sampah) Sirkular";
  title: string;
  nominalValueRp: number;
  availableUnits: number;
  circulatingUnits: number;
  collateralAssetGuarantee: string;
  shariaAkad: "Mudharabah Muqayyadah" | "Musyarakah Mutanaqisah" | "Hawalah" | "Kafalah";
  supportingEntity: "CAP" | "UPIC" | "Koperasi Syariah" | "Bank Syariah";
}




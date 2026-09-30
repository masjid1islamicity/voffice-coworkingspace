import React, { useState } from "react";
import { FacilityBooking as FacilityBookingType, Tenant } from "../types";
import {
  Calendar,
  Clock,
  Users,
  Tv,
  Mic,
  Coffee,
  CheckCircle2,
  Plus,
  Compass,
  Sparkles,
  ShieldCheck,
  Building,
  QrCode,
  Printer,
  ChevronRight,
} from "lucide-react";

interface FacilityBookingProps {
  bookings: FacilityBookingType[];
  tenants: Tenant[];
  onAddBooking: (newBooking: FacilityBookingType) => void;
}

export const FacilityBooking: React.FC<FacilityBookingProps> = ({
  bookings = [],
  tenants = [],
  onAddBooking,
}) => {
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  const [selectedRoom, setSelectedRoom] = useState<string>("Ruang Al-Fatih (Meeting 10 Pax)");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingTicket, setSelectedBookingTicket] = useState<FacilityBookingType | null>(null);

  // Form State
  const [tenantId, setTenantId] = useState(safeTenants[0]?.id || "");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [attendeesCount, setAttendeesCount] = useState(6);
  const [purpose, setPurpose] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Smart TV 65 Inch 4K",
    "Audio Conference Mic",
    "Coffee & Dates Break",
  ]);

  const roomsCatalog = [
    {
      name: "Ruang Al-Fatih (Meeting 10 Pax)",
      capacity: 10,
      ratePerHour: 150000,
      description: "Ruang rapat standar berkapasitas 10 orang dengan Smart TV 65-inch, whiteboard, dan wireless presentation.",
      features: ["Smart TV 65 Inch 4K", "Audio Conference Mic", "Whiteboard & Marker", "Coffee & Dates Break"],
      tag: "Terpopuler",
    },
    {
      name: "Ruang Cordoba (Executive 6 Pax)",
      capacity: 6,
      ratePerHour: 120000,
      description: "Ruang rapat eksekutif privat kedap suara untuk negosiasi kontrak, zoom meeting, dan evaluasi tim.",
      features: ["Display Casting", "Acoustic Soundproof", "High Speed Wi-Fi 6 Dedicated", "Mineral Water"],
      tag: "Eksekutif",
    },
    {
      name: "Ruang Al-Quds (Boardroom 16 Pax)",
      capacity: 16,
      ratePerHour: 300000,
      description: "Ruang rapat dewan direksi & komisaris, RUPS, atau RAT Koperasi dengan proyektor laser ganda dan sistem delegate mic.",
      features: ["Dual Laser Projector", "Wireless Delegate Mics", "Executive Refreshment & Coffee Break"],
      tag: "Boardroom",
    },
    {
      name: "Studio Podcast Sharia Creative",
      capacity: 4,
      ratePerHour: 250000,
      description: "Studio rekaman podcast profesional bernuansa Islami lengkap dengan 4x mic Shure SM7B dan kamera 4K Blackmagic.",
      features: ["4x Shure SM7B Mics", "Blackmagic 4K Camera", "Acoustic Booth", "Sound Engineer On-site"],
      tag: "Podcast Hub",
    },
    {
      name: "Hot Desk Coworking Area",
      capacity: 30,
      ratePerHour: 25000,
      description: "Meja kerja fleksibel di ruang terbuka dengan suasana tenang, view taman masjid, dan koneksi internet super cepat.",
      features: ["Ergonomic Chair", "Power Outlets", "Unlimited Arabica Coffee & Tea", "Pantry Access"],
      tag: "Flexi Desk",
    },
  ];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === tenantId);
    const roomInfo = roomsCatalog.find((r) => r.name === selectedRoom);
    if (!tenant || !roomInfo || !purpose) return;

    // Calculate hours
    const startH = parseInt(startTime.split(":")[0]);
    const endH = parseInt(endTime.split(":")[0]);
    const hours = Math.max(1, endH - startH);
    const totalCost = hours * roomInfo.ratePerHour;

    const newBooking: FacilityBookingType = {
      id: `BKG-${Math.floor(Math.random() * 900 + 100)}`,
      roomName: selectedRoom as any,
      tenantId: tenant.id,
      tenantName: tenant.companyName,
      date: selectedDate,
      startTime: startTime,
      endTime: endTime,
      attendeesCount: attendeesCount,
      purpose: purpose,
      amenities: selectedAmenities,
      status: "confirmed",
      prayerBreakFriendly: true,
      costPerHour: roomInfo.ratePerHour,
      totalCost: totalCost,
      paidWithQuota: tenant.meetingQuotaHours >= hours,
    };

    onAddBooking(newBooking);
    setIsModalOpen(false);
    setSelectedBookingTicket(newBooking);
    setPurpose("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              SOP-IVO-06 COMPLIANT
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              Sistem Reservasi & Penggunaan Kuota
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
            Penyewaan Ruang Rapat, Studio Podcast & Co-Working Hub
          </h2>
          <p className="text-xs sm:text-sm text-[#626252] max-w-2xl leading-relaxed">
            Booking real-time ruang rapat berfasilitas modern dengan penegakan adab Islami, otomatisasi pemotongan kuota bulanan tenant, dan integrasi jeda waktu sholat berjamaah.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Reservasi Ruangan Baru</span>
        </button>
      </div>

      {/* Room Catalogs Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roomsCatalog.map((room) => {
          const isSelected = selectedRoom === room.name;
          return (
            <div
              key={room.name}
              onClick={() => setSelectedRoom(room.name)}
              className={`p-6 rounded-[24px] border transition-all cursor-pointer relative flex flex-col justify-between shadow-xs ${
                isSelected
                  ? "bg-[#f5f2ed]/80 border-[#5A5A40] ring-1 ring-[#5A5A40]/30"
                  : "bg-white border-black/5 hover:border-[#5A5A40]/30"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f5f5f0] text-[#5A5A40] border border-[#5A5A40]/15">
                    {room.tag}
                  </span>
                  <span className="text-xs font-bold text-[#5A5A40] font-mono">
                    Rp {room.ratePerHour.toLocaleString("id-ID")}/jam
                  </span>
                </div>

                <h3 className="font-serif font-bold text-[#2d2d22] text-base">{room.name}</h3>
                <p className="text-[#626252] text-xs leading-relaxed">{room.description}</p>

                <div className="space-y-1.5 pt-3 border-t border-black/5 text-xs">
                  <div className="text-[11px] font-bold text-[#2d2d22]">Fasilitas Standar:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.features.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f5f5f0] text-[#3a3a2e] border border-black/5"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-[#72725e] flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#72725e]" />
                  Kapasitas: {room.capacity} Orang
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoom(room.name);
                    setIsModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                >
                  Pilih Jadwal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Bookings List */}
      <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="font-serif font-bold text-[#2d2d22] text-base">
              Daftar Reservasi Fasilitas Mendatang
            </h3>
          </div>
          <span className="text-xs text-[#72725e] font-medium">
            Total {safeBookings.length} Reservasi Terjadwal
          </span>
        </div>

        <div className="divide-y divide-black/5">
          {safeBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBookingTicket(b)}
              className="py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-[#f5f2ed]/50 p-3 rounded-[18px] transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/15 flex items-center justify-center font-bold text-xs shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[#2d2d22] text-xs sm:text-sm">{b.roomName}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f5f5f0] text-[#5A5A40] border border-[#5A5A40]/15">
                      {b.id}
                    </span>
                  </div>
                  <div className="text-xs text-[#626252] mt-0.5">
                    Tenant: <strong className="text-[#2d2d22]">{b.tenantName}</strong> • {b.purpose}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#72725e] mt-1">
                    <span className="flex items-center gap-1 font-semibold text-[#3a3a2e]">
                      <Calendar className="w-3 h-3 text-[#5A5A40]" /> {b.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[#5A5A40] font-bold">
                      <Clock className="w-3 h-3" /> {b.startTime} - {b.endTime} WIB
                    </span>
                    <span>•</span>
                    <span>{b.attendeesCount} Peserta</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="font-serif font-bold text-[#2d2d22]">
                    {b.paidWithQuota ? "Kuota Bulanan" : `Rp ${b.totalCost.toLocaleString("id-ID")}`}
                  </div>
                  <span className="text-[10px] font-semibold text-[#5A5A40] bg-[#f5f2ed] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/15">
                    {b.paidWithQuota ? "✓ Bebas Biaya (Kuota)" : "Ditagihkan di Invoice"}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBookingTicket(b);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-[#5A5A40]/20 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white font-bold text-xs transition-colors"
                >
                  Lihat Tiket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Booking Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-serif font-bold text-[#2d2d22] text-base sm:text-lg">
                  Reservasi Ruang Rapat / Coworking
                </h3>
                <p className="text-xs text-[#72725e]">
                  Pilih ruangan, jadwal bebas jeda sholat, dan fasilitas tambahan
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">
                  Pilih Perusahaan Tenant:
                </label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white font-medium text-[#2d2d22] px-4"
                >
                  {safeTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.companyName} (Sisa Kuota: {(t.meetingQuotaHours || 0) - (t.meetingQuotaUsed || 0)} Jam)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">
                  Pilih Fasilitas Ruangan:
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 bg-white font-medium text-[#2d2d22] px-4"
                >
                  {roomsCatalog.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} - Rp {r.ratePerHour.toLocaleString("id-ID")}/jam
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Tanggal:</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d2d22] mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1">
                  Agenda / Tujuan Pertemuan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Koordinasi Tim & Presentasi Investor"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-[#5A5A40]/20 px-4"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d2d22] mb-1.5">
                  Fasilitas & Perlengkapan Pendukung:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Smart TV 65 Inch 4K",
                    "Audio Conference Mic",
                    "Whiteboard & Marker",
                    "Coffee & Dates Break",
                    "Perekaman Audio (Voice Memo)",
                    "Layanan Cetak Dokumen Segera",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2.5 rounded-[14px] border border-black/5 hover:bg-[#f5f5f0] cursor-pointer text-[#3a3a2e]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded-sm text-[#5A5A40] accent-[#5A5A40]"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#f5f2ed] rounded-[18px] border border-[#5A5A40]/20 text-[#2d2d22] text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Adab & Ketertiban Bersama:</strong> Ruangan telah disterilkan dan dilengkapi penunjuk arah kiblat. Rapat dihimbau jeda 15 menit saat adzan berkumandang.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#72725e] hover:bg-[#f5f5f0] font-semibold rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Reservasi & Terbitkan E-Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Booking E-Ticket View */}
      {selectedBookingTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#5A5A40]/15 font-mono">
                E-Ticket Resmi Fasilitas
              </span>
              <button
                onClick={() => setSelectedBookingTicket(null)}
                className="text-[#72725e] hover:text-[#2d2d22] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f5f5f0] border border-black/5 rounded-[20px] p-5 text-center space-y-2">
              <div className="font-mono text-xs font-bold text-[#72725e]">KODE BOOKING</div>
              <div className="font-serif text-2xl font-bold text-[#2d2d22] font-mono tracking-wider">
                {selectedBookingTicket.id}
              </div>
              <div className="text-xs font-bold text-[#5A5A40]">{selectedBookingTicket.roomName}</div>
            </div>

            <div className="space-y-2 text-xs text-[#3a3a2e]">
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-[#72725e]">Penyewa:</span>
                <span className="font-bold text-[#2d2d22]">{selectedBookingTicket.tenantName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-[#72725e]">Tanggal:</span>
                <span className="font-bold text-[#2d2d22]">{selectedBookingTicket.date}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-[#72725e]">Waktu Sesi:</span>
                <span className="font-bold text-[#5A5A40]">
                  {selectedBookingTicket.startTime} - {selectedBookingTicket.endTime} WIB
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-[#72725e]">Agenda:</span>
                <span className="font-medium text-[#2d2d22]">{selectedBookingTicket.purpose}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-[#72725e]">Status Pembayaran:</span>
                <span className="font-bold text-[#5A5A40]">
                  {selectedBookingTicket.paidWithQuota ? "Kuota Bulanan (Lunas)" : `Rp ${selectedBookingTicket.totalCost.toLocaleString("id-ID")}`}
                </span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak E-Ticket (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

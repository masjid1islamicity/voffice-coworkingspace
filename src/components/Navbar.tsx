import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Mail,
  Calendar,
  Users,
  FileSignature,
  CreditCard,
  Headphones,
  ShieldCheck,
  Sparkles,
  Compass,
  Scale,
  Truck,
  Globe2,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mailAlertCount: number;
  expiringTenantCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mailAlertCount,
  expiringTenantCount,
}) => {
  const navItems = [
    {
      id: "overview",
      label: "Beranda",
      shortLabel: "Beranda",
      icon: LayoutDashboard,
    },
    {
      id: "voffice_4",
      label: "VirtualOffice 4.0 Hub",
      shortLabel: "V-Office 4.0",
      icon: Globe2,
      badge: "800k Masjid",
      badgeColor: "bg-[#5A5A40] text-white",
      highlight: true,
    },
    {
      id: "sop_hub",
      label: "Dashboard SOP",
      shortLabel: "SOP Hub",
      icon: BookOpen,
      badge: "8 Modul",
      badgeColor: "bg-[#E4E3DA] text-[#5A5A40]",
    },
    {
      id: "mailroom",
      label: "Smart Mailroom",
      shortLabel: "Mailroom",
      icon: Mail,
      badge: mailAlertCount > 0 ? `${mailAlertCount} Surat` : undefined,
      badgeColor: "bg-[#8A8A6A] text-white",
    },
    {
      id: "facility_booking",
      label: "Ruang Rapat & Coworking",
      shortLabel: "Fasilitas",
      icon: Calendar,
    },
    {
      id: "clients",
      label: "Admin Klien & KYC",
      shortLabel: "Tenant",
      icon: Users,
      badge: expiringTenantCount > 0 ? `${expiringTenantCount} Expire` : undefined,
      badgeColor: "bg-[#8A8A6A] text-white",
    },
    {
      id: "contract_generator",
      label: "Akad Ijarah AI",
      shortLabel: "Akad AI",
      icon: FileSignature,
    },
    {
      id: "ecosystem_architect",
      label: "Ecosystem Matchmaker AI",
      shortLabel: "Ecosystem AI",
      icon: Compass,
      badge: "3 Pilar",
      badgeColor: "bg-[#5A5A40] text-white",
      highlight: true,
    },
    {
      id: "billing",
      label: "Billing & Wakaf Hub",
      shortLabel: "Keuangan",
      icon: CreditCard,
    },
    {
      id: "zakat_calculator",
      label: "Kalkulator Zakat AI",
      shortLabel: "Zakat AI",
      icon: Scale,
      badge: "Nisab & BSZ",
      badgeColor: "bg-[#5A5A40] text-white",
    },
    {
      id: "logistics_hub",
      label: "Logistics Hub & Rute AI",
      shortLabel: "Logistik Hub",
      icon: Truck,
      badge: "Green Pool",
      badgeColor: "bg-emerald-700 text-white",
    },
    {
      id: "receptionist",
      label: "Resepsionis Cerdas AI",
      shortLabel: "Resepsionis",
      icon: Headphones,
    },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("overview")}
          >
            <div className="w-11 h-11 bg-[#5A5A40] rounded-full flex items-center justify-center text-white shadow-md shadow-[#5A5A40]/25 group-hover:scale-105 transition-transform">
              <span className="font-serif text-2xl font-bold">I</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2d2d22]">
                  Islamicity Virtual Office
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/20">
                  <ShieldCheck className="w-3 h-3 text-[#5A5A40]" /> Syariah Certified
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#72725e] uppercase tracking-widest font-semibold">
                Infrastruktur & Platform Cerdas Berdaya Komunitas Masjid
              </p>
            </div>
          </div>

          {/* Quick Info & Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-[#72725e] font-medium">Status Operasional</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A5A40]">
                <span className="w-2 h-2 rounded-full bg-[#5A5A40] animate-pulse"></span>
                <span>Active & Live (08.00 - 17.00 WIB)</span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#5A5A40]/15"></div>

            <div className="bg-[#f5f2ed] border border-[#5A5A40]/15 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs font-serif">
                5%
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-[#2d2d22]">Wakaf Produktif</div>
                <div className="text-[#5A5A40] font-medium">Masjid Business Hub</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar with Natural Tone Pills */}
        <nav className="flex space-x-2 overflow-x-auto no-scrollbar py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-black/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#5A5A40] text-white shadow-md shadow-[#5A5A40]/25 font-semibold"
                    : "border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10"
                } ${item.highlight && !isActive ? "bg-[#f5f2ed] border-[#5A5A40]/40 font-semibold" : ""}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#f5f2ed]" : "text-[#5A5A40]"}`} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? "bg-white/20 text-white" : item.badgeColor || "bg-[#E4E3DA] text-[#5A5A40]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <Sparkles className="w-3 h-3 text-[#8A8A6A]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

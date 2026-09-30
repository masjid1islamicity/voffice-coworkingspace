import React, { useState } from "react";
import {
  INITIAL_TENANTS,
  INITIAL_MAILS,
  INITIAL_BOOKINGS,
  INITIAL_INVOICES,
  INITIAL_SURVEYS,
  INITIAL_PROPOSALS,
  INITIAL_RECURRING_WAKAF_SUBSCRIPTIONS,
} from "./data/mockData";
import { SOP_MODULES } from "./data/sopData";
import {
  Tenant,
  MailItem,
  FacilityBooking as FacilityBookingType,
  Invoice,
  TenantSatisfactionSurvey,
  EcosystemProposal,
  RecurringWakafSubscription,
} from "./types";
import { Navbar } from "./components/Navbar";
import { PrayerTimesWidget } from "./components/PrayerTimesWidget";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { SopHub } from "./components/SopHub";
import { MailroomDesk } from "./components/MailroomDesk";
import { FacilityBooking } from "./components/FacilityBooking";
import { ContractGenerator } from "./components/ContractGenerator";
import { EcosystemArchitect } from "./components/EcosystemArchitect";
import { ClientDirectory } from "./components/ClientDirectory";
import { BillingManager } from "./components/BillingManager";
import { ZakatMaalCalculator } from "./components/ZakatMaalCalculator";
import { LogisticsHub } from "./components/LogisticsHub";
import { VirtualReceptionist } from "./components/VirtualReceptionist";
import { VirtualOffice4Ecosystem } from "./components/VirtualOffice4Ecosystem";
import { Building2, Heart, ShieldCheck } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Global Interactive States
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [mails, setMails] = useState<MailItem[]>(INITIAL_MAILS);
  const [bookings, setBookings] = useState<FacilityBookingType[]>(INITIAL_BOOKINGS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [surveys, setSurveys] = useState<TenantSatisfactionSurvey[]>(INITIAL_SURVEYS);
  const [proposals, setProposals] = useState<EcosystemProposal[]>(INITIAL_PROPOSALS);
  const [recurringWakafSubscriptions, setRecurringWakafSubscriptions] = useState<RecurringWakafSubscription[]>(
    INITIAL_RECURRING_WAKAF_SUBSCRIPTIONS
  );

  // Proposal Mutator
  const handleAddProposal = (newProposal: EcosystemProposal) => {
    setProposals((prev) => [newProposal, ...prev]);
  };

  // Mailroom Mutators
  const handleAddMail = (newMail: MailItem) => {
    setMails((prev) => [newMail, ...prev]);
    // Also update tenant's uncollected mails count
    setTenants((prev) =>
      prev.map((t) =>
        t.id === newMail.tenantId ? { ...t, uncollectedMailsCount: t.uncollectedMailsCount + 1 } : t
      )
    );
  };

  const handleUpdateMailStatus = (
    mailId: string,
    status: MailItem["status"],
    extra?: Partial<MailItem>
  ) => {
    setMails((prev) =>
      prev.map((m) => {
        if (m.id === mailId) {
          return { ...m, status, ...extra };
        }
        return m;
      })
    );
  };

  // Booking Mutator
  const handleAddBooking = (newBooking: FacilityBookingType) => {
    setBookings((prev) => [newBooking, ...prev]);
    // If paid with quota, increment used quota
    if (newBooking.paidWithQuota) {
      const hours =
        parseInt(newBooking.endTime.split(":")[0]) - parseInt(newBooking.startTime.split(":")[0]);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === newBooking.tenantId
            ? { ...t, meetingQuotaUsed: t.meetingQuotaUsed + Math.max(1, hours) }
            : t
        )
      );
    }
  };

  // Tenant Mutator with Recurring Wakaf Schedule Inspection
  const handleAddTenant = (newTenant: Tenant) => {
    setTenants((prev) => [newTenant, ...prev]);

    // Check if there is an active recurring wakaf subscription configured
    const activeSub = recurringWakafSubscriptions.find(
      (s) => s.tenantId === newTenant.id && s.status === "active"
    );
    
    let wakafEndowment = Math.round(newTenant.monthlyRate * 0.05);
    if (activeSub) {
      if (activeSub.amountType === "percentage_of_rent") {
        wakafEndowment = Math.round(newTenant.monthlyRate * ((activeSub.percentageValue || 5) / 100));
      } else {
        wakafEndowment = activeSub.effectiveMonthlyAmount || activeSub.fixedNominalAmount || Math.round(newTenant.monthlyRate * 0.05);
      }
    }

    const baseAmount = newTenant.monthlyRate;
    const taxAmount = Math.round(baseAmount * 0.11);
    const totalAmount = baseAmount + taxAmount + wakafEndowment;

    // Auto-generate initial invoice
    const newInvoice: Invoice = {
      id: `INV-${new Date().getFullYear()}-${String(invoices.length + 101)}`,
      invoiceNumber: `INV/IVO/${new Date().getFullYear()}/${String(invoices.length + 101).padStart(4, "0")}`,
      tenantId: newTenant.id,
      tenantName: newTenant.companyName,
      periodDescription: `Sewa Perdana 1 Bulan ${newTenant.packageType}`,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      baseAmount,
      taxAmount,
      wakafEndowmentAmount: wakafEndowment,
      totalAmount,
      status: "unpaid",
      paymentMethod: "Bank Syariah Indonesia (BSI) VA",
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  // Recurring Wakaf Mutators
  const handleSaveRecurringWakaf = (
    newSub: RecurringWakafSubscription,
    syncInvoices: boolean
  ) => {
    setRecurringWakafSubscriptions((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === newSub.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newSub;
        return updated;
      }
      return [newSub, ...prev];
    });

    // If sync invoices requested and subscription is active, apply wakaf amount to tenant's unpaid invoices
    if (syncInvoices && newSub.status === "active") {
      const monthlyAmount = newSub.effectiveMonthlyAmount || newSub.fixedNominalAmount;
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.tenantId === newSub.tenantId && inv.status !== "paid") {
            const newWakaf = monthlyAmount;
            const updatedTotal = inv.baseAmount + inv.taxAmount + newWakaf;
            return {
              ...inv,
              wakafEndowmentAmount: newWakaf,
              totalAmount: updatedTotal,
            };
          }
          return inv;
        })
      );
    }
  };

  const handleToggleRecurringWakafStatus = (subId: string) => {
    setRecurringWakafSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subId) {
          const nextStatus = sub.status === "active" ? "paused" : "active";
          return { ...sub, status: nextStatus };
        }
        return sub;
      })
    );
  };

  const handleApplyWaqfToInvoice = (tenantId: string, monthlyWaqfAmount: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.tenantId === tenantId && inv.status !== "paid") {
          const newWakaf = Math.round(monthlyWaqfAmount);
          const updatedTotal = inv.baseAmount + inv.taxAmount + newWakaf;
          return {
            ...inv,
            wakafEndowmentAmount: newWakaf,
            totalAmount: updatedTotal,
          };
        }
        return inv;
      })
    );
  };

  // Invoice Mutator
  const handleMarkInvoicePaid = (
    invoiceId: string,
    paymentMethod: Invoice["paymentMethod"]
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: "paid",
            paymentMethod,
            paidDate: new Date().toLocaleDateString("id-ID"),
          };
        }
        return inv;
      })
    );
  };

  // Survey Mutator
  const handleAddSurvey = (newSurvey: TenantSatisfactionSurvey) => {
    setSurveys((prev) => [newSurvey, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#3a3a2e] flex flex-col selection:bg-[#E4E3DA] selection:text-[#5A5A40]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mailAlertCount={mails.filter((m) => m.status === "received_logged").length}
        expiringTenantCount={tenants.filter((t) => t.status === "expiring_soon").length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Prayer Times Widget bar */}
        <PrayerTimesWidget />

        {/* Dynamic Tab Views */}
        {activeTab === "overview" && (
          <OverviewDashboard
            tenants={tenants}
            mails={mails}
            bookings={bookings}
            invoices={invoices}
            sopModules={SOP_MODULES}
            subscriptions={recurringWakafSubscriptions}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "voffice_4" && (
          <VirtualOffice4Ecosystem onNavigateTab={setActiveTab} />
        )}

        {activeTab === "sop_hub" && <SopHub sopModules={SOP_MODULES} />}

        {activeTab === "mailroom" && (
          <MailroomDesk
            mails={mails}
            tenants={tenants}
            onAddMail={handleAddMail}
            onUpdateMailStatus={handleUpdateMailStatus}
          />
        )}

        {activeTab === "facility_booking" && (
          <FacilityBooking
            bookings={bookings}
            tenants={tenants}
            onAddBooking={handleAddBooking}
          />
        )}

        {activeTab === "contract_generator" && <ContractGenerator tenants={tenants} />}

        {activeTab === "ecosystem_architect" && (
          <EcosystemArchitect
            tenants={tenants}
            proposals={proposals}
            onAddProposal={handleAddProposal}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "clients" && (
          <ClientDirectory
            tenants={tenants}
            onAddTenant={handleAddTenant}
            surveys={surveys}
            onAddSurvey={handleAddSurvey}
          />
        )}

        {activeTab === "billing" && (
          <BillingManager
            invoices={invoices}
            tenants={tenants}
            subscriptions={recurringWakafSubscriptions}
            onMarkInvoicePaid={handleMarkInvoicePaid}
            onSaveSubscription={handleSaveRecurringWakaf}
            onToggleSubscriptionStatus={handleToggleRecurringWakafStatus}
            onApplyWaqfToInvoice={handleApplyWaqfToInvoice}
          />
        )}

        {activeTab === "zakat_calculator" && (
          <ZakatMaalCalculator
            tenants={tenants}
            invoices={invoices}
          />
        )}

        {activeTab === "logistics_hub" && (
          <LogisticsHub
            tenants={tenants}
          />
        )}

        {activeTab === "receptionist" && <VirtualReceptionist tenants={tenants} />}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-black/5 py-8 px-4 text-xs text-[#72725e]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs font-serif shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-[#2d2d22] text-sm">Islamicity Virtual Office</span>
              <span className="text-[#72725e] block text-[11px]">Infrastruktur Cerdas & Standar Operasional Berdaya</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#72725e]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" /> Standar Fiqh Muamalah DSN-MUI
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#5A5A40] font-semibold">
              <Heart className="w-3.5 h-3.5 text-[#8A8A6A]" /> Ekosistem Masjid & UMKM Berdaya
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;


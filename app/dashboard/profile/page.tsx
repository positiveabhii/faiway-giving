"use client";
import React, { useState } from "react";
import Script from "next/script";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { User, CreditCard, Bell, CheckCircle2, Loader2, Mail, Calendar, FileText, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";
import { updateAdminUser } from "@/lib/api/admin-users";
import { manageSubscription } from "@/lib/api/subscriptions";

type TabType = "personal" | "billing" | "notifications";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { subscriptions, notifications, billingTransactions, markNotificationRead, isLoading, refreshAll } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [successMsg, setSuccessMsg] = useState("");
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);

  if (isLoading || !user) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const userSub = subscriptions.find(s => s.user_id === user.id);
  const userNotifications = notifications.filter(n => n.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const userTransactions = billingTransactions.filter(t => t.user_id === user.id).sort((a, b) => new Date(b.billing_date).getTime() - new Date(a.billing_date).getTime());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      await updateAdminUser({ user_id: user.id, first_name: firstName, last_name: lastName });
      await refreshProfile();
      setSuccessMsg("Settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "We could not save your profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePayNow = async () => {
    if (!userSub) return;
    setLoadingPayment(true);
    setErrorMsg("");
    try {
      const { createPaymentOrder, verifyPayment } = await import("@/lib/api/payments");
      const orderRes = await createPaymentOrder({ plan: userSub.plan });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Fairway Giving",
        description: `Activate ${userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1)} Membership`,
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          try {
            setLoadingPayment(true);
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: userSub.plan
            });
            await refreshAll();
            await refreshProfile();
            setSuccessMsg("Membership activated successfully!");
            setTimeout(() => setSuccessMsg(""), 5000);
          } catch (err: any) {
            setErrorMsg(err.message || "Verification failed.");
          } finally {
            setLoadingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPayment(false);
          }
        },
        prefill: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        },
        theme: { color: "#F59E0B" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate payment.");
      setLoadingPayment(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your membership? You will lose access at the end of your billing period.")) return;
    try {
      await manageSubscription({ status: "canceled" });
      await refreshAll();
      setSuccessMsg("Subscription cancelled successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cancel.");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-gold-500';
      case 'pending_payment': return 'bg-amber-500 text-charcoal-950';
      case 'past_due': return 'bg-red-500 text-white';
      case 'canceled': return 'bg-gray-500 text-white';
      default: return 'bg-charcoal-800 text-gray-400';
    }
  };

  const getCTAButtonText = (status?: string) => {
    switch (status) {
      case 'pending_payment': return "Complete Membership Payment";
      case 'past_due': return "Pay Now to Restore Access";
      case 'canceled': return "Reactivate Membership";
      default: return "Renew Membership";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <img src={user.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"} alt={user.first_name} className="w-24 h-24 rounded-full object-cover border-4 border-charcoal-800 shadow-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-charcoal-950 border-2 border-charcoal-950"><User size={14} /></div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{user.first_name} {user.last_name}</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("personal")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${activeTab === "personal" ? 'bg-gold-500/10 border border-gold-500/20 text-gold-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <User size={18} />
            <span>Account Details</span>
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${activeTab === "billing" ? 'bg-gold-500/10 border border-gold-500/20 text-gold-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <CreditCard size={18} />
            <span>Billing & Plan</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${activeTab === "notifications" ? 'bg-gold-500/10 border border-gold-500/20 text-gold-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Bell size={18} />
            <div className="flex-1 flex justify-between items-center">
              <span>Notifications</span>
              {userNotifications.some(n => !n.is_read) && (
                <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
              )}
            </div>
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === "personal" && (
            <GlassCard className="p-8 border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type="email" value={user.email} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-12 py-3 text-gray-500 cursor-not-allowed" disabled />
                  </div>
                </div>
                {successMsg && (
                  <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-lg text-sm border border-emerald-500/20"><CheckCircle2 size={16} /><span>{successMsg}</span></div>
                )}
                {errorMsg && (
                  <div className="text-red-400 bg-red-500/10 px-4 py-3 rounded-lg text-sm border border-red-500/20">{errorMsg}</div>
                )}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </GlassCard>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden">
                <div className={`absolute top-0 right-0 text-charcoal-950 text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg ${getStatusColor(userSub?.status)}`}>
                  {userSub?.status?.replace('_', ' ') ?? 'No Plan'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Membership Status</h3>
                <p className="text-gray-400 text-sm mb-6">You are currently on the <strong className="text-white capitalize">{userSub?.plan ?? "Unsubscribed"}</strong> plan.</p>

                {(userSub?.status === 'past_due' || userSub?.status === 'pending_payment') && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">
                      {userSub.status === 'pending_payment'
                        ? "Your registration is incomplete. Please finish your payment to join the community."
                        : "Your membership has lapsed. Complete payment to restore access."}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-charcoal-900/80 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Billing Amount</p>
                    <p className="text-xl font-bold text-white">{userSub?.plan === "yearly" ? "$290.00 / year" : "$29.00 / month"}</p>
                  </div>
                  <div className="p-4 bg-charcoal-900/80 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Next Renewal</p>
                    <p className="text-xl font-bold text-white">{userSub?.next_renewal_date ? new Date(userSub.next_renewal_date).toLocaleDateString() : "—"}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {userSub?.status !== 'active' ? (
                    <Button onClick={handlePayNow} disabled={loadingPayment} className="flex items-center space-x-2">
                      {loadingPayment ? <RefreshCw className="animate-spin" size={16} /> : <CreditCard size={16} />}
                      <span>{getCTAButtonText(userSub?.status)}</span>
                    </Button>
                  ) : (
                    <>
                      {/* <Button variant="secondary" size="sm" onClick={() => window.alert("Invoice management is handled via the Transactions table below.")}>Invoices</Button> */}
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleCancel}>Cancel Membership</Button>
                    </>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-0 border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center space-x-3">
                  <FileText className="text-gold-400" size={20} />
                  <h3 className="text-lg font-bold text-white">Billing History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-gray-500 text-[10px] uppercase tracking-widest">
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Invoice ID</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No transaction history found.</td>
                        </tr>
                      ) : (
                        userTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 text-sm text-gray-300">{new Date(tx.billing_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-400">{tx.invoice_reference || tx.payment_reference.slice(0, 12)}</td>
                            <td className="px-6 py-4 text-sm font-bold text-white">${tx.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-gray-500 group-hover:text-gold-400 transition-colors"><ChevronRight size={16} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "notifications" && (
            <GlassCard className="p-0 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Your Notifications</h3>
                <span className="text-xs text-gold-400 bg-gold-500/10 px-2 py-1 rounded">{userNotifications.filter(n => !n.is_read).length} Unread</span>
              </div>
              <div className="divide-y divide-white/5">
                {userNotifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No notifications to display.</div>
                ) : (
                  userNotifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && markNotificationRead(notif.id)}
                      className={`p-6 transition-colors cursor-pointer group ${!notif.is_read ? 'bg-gold-500/5 hover:bg-gold-500/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${!notif.is_read ? 'bg-gold-500' : 'bg-transparent'}`}></div>
                          <h4 className={`font-bold ${!notif.is_read ? 'text-gold-400' : 'text-white'}`}>{notif.title}</h4>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 ml-5">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { User, CreditCard, Bell, CheckCircle2, Loader2, Mail, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";
import * as profileService from "@/lib/supabase/services/profile.service";

type TabType = "personal" | "billing" | "notifications";

export default function ProfilePage() {
  const { user } = useAuth();
  const { subscriptions, notifications, markNotificationRead, isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [successMsg, setSuccessMsg] = useState("");
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [saving, setSaving] = useState(false);

  if (isLoading || !user) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const userSub = subscriptions.find(s => s.user_id === user.id);
  const userNotifications = notifications.filter(n => n.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, { first_name: firstName, last_name: lastName });
      setSuccessMsg("Settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch { setSuccessMsg(""); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
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
        {/* Navigation Tabs */}
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

        {/* Content Area */}
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
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </GlassCard>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gold-500 text-charcoal-950 text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg">Active</div>
                <h3 className="text-xl font-bold text-white mb-2">Membership Status</h3>
                <p className="text-gray-400 text-sm mb-6">You are currently on the <strong className="text-white capitalize">{userSub?.plan ?? "Subscriber"}</strong> plan.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-charcoal-900/80 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Billing Amount</p>
                    <p className="text-xl font-bold text-white">{userSub?.plan === "yearly" ? "$490.00 / year" : "$49.00 / month"}</p>
                  </div>
                  <div className="p-4 bg-charcoal-900/80 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Next Renewal</p>
                    <p className="text-xl font-bold text-white">{userSub ? new Date(userSub.next_renewal_date).toLocaleDateString() : "—"}</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-7 bg-charcoal-800 rounded border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-400 italic tracking-tighter">VISA</div>
                    <div>
                      <p className="text-sm font-medium text-white">Visa ending in 4242</p>
                      <p className="text-xs text-gray-500">Expires 12/28</p>
                    </div>
                  </div>
                  <button className="text-xs text-gold-400 hover:text-gold-300 font-medium">Edit</button>
                </div>

                <div className="flex space-x-4">
                  <Button variant="secondary" size="sm">Manage Billing</Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">Cancel Subscription</Button>
                </div>
              </GlassCard>

              <div className="grid grid-cols-2 gap-6">
                <GlassCard className="p-6 border-white/5 text-center">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><Calendar size={18} /></div>
                  <h4 className="text-white font-bold mb-1">Billing History</h4>
                  <p className="text-xs text-gray-500">View and download your past invoices.</p>
                </GlassCard>
                <GlassCard className="p-6 border-white/5 text-center cursor-not-allowed opacity-50">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><CreditCard size={18} /></div>
                  <h4 className="text-white font-bold mb-1">Tax Settings</h4>
                  <p className="text-xs text-gray-500">Manage tax ID and exemptions.</p>
                </GlassCard>
              </div>
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

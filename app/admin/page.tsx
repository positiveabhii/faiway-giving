"use client";

import React, { useMemo } from "react";
import { useAppData } from "@/context/AppDataContext";
import { Users, DollarSign, Heart, ShieldAlert, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardHome() {
  const { users, prizePools, verifications, charityDonations, billingTransactions, isLoading } = useAppData();

  // 1. Core KPIs
  const subscriberCount = useMemo(() => users.filter(u => u.role === 'subscriber' && u?.status === 'active').length, [users]);
  const activePrizePoolTotal = useMemo(() => prizePools[0]?.total_amount || 0, [prizePools]);
  const totalCharityDisbursed = useMemo(() => charityDonations.reduce((sum, d) => sum + Number(d.amount), 0), [charityDonations]);
  const pendingVerificationsCount = useMemo(() => verifications.filter(v => v.status === 'pending').length, [verifications]);

  // 2. Trend Calculations (Last 6 Months)
  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    const subscribersTrend = [];
    const revenueTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleString('default', { month: 'short' });
      months.push(mName);

      // New subscribers this month
      const newSubs = users.filter(u => {
        const cAt = new Date(u.created_at);
        return cAt.getMonth() === d.getMonth() && cAt.getFullYear() === d.getFullYear() && u.role === 'subscriber';
      }).length;
      subscribersTrend.push(newSubs);

      // Real Revenue from billing transactions
      const monthRev = billingTransactions.reduce((sum, t) => {
        const bAt = new Date(t.billing_date);
        if (bAt.getMonth() === d.getMonth() && bAt.getFullYear() === d.getFullYear()) {
          return sum + Number(t.amount);
        }
        return sum;
      }, 0);
      revenueTrend.push(monthRev);
    }

    return { months, subscribersTrend, revenueTrend };
  }, [users, billingTransactions]);

  const maxRevenue = Math.max(...chartData.revenueTrend, 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold-400" size={32} />
      </div>
    );
  }

  const stats = [
    { label: "Total Subscribers", value: subscriberCount.toLocaleString(), icon: Users, color: "text-blue-400" },
    { label: "Active Prize Pool", value: `$${activePrizePoolTotal.toLocaleString()}`, icon: DollarSign, color: "text-gold-400" },
    { label: "Charity Disbursed", value: `$${totalCharityDisbursed.toLocaleString()}`, icon: Heart, color: "text-emerald-400" },
    { label: "Pending Verifications", value: pendingVerificationsCount, icon: ShieldAlert, color: "text-amber-400" }
  ];

  return (
    <div className="space-y-6">

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-charcoal-900 border border-white/5 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-charcoal-950 border border-white/5 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Real Data Trend Chart */}
        <div className="lg:col-span-2 bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">Monthly Revenue Inflow</h3>
            <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Last 6 Months (Live)</div>
          </div>

          <div className="h-64 flex items-end justify-between px-2 pb-6 border-b border-white/5 relative">
            {chartData.revenueTrend.every(v => v === 0) ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm italic">
                Insufficient historical platform data
              </div>
            ) : (
              <>
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-600">
                  <span>${maxRevenue.toLocaleString()}</span>
                  <span>${(maxRevenue / 2).toLocaleString()}</span>
                  <span>$0</span>
                </div>

                <div className="w-full pl-12 h-full flex items-end justify-between">
                  {chartData.revenueTrend.map((val, i) => {
                    const height = (val / maxRevenue) * 100;
                    return (
                      <div key={i} className="w-1/12 bg-gold-500/20 hover:bg-gold-500/40 border-t-2 border-gold-500 transition-all duration-500 rounded-t relative group" style={{ height: `${Math.max(height, 2)}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-950 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 border border-white/10 shadow-xl">
                          ${val.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-between pl-12 pt-4 text-[10px] text-gray-500 font-medium">
            {chartData.months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Real Action Required */}
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Action Required</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded ${pendingVerificationsCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {pendingVerificationsCount} Pending
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {verifications.filter(v => v.status === 'pending').map(v => {
              const winnerUser = users.find(u => u.id === v.user_id);
              return (
                <div key={v.id} className="bg-charcoal-950 p-4 rounded-lg border border-white/5 group hover:border-gold-500/30 transition-colors">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-bold text-white">{winnerUser?.first_name || 'Member'} {winnerUser?.last_name || ''}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-gray-500">Verification Request</p>
                    <Link href="/admin/winners">
                      <button className="text-[10px] font-bold text-white bg-white/5 hover:bg-gold-500 hover:text-charcoal-950 px-3 py-1.5 rounded transition-all uppercase tracking-tighter">Review</button>
                    </Link>
                  </div>
                </div>
              );
            })}
            {pendingVerificationsCount === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <ShieldAlert size={40} className="mb-2 text-gray-600" />
                <p className="text-gray-500 text-sm">All clear! No pending items.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useAppData } from "@/hooks/useAppData";
import { Users, DollarSign, Heart, ShieldAlert, TrendingUp, Loader2 } from "lucide-react";

export default function AdminDashboardHome() {
  const { users, prizePools, charities, verifications, isLoading } = useAppData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold-400" size={32} />
      </div>
    );
  }

  const activePrizePool = prizePools[0]?.total_amount || 0;
  const totalCharityDisbursed = charities.reduce((sum, c) => sum + Number(c.total_raised), 0);
  const pendingVerifications = verifications.filter(v => v.status === 'pending').length;

  const stats = [
    { label: "Total Subscribers", value: users.filter(u => u.role === 'subscriber').length.toLocaleString(), icon: Users, color: "text-blue-400" },
    { label: "Active Prize Pool", value: `$${activePrizePool.toLocaleString()}`, icon: DollarSign, color: "text-gold-400" },
    { label: "Charity Disbursed", value: `$${totalCharityDisbursed.toLocaleString()}`, icon: Heart, color: "text-emerald-400" },
    { label: "Pending Verifications", value: pendingVerifications, icon: ShieldAlert, color: "text-amber-400" }
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
                {i === 0 && (
                  <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    <TrendingUp size={12} />
                    <span>+12%</span>
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Chart Mock (Stateless for now) */}
        <div className="lg:col-span-2 bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">Platform Growth & Revenue</h3>
            <select className="bg-charcoal-950 border border-white/10 rounded px-3 py-1 text-xs text-gray-400 focus:outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between px-2 pb-6 border-b border-white/5 relative">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-600">
              <span>$2.5M</span>
              <span>$1.5M</span>
              <span>$0.5M</span>
            </div>
            
            <div className="w-full pl-12 h-full flex items-end justify-between">
              {[40, 50, 45, 60, 75, 90].map((h, i) => (
                <div key={i} className="w-1/12 bg-white/10 hover:bg-white/20 transition-colors rounded-t relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-950 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 border border-white/10 shadow-xl">
                    ${(h * 2.5).toFixed(1)}M
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pl-12 pt-4 text-xs text-gray-500">
            <span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
          </div>
        </div>

        {/* Action Required: Verifications */}
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Action Required</h3>
            <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded">{pendingVerifications} Pending</span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {verifications.filter(v => v.status === 'pending').map(v => {
              const winnerUser = users.find(u => u.id === v.user_id);
              return (
                <div key={v.id} className="bg-charcoal-950 p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-bold text-white">{winnerUser?.first_name || 'Unknown'} {winnerUser?.last_name || ''}</p>
                    <p className="text-sm font-bold text-gold-400">Review</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-gray-500">Verification Pending</p>
                    <button className="text-xs font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors">Review</button>
                  </div>
                </div>
              );
            })}
            {pendingVerifications === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">All clear! No pending items.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

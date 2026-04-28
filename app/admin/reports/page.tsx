"use client";

import React, { useMemo } from "react";
import { useAppData } from "@/context/AppDataContext";
import { BarChart3, LineChart, PieChart, Loader2, AlertCircle } from "lucide-react";

export default function AdminReportsPage() {
  const { users, prizePools, charities, draws, userCharitySelections, isLoading } = useAppData();

  // 1. User Acquisition Analytics
  const acquisitionData = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = users.filter(u => {
        const cAt = new Date(u.created_at);
        return cAt.getMonth() === d.getMonth() && cAt.getFullYear() === d.getFullYear() && u.role === 'subscriber';
      }).length;
      result.push({
        month: d.toLocaleString('default', { month: 'short' }),
        count
      });
    }
    return result;
  }, [users]);

  // 2. Charity Allocation Distribution
  const charityDistribution = useMemo(() => {
    const totalSelections = userCharitySelections.length;
    if (totalSelections === 0) return [];

    const counts: Record<string, number> = {};
    userCharitySelections.forEach(s => {
      counts[s.charity_id] = (counts[s.charity_id] || 0) + 1;
    });

    return Object.entries(counts).map(([id, count]) => {
      const charity = charities.find(c => c.id === id);
      return {
        name: charity?.name || "Unknown",
        percentage: Math.round((count / totalSelections) * 100),
        count
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [charities, userCharitySelections]);

  // 3. Prize Pool Trajectory
  const prizeTrajectory = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Aggregate prize pools created in this month
      const total = prizePools.reduce((sum, p) => {
        const cAt = new Date(p.created_at);
        if (cAt.getMonth() === d.getMonth() && cAt.getFullYear() === d.getFullYear()) {
          return sum + p.total_amount;
        }
        return sum;
      }, 0);
      result.push({
        month: d.toLocaleString('default', { month: 'short' }),
        amount: total
      });
    }
    return result;
  }, [prizePools]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold-400" size={32} />
      </div>
    );
  }

  const maxAcquisition = Math.max(...acquisitionData.map(d => d.count), 5);
  const maxPrize = Math.max(...prizeTrajectory.map(d => d.amount), 1000);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">System Analytics (Live)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real User Acquisition */}
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <LineChart className="text-blue-400" size={18} />
              <span>Subscriber Acquisition</span>
            </h3>
          </div>

          <div className="h-64 flex items-end justify-between px-2 pb-6 border-b border-white/5 relative">
            {acquisitionData.every(d => d.count === 0) ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs italic">Insufficient historical platform data</div>
            ) : (
              <>
                <div className="w-full h-full flex items-end justify-between pt-8">
                  {acquisitionData.map((d, i) => {
                    const height = (d.count / maxAcquisition) * 100;
                    return (
                      <div key={i} className="w-1/12 bg-blue-500/20 rounded-t relative group" style={{ height: `${Math.max(height, 5)}%` }}>
                        <div className="absolute -top-1 w-full h-1 bg-blue-500 rounded-full"></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 border border-white/10">
                          {d.count} Users
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-between pt-4 text-[10px] text-gray-500 font-medium">
            {acquisitionData.map(d => <span key={d.month}>{d.month}</span>)}
          </div>
        </div>

        {/* Real Charity Distribution */}
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <PieChart className="text-emerald-400" size={18} />
              <span>Charity Allocation</span>
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8 h-64 overflow-hidden">
            {charityDistribution.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-600 text-xs italic">
                <AlertCircle size={24} className="mb-2" />
                <span>No member allocations recorded</span>
              </div>
            ) : (
              <>
                <div className="w-40 h-40 rounded-full border-[12px] border-emerald-500/10 relative flex items-center justify-center">
                  <div className="absolute inset-[-12px] rounded-full border-[12px] border-emerald-500 border-l-transparent border-b-transparent animate-pulse"></div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{charityDistribution.length}</p>
                    <p className="text-gray-500 text-[10px] uppercase">Charities</p>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-56 pr-2 custom-scrollbar">
                  {charityDistribution.map((item, i) => (
                    <div key={i} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-400' : 'bg-emerald-300'}`}></div>
                          <span className="text-gray-300 truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="text-white font-bold">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-400' : 'bg-emerald-300'}`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Real Prize Pool Trajectory */}
        <div className="lg:col-span-2 bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <BarChart3 className="text-gold-400" size={18} />
              <span>Monthly Prize Pool Allocation</span>
            </h3>
          </div>

          <div className="h-64 flex items-end justify-between px-2 pb-6 border-b border-white/5 relative">
            {prizeTrajectory.every(d => d.amount === 0) ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs italic">Insufficient historical platform data</div>
            ) : (
              <>
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-600">
                  <span>${maxPrize.toLocaleString()}</span>
                  <span>${(maxPrize/2).toLocaleString()}</span>
                  <span>$0</span>
                </div>

                <div className="w-full pl-12 h-full flex items-end justify-between">
                  {prizeTrajectory.map((d, i) => {
                    const height = (d.amount / maxPrize) * 100;
                    return (
                      <div key={i} className="w-1/12 bg-gold-500/20 hover:bg-gold-500/40 border-t-2 border-gold-500 transition-all duration-500 rounded-t relative group" style={{ height: `${Math.max(height, 2)}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 border border-white/10">
                          ${d.amount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-between pl-12 pt-4 text-[10px] text-gray-500 font-medium">
            {prizeTrajectory.map(d => <span key={d.month}>{d.month}</span>)}
          </div>
        </div>

      </div>
    </div>
  );
}

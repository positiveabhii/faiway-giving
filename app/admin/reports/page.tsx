"use client";

import React from "react";
import { mockAdminStats } from "@/lib/mockData";
import { BarChart3, LineChart, PieChart } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">System Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* User Growth Line Chart Mock */}
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <LineChart className="text-blue-400" size={18} />
              <span>User Acquisition</span>
            </h3>
          </div>

          <div className="h-64 flex items-end justify-between px-2 pb-6 border-b border-white/5 relative">
            <div className="w-full h-full flex items-end justify-between pt-8">
              {/* Mock Line Nodes (rendered as bars for simplicity of mock) */}
              {[20, 35, 40, 55, 70, 85].map((h, i) => (
                <div key={i} className="w-1/12 bg-blue-500/20 rounded-t relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-1 w-full h-1 bg-blue-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4 text-xs text-gray-500">
            <span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
          </div>
        </div>

        {/* Charity Distribution Pie Mock */}
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <PieChart className="text-emerald-400" size={18} />
              <span>Charity Allocation</span>
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8 h-64">
            <div className="w-48 h-48 rounded-full border-[16px] border-emerald-500 relative flex items-center justify-center">
              {/* Fake segments using borders */}
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-emerald-400 opacity-50 clip-half"></div>
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-emerald-300 opacity-30 clip-quarter"></div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{mockAdminStats.charityTotals}</p>
                <p className="text-gray-500 text-xs">Total Disbursed</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-gray-300">Heart Drive Initiative (45%)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-gray-300">Green Horizons (35%)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
                <span className="text-gray-300">Fairway Scholars (20%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prize Pool Analytics */}
        <div className="lg:col-span-2 bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <BarChart3 className="text-gold-400" size={18} />
              <span>Monthly Prize Pool Trajectory</span>
            </h3>
          </div>

          <div className="h-64 flex items-end justify-between px-2 pb-6 border-b border-white/5 relative">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-600">
              <span>$3.0M</span>
              <span>$2.0M</span>
              <span>$1.0M</span>
            </div>

            <div className="w-full pl-12 h-full flex items-end justify-between">
              {[30, 45, 60, 50, 75, 95].map((h, i) => (
                <div key={i} className="w-1/12 bg-gold-500/20 hover:bg-gold-500/40 border-t-2 border-gold-500 transition-colors rounded-t relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-950 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 border border-white/10">
                    ${(h * 0.03).toFixed(1)}M
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pl-12 pt-4 text-xs text-gray-500">
            <span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr (Est)</span>
          </div>
        </div>

      </div>
    </div>
  );
}

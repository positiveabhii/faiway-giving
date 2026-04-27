"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { mockUser, mockCharities } from "@/lib/mockData";
import { Heart, Edit2, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyCharityPage() {
  const { charity } = mockUser;
  const [contribution, setContribution] = useState(charity.contributionPercentage);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSave = () => {
    setIsEditing(false);
    setSuccess("Contribution percentage updated successfully.");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER / IMPACT SUMMARY */}
      <GlassCard className="p-8 border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 mb-6 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Your Philanthropic Impact</h2>
          <p className="text-gray-400">Together, we are making a difference in the world.</p>
        </div>
        
        <div className="relative z-10 text-center md:text-right">
          <p className="text-emerald-400 uppercase tracking-widest text-sm font-bold mb-1">Total Generated</p>
          <p className="text-5xl font-bold text-white">{charity.totalDonated}</p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SELECTED CHARITY PROFILE */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-0 overflow-hidden border-white/5 flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 h-64 md:h-auto relative">
              <img src={charity.selected.image} alt={charity.selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-charcoal-900 to-transparent"></div>
            </div>
            
            <div className="w-full md:w-3/5 p-8 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">{charity.selected.name}</h3>
                <Link href="/charities" className="text-sm text-gold-400 hover:text-gold-300 flex items-center space-x-1">
                  <Edit2 size={14} />
                  <span>Change</span>
                </Link>
              </div>
              <div className="flex space-x-2 mb-4">
                {charity.selected.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {charity.selected.mission}
              </p>
              
              <div className="bg-charcoal-900/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Platform Total Raised for this Charity</p>
                <p className="text-emerald-400 font-bold text-xl">{charity.selected.stats.totalRaised}</p>
              </div>
            </div>
          </GlassCard>

          {/* MOCK GRAPH AREA */}
          <GlassCard className="p-8 border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Donation Trajectory</h3>
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full">
                <TrendingUp size={16} />
                <span>+12.4% this year</span>
              </div>
            </div>
            
            <div className="h-48 border-b border-l border-white/10 relative flex items-end justify-between px-2 pb-2">
              {/* Mock Bar Chart */}
              {[40, 65, 45, 80, 55, 90, 70, 100].map((height, i) => (
                <div key={i} className="w-[8%] bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-t-sm transition-colors relative group" style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${height * 15}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </GlassCard>
        </div>

        {/* CONTROLS */}
        <div className="space-y-8">
          <GlassCard className="p-6 border-white/5">
            <h3 className="text-lg font-bold text-white mb-6">Winnings Contribution</h3>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500/30 mb-4 relative">
                <div className="absolute inset-2 rounded-full border-4 border-emerald-500 border-l-transparent border-b-transparent transform rotate-45"></div>
                <span className="text-3xl font-bold text-emerald-400">{contribution}%</span>
              </div>
              <p className="text-gray-400 text-sm">Of any jackpot won is directly routed to {charity.selected.name}.</p>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input 
                  type="range" 
                  min="5" max="50" step="5"
                  value={contribution}
                  onChange={(e) => setContribution(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setIsEditing(false); setContribution(charity.contributionPercentage); }}>Cancel</Button>
                  <Button className="flex-1" onClick={handleSave}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {success && <p className="text-emerald-400 text-xs text-center mb-2">{success}</p>}
                <Button variant="secondary" fullWidth onClick={() => setIsEditing(true)}>
                  Adjust Percentage
                </Button>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 border-gold-500/20 text-center bg-gradient-to-b from-charcoal-900 to-charcoal-950">
            <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-400">
              <DollarSign size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Direct Donation</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Want to make an immediate impact outside of the draw system? Make a secure, tax-deductible donation now.
            </p>
            <Button fullWidth className="bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 border-none glow-none">
              Donate Now
            </Button>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

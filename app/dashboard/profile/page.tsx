"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { mockUser } from "@/lib/mockData";
import { User, CreditCard, Bell, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Settings updated successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <img src={mockUser.avatar} alt={mockUser.name} className="w-24 h-24 rounded-full object-cover border-4 border-charcoal-800 shadow-xl" />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-charcoal-950 hover:bg-gold-400 transition-colors border-2 border-charcoal-950">
            <User size={14} />
          </button>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{mockUser.name}</h2>
          <p className="text-gray-400">{mockUser.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium flex items-center space-x-3">
            <User size={18} className="text-gold-400" />
            <span>Personal Info</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center space-x-3">
            <CreditCard size={18} />
            <span>Billing & Plan</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center space-x-3">
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center space-x-3">
            <Shield size={18} />
            <span>Security</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="p-8 border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" defaultValue={mockUser.name.split(' ')[0]} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" defaultValue={mockUser.name.split(' ')[1]} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" defaultValue={mockUser.email} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" disabled />
                <p className="text-xs text-gray-500 mt-2">Email address cannot be changed directly. Contact support.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
              </div>

              {successMsg && (
                <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-lg text-sm border border-emerald-500/20">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gold-500 text-charcoal-950 text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg">Active</div>
            <h3 className="text-xl font-bold text-white mb-2">Current Membership</h3>
            <p className="text-gray-400 text-sm mb-6">You are on the <strong className="text-white">{mockUser.subscription.plan}</strong> plan.</p>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-charcoal-900/80 rounded-xl border border-white/5 mb-6">
              <div>
                <p className="text-white font-medium">$490.00 / year</p>
                <p className="text-gray-500 text-sm">Next billing date: {new Date(mockUser.subscription.nextRenewal).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className="flex items-center space-x-2 text-gray-300 text-sm px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <CreditCard size={14} className="text-gray-400" />
                  <span>Visa ending in 4242</span>
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="secondary" size="sm">Manage Billing</Button>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">Cancel Plan</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

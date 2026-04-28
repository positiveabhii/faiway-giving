"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAppData } from "@/hooks/useAppData";
import { Search, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Charity } from "@/types/database";

export default function CharitiesPage() {
  const { charities, charityDonations, isLoading } = useAppData();
  const [search, setSearch] = useState("");
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-heading font-bold text-white mb-6">Make An <span className="gold-gradient-text">Impact</span></h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
              Browse our vetted global charity partners. Your subscription directly funds their critical missions.
            </p>
            
            <div className="max-w-xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-500" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by name or cause (e.g., Environment, Education)"
                className="w-full bg-charcoal-900 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-gold-400" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCharities.map((charity, i) => (
                <GlassCard key={charity.id} animate delay={i * 0.1} className="p-0 overflow-hidden flex flex-col">
                  <div className="h-56 relative overflow-hidden group">
                    <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 flex space-x-2">
                      {charity.tags.map(tag => (
                        <span key={tag} className="bg-charcoal-900/80 backdrop-blur-md text-gold-400 text-xs font-medium px-3 py-1 rounded-full border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-2">{charity.name}</h3>
                    <p className="text-gray-400 text-sm mb-6 flex-1">{charity.mission}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 uppercase">Raised</p>
                        <p className="text-emerald-400 font-medium">${charityDonations.filter(d => d.charity_id === charity.id).reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 uppercase">Events</p>
                        <p className="text-white font-medium">{charity.upcoming_events} Upcoming</p>
                      </div>
                    </div>
                    
                    <Button variant="secondary" fullWidth onClick={() => setSelectedCharity(charity)}>
                      View Details
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Charity Detail Modal */}
      <AnimatePresence>
        {selectedCharity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
              onClick={() => setSelectedCharity(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-charcoal-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="h-64 relative">
                <img src={selectedCharity.image_url} alt={selectedCharity.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 to-transparent"></div>
                <button
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  onClick={() => setSelectedCharity(null)}
                >
                  ✕
                </button>
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-12 right-8 w-24 h-24 bg-charcoal-900 rounded-full flex items-center justify-center border-4 border-charcoal-900 shadow-xl">
                  <Heart className="text-emerald-500" size={40} />
                </div>
                
                <h2 className="text-3xl font-heading font-bold text-white mb-2">{selectedCharity.name}</h2>
                <div className="flex space-x-2 mb-6">
                  {selectedCharity.tags.map(tag => (
                    <span key={tag} className="text-gold-400 text-sm font-medium">{tag}</span>
                  ))}
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-8">
                  {selectedCharity.mission} Our platform members have continually supported this initiative, driving massive impact across local communities and global ecosystems. Join the club and designate this charity to allocate a portion of the monthly prize pool to their ongoing efforts.
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button className="flex-1">Select for my Subscription</Button>
                  <Button variant="outline" className="flex-1">Make Direct Donation</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

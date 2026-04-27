"use client";

import React, { useState } from "react";
import { SplashIntro } from "@/components/ui/SplashIntro";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Trophy, Heart, Calendar, ArrowRight, Star, ChevronDown } from "lucide-react";
import Link from "next/link";
import { mockCharities } from "@/lib/mockData";

export default function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col selection:bg-gold-500/30">
      {!introComplete && <SplashIntro onComplete={() => setIntroComplete(true)} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col"
      >
        <Navbar />

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-charcoal-800 via-charcoal-950 to-charcoal-950 z-0"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={introComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight mb-6"
            >
              Play Better. <br className="md:hidden" />
              <span className="gold-gradient-text">Win Bigger.</span> <br className="md:hidden" />
              Give Back.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={introComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The exclusive membership club that transforms your golf scores into massive cash prizes and meaningful charitable impact.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={introComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link href="/signup">
                <Button size="lg" className="px-10 py-4 text-lg">
                  Subscribe Now
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2">
                  <span>Explore the Platform</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-charcoal-900 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">The Ecosystem</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">A seamless blend of performance, reward, and philanthropy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GlassCard animate delay={0.2} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Calendar className="text-gold-400" size={32} />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">1. Subscribe & Play</h3>
                <p className="text-gray-400 leading-relaxed">Join the club, play your regular rounds, and enter your scores into our premium dashboard.</p>
              </GlassCard>

              <GlassCard animate delay={0.4} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">2. Make an Impact</h3>
                <p className="text-gray-400 leading-relaxed">A portion of every entry pool is instantly dedicated to a vetted charity of your choice.</p>
              </GlassCard>

              <GlassCard animate delay={0.6} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Trophy className="text-gold-400" size={32} />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">3. Win the Draw</h3>
                <p className="text-gray-400 leading-relaxed">Your scores become your lucky numbers in our monthly multi-million dollar prize draws.</p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* PRIZE EXPLANATION */}
        <section className="py-24 bg-charcoal-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 pr-0 md:pr-12 mb-12 md:mb-0">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <h2 className="text-4xl font-heading font-bold text-white mb-6">Unprecedented Rewards.</h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Your 5 best scores each month generate your draw ticket. Match all 5 numbers to win the grand jackpot. Match 4 or 3 numbers for secondary premium payouts.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 bg-charcoal-900/50 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold-400 font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">Jackpot Match</h4>
                      <p className="text-gray-400 text-sm">Estimated $2.5M+ payout</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-charcoal-900/50 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">Secondary Match</h4>
                      <p className="text-gray-400 text-sm">Estimated $50,000 payout</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 relative">
              <GlassCard className="relative z-10 aspect-square flex flex-col items-center justify-center text-center p-8 border-gold-500/20 glow-gold">
                <p className="text-gold-400 font-medium uppercase tracking-widest mb-2">Current Estimated Jackpot</p>
                <h3 className="text-6xl md:text-7xl font-bold text-white mb-4">$2,500,000</h3>
                <p className="text-gray-400 mb-8">Drawing in 4 Days 12 Hours</p>
                <Button size="lg" className="w-full sm:w-auto">Enter Your Scores</Button>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* CHARITY IMPACT */}
        <section className="py-24 bg-charcoal-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-heading font-bold text-white mb-4">Elevate Your Impact</h2>
                <p className="text-gray-400 text-lg">We partner with leading global charities. You decide where your contribution goes.</p>
              </div>
              <Link href="/charities" className="mt-6 md:mt-0 text-gold-400 hover:text-gold-300 font-medium flex items-center space-x-2">
                <span>View Directory</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mockCharities.map((charity, index) => (
                <GlassCard key={charity.id} animate delay={0.2 * index} className="p-0 overflow-hidden flex flex-col">
                  <div className="h-48 relative overflow-hidden">
                    <img src={charity.image} alt={charity.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 to-transparent"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">{charity.name}</h3>
                    <p className="text-gray-400 text-sm mb-6 flex-1">{charity.mission}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Raised</p>
                        <p className="text-emerald-400 font-medium">{charity.stats.totalRaised}</p>
                      </div>
                      <Button variant="outline" size="sm">Select</Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-24 bg-charcoal-950 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">Exclusive Access</h2>
            <p className="text-gray-400 text-lg mb-12">Choose the membership that suits your ambition.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <GlassCard animate delay={0.2} className="text-left p-8 border-white/5">
                <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-5xl font-bold text-white">$49</span>
                  <span className="text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3 text-gray-300">
                    <Star size={18} className="text-gold-500" />
                    <span>Monthly Draw Entry</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-300">
                    <Star size={18} className="text-gold-500" />
                    <span>Charity Selection</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-300">
                    <Star size={18} className="text-gold-500" />
                    <span>Basic Dashboard</span>
                  </li>
                </ul>
                <Button fullWidth variant="secondary">Subscribe Monthly</Button>
              </GlassCard>

              <GlassCard animate delay={0.4} className="text-left p-8 border-gold-500/30 relative glow-gold overflow-hidden">
                <div className="absolute top-4 right-4 bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Premium
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Annually</h3>
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-5xl font-bold text-white">$490</span>
                  <span className="text-gray-400">/yr</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3 text-gray-300">
                    <Star size={18} className="text-gold-500" />
                    <span>Monthly Draw Entry (12x)</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-300">
                    <Star size={18} className="text-gold-500" />
                    <span>Multiplier Bonuses</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-300">
                    <Star size={18} className="text-gold-500" />
                    <span>Premium Dashboard & Concierge</span>
                  </li>
                </ul>
                <Button fullWidth>Subscribe Annually</Button>
              </GlassCard>
            </div>
          </div>
        </section>

        <Footer />
      </motion.div>
    </main>
  );
}

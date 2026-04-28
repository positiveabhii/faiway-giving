"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SplashIntro } from "@/components/ui/SplashIntro";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Trophy, Heart, Calendar, ArrowRight, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { session, initialized, user } = useAuth();
  const { draws, users, charities, isLoading: dataLoading } = useAppData();
  const router = useRouter();
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (initialized && session) {
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [initialized, session, user, router]);

  const landingStats = useMemo(() => {
    const totalJackpot = draws.reduce((sum, d) => sum + d.total_jackpot, 0);
    const subscriberCount = users.filter(u => u.role === 'subscriber').length;
    const totalDonated = charities.reduce((sum, c) => sum + Number(c.total_raised), 0);
    const nextDraw = draws.find(d => d.status === "upcoming");

    return [
      { label: "Total Jackpot", value: totalJackpot > 0 ? `$${(totalJackpot / 1000000).toFixed(1)}M+` : "$0.0M", icon: Trophy },
      { label: "Members", value: subscriberCount > 0 ? `${(subscriberCount / 1000).toFixed(1)}k+` : "0+", icon: Star },
      { label: "Donated", value: totalDonated > 0 ? `$${(totalDonated / 1000).toFixed(0)}k+` : "$0k", icon: Heart },
      { label: "Next Draw", value: nextDraw ? nextDraw.month_name : "TBD", icon: Calendar }
    ];
  }, [draws, users, charities]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-gold-400" size={40} />
        <p className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">Initializing Fairway Giving</p>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-gold-400" size={40} />
      </div>
    );
  }

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

        {/* STATS STRIP */}
        <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {landingStats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="flex justify-center mb-3">
                    <stat.icon className="text-gold-500 group-hover:scale-110 transition-transform duration-300" size={24} />
                  </div>
                  <p className="text-2xl md:text-3xl font-heading font-bold text-white mb-1 tracking-tight">
                    {dataLoading ? "..." : stat.value}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </motion.div>
    </main>
  );
}

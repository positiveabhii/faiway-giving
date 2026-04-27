"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { UserPlus, Edit3, Ticket, Heart, Trophy } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Premium Subscription",
      description: "Join the exclusive FairwayGiving club. Choose a monthly or annual membership that unlocks the dashboard, enables score tracking, and sets your foundation."
    },
    {
      icon: Edit3,
      title: "2. Record Your Scores",
      description: "Play your regular rounds anywhere. Enter your scores into our premium dashboard. Every score submitted validates your performance."
    },
    {
      icon: Ticket,
      title: "3. Generate Your Draw Numbers",
      description: "At the end of the month, your top 5 best scores form your exclusive Draw Ticket. No random numbers—your skill defines your luck."
    },
    {
      icon: Heart,
      title: "4. Empower Charities",
      description: "A defined percentage of the total entry pool is automatically routed to your chosen charity. Your gameplay makes an instant global impact."
    },
    {
      icon: Trophy,
      title: "5. Win the Jackpot",
      description: "The monthly draw selects 5 winning numbers. Match all 5 to claim the grand jackpot. Match 3 or 4 for lucrative secondary premium payouts."
    }
  ];

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-5xl font-heading font-bold text-white mb-6">The Path to <span className="gold-gradient-text">Victory</span></h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A transparent, elegant process that converts your time on the green into life-changing rewards and profound charitable contributions.
            </p>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10 md:left-1/2 md:-ml-px"></div>

            <div className="space-y-16">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                const Icon = step.icon;
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col md:flex-row items-start md:items-center"
                  >
                    {/* Content for even on left, odd on right (desktop) */}
                    <div className={`pl-20 md:pl-0 w-full md:w-1/2 ${isEven ? 'md:pr-16 md:text-right md:order-1' : 'md:pl-16 md:order-3'}`}>
                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{step.description}</p>
                    </div>

                    {/* Icon centered */}
                    <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-16 h-16 rounded-full bg-charcoal-900 border-2 border-gold-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] z-10 md:order-2">
                      <Icon className="text-gold-400" size={24} />
                    </div>

                    {/* Empty div to balance flex on desktop */}
                    <div className="hidden md:block md:w-1/2 md:order-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

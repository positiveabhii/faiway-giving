"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal-950 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-heading font-bold text-white tracking-wide">
              Fairway<span className="gold-gradient-text">Giving</span>
            </span>
          </Link>
          <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
            A premium subscription platform that rewards your golf performance while making a meaningful impact on charities worldwide.
          </p>
          {/* <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
              <Mail size={20} />
            </a>
          </div> */}
        </div>

        <div>
          <h3 className="text-white font-medium mb-6">Platform</h3>
          <ul className="space-y-4">
            <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
            <li><Link href="/draws" className="text-gray-400 hover:text-white transition-colors">Prize Draws</Link></li>
            <li><Link href="/charities" className="text-gray-400 hover:text-white transition-colors">Charity Directory</Link></li>
            <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-6">Legal</h3>
          <ul className="space-y-4">
            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/rules" className="text-gray-400 hover:text-white transition-colors">Official Rules</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-500 text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} FairwayGiving. All rights reserved.
        </p>
        <p className="text-gray-500 text-sm">
          Play Better. Win Bigger. Give Back.
        </p>
      </div>
    </footer>
  );
}

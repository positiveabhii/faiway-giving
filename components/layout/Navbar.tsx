"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../ui/Button";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, session, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Charities", href: "/charities" },
    { name: "Prize Draws", href: "/draws" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-charcoal-950/80 backdrop-blur-lg border-white/10 shadow-lg py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 z-50">
          <span className="text-2xl font-heading font-bold text-white tracking-wide">
            Fairway<span className="gold-gradient-text">Giving</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-gold-400",
                pathname === link.href ? "text-gold-500" : "text-gray-300"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-6">
          {!session ? (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-950 px-5 py-2 rounded-full text-sm font-medium hover:from-gold-400 hover:to-gold-500 transition-all glow-gold-hover">
                Subscribe Now
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-6">
              <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors">
                Dashboard
              </Link>
              <button 
                onClick={() => logout()}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <User size={16} className="text-gold-400" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden z-50 text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-charcoal-900 border-b border-white/10 shadow-2xl py-6 px-6 flex flex-col space-y-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-gold-400"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-4">
              {!session ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-gold-500 text-charcoal-950 px-5 py-3 rounded-full text-center font-medium"
                  >
                    Subscribe Now
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gold-400"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-lg font-medium text-gray-400"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

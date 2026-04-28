"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Ticket, Heart, ShieldCheck, BarChart3, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip layout wrapper for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // This is a failsafe, but the server layout should have already handled this.
  if (!user) return null;

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Draw Engine", href: "/admin/draws", icon: Ticket },
    { name: "Charities", href: "/admin/charities", icon: Heart },
    { name: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-charcoal-950 border-r border-white/5 w-64">
      <div className="p-6 border-b border-white/5">
        <span className="text-xl font-heading font-bold text-white tracking-wide flex items-center space-x-2">
          <ShieldCheck className="text-gold-500" size={24} />
          <span>Fairway<span className="text-gray-400 font-normal">Admin</span></span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={18} className={isActive ? "text-gold-400" : ""} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span>Exit Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal-900 flex text-sm selection:bg-gold-500/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40 shadow-2xl">
        {renderSidebarContent()}
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-charcoal-950/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-white capitalize hidden sm:block">
              {pathname === '/admin' ? 'System Overview' : pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400 bg-charcoal-900 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium">System Nominal</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-gold-400 font-bold text-xs">
              {user?.first_name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden shadow-2xl"
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

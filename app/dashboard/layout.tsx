"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Edit3, Ticket, Trophy, Heart, Settings, LogOut, Menu, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, user, initialized, logout } = useAuth();
  const { notifications, subscriptions, draws } = useAppData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (initialized && !session) {
      router.replace("/login");
    }
  }, [initialized, session, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-gold-400" size={40} />
        <p className="text-gray-500 text-xs uppercase tracking-widest animate-pulse font-heading font-bold">Restoring Member Session</p>
      </div>
    );
  }

  if (!session) return null;

  const userNotifications = notifications.filter(n => n.user_id === session.user.id);
  const unreadCount = userNotifications.filter(n => !n.is_read).length;
  const userSub = subscriptions.find(s => s.user_id === session.user.id);
  const upcomingDraw = draws.find(d => d.status === "upcoming");

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Score Management", href: "/dashboard/scores", icon: Edit3 },
    { name: "Draw Participation", href: "/dashboard/draws", icon: Ticket },
    { name: "Winnings & Proof", href: "/dashboard/winnings", icon: Trophy },
    { name: "My Charity", href: "/dashboard/charity", icon: Heart },
    { name: "Settings", href: "/dashboard/profile", icon: Settings },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-charcoal-900 border-r border-white/5 w-64">
      <div className="p-6">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-heading font-bold text-white tracking-wide">
            Fairway<span className="gold-gradient-text">Giving</span>
          </span>
        </Link>
      </div>

      <div className="px-6 py-4 border-b border-white/5 flex items-center space-x-3 mb-4">
        <img src={user?.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"} alt={user?.first_name} className="w-10 h-10 rounded-full object-cover border border-gold-500/30" />
        <div>
          <p className="text-white text-sm font-bold">{user?.first_name} {user?.last_name}</p>
          <p className="text-gold-400 text-xs capitalize">{userSub?.plan || 'Member'}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gold-500/10 text-gold-400 font-medium border border-gold-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal-950 flex selection:bg-gold-500/30">
      <div className="hidden md:block fixed inset-y-0 left-0 z-40">
        {renderSidebarContent()}
      </div>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-charcoal-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-heading font-bold text-white capitalize hidden sm:block">
              {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center space-x-6 relative">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">Current Jackpot</p>
              <p className="text-gold-400 font-bold">${upcomingDraw?.total_jackpot.toLocaleString() || '0'}</p>
            </div>

            <button
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold-500 rounded-full border-2 border-charcoal-950"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-80 bg-charcoal-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-white font-medium">Notifications</h3>
                    <span className="text-xs text-gold-400">{unreadCount} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {userNotifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-white/5 ${!notif.is_read ? 'bg-gold-500/5' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-medium ${!notif.is_read ? 'text-gold-400' : 'text-gray-300'}`}>{notif.title}</h4>
                          <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-400">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

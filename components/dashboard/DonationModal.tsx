"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  charityName: string;
  charityId: string;
  onSubmit: (amount: number) => Promise<void>;
}

export function DonationModal({ isOpen, onClose, charityName, charityId, onSubmit }: DonationModalProps) {
  const [amount, setAmount] = useState<string>("25");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(val);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Donation failed:", err);
      setError(err.message || "An unexpected error occurred during your donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg z-10"
          >
            <GlassCard className="p-8 border-white/10 shadow-2xl overflow-hidden">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Your contribution to <span className="text-white font-medium">{charityName}</span> has been processed.
                    Together, we're making an impact.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Heart size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Make a Donation</h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-gray-400 text-sm mb-8">
                    Supporting <span className="text-white font-medium">{charityName}</span>. Your direct donation helps fund their mission directly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">Select or Enter Amount</label>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["10", "25", "50", "100", "250", "500"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-3 rounded-xl border transition-all duration-300 font-bold ${amount === val
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                              }`}
                          >
                            ${val}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <DollarSign size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Custom Amount"
                          className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">
                        {error}
                      </div>
                    )}

                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-start space-x-3">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        100% of your donation (minus processing fees) goes directly to the charity. You will receive a tax receipt via email.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 border-none text-lg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 size={20} className="animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        `Confirm $${amount} Donation`
                      )}
                    </Button>
                  </form>
                </>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

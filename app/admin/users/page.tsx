"use client";

import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Search, Edit, Ban, FileText, Loader2 } from "lucide-react";
import { updateAdminUser } from "@/lib/api/admin-users";

export default function AdminUsersPage() {
  const { users, subscriptions, refreshAll, isLoading } = useAppData();
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const filteredUsers = users.filter(u => 
    u.first_name.toLowerCase().includes(search.toLowerCase()) || 
    u.last_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (userId: string, currentStatus: "active" | "suspended") => {
    setActiveUserId(userId);
    setActionError("");
    try {
      await updateAdminUser({ user_id: userId, status: currentStatus === "active" ? "suspended" : "active" });
      await refreshAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update this user.");
    } finally {
      setActiveUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
        {actionError && <div className="mb-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">{actionError}</div>}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-charcoal-950 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal-950 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Plan</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center">Scores</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center">Wins</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Charity</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user: any) => {
                const sub = user.subscription;
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors text-xs">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-gray-400 font-bold text-xs overflow-hidden">
                          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-gray-500 text-[10px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div className="flex flex-col">
                          <span className="text-gray-300 capitalize">{sub.plan}</span>
                          <span className={`text-[10px] ${sub.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>{sub.status}</span>
                        </div>
                      ) : <span className="text-gray-500">None</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-medium">{user.total_scores}</td>
                    <td className="px-6 py-4 text-center text-gold-400 font-medium">{user.total_wins}</td>
                    <td className="px-6 py-4 text-gray-300 truncate max-w-[120px]" title={user.selected_charity}>{user.selected_charity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Inspect Scores">
                          <FileText size={14} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Edit Profile">
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id, user.status)}
                          disabled={activeUserId === user.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                          title={user.status === "active" ? "Suspend User" : "Reactivate User"}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-between items-center text-xs text-gray-500">
          <p>Showing {filteredUsers.length} results</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5">Previous</button>
            <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}

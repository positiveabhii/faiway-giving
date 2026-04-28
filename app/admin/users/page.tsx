"use client";

import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Search, Edit, Ban, FileText, Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const { users, subscriptions, isLoading } = useAppData();
  const [search, setSearch] = useState("");

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const filteredUsers = users.filter(u => 
    u.first_name.toLowerCase().includes(search.toLowerCase()) || 
    u.last_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
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
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const sub = subscriptions.find(s => s.user_id === user.id);
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-gray-400 font-bold text-xs overflow-hidden">
                          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 capitalize">{sub?.plan || 'None'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded capitalize ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Inspect Scores">
                          <FileText size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Edit Profile">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Suspend User">
                          <Ban size={16} />
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

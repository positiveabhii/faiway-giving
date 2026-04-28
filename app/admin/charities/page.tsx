"use client";

import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import * as charityService from "@/lib/supabase/services/charity.service";
import { Search, Plus, Edit2, Trash2, Star, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminCharitiesPage() {
  const { charities, refreshAll, isLoading } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<any>(null);
  const [search, setSearch] = useState("");

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const filteredCharities = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (charity: any) => {
    setCurrentEdit(charity);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentEdit({
      name: "",
      mission: "",
      image_url: "",
      tags: [],
      is_spotlight: false,
      total_raised: 0,
      upcoming_events: 0
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEdit.id) {
        await charityService.updateCharity(currentEdit.id, currentEdit);
      } else {
        await charityService.createCharity(currentEdit);
      }
      setIsEditing(false);
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this charity?")) {
      await charityService.deleteCharity(id);
      refreshAll();
    }
  };

  return (
    <div className="space-y-6">
      
      {!isEditing ? (
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-xl font-bold text-white">Charity Partners</h2>
            <div className="flex w-full md:w-auto space-x-4">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50"
                />
              </div>
              <button 
                onClick={handleAddNew}
                className="bg-white hover:bg-gray-200 text-charcoal-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Partner</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharities.map((charity, index) => (
              <div key={charity.id} className="bg-charcoal-950 border border-white/5 rounded-xl overflow-hidden flex flex-col group relative">
                {charity.is_spotlight && (
                  <div className="absolute top-2 right-2 bg-gold-500 text-charcoal-950 text-xs font-bold px-2 py-1 rounded z-10 flex items-center space-x-1 shadow-lg">
                    <Star size={12} fill="currentColor" />
                    <span>Spotlight</span>
                  </div>
                )}
                
                <div className="h-40 relative">
                  <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 to-transparent"></div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-white font-bold text-lg mb-1">{charity.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4">{charity.mission}</p>
                  
                  <div className="mt-auto flex justify-between items-end border-t border-white/5 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Disbursed</p>
                      <p className="text-emerald-400 font-bold">${charity.total_raised.toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(charity)} className="w-8 h-8 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(charity.id)} className="w-8 h-8 rounded bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6 max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {currentEdit?.id ? "Edit Partner Profile" : "Add New Partner"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Organization Name</label>
                  <input 
                    type="text" 
                    value={currentEdit?.name} 
                    onChange={e => setCurrentEdit({...currentEdit, name: e.target.value})}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={currentEdit?.tags?.join(", ")} 
                    onChange={e => setCurrentEdit({...currentEdit, tags: e.target.value.split(",").map(t => t.trim())})}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold-500/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Profile Image URL</label>
                <input 
                    type="text" 
                    value={currentEdit?.image_url} 
                    onChange={e => setCurrentEdit({...currentEdit, image_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold-500/50 mb-4" 
                  />
                <div className="border-2 border-dashed border-white/10 rounded-lg h-32 flex flex-col items-center justify-center relative overflow-hidden">
                  {currentEdit?.image_url ? (
                    <img src={currentEdit.image_url} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-500 mb-2" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mission Statement / Description</label>
              <textarea 
                rows={4} 
                value={currentEdit?.mission} 
                onChange={e => setCurrentEdit({...currentEdit, mission: e.target.value})}
                className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500/50 resize-none"
              ></textarea>
            </div>

            <div className="bg-charcoal-950 p-4 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
                  <Star size={16} className="text-gold-400" />
                  <span>Spotlight Partner</span>
                </p>
                <p className="text-xs text-gray-500">Feature this charity on the public homepage and dashboard.</p>
              </div>
              <button 
                type="button"
                onClick={() => setCurrentEdit({...currentEdit, is_spotlight: !currentEdit.is_spotlight})}
                className="w-12 h-6 bg-charcoal-800 rounded-full relative cursor-pointer border border-white/10 transition-colors"
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${currentEdit?.is_spotlight ? 'translate-x-6 bg-gold-400' : 'bg-gray-500'}`}></div>
              </button>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-charcoal-950 hover:bg-gray-200 transition-colors">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

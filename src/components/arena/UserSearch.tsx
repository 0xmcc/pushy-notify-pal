'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  did: string;
  rating: number;
  display_name: string;
  avatar_url: string;
}

interface UserSearchProps {
  onSelectOpponent: (opponent: { did: string; display_name: string }) => void;
}

export const UserSearch = ({ onSelectOpponent }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const searchUsers = async (searchTerm: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('did, rating, display_name, avatar_url')
        .or(`display_name.ilike.%${searchTerm}%,did.ilike.%${searchTerm}%`)
        .limit(5);

      if (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error in searchUsers:', error);
      toast.error('Failed to search users');
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchUsers(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  return (
    <div className="p-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for opponent by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {searchResults.length > 0 && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-2 space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.did}
              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => onSelectOpponent({ did: user.did, display_name: user.display_name || user.did })}
            >
              <div className="flex items-center space-x-2">
                <img 
                  src={user.avatar_url} 
                  alt={user.display_name || user.did} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">
                  {user.display_name || user.did}
                </span>
              </div>
              <span className="text-sm text-gray-500">Rating: {user.rating}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
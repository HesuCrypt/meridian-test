'use client';

import { useEffect, useState } from 'react';
import { api } from "../trpc/react";
import { createClient } from '@supabase/supabase-js';

// Connect to Supabase just for Realtime listening
const supabase = createClient(
  'https://ptzwetuiqdsrpazqenin.supabase.co',
  'sb_publishable_ihsyYaYJbYTK66RORmN9dw_UShP3Qtb'
);

export default function Home() {
  const [realtimePrice, setRealtimePrice] = useState(0);

  const { data: initialPrice } = api.auction.getPrice.useQuery();

  const placeBidMutation = api.auction.placeBid.useMutation({
    onSuccess: () => console.log("Bid sent!"),
  });

  useEffect(() => {
    if (initialPrice) setRealtimePrice(initialPrice);
  }, [initialPrice]);

  useEffect(() => {
    console.log("Listening for updates...");
    const channel = supabase
      .channel('auction-room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'auctions' },
        (payload) => {
          console.log("Change received!", payload);

          setRealtimePrice(payload.new.current_price);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Meridian <span className="text-purple-400">Clone</span>
        </h1>

        <div className="bg-gray-800 p-10 rounded-xl text-center shadow-2xl border border-gray-700">
          <p className="text-gray-400 mb-4 text-xl">Current Bid Price</p>

          {/* THE PRICE DISPLAY */}
          <div className="text-7xl font-bold text-green-400 font-mono mb-8">
            ${realtimePrice}
          </div>

          {/* THE BUTTON */}
          <button
            onClick={() => placeBidMutation.mutate({ currentPrice: realtimePrice })}
            disabled={placeBidMutation.isPending}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-full text-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            {placeBidMutation.isPending ? "Processing..." : "Bid +$10 💰"}
          </button>
        </div>
      </div>
    </main>
  );
}
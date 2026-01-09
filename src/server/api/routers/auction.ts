import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { createClient } from '@supabase/supabase-js';
// Initialize the connection to Supabase
const supabase = createClient(
    'https://ptzwetuiqdsrpazqenin.supabase.co',
    'sb_publishable_ihsyYaYJbYTK66RORmN9dw_UShP3Qtb'
);

export const auctionRouter = createTRPCRouter({
    // 1. QUERY: Get the current price (Like fetching data)
    getPrice: publicProcedure
        .query(async () => {
            const { data } = await supabase
                .from('auctions')
                .select('current_price')
                .eq('id', 1) // We are getting the item with ID 1
                .single();

            return data?.current_price ?? 0;
        }),

    // 2. MUTATION: Place a Bid (Like sending data)
    placeBid: publicProcedure
        .input(z.object({ currentPrice: z.number() })) // Validate that input is a number
        .mutation(async ({ input }) => {
            const newPrice = input.currentPrice + 10;

            // Update the database
            const { error } = await supabase
                .from('auctions')
                .update({ current_price: newPrice })
                .eq('id', 1);

            if (error) throw new Error(error.message);

            return { success: true, newPrice };
        }),
});
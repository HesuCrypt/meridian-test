import { auctionRouter } from "./routers/auction";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auction: auctionRouter,
});

export type AppRouter = typeof appRouter;
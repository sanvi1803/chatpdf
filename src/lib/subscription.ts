/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { userSubscriptions } from "./db/schema";
import { eq } from "drizzle-orm";

export const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const checkSubscription = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }
  const _userSubscriptions: any = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId));

  if (!_userSubscriptions[0]) {
    return false;
  }

  const userSubscription = _userSubscriptions[0];

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription?.stripeCurrentPeriodEnd?.getTime() + DAY_IN_MS >
      Date.now();

  return !!isValid;
};

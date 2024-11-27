/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/stripe

import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { withAuthGuard } from "@/utils/guard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const return_url = process.env.NEXT_BASE_URL + "/";

const handler = async (req: Request) => {
  try {
    const { userId } = await auth();

    const { searchParams } = new URL(req.url);
    const price: any = searchParams.get("price");
    const plan: any = searchParams.get("plan");

    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const _userSubscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));

    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      // trying to cancel at the billing portal
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId,
        return_url,
      });

      return NextResponse.json({ url: stripeSession.url }, { status: 200 });
    }

    // User's first time trying to subscribe
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: return_url,
      cancel_url: return_url,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "ChatPDF Pro",
              description: "Unlimited PDF Sessions",
            },
            unit_amount: Number(price) * 100,
            recurring: {
              interval: plan,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (error: any) {
    console.log("Internal Server Error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + error },
      { status: 500 }
    );
  }
};

export const GET = withAuthGuard(handler);

/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const withAuthGuard =
  (handler: any) => async (req: Request, res: NextResponse) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (existingUser.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return handler(req, res);
    } catch (error: any) {
      console.log("Internal Server Error: ", error);
      return NextResponse.json(
        { error: "Internal Server Error: " + error },
        { status: 500 }
      );
    }
  };

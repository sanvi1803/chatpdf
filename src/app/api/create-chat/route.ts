// /api/create-chat
import { loadS3IntoPineCone } from "@/lib/pinecone";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getS3URL } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // console.log("Incoming request body:", body);

    const { file_key, file_name } = body;
    // console.log(file_key, file_name);

    await loadS3IntoPineCone(file_key);

    // if (!pages) {
    //   console.error("No pages returned from loadS3IntoPineCone");
    //   return NextResponse.json({ error: "No pages found" }, { status: 404 });
    // }

    const chatId = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3URL(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });
    return NextResponse.json({ chatId: chatId[0].insertedId }, { status: 200 });
  } catch (error) {
    console.log("Error in route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" + error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Hello Create Chat" }, { status: 200 });
}

// /api/create-chat
import { loadS3IntoPineCone } from "@/lib/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming request body:", body);
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    const pages = await loadS3IntoPineCone(file_key);

    if (!pages) {
      console.error("No pages returned from loadS3IntoPineCone");
      return NextResponse.json({ error: "No pages found" }, { status: 404 });
    }
    return NextResponse.json({ pages });
  } catch (error) {
    console.log("Error in route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

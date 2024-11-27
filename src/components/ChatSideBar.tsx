"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { ArrowLeftIcon, MessageCircleMoreIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import SubscriptionButton from "./SubscriptionButton";
import axios from "axios";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

export default function ChatSidebar({ chats, chatId, isPro }: Props) {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/chats">
          <ArrowLeftIcon className="w-8 h-8 text-black" />
        </Link>
        <h6 className="text-lg font-semibold text-black">Chats</h6>

        {!isPro && <SubscriptionButton isPro={isPro} />}
      </div>
      <Link href="/create-chat">
        <Button className="w-full border-dashed border-2 border-black text-black bg-white hover:bg-emerald-500 hover:text-white">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link href={`/chat/${chat.id}`} key={chat.id}>
            <div
              className={cn(
                "rounded-lg p-3 text-slate-400 flex items-center gap-2 font-semibold",
                {
                  "text-emerald-500": chat.id === chatId,
                  "hover:text-emerald-500": chat.id !== chatId,
                }
              )}
            >
              <MessageCircleMoreIcon className="w-6 h-6" />
              <p className="w-full overflow-hidden text-md truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
        </div>
        <Button className="mt-2 text-white bg-slate-500" disabled={loading} onClick={handleSubscription}>
          Upgrade to Pro!
        </Button>
      </div>
    </div>
  );
}

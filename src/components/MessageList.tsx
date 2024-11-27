import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";

type Props = {
  messages: Message[];
  isLoading: boolean;
};

function MessageList({ messages, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (!messages) {
    return <></>;
  }
  return (
    <div className="flex flex-col gap-2 px-4">
      {messages.map((message, index) => {
        return (
          <div
            key={index}
            className={cn("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": message.role === "assistant",
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm py01 shadow-md ring-1 ring-gray-900/10",
                {
                  "bg-blue-600 text-white": message.role === "user",
                  "bg-white text-black": message.role === "assistant",
                }
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;

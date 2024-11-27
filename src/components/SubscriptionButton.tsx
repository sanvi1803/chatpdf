"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { SparkleIcon } from "lucide-react";
import Link from "next/link";

type Props = { isPro: boolean };

const SubscriptionButton = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  return (
    <Link href="/pricing">
      <Button
        className="w-full bg-white text-yellow-700 font-bold flex items-center gap-2 hover:bg-white hover:text-emerald-500"
        disabled={isLoading}
        onClick={handleSubscription}
      >
        <SparkleIcon className="w-4 h-4" />
        {props.isPro ? "Manage Subscription" : "Upgrade Pro"}
      </Button>
    </Link>
  );
};

export default SubscriptionButton;

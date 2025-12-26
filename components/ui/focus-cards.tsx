"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LinkPreview } from "./link-preview";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative mx-auto bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-[250px] md:w-[300px] transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <Image
        src={card.image}
        width={500}
        height={500}
        alt={card.name}
        className="object-cover inset-0 rounded-full w-52 h-52 mx-auto mt-5"
      />
      <h2 className="text-xl md:text-2xl font-medium mt-5 text-center bg-clip-text text-foreground bg-gradient-to-b from-neutral-50 to-neutral-200">
        {card.name}
      </h2>
      <p className="text-base md:text-lg font-medium mt-2 text-center bg-clip-text text-muted-foreground bg-gradient-to-b from-neutral-50 to-neutral-200">
        {card.location}
      </p>
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        {/* <LinkPreview url={card.viewMore} className="text-lg md:text-xl text-red-700 hover:text-red-800 font-medium bg-clip-text bg-gradient-to-b from-neutral-50 to-neutral-200">
          View More
        </LinkPreview> */}
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  name: string;
  image: string;
  location: string;
  viewMore: string
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.name}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

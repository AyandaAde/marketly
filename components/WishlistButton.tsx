"use client";

import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  userId: string | null | undefined;
  setFavorites: React.Dispatch<React.SetStateAction<any[]>>;
  isInWishlist: boolean;
  getWishlist: any;
}

export default function WishlistButton({
  productId,
  userId,
  setFavorites,
  isInWishlist,
  getWishlist,
}: WishlistButtonProps) {
  const addToWishlistMtn = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await axios.post("/api/wishlist/add-to-wishlist", {
        productId,
        userId,
      });

      return data;
    },
  });

  const deleteItemMtn = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await axios.delete(
        "/api/wishlist/delete-from-wishlist",
        {
          data: {
            productId,
            userId,
          },
        }
      );

      return data;
    },
  });

  const toggleFavorite = (productId: string) => {
    setFavorites((prev: any[]) =>
      prev.includes(productId)
        ? prev.filter((id: string) => id !== productId)
        : [...prev, productId]
    );
    if (!isInWishlist)
      addToWishlistMtn.mutate(productId, {
        onSuccess: () => {
          getWishlist.refetch();
          toast.success("Success", {
            description: "Successfully added product to wishlist.",
          });
        },
        onError: (error: any) => {
          console.error("Error adding product to wishlist", error);
          toast.error("Error", {
            description: "Error adding product to wishlist. Please try again.",
          });
        },
      });
    else
      deleteItemMtn.mutate(productId, {
        onSuccess: () => {
          getWishlist.refetch();
        },
      });
  };

  return (
    <Button
      id="wishlist-button"
      name="add-to-wishlist-button"
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
      onClick={() => toggleFavorite(productId)}
    >
      <Heart
        className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`}
      />
    </Button>
  );
}

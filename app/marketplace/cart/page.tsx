"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Heart,
  Minus,
  Plus,
  Shield,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { COUNTRIES } from "@/lib/data/countries";
import { product } from "@prisma/client";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function CartPage() {
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<string>("US");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const getCart = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await axios.get("/api/cart/get-cart");

      setCartItems(data);
      return data;
    },
  });

  const updateCart = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const { data } = await axios.post("/api/cart/add-to-cart", {
        productId,
        quantity,
        userId,
      });
      return data;
    },
  });

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
  }, []);

  const getCurrentLocationName = () => {
    return (
      COUNTRIES.find((country) => country.code === userLocation)?.name ||
      "United States"
    );
  };

  const getShippingInfo = (product: product) => {
    const shippingCosts = product.shippingCosts ?? { US: 60 };
    const estimatedDelivery = product.estimatedDelivery;

    //@ts-expect-error cost
    const cost = shippingCosts[userLocation];
    //@ts-expect-error delivery
    const delivery = estimatedDelivery[userLocation];
    return { cost, delivery };
  };

  // Cart calculations
  const subtotal = cartItems.reduce(
    (sum: any, item: any) => sum + item.product.price * item.quantity,
    0
  );
  const totalShipping = cartItems.reduce(
    (sum: any, item: any) => sum + item.product.shippingCosts[userLocation],
    0
  );
  const promoDiscount = appliedPromo
    ? (subtotal * appliedPromo.discount) / 100
    : 0;
  const tax = Math.floor((subtotal - promoDiscount) * 0.08); // 8% tax
  const total = (subtotal + totalShipping - promoDiscount + tax).toFixed(2);

  // Cart actions
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCart.mutate({
      productId: id,
      quantity: newQuantity,
    });
    setCartItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const quantity = Math.min(newQuantity, item.maxQuantity);
          return { ...item, quantity };
        }
        return item;
      })
    );

    toast.success("Cart Updated", {
      description: "Item quantity has been updated.",
    });
  };

  const removeItem = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    setCartItems((items) => items.filter((item) => item.id !== id));

    toast.error("Item Removed", {
      description: `${item?.name} has been removed from your cart.`,
    });
  };

  const moveToSaveForLater = (id: number) => {
    const item = cartItems.find((item) => item.id === id);
    // setSaveForLater((prev) => [...prev, id])
    setCartItems((items) => items.filter((item) => item.id !== id));

    toast.success("Saved for Later", {
      description: `${item?.name} has been saved for later.`,
    });
  };

  const applyPromoCode = () => {
    const validCodes = {
      SAVE10: 10,
      WELCOME15: 15,
      HOLIDAY20: 20,
    };

    const discount =
      validCodes[promoCode.toUpperCase() as keyof typeof validCodes];

    if (discount) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount });
      toast.success("Promo Code Applied!", {
        description: `You saved ${discount}% on your order.`,
      });
    } else {
      toast.error("Invalid Promo Code", {
        description: "Please check your promo code and try again.",
      });
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
    toast.error("Promo Code Removed", {
      description: "The promo code has been removed from your order.",
    });
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      // Simulate checkout process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Redirecting to Checkout", {
        description: "Taking you to secure payment processing...",
      });

      // In a real app, this would redirect to payment processor
      console.log("Proceeding to checkout with:", {
        items: cartItems,
        total,
        location: userLocation,
      });
    } catch (error: any) {
      toast.error("Checkout Error", {
        description: `There was an issue processing your request. Please try again. Error: ${error.message}`,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="w-full bg-muted/50 py-4">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href="/marketplace" className="hover:text-primary">
                Marketplace
              </Link>
              <span>/</span>
              <span className="text-foreground">Shopping Cart</span>
            </div>
          </div>
        </section>

        {/* Cart Content */}
        <section className="w-full py-8">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-4 mb-8">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>

            {cartItems.length === 0 ? (
              // Empty Cart
              <div className="text-center py-16">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven&apos;t added anything to your cart yet.
                  Start shopping to fill it up!
                </p>
                <Button asChild size="lg">
                  <Link href="/marketplace">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              // Cart with Items
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Shopping Cart</h1>
                    <span className="text-muted-foreground">
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Shipping Notice */}
                  <Alert>
                    <Truck className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>
                          Free shipping to {getCurrentLocationName()} on orders
                          over ${50}
                        </span>
                        {subtotal >= 50 ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Qualified!
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Add ${50 - subtotal} more
                          </span>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Cart Items List */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <Card key={item.product.id}>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <Image
                                src={item.product.image || "/placeholder.svg"}
                                alt={item.product.name}
                                width={120}
                                height={120}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg line-clamp-2">
                                    {item.product.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    by {item.product.vendor}
                                  </p>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">
                                      {item.product.category}
                                    </Badge>
                                    {item.product.originalPrice && (
                                      <Badge className="bg-red-100 text-red-800">
                                        Sale
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Truck className="h-4 w-4" />
                                    <span>
                                      {item.product.shippingCost === 0
                                        ? "Free shipping"
                                        : "$ " +
                                          getShippingInfo(item.product)
                                            .cost}{" "}
                                      • {getShippingInfo(item.product).delivery}
                                    </span>
                                  </div>
                                </div>

                                {/* Price and Actions */}
                                <div className="text-right">
                                  <div className="mb-2">
                                    <div className="text-lg font-bold">
                                      ${item.product.price}
                                    </div>
                                    {item.originalPrice && (
                                      <div className="text-sm text-muted-foreground line-through">
                                        ${item.product.originalPrice}
                                      </div>
                                    )}
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.quantity - 1
                                        )
                                      }
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-medium">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.quantity + 1
                                        )
                                      }
                                      disabled={
                                        item.quantity >= item.maxQuantity
                                      }
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        moveToSaveForLater(item.product.id)
                                      }
                                      className="text-xs"
                                    >
                                      <Heart className="h-3 w-3 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(item.id)}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Stock Warning */}
                              {item.quantity >= item.maxQuantity && (
                                <Alert className="mt-3">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    Maximum quantity ({item.maxQuantity})
                                    reached for this item.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Promo Code */}
                      <div className="space-y-2">
                        <Label htmlFor="promo">Promo Code</Label>
                        <div className="flex gap-2">
                          <Input
                            id="promo"
                            placeholder="Enter code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            disabled={!!appliedPromo}
                          />
                          {appliedPromo ? (
                            <Button variant="outline" onClick={removePromoCode}>
                              Remove
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={applyPromoCode}
                              disabled={!promoCode.trim()}
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                        {appliedPromo && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Tag className="h-3 w-3" />
                            <span>
                              {appliedPromo.code} applied (
                              {appliedPromo.discount}% off)
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Price Breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal ({cartItems.length} items)</span>
                          <span>${subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>
                            {totalShipping === 0
                              ? "Free"
                              : "$ " + totalShipping}
                          </span>
                        </div>
                        {appliedPromo && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({appliedPromo.code})</span>
                            <span>-${promoDiscount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>${tax}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${total}</span>
                      </div>

                      {/* Security Notice */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Secure checkout with SSL encryption</span>
                      </div>

                      {/* Checkout Button */}
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCheckout}
                        disabled={isCheckingOut || cartItems.length === 0}
                      >
                        {isCheckingOut ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Proceed to Checkout
                          </>
                        )}
                      </Button>

                      {/* Payment Methods */}
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                          We accept
                        </p>
                        <div className="flex justify-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Visa
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Mastercard
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            PayPal
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Apple Pay
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trust Signals */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">Secure Payment</p>
                          <p className="text-xs text-muted-foreground">
                            Your payment info is protected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">Fast Shipping</p>
                          <p className="text-xs text-muted-foreground">
                            Free shipping on orders over ${50}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">Easy Returns</p>
                          <p className="text-xs text-muted-foreground">
                            30-day return policy
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

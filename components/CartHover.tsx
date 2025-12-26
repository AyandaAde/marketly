"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

interface CartItem {
    id: number
    name: string
    vendor: string
    price: number
    originalPrice?: number
    image: string
    quantity: number
    inStock: boolean
}

// Mock cart data (in a real app, this would come from a global state or context)
const mockCartItems: CartItem[] = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        vendor: "TechSound Pro",
        price: 129.99,
        originalPrice: 159.99,
        image: "/placeholder.svg?height=300&width=300",
        quantity: 1,
        inStock: true,
    },
    {
        id: 3,
        name: "Smart Home Security Camera",
        vendor: "SecureHome",
        price: 89.99,
        originalPrice: 119.99,
        image: "/placeholder.svg?height=300&width=300",
        quantity: 2,
        inStock: true,
    },
    {
        id: 6,
        name: "Handcrafted Leather Wallet",
        vendor: "Artisan Leather Co.",
        price: 79.99,
        image: "/placeholder.svg?height=300&width=300",
        quantity: 1,
        inStock: true,
    },
]

interface CartHoverProps {
    items: any
    isOpen: boolean
    onClose: () => void
}

export default function CartHover({ items, isOpen, onClose }: CartHoverProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems)

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return

        setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))

        toast.success("Cart Updated", {
            description: "Item quantity has been updated.",
        })
    }

    const removeItem = (id: number) => {
        const item = cartItems.find((item) => item.id === id)
        setCartItems((items) => items.filter((item) => item.id !== id))

        toast.error("Item removed", {
            description: `${item?.name} has been removed from your cart.`,
        })
    }

    const subtotal = items?.reduce((sum: any, item: any) => sum + item.product.price * item.quantity, 0).toFixed(2)

    if (!isOpen) return null

    console.error("Item.", items[0])

    return (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
            <Card className="shadow-lg border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Shopping Cart
                        </CardTitle>
                        <Badge variant="secondary">{items.length} items</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {items.length === 0 ? (
                        // Empty Cart
                        <div className="text-center py-8 px-6">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">Your cart is empty</p>
                            <Button asChild size="sm" onClick={onClose}>
                                <Link href="/marketplace">Start Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="max-h-80 overflow-y-auto px-6">
                                <div className="space-y-4">
                                    {items.map((item: any, index: any) => (
                                        <div key={item.product.id}>
                                            <div className="flex gap-3">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    <Image
                                                        src={item.product.image || "/placeholder.svg"}
                                                        alt={item.product.name}
                                                        width={60}
                                                        height={60}
                                                        className="w-15 h-15 object-cover rounded-md"
                                                    />
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.product.name}</h4>
                                                    <p className="text-xs text-muted-foreground mb-2">by <Link href={item.product.website} className="underline hover:text-primary">{item.product.vendor}</Link></p>

                                                    <div className="flex items-center justify-between">
                                                        {/* Price */}
                                                        <div>
                                                            <span className="font-medium text-sm">${item.product.price}</span>
                                                            {item.product.originalPrice && (
                                                                <span className="text-xs text-muted-foreground line-through ml-1">
                                                                    ${item.product.originalPrice}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 ml-1"
                                                                onClick={() => removeItem(item.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {index < cartItems.length - 1 && <Separator className="mt-4" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="px-6 py-4 border-t bg-muted/30">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium">Subtotal:</span>
                                    <span className="font-bold">${subtotal}</span>
                                </div>
                                <div className="space-y-2">
                                    <Button asChild className="w-full" size="sm" onClick={onClose}>
                                        <Link href="/marketplace/cart">
                                            View Cart
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent" size="sm" onClick={onClose}>
                                        <Link href="/marketplace">Continue Shopping</Link>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-3">
                                    Shipping and taxes calculated at checkout
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

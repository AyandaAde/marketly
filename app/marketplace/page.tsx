"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkPreview } from "@/components/ui/link-preview";
import {
  marketplaceLoadingStates,
  MultiStepLoader,
} from "@/components/ui/multi-step-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { COUNTRIES } from "@/lib/data/countries";
import { useAuth } from "@clerk/nextjs";
import { product } from "@prisma/client";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowUpDown,
  Filter,
  Globe,
  Grid3X3,
  Heart,
  List,
  Loader2,
  MapPin,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setIsLocationDialogOpen } from "../features/location/locationSlice";
import { AppDispatch, RootState } from "../store";
import WishlistButton from "@/components/WishlistButton";

const categories = [
  "All Categories",
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Sports & Fitness",
  "Accessories",
  "Home & Garden",
  "Services",
  "Hotel and Homestay",
  "Software as a Service",
];

export default function MarketplacePage() {
  const { userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showFastShippingOnly, setShowFastShippingOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState("");
  const { userLocation } = useSelector((state: RootState) => state.location);
  const dispatch = useDispatch<AppDispatch>();

  const observerRef = useRef(null);

  const getProducts = useInfiniteQuery({
    queryKey: ["products", userLocation],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get("/api/get-products", {
        params: {
          shipsTo: userLocation,
          currentPage: pageParam,
        },
      });

      return {
        items: data,
        nextPage: pageParam + 1,
        hasNextPage: data.length === 8,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    enabled: !!userLocation,
  });

  const getWishlist = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      const { data } = await axios.get("/api/get-wishlist", {
        params: {
          userId,
        },
      });
      return data;
    },
  });

  const createCartMtn = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await axios.post("/api/cart/create-cart", {
        productId,
        quantity: 1,
        userId,
      });
      return data;
    },
  });
  const addToCartMtn = useMutation({
    mutationFn: async (product: product) => {
      const { data } = await axios.post("/api/cart/add-to-cart", {
        productId: product.id,
        quantity: 1,
        userId,
      });
      return data;
    },
  });

  const flatProducts =
    getProducts.data?.pages.flatMap((page) => page.items) ?? [];

  // Filter products based on current filters AND user location
  const filteredProducts = flatProducts?.length
    ? flatProducts?.filter((product: product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === "All Categories" ||
          product.category === selectedCategory;

        // Convert price to user's currency for filtering
        const convertedPrice = product.price;
        const convertedPriceRange = [priceRange[0], priceRange[1]];

        const matchesPrice =
          convertedPrice >= convertedPriceRange[0] &&
          convertedPrice <= convertedPriceRange[1];
        const matchesStock = !showInStockOnly || product.inStock;
        const matchesShipping = !showFastShippingOnly || product.fastShipping;
        const shipsToUserLocation = product.shipsTo.includes(userLocation);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesPrice &&
          matchesStock &&
          matchesShipping &&
          shipsToUserLocation
        );
      })
    : [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      case "name":
        return a.name.localeCompare(b.name);
      case "shipping-cost":
        const aShippingCosts: Record<string, number> = a.shippingCosts ?? {
          US: 60,
        };
        const bShippingCosts: Record<string, number> = b.shippingCosts ?? {
          US: 60,
        };

        return aShippingCosts[userLocation] - bShippingCosts[userLocation];
      default:
        return 0;
    }
  });

  const getCurrentLocationName = () => {
    return COUNTRIES.find((l) => l.code === userLocation)?.name || "Unknown";
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

  const ProductCard = ({ product }: { product: product }) => {
    const { cost, delivery } = getShippingInfo(product);

    return (
      <Card className="group transition-all duration-200 hover:shadow-lg hover:border-primary/20">
        <div className="relative overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          />
          <WishlistButton
            productId={product.id}
            userId={userId}
            setFavorites={setFavorites}
            isInWishlist={favorites.includes(product.id)}
          />
          {product.originalPrice && (
            <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
          )}
          {cost === 0 && (
            <Badge className="absolute top-10 left-2 bg-green-500">
              Free Shipping
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </CardTitle>
              <CardDescription className="text-sm">
                by{" "}
                <LinkPreview
                  url={product.website}
                  className="hover:text-primary underline"
                >
                  {product.vendor}
                </LinkPreview>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold">${product.price} USD</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Shipping Information */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Ships from {product.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Truck className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">
                {cost === 0
                  ? "Free shipping"
                  : cost === 999
                  ? "No shipping"
                  : `$${cost} shipping`}{" "}
                to {getCurrentLocationName()}
              </span>
            </div>
            {cost !== 999 && (
              <div className="text-xs text-muted-foreground">
                Estimated delivery: {delivery}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
          <Button
            className="w-full"
            disabled={!product.inStock}
            variant={product.inStock ? "default" : "secondary"}
            onClick={() => addToCart(product)}
          >
            {product.inStock ? (
              addingToCart === product.id && addToCartMtn.isPending ? (
                <p className="flex flex-row items-center">
                  <Loader2 className="animate-spin mr-2" />
                  Adding to Cart...
                </p>
              ) : (
                "Add to Cart"
              )
            ) : (
              "Out of Stock"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ product }: { product: product }) => {
    const { cost, delivery } = getShippingInfo(product);

    return (
      <Card className="group transition-all duration-200 hover:shadow-lg hover:border-primary/20">
        <div className="flex gap-4 p-4">
          <div className="relative flex-shrink-0">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={120}
              height={120}
              className="w-24 h-24 object-cover rounded-lg"
            />
            {product.originalPrice && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-xs">
                Sale
              </Badge>
            )}
            {cost === 0 && (
              <Badge className="absolute -top-1 -left-1 bg-green-500 text-xs">
                Free Ship
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  by {product.vendor}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Ships from {product.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Truck className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {cost === 0
                        ? "Free shipping"
                        : cost === 999
                        ? "No shipping available"
                        : `${cost} shipping`}
                      {cost !== 999 && ` • ${delivery}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <WishlistButton
                  productId={product.id}
                  userId={userId}
                  setFavorites={setFavorites}
                  isInWishlist={favorites.includes(product.id)}
                />
                <div className="text-right">
                  <div className="text-xl font-bold">${product.price} USD</div>
                  {product.originalPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice} USD
                    </div>
                  )}
                </div>
                <Button
                  disabled={!product.inStock}
                  variant={product.inStock ? "default" : "secondary"}
                  size="sm"
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const addToCart = async (product: product) => {
    setAddingToCart(product.id);
    createCartMtn.mutate(product.id);
    // addToCartMtn.mutate(product, {
    //   onSuccess: () => {
    //     toast.success("Success", {
    //       description: "Product successfully added to cart.",
    //     });
    //   },
    //   onError: (error: any) => {
    //     console.error("Error adding product to cart:", error);
    //     toast.error("Error", {
    //       description: "Error adding product to cart. Please try again.",
    //     });
    //   },
    // });
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && getProducts.hasNextPage) {
        getProducts.fetchNextPage();
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [observerRef, getProducts]);

  if (getProducts.isFetching && !getProducts.isFetchingNextPage)
    return (
      <MultiStepLoader
        loadingStates={marketplaceLoadingStates}
        loading={getProducts.isFetching && !getProducts.isFetchingNextPage}
        duration={2000}
      />
    );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Discover Amazing Products
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Shop from thousands of trusted vendors and find exactly what
                you&apos;re looking for
              </p>

              {/* Location Notice */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  Showing products that ship to{" "}
                  <strong>{getCurrentLocationName()}</strong>
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary underline"
                  onClick={() => dispatch(setIsLocationDialogOpen(true))}
                >
                  Change
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:max-w-2xl sm:mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products, vendors, or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{sortedProducts.length} Products Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Verified Vendors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Ships to {getCurrentLocationName()}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Content */}
        <section className="w-full py-8">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium">
                        Price Range $
                      </Label>
                      <div className="mt-2">
                        <Slider
                          value={[priceRange[0], priceRange[1]]}
                          onValueChange={(value) => {
                            setPriceRange([value[0], value[1]]);
                          }}
                          max={200}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>${priceRange[0]} USD</span>
                          <span>${priceRange[1]} USD</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Stock Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Availability
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="in-stock"
                          checked={showInStockOnly}
                          onCheckedChange={(value) => {
                            setShowInStockOnly(value as boolean);
                          }}
                        />
                        <Label htmlFor="in-stock" className="text-sm">
                          In stock only
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="fast-shipping"
                          checked={showFastShippingOnly}
                          onCheckedChange={() =>
                            setShowFastShippingOnly(!showFastShippingOnly)
                          }
                        />
                        <Label htmlFor="fast-shipping" className="text-sm">
                          Fast shipping
                        </Label>
                      </div>
                    </div>

                    <Separator />

                    {/* Shipping Info */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Shipping to {getCurrentLocationName()}
                      </Label>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Free shipping available on select items</p>
                        <p>• Delivery times vary by vendor</p>
                        <p>• All prices include applicable taxes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {sortedProducts.length} products ship to{" "}
                      {getCurrentLocationName()}
                    </p>

                    {/* Mobile Filter Button */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="lg:hidden bg-transparent"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                          <SheetDescription>
                            Refine your search results
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          {/* Mobile filters content - same as desktop */}
                          <div>
                            <Label className="text-sm font-medium">
                              Price Range $
                            </Label>
                            <div className="mt-2">
                              <Slider
                                value={[priceRange[0], priceRange[1]]}
                                onValueChange={(value) => {
                                  setPriceRange([value[0], value[1]]);
                                }}
                                max={200}
                                step={5}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>${priceRange[0]} USD</span>
                                <span>${priceRange[1]} USD</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              Availability
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mobile-in-stock"
                                checked={showInStockOnly}
                                onCheckedChange={() =>
                                  setShowInStockOnly(!showInStockOnly)
                                }
                              />
                              <Label
                                htmlFor="mobile-in-stock"
                                className="text-sm"
                              >
                                In stock only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mobile-fast-shipping"
                                checked={showFastShippingOnly}
                                onCheckedChange={() =>
                                  setShowFastShippingOnly(!showFastShippingOnly)
                                }
                              />
                              <Label
                                htmlFor="mobile-fast-shipping"
                                className="text-sm"
                              >
                                Fast shipping
                              </Label>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="shipping-cost">
                          Shipping: Low to High
                        </SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="reviews">Most Reviews</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products Grid/List */}
                {sortedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No products available in your area
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No products ship to {getCurrentLocationName()} with your
                      current filters.
                    </p>
                    <Button
                      onClick={() => dispatch(setIsLocationDialogOpen(true))}
                    >
                      Change Location
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          : "space-y-4"
                      }
                    >
                      {sortedProducts.map((product: product) =>
                        viewMode === "grid" ? (
                          <ProductCard key={product.id} product={product} />
                        ) : (
                          <ProductListItem key={product.id} product={product} />
                        )
                      )}
                      {getProducts.hasNextPage && (
                        <div ref={observerRef} style={{ height: 1 }} />
                      )}
                    </div>
                    {getProducts.isFetchingNextPage && (
                      <Loader2
                        size={35}
                        className="mx-auto mt-7 animate-spin text-primary"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

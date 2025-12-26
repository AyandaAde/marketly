"use client";

import Image from "next/image";
import Link from "next/link";
// import {
//   ReactNode
// } from "react";
import { setIsLocationDialogOpen, setUserLocation } from "@/app/features/location/locationSlice";
import { COUNTRIES } from "@/lib/data/countries";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle, Globe, Heart, Search, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "../app/store";
import CartHover from "./CartHover";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// const options: { title: string; href: string; icon: ReactNode }[] = [
//   {
//     title: "Industries",
//     icon: (
//       <div className="rounded-full border-[1px] border-black p-1 w-7 h-7 justify-center items-center">
//         <i className="fa-solid fa-list text-primary text-sm ml-[1px]" />
//       </div>
//     ),
//     href: "/docs/primitives/alert-dialog",
//   },
//   {
//     title: "Why Choose Us",
//     icon: <i className="fa-solid fa-list" />,
//     href: "/docs/primitives/hover-card",
//   },
//   {
//     title: "Objectives",
//     icon: <i className="fa-solid fa-list" />,
//     href: "/docs/primitives/progress",
//   },
//   {
//     title: "Who It's for",
//     icon: <i className="fa-solid fa-list" />,
//     href: "/docs/primitives/scroll-area",
//   },
//   {
//     title: "How it works",
//     icon: <i className="fa-solid fa-list" />,
//     href: "/docs/primitives/tabs",
//   },
//   {
//     title: "Contact",
//     icon: <i className="fa-solid fa-list" />,
//     href: "/docs/primitives/tooltip",
//   },
// ];


export function NavBar() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const { userLocation, isLocationDialogOpen } = useSelector((state: RootState) => state.location);
  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCart = useQuery({
    queryKey: ["cart", isLoaded],
    queryFn: async () => {
      const { data } = await axios.get("/api/cart/get-cart");

      return data
    },
    enabled: !!isLoaded
  });

  console.error("Cart", getCart.data)

  const totalItems = getCart?.data?.reduce((sum: any, item: any) => sum + item.quantity, 0)


  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHoverOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHoverOpen(false)
    }, 150) // Small delay to prevent flickering
  }

  const handleLocationChange = (newLocation: string) => {
    dispatch(setUserLocation(newLocation))
    localStorage.setItem("userLocation", newLocation)
    dispatch(setIsLocationDialogOpen(false))
    setCountrySearchQuery("")
    toast.success(<>
      <span>Location Updated.</span>
      <br />
      <span>Now showing products that ship to {COUNTRIES.find((l) => l.code === newLocation)?.name}</span>
    </>)
  }

  const getCurrentLocationName = () => {
    return COUNTRIES.find((l: any) => l.code === userLocation)?.name || "Unknown"
  }

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter(
    (country): any =>
      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
      country.continent.toLowerCase().includes(countrySearchQuery.toLowerCase()),
  )

  // Group countries by continent for better organization
  const continents = ["North America", "South America", "Europe", "Asia", "Africa", "Oceania", "Antarctica"]

  // Group filtered countries by continent
  const countriesByContinent = continents.reduce(
    (acc, continent) => {
      acc[continent] = filteredCountries.filter((country) => country.continent === continent)
      return acc
    },
    {} as Record<string, typeof COUNTRIES>,
  )

  // Auto-detect user location on first visit
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) {
      dispatch(setUserLocation(savedLocation))
    } else {
      // Try to detect location (simplified - in real app you'd use geolocation API)
      dispatch(setIsLocationDialogOpen(true))
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center space-x-4 flex-row justify-between sm:space-x-0">
        <Link href={"/"} className="ml-5 rounded-xl">
          <Image
            src={"/images/marketly-logo-2.png"}
            width={200}
            height={200}
            alt="Marketly logo"
            className="w-50 rounded-lg"
          />
        </Link>
        <nav className="hidden gap-6 lg:gap-10 md:flex">
          <Link
            href="/"
            className="flex items-center text-base font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center text-base font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Marketplace
          </Link>
          <Link
            href="/contact"
            className="flex items-center text-base font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contact Us
          </Link>
        </nav>
        <div className="flex items-center justify-end space-x-4">
          {
            !pathname.includes("/marketplace") ?
              isLoaded && isSignedIn ? (
                <Button variant="outline" className="hidden md:flex" onClick={() => signOut()}>
                  Log out
                </Button>
              )
                : (
                  <>
                    <Button variant="outline" className="hidden md:flex" onClick={() => router.push("/sign-in")}>
                      Log in
                    </Button>
                    <Button variant={pathname === "/marketplace" ? "outline" : "default"} onClick={() => router.push("/sign-up")}>Get Started</Button>
                  </>
                ) : (
                <>
                  {/* Location Selector */}
                  <Dialog open={isLocationDialogOpen} onOpenChange={(value) => dispatch(setIsLocationDialogOpen(value))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Globe className="h-4 w-4" />
                        <span className="hidden sm:inline">Ship to:</span>
                        {getCurrentLocationName()}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Choose Your Location</DialogTitle>
                        <DialogDescription>
                          Select your country to see products that ship to you and accurate shipping costs.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Search Countries */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search countries..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        {/* Countries List */}
                        <ScrollArea className="h-96">
                          <div className="space-y-4">
                            {continents.map((continent) => {
                              const continentCountries = countriesByContinent[continent]
                              if (continentCountries.length === 0) return null

                              return (
                                <div key={continent}>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2 px-2">{continent}</h4>
                                  <div className="space-y-1">
                                    {continentCountries.map((country) => (
                                      <Button
                                        key={country.code}
                                        variant={userLocation === country.code ? "default" : "ghost"}
                                        className="w-full justify-start gap-2 h-auto py-2"
                                        onClick={() => handleLocationChange(country.code)}
                                      >
                                        {userLocation === country.code && <CheckCircle className="h-4 w-4" />}
                                        <span className="flex-1 text-left">{country.name}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist ({3})
                  </Button>
                  <div ref={containerRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <Button variant="default" className="relative">
                      <Link href={"/marketplace/cart"} className="relative flex flex-row gap-1">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Cart
                        {totalItems > 0 && (
                          <p> ({totalItems > 99 ? "99+" : totalItems})</p>
                        )}
                      </Link>
                    </Button>
                    {
                      !getCart.isFetching ? (
                        <CartHover isOpen={isHoverOpen} onClose={() => setIsHoverOpen(false)} items={getCart.data} />
                      ) : null
                    }
                  </div>
                </>
              )
          }
        </div>
      </div>
    </header >
  );
}

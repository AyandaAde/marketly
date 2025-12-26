"use client";

import ConsultationPopUp from "@/components/ConsultationPopup";
import { MatchWithConsultantModal } from "@/components/matchWithConsultantModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import Feature from "@/components/ui/feature";
import { FocusCards } from "@/components/ui/focus-cards";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { WorldMapComp } from "@/components/WorlMap";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  CreditCard,
  Globe,
  Handshake,
  Search,
  Settings,
  Smartphone,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PopupModal, useCalendlyEventListener } from "react-calendly";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const router = useRouter();

  const industries = [
    {
      title: "Retail",
      description:
        "Comprehensive solutions for fashion, electronics, home goods, and specialty retail businesses.",
      icon: (
        <i className="fa-solid fa-bag-shopping text-card-foreground w-5 h-5" />
      ),
    },
    {
      title: "B2B Wholesale",
      description:
        "Specialized features for bulk ordering, account management, and business-to-business transactions.",
      icon: <i className="fa-solid fa-shop text-card-foreground w-5 h-5" />,
    },
    {
      title: "Service Providers",
      description:
        "Booking systems, service packages, and appointment scheduling for service-based businesses.",
      icon: <i className="fa-solid fa-user-tie text-card-foreground w-5 h-5" />,
    },
    {
      title: "Food & Beverage",
      description:
        "Order management, delivery integration, and inventory tracking for restaurants and food retailers.",
      icon: <i className="fa-solid fa-utensils text-card-foreground w-5 h-5" />,
    },
    {
      title: "Digital Products",
      description:
        "Secure delivery systems for software, courses, ebooks, and other digital goods.",
      icon: <i className="fa-solid fa-globe text-card-foreground w-5 h-5" />,
    },
    {
      title: "Vehicles",
      description:
        "Specialized marketplace features for automotive dealers, parts suppliers, and vehicle service providers with inventory management.",
      icon: <i className="fa-solid fa-car text-card-foreground w-5 h-5" />,
    },
  ];

  const features = [
    {
      title: "Free Sign Up",
      description: `Trying Kondarsoft® is totally free. You can cancel at any time.`,
      icon: <CreditCard className="h-6 w-6 text-primary" />,
    },
    {
      title: "Advanced Payment Processing",
      description: `Increase conversion rates by offering customers their preferred payment methods while simplifying
                      vendor payouts.`,
      icon: <Handshake className="h-6 w-6 text-primary" />,
    },
    {
      title: "Mobile-First Design",
      description: `Fully responsive marketplace that delivers an optimal shopping experience across all devices with
                    native-like mobile performance.`,
      icon: <Smartphone className="h-6 w-6 text-primary" />,
    },
    {
      title: "Intelligent Search & Filtering",
      description: `AI-powered search with autocomplete, typo tolerance, and personalized results based on user behavior
                    and preferences.`,
      icon: <Search className="h-6 w-6 text-primary" />,
    },
    {
      title: "Comprehensive Analytics",
      description: `Make data-driven decisions with powerful real-time dashboards that provide deep insights into your store with sales performance tracking and customer behavior analytics`,
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
    },
    {
      title: "24/7 Customer Support",
      description:
        "We are available a 100% of the time. At least our AI Agents are.",
      icon: <Settings className="h-6 w-6 text-primary" />,
    },
    {
      title: "Marketing Automation",
      description: `Increase customer retention and lifetime value through automated, targeted marketing campaigns.`,
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
    {
      title: "Global Commerce Support",
      description: `Multi-language and multi-currency capabilities. Expand your marketplace globally and provide a localized experience for international customers.`,
      icon: <Globe className="h-6 w-6 text-primary" />,
    },
  ];

  const content = [
    {
      title: "Step 1 - Sign Up",
      description: `To register for an online e-store simply click login and a member of our team will get in touch.`,
      content: (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
          <Image
            src="/images/login.jpg"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="login"
          />
        </div>
      ),
    },
    {
      title: "Step 2 - Consultation",
      description:
        "We'll have a detailed consultation to understand your business needs, goals, and target market.",
      content: (
        <div className="flex h-full w-full items-center justify-center text-white">
          <Image
            src="/images/consultation.jpg"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="login"
          />
        </div>
      ),
    },
    {
      title: "Step 3 - Customization",
      description:
        "Our team configures the platform to match your brand identity and implements your specific feature requirements.",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
          <Image
            src="/images/customization.jpg"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="login"
          />
        </div>
      ),
    },
    {
      title: "Step 4 - Launch",
      description:
        "After thorough testing, your marketplace goes live with our team providing ongoing support and optimization.",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
          <Image
            src="/images/launch.png"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="launch"
          />
        </div>
      ),
    },
    {
      title: "",
      description: "",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white"></div>
      ),
    },
  ];

  const team = [
    {
      image: "/images/james-richardson.jpg",
      name: "Mr.Jamees R",
      location: "British Columbia, Canada",
      viewMore: "",
    },
    {
      image: "/images/lola-dam.jpg",
      name: "Ms.Lola D",
      location: "New York, United States",
      viewMore: "",
    },
    {
      image: "/images/joseph-gonzalez.jpg",
      name: "Mr.Joseph G",
      location: "British Columbia, Canada",
      viewMore: "",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] py-6 md:py-12 overflow-hidden">
          <div className="absolute w-full h-[110%] -top-[10%] -z-[5] bg-gradient-to-tl from-primary/65 via-background to-background" />
          <div className="container h-full mx-auto px-4 md:px-6">
            <div className="grid h-full gap-6 lg:grid-cols-[1fr_37vw] lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Modern commerce infrastructure for growing brands and
                    marketplaces
                  </h1>
                  <p className="max-w-[600px] px-2 rounded-lg text-foreground md:text-xl">
                    Empower your business with Marketly’s complete marketplace
                    platform. Scale faster, reach more customers, and grow your
                    revenue with ease.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {isLoaded && !isSignedIn && (
                    <Button size="lg" onClick={() => router.push("/sign-up")}>
                      Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  <Button size="lg" variant="outline">
                    <Link href={"/marketplace"}>Marketplace</Link>
                  </Button>
                </div>
              </div>
              <div className="group hidden lg:block rounded-lg  w-full h-full overflow-hidden">
                <Image
                  src="/images/warehouse.jpg"
                  width={4367}
                  height={1506}
                  alt="Hero Image"
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        {/* Industries Section */}
        <section
          id="industries"
          className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Industries We Serve
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Marketly’s white label marketplace platform is designed to
                  flexibly serve multiple industries, offering tailored features
                  that meet the unique needs of each sector.
                </p>
              </div>
            </div>
            <HoverEffect items={industries} />
          </div>
        </section>
        {/* Why Choose Us Section */}
        <section
          id="why-us"
          className="relative w-full min-h-[80vh] py-6 md:py-12 overflow-hidden"
        >
          <div className="container h-full mx-auto px-4 md:px-6">
            <div className="flex flex-col mb-7 items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose Our Platform
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our white label solution offers unmatched benefits worldwide
                  to help your business thrive in the digital marketplace.
                </p>
              </div>
            </div>
            <div className="h-[50vh] mt-10 lg:grid gap-6">
              <WorldMapComp className="block lg:hidden absolute -z-10 w-full" />
              <div className="relative hidden lg:block h-10/12">
                <WorldMapComp className="hidden lg:block h-10/12" />
              </div>
            </div>
          </div>
        </section>
        {/* Objectives Section */}
        <section
          id="objectives"
          className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
        >
          <div className="container h-fit mx-auto px-4 md:px-6">
            <div className="grid h-fit gap-6 items-start lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="group hidden lg:block rounded-lg  w-full h-[65vh] overflow-hidden">
                <Image
                  src="/images/goals.jpg"
                  width={3589}
                  height={5383}
                  alt="Our Mission"
                  className="hidden lg:block rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Our Objectives
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    We&apos;re committed to revolutionizing the e-commerce
                    landscape by introducing our unparalleled white label online
                    store and providing accessible, powerful marketplace
                    solutions.
                  </p>
                </div>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-bold">Democratize E-Commerce</h3>
                      <p className="text-muted-foreground">
                        Empower product suppliers of all sizes with advanced
                        marketplace technology, enabling them to excel in both
                        B2B and B2C online sales all over the world.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-bold">Drive Innovation</h3>
                      <p className="text-muted-foreground">
                        Continuously develop cutting-edge features that keep our
                        clients ahead of the competition.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-bold">Foster Growth</h3>
                      <p className="text-muted-foreground">
                        Provide the tools and support needed for our clients to
                        achieve sustainable business growth.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-bold">Build Community</h3>
                      <p className="text-muted-foreground">
                        Create a network of successful marketplace operators who
                        can share insights and best practices.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section id="for-who" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Who It&apos;s For
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our white label marketplace solution is designed for a variety
                  of business types and entrepreneurs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Established Businesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Brick-and-mortar businesses looking to expand their digital
                    presence and reach new customers through an online
                    marketplace.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Seamless inventory synchronization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Omnichannel selling capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Integrated marketing tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>E-Commerce Entrepreneurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Digital-first business owners looking to scale their
                    operations and transform their store into a full
                    marketplace.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Rapid scaling capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Multi-vendor management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Advanced marketing tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Service Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Businesses looking to streamline booking, delivery, and
                    management of their services through a centralized platform.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Booking creation and calendar management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Service package bundling and pricing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Client management and communication tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Restaurants & Food Businesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Restaurants, catering services, and food delivery businesses
                    seeking to expand their digital presence and streamline
                    online ordering.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Menu management with customization options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Delivery zone and timing configuration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Reservation and table management system</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features and Benefits Section */}
        <section
          id="features"
          className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Features & Benefits
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform comes packed with powerful features designed to
                  help your business succeed in the digital marketplace.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <Feature key={feature.title} {...feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-5">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our streamlined process makes it easy to launch your white
                  label marketplace in just a few steps.
                </p>
              </div>
            </div>
            <StickyScroll content={content} />
            <div className="flex justify-center mt-5">
              <ConsultationPopUp
                isScheduleModalOpen={isScheduleModalOpen}
                setIsScheduleModalOpen={setIsScheduleModalOpen}
              />
              <Button size="lg" onClick={() => setIsScheduleModalOpen(true)}>
                Schedule Your Consultation{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-10 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 mb-3">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Contact Our Consultants
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get in touch with our local commercial consultants who can
                  guide you through the process of setting up your marketplace.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl">
              <FocusCards cards={team} />
              <MatchWithConsultantModal inquiry="Hi, I need help with SEO." />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

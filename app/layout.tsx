import Footer from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
// import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import QueryProvider from "@/components/query-provider";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import ReduxProvider from "@/components/redux-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketly",
  description: "Sell online with your own white-label store and marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script src="https://kit.fontawesome.com/1dce5cdcc1.js" />
          <Script
            src="https://assets.calendly.com/assets/external/widget.js"
            type="text/javascript"
            async
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ReduxProvider>
            <QueryProvider>
              {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
              <NavBar />
              {children}
              <Toaster richColors />
              <Footer />
              {/* </ThemeProvider> */}
            </QueryProvider>
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

"use client";

import { Loader, MapPin, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "Please enter a first name."),
  lastName: z.string().min(1, "Please enter a last name."),
  email: z.string({ message: "Please enter a valid email" }).email(),
  phone: z.string().optional(),
  company: z.string().min(1, "Please enter a company name."),
  industry: z.string().optional(),
  message: z
    .string()
    .min(10, "Please enter a message of at least 10 characters."),
});

type ContactData = z.infer<typeof contactFormSchema>;
export default function ContactPage() {
  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      message: "",
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (contactData: ContactData) => {
      const { data } = await axios.post(
        "/api/send-message",
        {
          contactData,
        },
        {
          headers: {
            Authorization: `Bearer ${env.NEXT_PUBLIC_AUTHORIZATION_TOKEN}`,
          },
        }
      );
      return data;
    },
  });

  const industries = [
    {
      title: "How long does implementation take?",
      description: `Typically 4-8 weeks depending on customization requirements. We provide a detailed timeline during
        your consultation.`,
      icon: <i className="fa-solid fa-clock text-card-foreground w-5 h-5" />,
    },
    {
      title: "What's included in the consultation?",
      description: `A comprehensive business analysis, feature recommendations, and a customized
        implementation roadmap.`,
      icon: (
        <i className="fa-solid fa-headphones text-card-foreground w-5 h-5" />
      ),
    },
    {
      title: "Do you provide ongoing support?",
      description: `Yes, we offer 24/7 technical support, regular updates, and dedicated account management for all
        our clients.`,
      icon: <i className="fa-solid fa-user-tie text-card-foreground w-5 h-5" />,
    },
    {
      title: "Can I see a demo first?",
      description: `We provide personalized demos tailored to your industry and specific use case during the
        consultation.`,
      icon: (
        <i className="fa-solid fa-laptop-code text-card-foreground w-5 h-5" />
      ),
    },
  ];

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    sendMessage.mutate(values, {
      onSuccess: () => {
        toast.success(
          "Message successfully sent. You will hear back from a member of our team shortly."
        );
      },
      onError: (error) => {
        console.error("Error sending message", error);
        toast.error(
          "Error sending message. Please try again later or contact support."
        );
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <section className="w-full border-b bg-muted/50 py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Contact Our Consultants
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get in touch with our local commercial consultants who can
                  guide you through the process of setting up your white label
                  marketplace. We&apos;re here to help you succeed.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">24/7 Support</Badge>
                <Badge variant="secondary">Consultation</Badge>
                <Badge variant="secondary">Expert Guidance</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Contact Form */}
              <Card className="order-2 lg:order-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and one of our team members will get
                    back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...contactForm}>
                    <form
                      className="grid gap-6"
                      onSubmit={contactForm.handleSubmit(onSubmit)}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={contactForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor="first-name"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                First Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="first-name"
                                  placeholder="John"
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor="last-name"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Last Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="last-name"
                                  placeholder="John"
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={contactForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="email"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Email *
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="email"
                                placeholder="john.doe@email.com"
                                {...field}
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="phone"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="phone"
                                placeholder="+1 (555) 123-4567"
                                type="number"
                                className="no-spinner"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Please include an area code in your phone number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="company"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Company *
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="company"
                                placeholder="NovaStack"
                                {...field}
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="industry"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Industry
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="industry"
                                placeholder="e.g., Retail, Healthcare, B2B"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="message"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Message *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                id="message"
                                placeholder="Tell us about your business, requirements, and how we can help you..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={sendMessage.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {sendMessage.isPending ? (
                          <>
                            <Loader className="animate-spin" />
                            <p className="ml-2">Sending Message</p>
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="order-1 flex flex-col gap-6 lg:order-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Reach out to us directly through any of these channels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <i className="relative fa-solid fa-phone  left-1 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Phone Support</h3>
                        <p className="text-sm text-muted-foreground">
                          +1-234-567-8900
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monday - Friday, 9am - 5pm EST
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <i className="relative fa-brands fa-whatsapp fa-xl left-[2px] w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Whatsapp Support</h3>
                        <p className="text-sm text-muted-foreground">
                          +1-234-567-8900
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <i className="relative fa-solid fa-clock fa-lg left-1 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Response Time</h3>
                        <p className="text-sm text-muted-foreground">
                          Within 24 hours
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Emergency support available
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Locations
                    </CardTitle>
                    <CardDescription>
                      Our consultants are available in these locations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <h3 className="font-medium">Marketly Ltd.</h3>
                        <p className="text-sm text-muted-foreground">
                          123-4567 Main St
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Burnaby, British Columbia
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tel: +1-234-567-8900
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Whatsapp: +1-234-567-8900
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full bg-muted/50 py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Quick answers to common questions about our white label
                  marketplace solution.
                </p>
              </div>
              <HoverEffect items={industries} gridsClass={"lg:grid-cols-2"} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                Ready to Get Started?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Schedule a consultation with our experts and discover how our
                white label marketplace can transform your business.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
    
                <Button size="lg" variant="outline" asChild>
                  <Link href={"/sign-up"}>Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

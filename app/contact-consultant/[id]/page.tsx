"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader, MapPin } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string({ required_error: "Please enter a first name." }),
  lastName: z.string({ required_error: "Please enter a last name." }),
  subject: z.string({ required_error: "Please select a subject." }),
  message: z
    .string({ required_error: "Please enter a message." })
    .min(10, "Please enter a message of at least 10 characters.")
    .max(1000, "Please enter a message of at most 1000 characters"),
});

type ContactData = z.infer<typeof contactSchema>;

export default function ContactConsultantPage() {
  const params = useParams();
  const id = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ["consultant", id],
    queryFn: async () => {
      const { data } = await axios.get("/api/get-consultant", {
        params: {
          id,
        },
      });

      return data;
    },
    enabled: !!id,
  });

  let consultant = data;

  const sendMessageToConsultant = useMutation({
    mutationFn: async (data: ContactData) => {
      const { data: returnData } = await axios.post(
        "/api/send-message-to-consultant",
        {
          ...data,
          consultantEmail: consultant.email,
        }
      );
      return returnData;
    },
  });

  const contactForm = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: ContactData) => {
    sendMessageToConsultant.mutate(data, {
      onSuccess: () => {
        toast.success("Success", {
          description: `Message successfully sent to ${consultant.name}. You will hear back from them shortly.`,
        });
      },
      onError: (error) => {
        console.error("Error sending message to consultant", error);
        toast.error("Error", {
          description: `Error sending message to ${consultant.name}. Please try again later.`,
        });
      },
    });
  };

  useEffect(() => {
    if (!isLoading && !consultant) {
      notFound();
    }
  }, [isLoading, consultant]);

  if (isLoading) return <Loader className="animate-spin" />;

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
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-1 lg:grid-cols-2">
              <Card className="w-full max-w-md p-8 text-center">
                <CardHeader>
                  <Avatar className="size-32 mx-auto">
                    <AvatarImage
                      src={consultant?.image}
                      alt={consultant?.name}
                    />
                    <AvatarFallback>{consultant?.initials}</AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="text-left space-y-1 mx-auto">
                  <h2 className="text-center text-2xl font-bold text-foreground">
                    {consultant?.name}
                  </h2>
                  <p className="text-lg font-semibold text-accent-foreground/70">
                    Title:{" "}
                    <span className="font-normal">{consultant?.title}</span>
                  </p>
                  <p className="font-semibold text-muted-foreground">
                    Expertise:{" "}
                    <span className="font-normal">
                      {consultant?.expertise[0].title}
                    </span>
                  </p>
                  <div className="relative -left-1 flex items-center gap-1 text-muted-foreground">
                    <MapPin />
                    <span>{consultant?.location}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Form {...contactForm}>
                    <form
                      onSubmit={contactForm.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="flex flex-row gap-4">
                        <FormField
                          control={contactForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel htmlFor="firstName">
                                First Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="firstName"
                                  type="text"
                                  placeholder="Bradly"
                                  {...field}
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
                            <FormItem className="space-y-2">
                              <FormLabel htmlFor="lastName">
                                Last Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="firstName"
                                  type="text"
                                  placeholder="Doberman"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={contactForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel htmlFor="subject">Subject</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger id="subject">
                                <SelectValue
                                  placeholder={consultant?.expertise[0].title}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {consultant?.expertise?.map(
                                  (expertise: {
                                    title: string;
                                    value: string;
                                  }) => (
                                    <SelectItem value={expertise.value}>
                                      {expertise.title}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel htmlFor="message">Message</FormLabel>
                            <FormControl>
                              <Textarea
                                id="message"
                                placeholder="I'd like to enquire about SEO."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

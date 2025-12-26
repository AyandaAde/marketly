"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LinkPreview } from "@/components/ui/link-preview"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { COUNTRIES } from "@/lib/data/countries"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { OAuthStrategy } from "@clerk/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Check, Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { PopupModal, useCalendlyEventListener } from "react-calendly";
import ConsultationPopUp from "@/components/ConsultationPopup"

const businessSchema = z.object({
    firstName: z.string().min(1, "Please enter a first name."),
    lastName: z.string().min(1, "Please enter a last name."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().min(1, "Please enter a phone number."),
    companyName: z.string().min(1, "Please enter a company name."),
    companySize: z.string().min(1, "Please select a company size.").optional(),
    industry: z.string().min(1, "Please select an industry."),
    companyWebsite: z.string().optional(),
    description: z.string().min(1, "PLease enter a business description"),
    scheduleConsultation: z.boolean().optional(),
});

const individualSchema = z.object({
    firstName: z.string().min(1, "Please enter a first name."),
    lastName: z.string().min(1, "Please enter a last name."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().min(1, "Please enter a phone number."),
    interests: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "Please select at least one interest.",
    }),
    budgetRange: z.string({
        message: "Please select a budget range.",
    }).optional(),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    postalCode: z.string().min(1, "ZIP/Postal code is required"),
    country: z.string().min(1, "Country is required"),
    useSameForBilling: z.boolean(),
    receiveDeals: z.boolean().optional(),
    receiveRecommendations: z.boolean().optional(),
});

type BusinessData = z.infer<typeof businessSchema>
type IndividualData = z.infer<typeof individualSchema>

export default function SignUpPage() {
    const { isLoaded, signUp } = useSignUp();
    const { signIn, setActive } = useSignIn();
    const [oAuthStrategy, setOAuthStrategy] = useState<OAuthStrategy | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    const router = useRouter()

    const shoppingInterests = [
        { id: "fashion", name: "Fashion & Apparel" },
        { id: "electronics", name: "Electronics & Tech" },
        { id: "home", name: "Home & Garden" },
        { id: "health", name: "Health & Beauty" },
        { id: "sports", name: "Sports & Outdoors" },
        { id: "books", name: "Books & Media" },
        { id: "food", name: "Food & Beverages" },
        { id: "automotive", name: "Automotive" },
        { id: "services", name: "Professional Services" },
        { id: "hospitality", name: "Hospitality" },
        { id: "software", name: "Software" },
    ]

    const businessForm = useForm<BusinessData>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            companyName: "",
            companySize: "",
            industry: "",
            companyWebsite: "",
            description: "",
            scheduleConsultation: false,
        },
    })

    const individualForm = useForm<IndividualData>({
        resolver: zodResolver(individualSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            interests: [],
            budgetRange: "",
            useSameForBilling: true,
            receiveDeals: true,
            receiveRecommendations: true,
        },
    })


    const createBusinessAccount = useMutation({
        mutationFn: async (values: BusinessData) => {
            delete values.scheduleConsultation;
            const { data } = await axios.post("/api/create-account", {
                values,
                type: "business"
            });

            return data
        }
    })

    const createIndividualAccount = useMutation({
        mutationFn: async (values: IndividualData) => {
            const { data } = await axios.post("/api/create-account", {
                values,
                type: "shopping"
            });

            return data
        }
    })

    const onBusinessSubmit = async (data: BusinessData) => {
        createBusinessAccount.mutate(data, {
            onSuccess: () => {
                toast.success("Authenticating")
            },
            onError: (error) => {
                console.error("Error", error.message)
                if (error.message.includes("409")) return toast.error("Email taken. Please try another email.");
                toast.error("Error creating account. Please try again.")
            }
        })
    }

    const onIndividualSubmit = async (data: IndividualData) => {
        createIndividualAccount.mutate(data, {
            onSuccess: () => {
                toast.success("Authenticating")
            },
            onError: (error) => {
                console.error("Error", error)
                if (error.message.includes("409")) return toast.error("Email taken. Please try another email.")
                toast.error("Error creating account. Please try again.")
            }
        })
    }

    async function authenticate(email: string) {
        if (!isLoaded && !signUp) return null;

        try {
            await signUp.create({
                emailAddress: email,
            })

            await signUp.prepareEmailAddressVerification();
            router.push(`/verify-email?isSignUp=true`);

        } catch (error: any) {
            console.log("Error", JSON.stringify(error, null, 2));
            toast.error(error.errors[0].longMessage);
        }
    }

    const signUpWith = (strategy: OAuthStrategy) => {
        if (!isLoaded && !signUp) return null;
        try {
            signUp.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sign-up/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (error) {
            console.log("Error signing up", error);
        }
    };

    const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
        if (!isLoaded && !signUp || !signIn) return null;

        try {
            const userExistsButNeedsToSignIn =
                signUp.verifications.externalAccount.status === "transferable" &&
                signUp.verifications.externalAccount.error?.code ===
                "external_account_exists";

            if (userExistsButNeedsToSignIn) {
                const res = await signIn.create({ transfer: true });

                if (res.status === "complete") {
                    setActive({
                        session: res.createdSessionId,
                    });
                    router.push("/");
                    return
                }
            }

            const userNeedsToBeCreated =
                signIn.firstFactorVerification.status === "transferable";

            if (userNeedsToBeCreated) {
                const res = await signUp.create({
                    transfer: true,
                });

                if (res.status === "complete") {
                    setActive({
                        session: res.createdSessionId,
                    });
                    router.push("/");
                }
            } else {
                signUpWith(strategy);
            }
        } catch (error) {
            console.log("Error signing up", error);
        }
    };


    useEffect(() => {
        if (oAuthStrategy === null) {
            if (createBusinessAccount.isSuccess) authenticate(businessForm.getValues("email"));
            else if (createIndividualAccount.isSuccess) authenticate(individualForm.getValues("email"))
        } else {
            if (createBusinessAccount.isSuccess || createIndividualAccount.isSuccess) handleOAuthSignUp(oAuthStrategy as OAuthStrategy)
        }

    }, [createBusinessAccount, createIndividualAccount, businessForm, individualForm, oAuthStrategy])

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full bg-muted/50 py-12 md:py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                Start Your Marketplace Journey
                            </h1>
                            <p className="mt-4 text-muted-foreground md:text-xl">
                                Join thousands of successful businesses using our white label marketplace platform. Get started with a
                                free consultation and see how we can transform your business.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    Free 15-day trial
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    No setup fees
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    24/7 support
                                </Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sign Up Form Section */}
                <section className="w-full py-12 md:py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mx-auto max-w-4xl">
                            <Tabs defaultValue="business" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="business">Business Account</TabsTrigger>
                                    <TabsTrigger value="shopping">Shopping Account</TabsTrigger>
                                </TabsList>

                                {/* Business Account Form */}
                                <TabsContent value="business">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Create Your Business Account</CardTitle>
                                            <CardDescription>
                                                Set up your marketplace platform for your business. Perfect for companies looking to launch
                                                their own branded marketplace.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...businessForm}>
                                                <form className="grid gap-6" onSubmit={businessForm.handleSubmit(onBusinessSubmit)}>
                                                    {/* Personal Information */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Personal Information</h3>
                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="firstName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="first-name">First Name *</FormLabel>
                                                                            <FormControl>
                                                                                <Input id="first-name" placeholder="Lyra" required {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="lastName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="last-name">Last Name *</FormLabel>
                                                                            <FormControl>
                                                                                <Input id="last-name" placeholder="Thorne" required {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <FormField
                                                            control={businessForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <div className="space-y-2">
                                                                        <FormLabel htmlFor="email">Email Address *</FormLabel>
                                                                        <FormControl>
                                                                            <Input id="email" type="email" placeholder="lyrathorne@company.com" required {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={businessForm.control}
                                                            name="phone"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <div className="space-y-2">
                                                                        <FormLabel htmlFor="phone">Phone Number</FormLabel>
                                                                        <FormControl>
                                                                            <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={field.value} onChange={(e) => {
                                                                                const onlyNumsAndPlus = e.target.value.replace(/[^0-9+]/g, "");
                                                                                field.onChange(onlyNumsAndPlus);
                                                                            }} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Company Information */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Company Information</h3>
                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="companyName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="company-name">Company Name *</FormLabel>
                                                                            <FormControl>
                                                                                <Input id="company-name" placeholder="Axios Labs" required {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="companySize"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="company-size">Company Size</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select company size" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="1-10">1-10 employees</SelectItem>
                                                                                    <SelectItem value="11-50">11-50 employees</SelectItem>
                                                                                    <SelectItem value="51-200">51-200 employees</SelectItem>
                                                                                    <SelectItem value="201-500">201-500 employees</SelectItem>
                                                                                    <SelectItem value="500+">500+ employees</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="industry"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="industry">Industry *</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select your industry" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="retail">Retail</SelectItem>
                                                                                    <SelectItem value="b2b">B2B Wholesale</SelectItem>
                                                                                    <SelectItem value="food">Food & Beverage</SelectItem>
                                                                                    <SelectItem value="services">Service Providers</SelectItem>
                                                                                    <SelectItem value="services">Hospitality</SelectItem>
                                                                                    <SelectItem value="digital">Digital Products</SelectItem>
                                                                                    <SelectItem value="automotive">Vehicles</SelectItem>
                                                                                    <SelectItem value="other">Other</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="companyWebsite"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="website">Company Website</FormLabel>
                                                                            <FormControl>
                                                                                <Input id="website" type="url" placeholder="https://www.company.com" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <FormField
                                                            control={businessForm.control}
                                                            name="description"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <div className="space-y-2">
                                                                        <FormLabel htmlFor="description">Business Description</FormLabel>
                                                                        <FormControl>
                                                                            <Textarea
                                                                                id="description"
                                                                                placeholder="Tell us about your business and what you're looking to achieve with your marketplace..."
                                                                                className="min-h-[100px]"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Account Security */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Account Security</h3>
                                                        {/* Social Login Options */}
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full rounded-xl"
                                                                    type="submit"
                                                                    disabled={businessForm.formState.isSubmitting}
                                                                    onClick={() => setOAuthStrategy("oauth_google")}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                                        />
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                                        />
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                                        />
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                                        />
                                                                    </svg>
                                                                    Google
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full rounded-xl"
                                                                    type="submit"
                                                                    disabled={businessForm.formState.isSubmitting}
                                                                    onClick={() => setOAuthStrategy("oauth_linkedin_oidc")}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                                    </svg>
                                                                    LinkedIn
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full rounded-xl"
                                                                    type="submit"
                                                                    onClick={() => setOAuthStrategy("oauth_apple")}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                                                    </svg>
                                                                    Apple
                                                                </Button>
                                                            </div>

                                                            <div className="relative">
                                                                <div className="absolute inset-0 flex items-center">
                                                                    <Separator className="w-full" />
                                                                </div>
                                                                <div className="relative flex justify-center text-xs uppercase">
                                                                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Preferences */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Preferences</h3>
                                                        <div className="space-y-3">
                                                            <FormField
                                                                control={businessForm.control}
                                                                name="scheduleConsultation"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id="consultation"
                                                                                defaultChecked
                                                                                checked={field.value}
                                                                                onCheckedChange={(checked) => {
                                                                                    field.onChange(checked)
                                                                                    if (checked) return setIsScheduleModalOpen(true)


                                                                                }} />
                                                                            <Label htmlFor="consultation" className="text-sm">
                                                                                I&apos;d like to schedule a free consultation call
                                                                            </Label>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <ConsultationPopUp
                                                                isScheduleModalOpen={isScheduleModalOpen}
                                                                setIsScheduleModalOpen={setIsScheduleModalOpen}
                                                            />
                                                            <div id="clerk-captcha" />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        size="lg"
                                                        className="w-full"
                                                    >
                                                        {
                                                            createBusinessAccount.isPending ? (
                                                                <>
                                                                    <Loader className="animate-spin mr-2" />
                                                                    <p>
                                                                        Creating Business Account...
                                                                    </p>
                                                                </>

                                                            ) : (
                                                                "Create Business Account"
                                                            )
                                                        }
                                                    </Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Individual Account Form */}
                                <TabsContent value="shopping">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold">Create Your Shopping Account</CardTitle>
                                            <CardDescription>
                                                Join our marketplace community and discover amazing products from verified sellers. Enjoy
                                                personalized recommendations and exclusive deals.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...individualForm}>
                                                <form className="grid gap-6" onSubmit={individualForm.handleSubmit(onIndividualSubmit)}>
                                                    {/* Personal Information */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Personal Information</h3>
                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            <FormField
                                                                control={individualForm.control}
                                                                name="firstName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="ind-first-name">First Name *</FormLabel>
                                                                            <FormControl>
                                                                                <Input id="ind-first-name" placeholder="Rowan" required {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={individualForm.control}
                                                                name="lastName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="space-y-2">
                                                                            <FormLabel htmlFor="ind-last-name">Last Name *</FormLabel>
                                                                            <FormControl>
                                                                                <Input id="ind-last-name" placeholder="Ashford" required {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <FormField
                                                            control={individualForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <div className="space-y-2">
                                                                        <FormLabel htmlFor="ind-email">Email Address *</FormLabel>
                                                                        <FormControl>
                                                                            <Input id="ind-email" type="email" placeholder="rowanash@email.com" required {...field} />
                                                                        </FormControl>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={individualForm.control}
                                                            name="phone"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <div className="space-y-2">
                                                                        <FormLabel htmlFor="ind-phone">Phone Number</FormLabel>
                                                                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={field.value} onChange={(e) => {
                                                                            const onlyNumsAndPlus = e.target.value.replace(/[^0-9+]/g, "");
                                                                            field.onChange(onlyNumsAndPlus);
                                                                        }} />
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Shopping Preferences */}
                                                    <div className="space-y-4">
                                                        <FormField
                                                            control={individualForm.control}
                                                            name="interests"
                                                            render={() => (
                                                                <FormItem>
                                                                    <div className="mb-4">
                                                                        <FormLabel className="text-lg font-semibold">Shopping Interests</FormLabel>
                                                                        <FormDescription>
                                                                            Select all categories that interest you. This helps us personalize your shopping experience.
                                                                        </FormDescription>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                        {shoppingInterests.map((interest) => (
                                                                            <FormField
                                                                                key={interest.id}
                                                                                control={individualForm.control}
                                                                                name="interests"
                                                                                render={({ field }) => {
                                                                                    return (
                                                                                        <FormItem key={interest.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                                                            <FormControl>
                                                                                                <Checkbox
                                                                                                    checked={field.value?.includes(interest.id)}
                                                                                                    onCheckedChange={(checked) => {
                                                                                                        return checked
                                                                                                            ? field.onChange([...field.value, interest.id])
                                                                                                            : field.onChange(field.value?.filter((value: any) => value !== interest.id))
                                                                                                    }}
                                                                                                />
                                                                                            </FormControl>
                                                                                            <FormLabel className="text-sm font-normal leading-5">{interest.name}</FormLabel>
                                                                                        </FormItem>
                                                                                    )
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={individualForm.control}
                                                            name="budgetRange"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-base font-semibold">Typical Budget Range</FormLabel>
                                                                    <FormDescription>
                                                                        What&apos;s your typical spending range per purchase? This helps us show you relevant products.
                                                                    </FormDescription>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select your typical budget range" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="under-50">Under $50</SelectItem>
                                                                            <SelectItem value="50-100">$50 - $100</SelectItem>
                                                                            <SelectItem value="100-250">$100 - $250</SelectItem>
                                                                            <SelectItem value="250-500">$250 - $500</SelectItem>
                                                                            <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                                                                            <SelectItem value="over-1000">Over $1,000</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Shipping Address */}
                                                    <div className="space-y-4">
                                                        <FormLabel className="text-lg font-semibold">Shipping Address</FormLabel>
                                                        <FormField
                                                            control={individualForm.control}
                                                            name="addressLine1"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Address Line 1 *</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="123 Main Street" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={individualForm.control}
                                                            name="addressLine2"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Apartment, suite, unit, building, floor, etc." {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={individualForm.control}
                                                            name="country"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Country *</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select country" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="max-h-[200px]">
                                                                            {COUNTRIES.map((country) => (
                                                                                <SelectItem key={country.code} value={country.code}>
                                                                                    {country.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                            <FormField
                                                                control={individualForm.control}
                                                                name="city"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>City *</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Enter city name" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={individualForm.control}
                                                                name="state"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>State/Province *</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Enter state/province" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={individualForm.control}
                                                                name="postalCode"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>ZIP/Postal Code *</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder={"12345"} {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={individualForm.control}
                                                            name="useSameForBilling"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                                    <FormControl>
                                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel>Use as billing address</FormLabel>
                                                                        <FormDescription>Use this address for billing purposes as well</FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Account Security */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Account Security</h3>
                                                        {/* Social Login Options */}
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full rounded-xl"
                                                                    type="submit"
                                                                    onClick={() => setOAuthStrategy("oauth_google")}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                                        />
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                                        />
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                                        />
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                                        />
                                                                    </svg>
                                                                    Google
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full rounded-xl"
                                                                    type="submit"
                                                                    onClick={() => setOAuthStrategy("oauth_linkedin_oidc")}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                                    </svg>
                                                                    LinkedIn
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full rounded-xl"
                                                                    type="submit"
                                                                    onClick={() => setOAuthStrategy("oauth_apple")}
                                                                >
                                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                                                    </svg>
                                                                    Apple
                                                                </Button>
                                                            </div>

                                                            <div className="relative">
                                                                <div className="absolute inset-0 flex items-center">
                                                                    <Separator className="w-full" />
                                                                </div>
                                                                <div className="relative flex justify-center text-xs uppercase">
                                                                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Preferences */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold">Preferences</h3>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox id="ind-deals" defaultChecked />
                                                                <Label htmlFor="ind-deals" className="text-sm">
                                                                    Send me exclusive deals and promotions
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox id="ind-recommendations" defaultChecked />
                                                                <Label htmlFor="ind-recommendations" className="text-sm">
                                                                    Receive personalized product recommendations
                                                                </Label>
                                                            </div>
                                                            <div id="clerk-captcha" />
                                                        </div>
                                                    </div>

                                                    <Button type="submit" size="lg" className="w-full">
                                                        {
                                                            createIndividualAccount.isPending ? (
                                                                <>
                                                                    <Loader className="animate-spin mr-2" />
                                                                    <p>
                                                                        Creating Shopping Account...
                                                                    </p>
                                                                </>

                                                            ) : (
                                                                "Create Shopping Account"
                                                            )
                                                        }
                                                    </Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="w-full bg-muted/50 py-12 md:py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mx-auto max-w-4xl">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">What You Get When You Sign Up</h2>
                                <p className="mt-2 text-muted-foreground">
                                    Start your marketplace journey with everything you need to succeed.
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Check className="h-5 w-5 text-green-500" />
                                            Free Consultation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Get a personalized consultation with our experts to discuss your marketplace strategy and
                                            requirements.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Check className="h-5 w-5 text-green-500" />
                                            15-Day Free Trial
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Test drive our platform with full access to all features for 15 days, completely free.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Check className="h-5 w-5 text-green-500" />
                                            Dedicated Support
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Get 24/7 support from our team of marketplace experts to help you succeed.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div >
    )
}


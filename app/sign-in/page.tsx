"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import {
    EmailCodeFactor,
    OAuthStrategy,
    SignInFirstFactor,
} from "@clerk/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type SignInData = z.infer<typeof signInSchema>;

export default function LoginPage() {
    const { isLoaded, signIn, setActive } = useSignIn()
    const { signUp } = useSignUp();
    const router = useRouter();

    const signInForm = useForm<SignInData>({
        resolver: zodResolver(signInSchema),
    });

    async function onSubmit(values: SignInData) {
        if (!isLoaded && !signIn) return null;

        try {
            const { supportedFirstFactors } = await signIn.create({
                identifier: values.email,
            });
            const isEmailCodeFactor = (
                factor: SignInFirstFactor
            ): factor is EmailCodeFactor => {
                return factor.strategy === "email_code";
            };

            const emailCodeFactor = supportedFirstFactors?.find(isEmailCodeFactor);

            if (emailCodeFactor) {
                const { emailAddressId } = emailCodeFactor;

                await signIn.prepareFirstFactor({
                    strategy: "email_code",
                    emailAddressId,
                });
            }
            router.push("/verify-email?isSignedIn=true");

        } catch (error: any) {
            console.log("Error", JSON.stringify(error, null, 2));
            if (error.errors[0].code === "form_identifier_not_found") {
                toast.error(
                    "User not found. Please create an account."
                );
                router.push("/sign-up");
            }
        }
    }

    const signInWith = (strategy: OAuthStrategy) => {
        if (!isLoaded && !signIn) return

        signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: "/sign-up",
            redirectUrlComplete: "/",
        });
    };

    const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
        if (!isLoaded && !signUp || !signIn) return null;
        if (!signUp) return;

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
                router.push("/sign-up")
            } else {
                signInWith(strategy);
            }
        } catch (error) {
            console.log("Error signing up", error);
        }
    };


    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 flex items-center justify-center py-12 md:py-16">
                <div className="container px-4 md:px-6">
                    <div className="mx-auto max-w-md">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                                <CardDescription>Sign in to your Marketly account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Social Login Options */}
                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-1 gap-3">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                            onClick={() => handleOAuthSignIn("oauth_google")}
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
                                            Continue with Google
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                            onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
                                        >
                                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            Continue with LinkedIn
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                            onClick={() => handleOAuthSignIn("oauth_apple")}
                                        >
                                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                            </svg>
                                            Continue with Apple
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
                                <Form {...signInForm}>
                                    <form className="grid gap-4" onSubmit={signInForm.handleSubmit(onSubmit)}>
                                        <FormField
                                            control={signInForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="space-y-2">
                                                        <FormLabel htmlFor="email">Email Address</FormLabel>
                                                        <FormControl>
                                                            <Input id="email" type="email" placeholder="jason.clarke@company.com" required {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex items-center justify-between">
                                        </div>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            disabled={signInForm.formState.isSubmitting}
                                        >
                                            {
                                                signInForm.formState.isSubmitting ? (
                                                    <>
                                                        <Loader className="animate-spin mr-2" />
                                                        <p>Signing in...</p>
                                                    </>
                                                ) : (
                                                    "Sign In"
                                                )
                                            }
                                        </Button>
                                    </form>
                                </Form>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/sign-up" className="underline hover:text-primary">
                                            Sign up here
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

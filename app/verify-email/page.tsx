"use client"

import { useSignIn, useSignUp } from "@clerk/nextjs"
import { Loader2, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const OTPFormSchema = z.object({
    code: z.string().min(6, "Your one-time password must be 6 characters"),
});

type OTPFormData = z.infer<typeof OTPFormSchema>;


export default function VerifyEmailPage() {

    return (
        <Suspense>
            <div className="flex min-h-screen flex-col">
                <main className="flex-1 flex items-center justify-center py-12 md:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="mx-auto max-w-md">
                            <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <Mail className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                                    <CardDescription>
                                        We&apos;ve sent a verification code to your email address. Please enter it below to complete your account
                                        setup.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormComp />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </Suspense>
    )
}

function FormComp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { signIn } = useSignIn();
    const searchParams = useSearchParams();
    const isSignUp = searchParams.get("isSignUp");

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false)

    const otpForm = useForm<OTPFormData>({
        resolver: zodResolver(OTPFormSchema),
    });

    const onSubmit = async (data: OTPFormData) => {

        if (!isLoaded) return

        setIsLoading(true)

        try {
            if (isSignUp !== null) {
                const completeSignUp = await signUp.attemptEmailAddressVerification({
                    code: data.code,
                })

                if (completeSignUp.status === "complete") {
                    await setActive({ session: completeSignUp.createdSessionId })
                } else {
                    toast.error("Verification failed. Please try again.")
                    return console.error("Sign up not complete:", completeSignUp.status)
                }
            } else {
                const signInAttempt = await signIn?.attemptFirstFactor({
                    strategy: "email_code",
                    code: data.code,
                });
                if (signInAttempt?.status === "complete") {
                    await setActive({ session: signInAttempt.createdSessionId });
                } else {
                    toast.error("Verification complete. Please try again.")
                    return console.error("Error signing in", signInAttempt);
                }
            }
            router.push("/")
        } catch (err: any) {
            console.error("Verification error:", err)
            toast.error(err.errors?.[0]?.message || "Invalid verification code")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (!isLoaded) return

        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        } catch (error: any) {
            console.error("Error resending email code:", error)
            toast.error(`Failed to resend code. Please try again. ${error}`)
        }
    }

    const code = otpForm.watch("code");
    useEffect(() => {
        if (code && code.length === 6) {
            onSubmit({ code });
        }
    }, [code]);

    return (
        <Form {...otpForm}>
            <form
                onSubmit={otpForm.handleSubmit(onSubmit)}
                className="mt-6"
            >
                <FormField
                    control={otpForm.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem className="mx-auto mb-8 w-[250px] sm:w-fit">
                            <FormLabel htmlFor="otp">Verification Code</FormLabel>
                            <FormControl>
                                <InputOTP maxLength={6} {...field}>
                                    <InputOTPGroup className="sm:w-[150px]">
                                        <InputOTPSlot
                                            index={0}
                                            className="sm:h-14 sm:w-1/3"
                                        />
                                        <InputOTPSlot
                                            index={1}
                                            className="sm:h-14 sm:w-1/3"
                                        />
                                        <InputOTPSlot
                                            index={2}
                                            className="sm:h-14 sm:w-1/3"
                                        />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup className="sm:w-[150px]">
                                        <InputOTPSlot
                                            index={3}
                                            className="sm:h-14 sm:w-1/3"
                                        />
                                        <InputOTPSlot
                                            index={4}
                                            className="sm:h-14 sm:w-1/3"
                                        />
                                        <InputOTPSlot
                                            index={5}
                                            className="sm:h-14 sm:w-1/3"
                                        />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={!code || isLoading || !isLoaded}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify Email"
                    )}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive the code?{" "}
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto font-normal"
                            onClick={handleResendCode}
                            disabled={!isLoaded}
                        >
                            Resend code
                        </Button>
                    </p>
                </div>
            </form>
        </Form>
    )
}

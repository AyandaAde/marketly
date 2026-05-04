import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    server: {
        EMAIL_USER: z.string().min(1),
        EMAIL_PASSWORD: z.string().min(1),
        CLERK_SIGNING_SECRET: z.string().min(1),
        REDIS_URL: z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_AUTHORIZATION_TOKEN: z.string().min(1)
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_AUTHORIZATION_TOKEN: process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN
    }
})
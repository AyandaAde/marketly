"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"

import { type ReactNode, useState } from "react"

export const OfficeHoverEffect = ({
    items,
    className,
}: {
    items: {
        city: string
        address: string
        description: string
        icon: ReactNode
    }[]
    className?: string
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-4", className)}>
            {items.map((item, idx) => (
                <div
                    key={item?.city + idx}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-primary/5 dark:bg-primary/10 block rounded-2xl"
                                layoutId="officeHoverBackground"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    transition: { duration: 0.2 },
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.95,
                                    transition: { duration: 0.15, delay: 0.1 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <OfficeCard>
                        <OfficeCardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <motion.div
                                    animate={hoveredIndex === idx ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.icon}
                                </motion.div>
                                <OfficeCardTitle>{item.city}</OfficeCardTitle>
                            </div>
                            <OfficeCardAddress>{item.address}</OfficeCardAddress>
                        </OfficeCardHeader>
                        <OfficeCardContent>
                            <OfficeCardDescription>{item.description}</OfficeCardDescription>
                        </OfficeCardContent>
                    </OfficeCard>
                </div>
            ))}
        </div>
    )
}

export const OfficeCard = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return (
        <div
            className={cn(
                "rounded-xl h-full w-full p-6 overflow-hidden bg-card border border-border group-hover:border-primary/20 shadow-sm relative z-20 transition-all duration-200 group-hover:shadow-md",
                className,
            )}
        >
            <div className="relative z-50">{children}</div>
        </div>
    )
}

export const OfficeCardHeader = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return <div className={cn("mb-4", className)}>{children}</div>
}

export const OfficeCardTitle = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return <h3 className={cn("text-lg font-semibold text-card-foreground", className)}>{children}</h3>
}

export const OfficeCardAddress = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return <p className={cn("text-sm font-medium text-muted-foreground", className)}>{children}</p>
}

export const OfficeCardContent = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return <div className={cn("", className)}>{children}</div>
}

export const OfficeCardDescription = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return <p className={cn("text-sm text-muted-foreground leading-relaxed", className)}>{children}</p>
}

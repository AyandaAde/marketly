"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { useState, useEffect } from "react"
import { ShoppingBag, Package, CreditCard, Truck, CheckCircle } from "lucide-react"

const CheckFilled = ({ className }: { className?: string }) => {
  return <CheckCircle className={cn("w-6 h-6", className)} />
}

// Custom icons for different loading states
const LoadingIcon = ({ type, className }: { type: string; className?: string }) => {
  const iconMap = {
    cart: ShoppingBag,
    package: Package,
    payment: CreditCard,
    shipping: Truck,
    complete: CheckCircle,
  }

  const Icon = iconMap[type as keyof typeof iconMap] || ShoppingBag
  return <Icon className={cn("w-6 h-6", className)} />
}

type LoadingState = {
  text: string
  icon?: string
}

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[]
  value?: number
}) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value)
        const opacity = Math.max(1 - distance * 0.2, 0)
        const isCompleted = index < value
        const isCurrent = index === value

        return (
          <motion.div
            key={index}
            className={cn("text-left flex gap-3 mb-6 items-center")}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              {isCompleted ? (
                <CheckFilled className={cn("text-green-500 dark:text-green-400")} />
              ) : isCurrent ? (
                <div className="relative">
                  <LoadingIcon
                    type={loadingState.icon || "cart"}
                    className={cn("text-primary animate-pulse")}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-primary dark:border-primary-foreground animate-spin border-t-transparent" />
                </div>
              ) : (
                <LoadingIcon type={loadingState.icon || "cart"} className="text-gray-400 dark:text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <span
                className={cn(
                  "text-lg font-medium",
                  isCompleted && "text-green-600 dark:text-green-400",
                  isCurrent && "text-primary font-semibold",
                  !isCompleted && !isCurrent && "text-gray-500 dark:text-gray-400",
                )}
              >
                {loadingState.text}
              </span>
              {isCurrent && (
                <motion.div
                  className="h-1 bg-primary rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
}: {
  loadingStates: LoadingState[]
  loading?: boolean
  duration?: number
  loop?: boolean
}) => {
  const [currentState, setCurrentState] = useState(0)

  useEffect(() => {
    if (!loading) {
      setCurrentState(0)
      return
    }

    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1),
      )
    }, duration)

    return () => clearTimeout(timeout)
  }, [currentState, loading, loop, loadingStates.length, duration])

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl bg-black/20 dark:bg-black/40"
        >
          <div className="bg-white/65 bg:bg-gray-900/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/65 dark:border-gray-700/70 p-8 max-w-md w-full mx-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Your Order</h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your purchase</p>
            </div>

            <div className="h-96 relative overflow-hidden">
              <LoaderCore value={currentState} loadingStates={loadingStates} />
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments...</p>
            </div>
          </div>

          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Predefined loading states for common e-commerce scenarios
export const checkoutLoadingStates: LoadingState[] = [
  { text: "Validating cart items", icon: "cart" },
  { text: "Processing payment", icon: "payment" },
  { text: "Confirming inventory", icon: "package" },
  { text: "Preparing shipment", icon: "shipping" },
  { text: "Order confirmed!", icon: "complete" },
]

export const addToCartLoadingStates: LoadingState[] = [
  { text: "Adding to cart", icon: "cart" },
  { text: "Updating inventory", icon: "package" },
  { text: "Cart updated!", icon: "complete" },
]

export const orderProcessingStates: LoadingState[] = [
  { text: "Receiving your order", icon: "cart" },
  { text: "Verifying payment details", icon: "payment" },
  { text: "Checking product availability", icon: "package" },
  { text: "Calculating shipping", icon: "shipping" },
  { text: "Order successfully placed!", icon: "complete" },
]

export const marketplaceLoadingStates: LoadingState[] = [
  { text: "Detecting your location", icon: "globe" },
  { text: "Loading product catalog", icon: "search" },
  { text: "Preparing filters and categories", icon: "filter" },
  { text: "Calculating shipping options", icon: "shipping" },
  { text: "Marketplace ready!", icon: "complete" },
]

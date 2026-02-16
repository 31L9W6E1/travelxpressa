"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Item({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "muted" }) {
  return (
    <div
      data-slot="item"
      data-variant={variant}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        "data-[variant=default]:border-border data-[variant=default]:bg-background",
        "data-[variant=muted]:border-border/80 data-[variant=muted]:bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

function ItemMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-media"
      className={cn("flex h-8 w-8 shrink-0 items-center justify-center", className)}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex min-w-0 flex-1 flex-col justify-center", className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-title"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

export { Item, ItemContent, ItemMedia, ItemTitle }

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Spinner({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinner"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-primary/35 border-t-primary",
        className
      )}
      aria-label="Loading"
      role="status"
      {...props}
    />
  )
}

export { Spinner }

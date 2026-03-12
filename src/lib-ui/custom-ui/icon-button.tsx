"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/shadcn-ui/button"
import { cn } from "@/shadcn-ui/utils/utils"

export function IconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      size="icon"
      className={cn("min-w-[48px] min-h-[48px] p-0.5 rounded-xl", className)}
    />
  )
}

export default IconButton

// Toaster.tsx

"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/app/ui/design-system/toast"
import { useToast } from "@/app/ui/components/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, open, ...props }) => (
        open && (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>

            <ToastClose
              onClick={() => {
                console.log("Toast closed!")
              }}
            >
              <button className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 transition-opacity hover:text-foreground focus:outline-none">
                <X className="h-4 w-4" />
              </button>
            </ToastClose>
          </Toast>
        )
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

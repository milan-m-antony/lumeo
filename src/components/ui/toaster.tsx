"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant === 'success' ? CheckCircle : variant === 'destructive' ? AlertCircle : Info;
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {title && 
                <ToastTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${variant === 'success' ? 'text-green-400' : ''}`} />
                  {title}
                </ToastTitle>
              }
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

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

/**
 * Renders a toast notification stack driven by the application's toast state.
 *
 * @returns A React element that provides a ToastProvider, renders each active toast with its title, description, optional action and close button, and includes the toast viewport.
 */
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right" duration={3500}>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
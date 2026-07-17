import type { ReactNode } from "react"
import SpecularButton from "@/components/SpecularButton"

/**
 * ReactBits SpecularButton adapted to act as a link. SpecularButton renders a
 * real <button> (WebGL specular glass), so navigation happens in onClick.
 */
interface LinkButtonProps {
  href: string
  children: ReactNode
  variant?: "primary" | "ghost"
  size?: "sm" | "md" | "lg"
  external?: boolean
  className?: string
}

const RADII = { sm: 20, md: 25, lg: 30 }

export default function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  className = "",
}: LinkButtonProps) {
  return (
    <SpecularButton
      size={size}
      radius={RADII[size]}
      tint={variant === "primary" ? "#3574f0" : "#7a8095"}
      tintOpacity={variant === "primary" ? 0.55 : 0.14}
      blur={8}
      textColor="#f2f4fa"
      lineColor="#cfe0ff"
      followMouse
      onClick={() => {
        if (external) window.open(href, "_blank", "noreferrer")
        else window.location.href = href
      }}
      className={className}
    >
      {children}
    </SpecularButton>
  )
}

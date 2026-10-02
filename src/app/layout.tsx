import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MSA 26 — Trading Simulator",
  description:
    "MSA 26 is an educational trading simulator with training, demo markets, virtual money, and simulated trading environments.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
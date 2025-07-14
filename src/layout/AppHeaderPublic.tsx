//File: src\layout\AppHeaderPublic.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import React, { useState } from "react"
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton"

const AppHeaderPublic: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full border-b border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/images/logo/logo.svg"
            alt="Logo"
            width={180}
            height={38}
            className="dark:hidden"
          />
          <Image
            src="/images/logo/logo-dark.svg"
            alt="Logo Dark"
            width={180}
            height={38}
            className="hidden dark:block"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8 text-base font-medium text-gray-800 dark:text-white/90">
          <Link href="#features" className="hover:text-brand-500">Features</Link>
          <Link href="#about" className="hover:text-brand-500">About</Link>
          <Link href="#how-it-works" className="hover:text-brand-500">How It Works</Link>
          <Link href="#support" className="hover:text-brand-500">Support</Link>
          <div className="relative group cursor-pointer">
            <span className="hover:text-brand-500">Pages ▾</span>
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-gray-700 dark:text-white"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Search */}
          <button className="hidden lg:block text-gray-600 dark:text-gray-300 hover:text-brand-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 15z" />
            </svg>
          </button>

          {/* Theme toggle */}
          <ThemeToggleButton className="hidden lg:block" />

          {/* Sign In */}
          <Link href="/signin" className="hidden lg:block text-gray-800 dark:text-white hover:text-brand-500">
            Sign In
          </Link>

          {/* Sign Up */}
          <Link
            href="/signup"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 space-y-2 px-6 text-base font-medium text-gray-800 dark:text-white/90">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block">Features</Link>
          <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="block">About</Link>
          <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block">How It Works</Link>
          <Link href="#support" onClick={() => setMobileMenuOpen(false)} className="block">Support</Link>
          <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block">Sign In</Link>
        </div>
      )}
    </header>
  )
}

export default AppHeaderPublic

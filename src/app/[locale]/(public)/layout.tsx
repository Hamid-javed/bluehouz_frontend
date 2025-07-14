//File: src\app\(public)\layout.tsx

import AppHeaderPublic from "@/layout/AppHeaderPublic"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <AppHeaderPublic />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        © 2025 MyProduct
      </footer>
    </div>
  )
}

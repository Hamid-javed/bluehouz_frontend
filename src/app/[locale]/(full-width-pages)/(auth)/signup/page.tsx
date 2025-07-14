//File: src\app\(full-width-pages)\(auth)\signup\page.tsx

import { useSearchParams, useRouter } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";
import OrganizationStepForm from "@/components/auth/OrganizationStepForm";
import { useState, useEffect } from "react";
import { Metadata } from "next";  // Keep this import

// Move the metadata export here (server-side rendering)
export const metadata: Metadata = {
  title: "Next.js SignUp Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js SignUp Page TailAdmin Dashboard Template",
};

export default function SignUp() {
  return <SignUpForm />;
}

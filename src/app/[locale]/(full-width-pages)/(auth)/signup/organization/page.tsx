//File: src\app\(full-width-pages)\(auth)\signup\organization\page.tsx

import OrganizationStepForm from "@/components/auth/OrganizationStepForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Complete Sign-Up | TailAdmin",
  description: "Select or create an organization",
}

export default function OrganizationStep() {
  return <OrganizationStepForm />
}

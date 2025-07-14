//File: src\app\(full-width-pages)\(auth)\signin\page.tsx

import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn | BlueHouz",
  description: "",
};

export default function SignIn() {
  return <SignInForm />;
}

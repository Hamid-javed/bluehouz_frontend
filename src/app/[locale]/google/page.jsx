"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useSnackbar } from "@/context/SnackbarContext";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        if (data.user) {
          if (!isMounted) return;
          setUser(data.user);
          showSnackbar("Login Successful", "success");
          if (data.user.needsOrganizationSetup) {
            router.replace("/onboarding");
          } else {
            router.replace("/dashboard");
          }
        } else {
          throw new Error("No user returned");
        }
      } catch (err) {
        if (!isMounted) return;
        showSnackbar("Google login failed. Please try again.", "error");
        router.replace("/signin");
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [router, setUser, showSnackbar]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="p-8 rounded shadow-md bg-gray-50 dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Signing you in with Google...</h2>
        <p className="text-gray-500 dark:text-gray-300">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
} 
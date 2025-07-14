//File: src\components\auth\OrganizationStepForm.tsx

"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import apiHandler from "@/services/apihandler";

export default function OrganizationStepForm({
  onComplete,
  step,
}: {
  onComplete?: () => void;
  step?: number;
}) {
  const [mode, setMode] = useState<"join" | "create">("create");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint =
        mode === "join"
          ? "/organization/request-access"
          : "/organization/create";
      const response = await apiHandler("POST", endpoint, { name: orgName });
      console.log("API Success:", response);

      if (onComplete) onComplete(); // ✅ trigger completion
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto">
        {/* ✅ Step indicator */}
        {step && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Step {step} of 2: Select Organization
          </p>
        )}

        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
            Set Up Your Organization
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === "join"
              ? "Search for an existing organization"
              : "Create a new organization"}
          </p>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => setMode("join")}
            className={`px-4 py-2 rounded ${
              mode === "join"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Join
          </button>
          <button
            onClick={() => setMode("create")}
            className={`px-4 py-2 rounded ${
              mode === "create"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Create
          </button>
        </div>

        <div className="mt-6">
          <Label>
            {mode === "join" ? "Organization Name" : "New Organization Name"}
          </Label>
          <Input
            type="text"
            name="organization"
            placeholder={
              mode === "join"
                ? "Search organization"
                : "Enter organization name"
            }
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />

          <button
            disabled={!orgName || loading}
            onClick={handleSubmit}
            className="mt-6 w-full rounded bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : mode === "join"
              ? "Request Access"
              : "Create Organization"}
          </button>
        </div>
      </div>
    </div>
  );
}

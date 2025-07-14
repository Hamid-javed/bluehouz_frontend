"use client";

import dynamic from "next/dynamic";

const GrapeEditor = dynamic(() => import("@/components/GrapeEditor"), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <GrapeEditor />
    </main>
  );
}

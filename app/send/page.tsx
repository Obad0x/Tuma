import { Suspense } from "react";
import { SendExperience } from "@/components/send-experience";

export default function SendPage() {
  return (
    <Suspense fallback={null}>
      <SendExperience />
    </Suspense>
  );
}

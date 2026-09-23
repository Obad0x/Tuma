import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profile",
  description: "Manage your Tuma profile, avatar and payment QR code.",
  path: "/profile",
  noindex: true,
});

export default function ProfilePage() {
  return <ProfileView />;
}

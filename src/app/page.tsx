"use client";

import WelcomeHeader from "@/components/home/WelcomeHeader";
import QuotesSection from "@/components/home/QuotesSection";
import BlogsSection from "@/components/home/BlogsSection";
import CommunityTasksCTA from "@/components/home/CommunityTasksCTA";

export default function HomePage() {
  return (
    <div className="py-2 pb-10 space-y-4">
      <WelcomeHeader />
      <QuotesSection />
      <BlogsSection />
      <CommunityTasksCTA />
    </div>
  );
}

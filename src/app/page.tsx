"use client";

import WelcomeHeader from "@/components/home/WelcomeHeader";
import QuotesSection from "@/components/home/QuotesSection";
import BlogsSection from "@/components/home/BlogsSection";
import BestPerformanceSection from "@/components/home/BestPerformanceSection";
import CommunityTasksCTA from "@/components/home/CommunityTasksCTA";
import FeedLayout from "@/components/layout/FeedLayout";

export default function HomePage() {
  return (
    <FeedLayout>
      <div className="space-y-4 px-2 sm:px-0">
        <WelcomeHeader />
        <QuotesSection />
        <BlogsSection />
        <CommunityTasksCTA />
        <BestPerformanceSection />
      </div>
    </FeedLayout>
  );
}

"use client";

import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

interface FeedLayoutProps {
  children: React.ReactNode;
  hideLeft?: boolean;
  hideRight?: boolean;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function FeedLayout({ 
  children, 
  hideLeft = false, 
  hideRight = false,
  leftSidebar,
  rightSidebar 
}: FeedLayoutProps) {
  // Determine grid columns based on visibility
  let gridClasses = "grid-cols-1 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_minmax(auto,600px)_300px]";
  
  if (hideLeft && hideRight) {
    gridClasses = "grid-cols-1 md:grid-cols-1 lg:grid-cols-[minmax(auto,800px)]";
  } else if (hideLeft) {
    gridClasses = "grid-cols-1 md:grid-cols-1 lg:grid-cols-[minmax(auto,750px)_300px]";
  } else if (hideRight) {
    gridClasses = "grid-cols-1 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_minmax(auto,750px)]";
  }

  return (
    <div className="mx-auto max-w-7xl px-0 md:px-6 py-0 md:py-6">
      <div className={`grid gap-0 md:gap-6 justify-center ${gridClasses}`}>
        
        {/* LEFT SIDEBAR (Tablet & PC) */}
        {!hideLeft && (
          <aside className="hidden md:block min-w-0">
            {leftSidebar || <LeftSidebar />}
          </aside>
        )}

        {/* CENTER CONTENT */}
        <main className="min-w-0">
          {children}
        </main>

        {/* RIGHT SIDEBAR (PC Only) */}
        {!hideRight && (
          <aside className="hidden lg:block min-w-0">
            {rightSidebar || <RightSidebar />}
          </aside>
        )}

      </div>
    </div>
  );
}

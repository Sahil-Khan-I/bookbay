"use client"

import { useEffect, useState } from "react";

export default function HydrationSafeWrapper({ children }) {
  // Use state to track if hydration is complete
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // After the component mounts, we know hydration is complete
    setIsHydrated(true);
    
    // Fix hydration mismatch by removing any added classes after mount
    const html = document.documentElement;
    if (html.classList.contains('hydrated')) {
      html.classList.remove('hydrated');
    }
  }, []);

  // On the server and during hydration, render a simplified version
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Once hydrated, render the full content
  return children;
} 
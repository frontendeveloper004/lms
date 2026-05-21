"use client";

import { useEffect, useState } from "react";

export function MessagesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const res = await fetch("/api/messages/unread-count");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center px-1">
      {count > 99 ? "99+" : count}
    </span>
  );
}

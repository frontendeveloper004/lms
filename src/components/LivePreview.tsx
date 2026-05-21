"use client";

import { useEffect, useState } from "react";

interface LivePreviewProps {
  html: string;
  css: string;
  js: string;
  className?: string;
}

function buildSrcdoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}

export default function LivePreview({ html, css, js, className = "" }: LivePreviewProps) {
  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(html, css, js));

  useEffect(() => {
    const timer = setTimeout(() => {
      setSrcdoc(buildSrcdoc(html, css, js));
    }, 500);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  return (
    <iframe
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      scrolling="yes"
      className={`w-full h-full border-0 ${className}`}
      title="Jonli Ko'rinish"
    />
  );
}

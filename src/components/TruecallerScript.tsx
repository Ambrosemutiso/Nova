'use client';

import Script from 'next/script';

export default function TruecallerScript() {
  return (
    <Script
      src="https://sdk.truecaller.com/sdk/v1.0.0/truecaller.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("Truecaller SDK loaded");
        (window as any).isTruecallerReady = true;
      }}
      onError={() => {
        console.warn("Truecaller SDK failed to load");
        (window as any).isTruecallerReady = false;
      }}
    />
  );
}
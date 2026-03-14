'use client';

import { useEffect } from 'react';

export default function TranslateWidget() {
  useEffect(() => {

    const addScript = () => {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      document.body.appendChild(script);
    };

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,sw,fr,ar,am",
          autoDisplay: false
        },
        "google_translate_element"
      );
    };

    addScript();

  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}
'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { defaultLanguage } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cookie first
    const savedLang = Cookies.get('language');
    if (savedLang) {
      setLanguage(savedLang);
      setLoading(false);
      return;
    }

    // Detect language based on IP
    detectLanguageFromIP();
  }, []);

  const detectLanguageFromIP = async () => {
    try {
      const response = await fetch(`https://ipinfo.io?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`);
      const data = await response.json();
      
      // Indonesia detection
      const detectedLang = data.country === 'ID' ? 'id' : 'en';
      setLanguage(detectedLang);
      Cookies.set('language', detectedLang, { expires: 365 });
    } catch (error) {
      console.error('Failed to detect language from IP:', error);
      setLanguage(defaultLanguage);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    Cookies.set('language', newLang, { expires: 365 });
  };

  return { language, changeLanguage, loading };
}
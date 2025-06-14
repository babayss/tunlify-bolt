'use client';

import Link from 'next/link';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';

export default function Footer() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(key, language);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Tunlify
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {language === 'id' 
                ? 'Layanan tunneling terpercaya untuk menghubungkan aplikasi lokal Anda ke internet dengan aman dan cepat.'
                : 'Reliable tunneling service to connect your local applications to the internet securely and fast.'
              }
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {language === 'id' ? 'Produk' : 'Product'}
            </h3>
            <div className="space-y-2">
              <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('pricing')}
              </Link>
              <Link href="/features" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('features')}
              </Link>
              <Link href="/docs" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {language === 'id' ? 'Dokumentasi' : 'Documentation'}
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {language === 'id' ? 'Perusahaan' : 'Company'}
            </h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {language === 'id' ? 'Tentang Kami' : 'About Us'}
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {language === 'id' ? 'Kontak' : 'Contact'}
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {language === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {language === 'id' ? 'Ikuti Kami' : 'Follow Us'}
            </h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © 2024 Tunlify. {language === 'id' ? 'Hak cipta dilindungi.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
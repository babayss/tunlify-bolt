'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
}

interface PricingContent {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

export default function PricingPage() {
  const { language, loading: langLoading } = useLanguage();
  const [content, setContent] = useState<PricingContent | null>(null);
  const [loading, setLoading] = useState(true);

  const t = (key: string) => getTranslation(key, language);

  useEffect(() => {
    if (!langLoading) {
      fetchContent();
    }
  }, [language, langLoading]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/pricing?lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error('Failed to fetch pricing content:', error);
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (): PricingContent => ({
    title: language === 'id' ? 'Pilih Paket yang Tepat' : 'Choose the Right Plan',
    subtitle: language === 'id' 
      ? 'Mulai gratis, upgrade kapan saja sesuai kebutuhan Anda.'
      : 'Start free, upgrade anytime as your needs grow.',
    plans: [
      {
        id: 'free',
        name: language === 'id' ? 'Gratis' : 'Free',
        price: 0,
        period: language === 'id' ? '/bulan' : '/month',
        description: language === 'id' ? 'Sempurna untuk memulai' : 'Perfect for getting started',
        features: [
          language === 'id' ? '1 tunnel aktif' : '1 active tunnel',
          language === 'id' ? 'Bandwidth 1GB/bulan' : '1GB bandwidth/month',
          language === 'id' ? 'Subdomain gratis' : 'Free subdomain',
          language === 'id' ? 'Dukungan email' : 'Email support',
        ],
        popular: false,
        cta: language === 'id' ? 'Mulai Gratis' : 'Start Free',
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 10,
        period: language === 'id' ? '/bulan' : '/month',
        description: language === 'id' ? 'Untuk developer professional' : 'For professional developers',
        features: [
          language === 'id' ? '5 tunnel aktif' : '5 active tunnels',
          language === 'id' ? 'Bandwidth 50GB/bulan' : '50GB bandwidth/month',
          language === 'id' ? 'Custom domain' : 'Custom domain',
          language === 'id' ? 'SSL gratis' : 'Free SSL',
          language === 'id' ? 'Prioritas dukungan' : 'Priority support',
          language === 'id' ? 'Analitik lanjutan' : 'Advanced analytics',
        ],
        popular: true,
        cta: language === 'id' ? 'Pilih Pro' : 'Choose Pro',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 50,
        period: language === 'id' ? '/bulan' : '/month',
        description: language === 'id' ? 'Untuk tim dan perusahaan' : 'For teams and companies',
        features: [
          language === 'id' ? 'Tunnel unlimited' : 'Unlimited tunnels',
          language === 'id' ? 'Bandwidth unlimited' : 'Unlimited bandwidth',
          language === 'id' ? 'Multiple custom domain' : 'Multiple custom domains',
          language === 'id' ? 'Dukungan 24/7' : '24/7 support',
          language === 'id' ? 'SLA 99.9%' : '99.9% SLA',
          language === 'id' ? 'Manajemen tim' : 'Team management',
          language === 'id' ? 'API akses' : 'API access',
        ],
        popular: false,
        cta: language === 'id' ? 'Hubungi Sales' : 'Contact Sales',
      },
    ],
  });

  if (loading || langLoading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      
      <section className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {content.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1">
                      <Zap className="h-4 w-4 mr-1" />
                      {language === 'id' ? 'Populer' : 'Popular'}
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} hover:shadow-lg transition-all duration-300`}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <Link href={plan.id === 'enterprise' ? '/contact' : '/register'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 text-center"
          >
            <h2 className="text-3xl font-bold mb-8">
              {language === 'id' ? 'Pertanyaan Umum' : 'Frequently Asked Questions'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {language === 'id' ? 'Bisakah saya upgrade kapan saja?' : 'Can I upgrade anytime?'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'id' 
                      ? 'Ya, Anda dapat upgrade atau downgrade paket kapan saja. Perubahan akan berlaku pada siklus billing berikutnya.'
                      : 'Yes, you can upgrade or downgrade your plan anytime. Changes take effect on your next billing cycle.'
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {language === 'id' ? 'Apakah ada kontrak jangka panjang?' : 'Are there long-term contracts?'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'id' 
                      ? 'Tidak, semua paket berbasis bulanan tanpa kontrak jangka panjang. Anda dapat membatalkan kapan saja.'
                      : 'No, all plans are month-to-month with no long-term contracts. You can cancel anytime.'
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {language === 'id' ? 'Bagaimana dengan keamanan data?' : 'What about data security?'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'id' 
                      ? 'Semua koneksi dilindungi dengan enkripsi end-to-end dan sertifikat SSL gratis.'
                      : 'All connections are protected with end-to-end encryption and free SSL certificates.'
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {language === 'id' ? 'Dukungan pelanggan tersedia?' : 'Is customer support available?'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'id' 
                      ? 'Ya, kami menyediakan dukungan email untuk semua pengguna dan dukungan prioritas untuk paket Pro.'
                      : 'Yes, we provide email support for all users and priority support for Pro plans.'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Server,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';

interface LandingContent {
  hero: {
    title: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  stats: Array<{
    number: string;
    label: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;
}

export default function LandingPage() {
  const { language, loading: langLoading } = useLanguage();
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);

  const t = (key: string) => getTranslation(key, language);

  useEffect(() => {
    if (!langLoading) {
      fetchContent();
    }
  }, [language, langLoading]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/landing?lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        // Fallback content
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error('Failed to fetch landing content:', error);
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (): LandingContent => ({
    hero: {
      title: t('heroTitle'),
      subtitle: t('heroSubtitle'),
      cta_primary: t('getStarted'),
      cta_secondary: t('learnMore'),
    },
    features: [
      {
        icon: 'Shield',
        title: t('secureTitle'),
        description: t('secureDesc'),
      },
      {
        icon: 'Zap',
        title: t('fastTitle'),
        description: t('fastDesc'),
      },
      {
        icon: 'Globe',
        title: t('reliableTitle'),
        description: t('reliableDesc'),
      },
    ],
    stats: [
      { number: '99.9%', label: language === 'id' ? 'Uptime' : 'Uptime' },
      { number: '50+', label: language === 'id' ? 'Negara' : 'Countries' },
      { number: '24/7', label: language === 'id' ? 'Dukungan' : 'Support' },
      { number: '1M+', label: language === 'id' ? 'Pengguna' : 'Users' },
    ],
    testimonials: [
      {
        name: 'John Doe',
        role: 'Developer',
        content: 'Tunlify has been a game-changer for our development workflow.',
        rating: 5,
      },
      {
        name: 'Jane Smith',
        role: 'DevOps Engineer',
        content: 'Reliable, fast, and secure. Everything we need in a tunneling service.',
        rating: 5,
      },
    ],
  });

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="h-8 w-8 text-primary" />;
      case 'Zap':
        return <Zap className="h-8 w-8 text-primary" />;
      case 'Globe':
        return <Globe className="h-8 w-8 text-primary" />;
      default:
        return <Shield className="h-8 w-8 text-primary" />;
    }
  };

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
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <Badge variant="outline" className="px-4 py-2">
              <Star className="h-4 w-4 mr-2 fill-primary text-primary" />
              {language === 'id' ? 'Terpercaya oleh developer di seluruh dunia' : 'Trusted by developers worldwide'}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {content.hero.title}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/register">
                  {content.hero.cta_primary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/pricing">
                  {content.hero.cta_secondary}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('features')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'id' 
                ? 'Fitur-fitur canggih yang membuat Tunlify menjadi pilihan terbaik untuk kebutuhan tunneling Anda.'
                : 'Advanced features that make Tunlify the best choice for your tunneling needs.'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      {getFeatureIcon(feature.icon)}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'id' ? 'Apa Kata Pengguna Kami' : 'What Our Users Say'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'id' ? 'Siap Memulai?' : 'Ready to Get Started?'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {language === 'id' 
                ? 'Bergabunglah dengan ribuan developer yang telah mempercayai Tunlify.'
                : 'Join thousands of developers who trust Tunlify for their tunneling needs.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/register">
                  {t('getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/pricing">
                  {t('pricing')}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
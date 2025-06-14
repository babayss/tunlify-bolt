import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import redis, { cacheKeys, cacheTTL } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKeys.pricingContent(lang));
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
    }

    // Get from database
    const { data: content, error } = await supabaseAdmin
      .from('content_pages')
      .select('*')
      .eq('type', 'pricing')
      .eq('lang', lang)
      .single();

    if (error || !content) {
      // Return default content if not found
      const defaultContent = getDefaultPricingContent(lang);
      
      // Cache the default content
      try {
        await redis.setEx(
          cacheKeys.pricingContent(lang),
          cacheTTL.content,
          JSON.stringify(defaultContent)
        );
      } catch (cacheError) {
        console.error('Cache set error:', cacheError);
      }
      
      return NextResponse.json(defaultContent);
    }

    // Cache the content
    try {
      await redis.setEx(
        cacheKeys.pricingContent(lang),
        cacheTTL.content,
        JSON.stringify(content.content)
      );
    } catch (cacheError) {
      console.error('Cache set error:', cacheError);
    }

    return NextResponse.json(content.content);
  } catch (error) {
    console.error('Pricing content error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultPricingContent(lang: string) {
  return {
    title: lang === 'id' ? 'Pilih Paket yang Tepat' : 'Choose the Right Plan',
    subtitle: lang === 'id' 
      ? 'Mulai gratis, upgrade kapan saja sesuai kebutuhan Anda.'
      : 'Start free, upgrade anytime as your needs grow.',
    plans: [
      {
        id: 'free',
        name: lang === 'id' ? 'Gratis' : 'Free',
        price: 0,
        period: lang === 'id' ? '/bulan' : '/month',
        description: lang === 'id' ? 'Sempurna untuk memulai' : 'Perfect for getting started',
        features: [
          lang === 'id' ? '1 tunnel aktif' : '1 active tunnel',
          lang === 'id' ? 'Bandwidth 1GB/bulan' : '1GB bandwidth/month',
          lang === 'id' ? 'Subdomain gratis' : 'Free subdomain',
          lang === 'id' ? 'Dukungan email' : 'Email support',
        ],
        popular: false,
        cta: lang === 'id' ? 'Mulai Gratis' : 'Start Free',
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 10,
        period: lang === 'id' ? '/bulan' : '/month',
        description: lang === 'id' ? 'Untuk developer professional' : 'For professional developers',
        features: [
          lang === 'id' ? '5 tunnel aktif' : '5 active tunnels',
          lang === 'id' ? 'Bandwidth 50GB/bulan' : '50GB bandwidth/month',
          lang === 'id' ? 'Custom domain' : 'Custom domain',
          lang === 'id' ? 'SSL gratis' : 'Free SSL',
          lang === 'id' ? 'Prioritas dukungan' : 'Priority support',
          lang === 'id' ? 'Analitik lanjutan' : 'Advanced analytics',
        ],
        popular: true,
        cta: lang === 'id' ? 'Pilih Pro' : 'Choose Pro',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 50,
        period: lang === 'id' ? '/bulan' : '/month',
        description: lang === 'id' ? 'Untuk tim dan perusahaan' : 'For teams and companies',
        features: [
          lang === 'id' ? 'Tunnel unlimited' : 'Unlimited tunnels',
          lang === 'id' ? 'Bandwidth unlimited' : 'Unlimited bandwidth',
          lang === 'id' ? 'Multiple custom domain' : 'Multiple custom domains',
          lang === 'id' ? 'Dukungan 24/7' : '24/7 support',
          lang === 'id' ? 'SLA 99.9%' : '99.9% SLA',
          lang === 'id' ? 'Manajemen tim' : 'Team management',
          lang === 'id' ? 'API akses' : 'API access',
        ],
        popular: false,
        cta: lang === 'id' ? 'Hubungi Sales' : 'Contact Sales',
      },
    ],
  };
}
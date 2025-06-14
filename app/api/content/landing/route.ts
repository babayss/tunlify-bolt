import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import redis, { cacheKeys, cacheTTL } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKeys.landingContent(lang));
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
      .eq('type', 'landing')
      .eq('lang', lang)
      .single();

    if (error || !content) {
      // Return default content if not found
      const defaultContent = getDefaultLandingContent(lang);
      
      // Cache the default content
      try {
        await redis.setex(
          cacheKeys.landingContent(lang),
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
      await redis.setex(
        cacheKeys.landingContent(lang),
        cacheTTL.content,
        JSON.stringify(content.content)
      );
    } catch (cacheError) {
      console.error('Cache set error:', cacheError);
    }

    return NextResponse.json(content.content);
  } catch (error) {
    console.error('Landing content error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultLandingContent(lang: string) {
  return {
    hero: {
      title: lang === 'id' ? 'Layanan Tunneling Aman & Cepat' : 'Secure & Fast Tunneling Service',
      subtitle: lang === 'id' 
        ? 'Hubungkan aplikasi lokal Anda ke internet dengan layanan tunneling yang handal. Mulai dalam hitungan menit.'
        : 'Connect your local applications to the internet with our reliable tunneling service. Get started in minutes.',
      cta_primary: lang === 'id' ? 'Mulai Sekarang' : 'Get Started',
      cta_secondary: lang === 'id' ? 'Pelajari Lebih Lanjut' : 'Learn More',
    },
    features: [
      {
        icon: 'Shield',
        title: lang === 'id' ? 'Koneksi Aman' : 'Secure Connection',
        description: lang === 'id' ? 'Enkripsi end-to-end untuk semua koneksi Anda' : 'End-to-end encryption for all your connections',
      },
      {
        icon: 'Zap',
        title: lang === 'id' ? 'Sangat Cepat' : 'Lightning Fast',
        description: lang === 'id' ? 'Server yang dioptimalkan di seluruh dunia untuk latensi minimal' : 'Optimized servers worldwide for minimal latency',
      },
      {
        icon: 'Globe',
        title: lang === 'id' ? 'Layanan Handal' : 'Reliable Service',
        description: lang === 'id' ? 'Jaminan uptime 99.9% dengan monitoring 24/7' : '99.9% uptime guarantee with 24/7 monitoring',
      },
    ],
    stats: [
      { number: '99.9%', label: 'Uptime' },
      { number: '50+', label: lang === 'id' ? 'Negara' : 'Countries' },
      { number: '24/7', label: lang === 'id' ? 'Dukungan' : 'Support' },
      { number: '1M+', label: lang === 'id' ? 'Pengguna' : 'Users' },
    ],
    testimonials: [
      {
        name: 'John Doe',
        role: 'Developer',
        content: lang === 'id' 
          ? 'Tunlify telah mengubah alur kerja pengembangan kami.'
          : 'Tunlify has been a game-changer for our development workflow.',
        rating: 5,
      },
      {
        name: 'Jane Smith',
        role: 'DevOps Engineer',
        content: lang === 'id'
          ? 'Handal, cepat, dan aman. Semua yang kami butuhkan dalam layanan tunneling.'
          : 'Reliable, fast, and secure. Everything we need in a tunneling service.',
        rating: 5,
      },
    ],
  };
}
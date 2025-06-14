import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user's tunnels
      const { data: tunnels, error } = await supabaseAdmin
        .from('tunnels')
        .select('*')
        .eq('user_id', decoded.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { message: 'Failed to fetch tunnels' },
          { status: 500 }
        );
      }

      return NextResponse.json(tunnels || []);
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Tunnels fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const { subdomain, target_ip, target_port, location } = await request.json();

      if (!subdomain || !target_ip || !target_port || !location) {
        return NextResponse.json(
          { message: 'All fields are required' },
          { status: 400 }
        );
      }

      // Check if subdomain is already taken
      const { data: existingTunnel } = await supabaseAdmin
        .from('tunnels')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (existingTunnel) {
        return NextResponse.json(
          { message: 'Subdomain is already taken' },
          { status: 409 }
        );
      }

      // Create new tunnel
      const { data: tunnel, error } = await supabaseAdmin
        .from('tunnels')
        .insert({
          user_id: decoded.userId,
          subdomain,
          target_ip,
          target_port,
          location,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { message: 'Failed to create tunnel' },
          { status: 500 }
        );
      }

      return NextResponse.json(tunnel);
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Tunnel creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
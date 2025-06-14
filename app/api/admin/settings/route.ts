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
      
      // Check if user is admin
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', decoded.userId)
        .single();

      if (userError || !user || user.role !== 'admin') {
        return NextResponse.json(
          { message: 'Access denied' },
          { status: 403 }
        );
      }

      // Get admin settings
      const { data: settings, error } = await supabaseAdmin
        .from('admin_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json(
          { message: 'Failed to fetch settings' },
          { status: 500 }
        );
      }

      return NextResponse.json(settings || {});
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin settings fetch error:', error);
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
      
      // Check if user is admin
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', decoded.userId)
        .single();

      if (userError || !user || user.role !== 'admin') {
        return NextResponse.json(
          { message: 'Access denied' },
          { status: 403 }
        );
      }

      const { google_client_id } = await request.json();

      // Check if settings exist
      const { data: existingSettings } = await supabaseAdmin
        .from('admin_settings')
        .select('id')
        .single();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabaseAdmin
          .from('admin_settings')
          .update({ google_client_id })
          .eq('id', existingSettings.id);

        if (error) {
          return NextResponse.json(
            { message: 'Failed to update settings' },
            { status: 500 }
          );
        }
      } else {
        // Create new settings
        const { error } = await supabaseAdmin
          .from('admin_settings')
          .insert({ google_client_id });

        if (error) {
          return NextResponse.json(
            { message: 'Failed to create settings' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ message: 'Settings saved successfully' });
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin settings save error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
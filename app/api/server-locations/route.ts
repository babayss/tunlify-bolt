import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get all server locations (public data)
    const { data: locations, error } = await supabaseAdmin
      .from('server_locations')
      .select('*')
      .order('name');

    if (error) {
      return NextResponse.json(
        { message: 'Failed to fetch server locations' },
        { status: 500 }
      );
    }

    return NextResponse.json(locations || []);
  } catch (error) {
    console.error('Server locations fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
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

      // Get all server locations
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

      return NextResponse.json(locations);
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin server locations fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
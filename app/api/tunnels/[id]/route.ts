import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      
      // Delete tunnel (only if it belongs to the user)
      const { error } = await supabaseAdmin
        .from('tunnels')
        .delete()
        .eq('id', params.id)
        .eq('user_id', decoded.userId);

      if (error) {
        return NextResponse.json(
          { message: 'Failed to delete tunnel' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Tunnel deleted successfully' });
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Tunnel deletion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
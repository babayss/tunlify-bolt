import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Find valid OTP
    const { data: otpToken, error: otpError } = await supabaseAdmin
      .from('otp_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('token', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpToken) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark user as verified
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({ is_verified: true })
      .eq('id', user.id);

    if (updateUserError) {
      return NextResponse.json(
        { message: 'Failed to verify user' },
        { status: 500 }
      );
    }

    // Mark OTP as used
    const { error: updateOtpError } = await supabaseAdmin
      .from('otp_tokens')
      .update({ verified: true })
      .eq('id', otpToken.id);

    if (updateOtpError) {
      console.error('Failed to update OTP status:', updateOtpError);
    }

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
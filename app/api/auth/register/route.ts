import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          name,
          role: 'user',
          is_verified: false,
        },
      ])
      .select()
      .single();

    if (userError) {
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP
    const { error: otpError } = await supabaseAdmin
      .from('otp_tokens')
      .insert([
        {
          user_id: newUser.id,
          token: otp,
          expires_at: expiresAt.toISOString(),
          verified: false,
        },
      ]);

    if (otpError) {
      console.error('OTP creation error:', otpError);
    }

    // TODO: Send OTP via email
    // For now, we'll just log it (in production, implement proper email service)
    console.log(`OTP for ${email}: ${otp}`);

    return NextResponse.json({
      message: 'User created successfully. Please check your email for OTP.',
      userId: newUser.id,
    
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
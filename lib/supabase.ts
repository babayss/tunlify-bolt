import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          name: string;
          role: 'user' | 'admin';
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string | null;
          name: string;
          role?: 'user' | 'admin';
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string | null;
          name?: string;
          role?: 'user' | 'admin';
          is_verified?: boolean;
          created_at?: string;
        };
      };
      tunnels: {
        Row: {
          id: string;
          user_id: string;
          subdomain: string;
          target_ip: string;
          target_port: number;
          location: string;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subdomain: string;
          target_ip: string;
          target_port: number;
          location: string;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subdomain?: string;
          target_ip?: string;
          target_port?: number;
          location?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
      };
      server_locations: {
        Row: {
          id: string;
          name: string;
          region_code: string;
          ip_address: string;
        };
        Insert: {
          id?: string;
          name: string;
          region_code: string;
          ip_address: string;
        };
        Update: {
          id?: string;
          name?: string;
          region_code?: string;
          ip_address?: string;
        };
      };
      content_pages: {
        Row: {
          id: string;
          type: string;
          lang: string;
          title: string | null;
          content: any;
          last_updated: string;
        };
        Insert: {
          id?: string;
          type: string;
          lang: string;
          title?: string | null;
          content: any;
          last_updated?: string;
        };
        Update: {
          id?: string;
          type?: string;
          lang?: string;
          title?: string | null;
          content?: any;
          last_updated?: string;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          google_client_id: string | null;
          google_secret: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          google_client_id?: string | null;
          google_secret?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          google_client_id?: string | null;
          google_secret?: string | null;
          created_at?: string;
        };
      };
      otp_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          verified: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          expires_at: string;
          verified?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          expires_at?: string;
          verified?: boolean;
        };
      };
    };
  };
};
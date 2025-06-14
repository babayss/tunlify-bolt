export const languages = {
  en: 'English',
  id: 'Bahasa Indonesia',
};

export const defaultLanguage = 'en';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    pricing: 'Pricing',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    logout: 'Logout',
    
    // Landing Page
    heroTitle: 'Secure & Fast Tunneling Service',
    heroSubtitle: 'Connect your local applications to the internet with our reliable tunneling service. Get started in minutes.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Features
    features: 'Features',
    secureTitle: 'Secure Connection',
    secureDesc: 'End-to-end encryption for all your connections',
    fastTitle: 'Lightning Fast',
    fastDesc: 'Optimized servers worldwide for minimal latency',
    reliableTitle: 'Reliable Service',
    reliableDesc: '99.9% uptime guarantee with 24/7 monitoring',
    
    // Auth
    emailAddress: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    loginButton: 'Sign In',
    registerButton: 'Create Account',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signUp: 'Sign up',
    signIn: 'Sign in',
    continueWithGoogle: 'Continue with Google',
    
    // Dashboard
    myTunnels: 'My Tunnels',
    createTunnel: 'Create New Tunnel',
    status: 'Status',
    subdomain: 'Subdomain',
    targetAddress: 'Target Address',
    location: 'Location',
    active: 'Active',
    inactive: 'Inactive',
    
    // Admin
    adminPanel: 'Admin Panel',
    manageContent: 'Manage Content',
    manageServers: 'Manage Servers',
    manageUsers: 'Manage Users',
    settings: 'Settings',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  id: {
    // Navigation
    home: 'Beranda',
    pricing: 'Harga',
    login: 'Masuk',
    register: 'Daftar',
    dashboard: 'Dashboard',
    logout: 'Keluar',
    
    // Landing Page
    heroTitle: 'Layanan Tunneling Aman & Cepat',
    heroSubtitle: 'Hubungkan aplikasi lokal Anda ke internet dengan layanan tunneling yang handal. Mulai dalam hitungan menit.',
    getStarted: 'Mulai Sekarang',
    learnMore: 'Pelajari Lebih Lanjut',
    
    // Features
    features: 'Fitur',
    secureTitle: 'Koneksi Aman',
    secureDesc: 'Enkripsi end-to-end untuk semua koneksi Anda',
    fastTitle: 'Sangat Cepat',
    fastDesc: 'Server yang dioptimalkan di seluruh dunia untuk latensi minimal',
    reliableTitle: 'Layanan Handal',
    reliableDesc: 'Jaminan uptime 99.9% dengan monitoring 24/7',
    
    // Auth
    emailAddress: 'Alamat Email',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    fullName: 'Nama Lengkap',
    loginButton: 'Masuk',
    registerButton: 'Buat Akun',
    forgotPassword: 'Lupa Kata Sandi?',
    noAccount: 'Belum punya akun?',
    hasAccount: 'Sudah punya akun?',
    signUp: 'Daftar',
    signIn: 'Masuk',
    continueWithGoogle: 'Lanjutkan dengan Google',
    
    // Dashboard
    myTunnels: 'Tunnel Saya',
    createTunnel: 'Buat Tunnel Baru',
    status: 'Status',
    subdomain: 'Subdomain',
    targetAddress: 'Alamat Target',
    location: 'Lokasi',
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    
    // Admin
    adminPanel: 'Panel Admin',
    manageContent: 'Kelola Konten',
    manageServers: 'Kelola Server',
    manageUsers: 'Kelola Pengguna',
    settings: 'Pengaturan',
    
    // Common
    save: 'Simpan',
    cancel: 'Batal',
    edit: 'Edit',
    delete: 'Hapus',
    loading: 'Memuat...',
    error: 'Error',
    success: 'Berhasil',
  },
};

export function getTranslation(key: string, lang: string = defaultLanguage): string {
  const langTranslations = translations[lang as keyof typeof translations] || translations[defaultLanguage];
  return langTranslations[key as keyof typeof langTranslations] || key;
}
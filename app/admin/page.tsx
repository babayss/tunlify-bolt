'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/components/Navbar';
import { 
  Users, 
  Server, 
  Settings, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  created_at: string;
}

interface ServerLocation {
  id: string;
  name: string;
  region_code: string;
  ip_address: string;
}

interface ContentPage {
  id: string;
  type: string;
  lang: string;
  title: string;
  content: any;
  last_updated: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [serverLocations, setServerLocations] = useState<ServerLocation[]>([]);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleClientId, setGoogleClientId] = useState('');
  
  const { user } = useAuth();
  const { language } = useLanguage();

  const t = (key: string) => getTranslation(key, language);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchServerLocations();
      fetchContentPages();
      fetchSettings();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = Cookies.get('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerLocations = async () => {
    try {
      const response = await fetch('/api/admin/server-locations', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setServerLocations(data);
      }
    } catch (error) {
      console.error('Failed to fetch server locations:', error);
    }
  };

  const fetchContentPages = async () => {
    try {
      const response = await fetch('/api/admin/content', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setContentPages(data);
      }
    } catch (error) {
      console.error('Failed to fetch content pages:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setGoogleClientId(data.google_client_id || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ google_client_id: googleClientId }),
      });

      if (response.ok) {
        toast.success(language === 'id' ? 'Pengaturan berhasil disimpan!' : 'Settings saved successfully!');
      } else {
        toast.error(language === 'id' ? 'Gagal menyimpan pengaturan' : 'Failed to save settings');
      }
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menyimpan pengaturan' : 'Failed to save settings');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'id' ? 'Akses Ditolak' : 'Access Denied'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'id' ? 'Anda tidak memiliki akses ke halaman ini.' : 'You do not have access to this page.'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t('adminPanel')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'id' ? 'Kelola konten, pengguna, dan pengaturan sistem' : 'Manage content, users, and system settings'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Total Pengguna' : 'Total Users'}
                    </p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Lokasi Server' : 'Server Locations'}
                    </p>
                    <p className="text-2xl font-bold">{serverLocations.length}</p>
                  </div>
                  <Server className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Halaman Konten' : 'Content Pages'}
                    </p>
                    <p className="text-2xl font-bold">{contentPages.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Sistem Status' : 'System Status'}
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      {language === 'id' ? 'Aktif' : 'Active'}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">
                {t('manageUsers')}
              </TabsTrigger>
              <TabsTrigger value="content">
                {t('manageContent')}
              </TabsTrigger>
              <TabsTrigger value="servers">
                {t('manageServers')}
              </TabsTrigger>
              <TabsTrigger value="settings">
                {t('settings')}
              </TabsTrigger>
            </TabsList>

            {/* Users Management */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('manageUsers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'id' ? 'Nama' : 'Name'}</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>{language === 'id' ? 'Peran' : 'Role'}</TableHead>
                        <TableHead>{language === 'id' ? 'Status' : 'Status'}</TableHead>
                        <TableHead>{language === 'id' ? 'Bergabung' : 'Joined'}</TableHead>
                        <TableHead>{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_verified ? 'default' : 'destructive'}>
                              {user.is_verified 
                                ? (language === 'id' ? 'Terverifikasi' : 'Verified')
                                : (language === 'id' ? 'Belum Terverifikasi' : 'Unverified')
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management */}
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t('manageContent')}
                    </CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'id' ? 'Tambah Konten' : 'Add Content'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentPages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold capitalize">
                            {page.type} - {page.lang.toUpperCase()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {page.title || (language === 'id' ? 'Tanpa judul' : 'No title')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'id' ? 'Terakhir diperbarui' : 'Last updated'}: {new Date(page.last_updated).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Server Management */}
            <TabsContent value="servers">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {t('manageServers')}
                    </CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'id' ? 'Tambah Server' : 'Add Server'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serverLocations.map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{location.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {language === 'id' ? 'Kode Region' : 'Region Code'}: {location.region_code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            IP: {location.ip_address}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('settings')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="google_client_id">
                        {language === 'id' ? 'Google Client ID' : 'Google Client ID'}
                      </Label>
                      <Input
                        id="google_client_id"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="xxxxx.apps.googleusercontent.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'id' 
                          ? 'Client ID Google OAuth untuk login dengan Google'
                          : 'Google OAuth Client ID for Google login'
                        }
                      </p>
                    </div>
                    
                    <Button onClick={handleSaveSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      {t('save')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
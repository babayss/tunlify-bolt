'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import { 
  Plus, 
  Globe, 
  Activity, 
  Server, 
  Zap,
  BarChart3,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw,
  Download,
  Terminal,
  Key,
  Code,
  CheckCircle,
  Package,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import Cookies from 'js-cookie';

interface Tunnel {
  id: string;
  subdomain: string;
  location: string;
  status: 'active' | 'inactive' | 'connecting';
  connection_token: string;
  created_at: string;
  last_connected?: string;
  client_connected: boolean;
}

interface ServerLocation {
  id: string;
  name: string;
  region_code: string;
  ip_address: string;
}

export default function DashboardPage() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [serverLocations, setServerLocations] = useState<ServerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedTunnel, setSelectedTunnel] = useState<Tunnel | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    subdomain: '',
    location: '',
  });

  const { user } = useAuth();
  const { language } = useLanguage();

  const t = (key: string) => getTranslation(key, language);

  useEffect(() => {
    if (user) {
      fetchTunnels();
      fetchServerLocations();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = Cookies.get('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchTunnels = async () => {
    try {
      const response = await apiClient.get('/api/tunnels', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTunnels(data);
      }
    } catch (error) {
      console.error('Failed to fetch tunnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerLocations = async () => {
    try {
      const response = await apiClient.get('/api/server-locations');
      if (response.ok) {
        const data = await response.json();
        setServerLocations(data);
      }
    } catch (error) {
      console.error('Failed to fetch server locations:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔍 Form field changed: ${field} = "${value}"`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Form submission started');
    console.log('🔍 Current form data:', formData);
    
    // Validation
    if (!formData.subdomain.trim()) {
      toast.error(language === 'id' ? 'Subdomain harus diisi' : 'Subdomain is required');
      return;
    }
    
    if (!formData.location) {
      toast.error(language === 'id' ? 'Lokasi harus dipilih' : 'Location must be selected');
      return;
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    const cleanSubdomain = formData.subdomain.trim().toLowerCase();
    
    if (!subdomainRegex.test(cleanSubdomain)) {
      toast.error(language === 'id' ? 'Subdomain hanya boleh huruf kecil, angka, dan tanda hubung' : 'Subdomain can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    if (cleanSubdomain.length < 3 || cleanSubdomain.length > 50) {
      toast.error(language === 'id' ? 'Subdomain harus 3-50 karakter' : 'Subdomain must be 3-50 characters');
      return;
    }

    setFormLoading(true);
    
    const payload = {
      subdomain: cleanSubdomain,
      location: formData.location
    };
    
    console.log('🔍 Sending payload:', payload);
    
    try {
      const response = await apiClient.post('/api/tunnels', payload, {
        headers: getAuthHeaders(),
      });

      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const tunnel = await response.json();
        console.log('✅ Tunnel created:', tunnel);
        
        toast.success(language === 'id' ? 'Tunnel berhasil dibuat!' : 'Tunnel created successfully!');
        setCreateDialogOpen(false);
        setFormData({ subdomain: '', location: '' });
        fetchTunnels();
        
        // Show setup dialog
        setSelectedTunnel(tunnel);
        setSetupDialogOpen(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Tunnel creation failed:', errorText);
        
        try {
          const error = JSON.parse(errorText);
          if (error.errors && Array.isArray(error.errors)) {
            const errorMessages = error.errors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
            toast.error(errorMessages);
          } else {
            toast.error(error.message || (language === 'id' ? 'Gagal membuat tunnel' : 'Failed to create tunnel'));
          }
        } catch (parseError) {
          toast.error(language === 'id' ? 'Gagal membuat tunnel' : 'Failed to create tunnel');
        }
      }
    } catch (error) {
      console.error('❌ Tunnel creation error:', error);
      toast.error(language === 'id' ? 'Gagal membuat tunnel' : 'Failed to create tunnel');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTunnel = async (tunnelId: string) => {
    try {
      const response = await apiClient.delete(`/api/tunnels/${tunnelId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success(language === 'id' ? 'Tunnel berhasil dihapus!' : 'Tunnel deleted successfully!');
        fetchTunnels();
      } else {
        toast.error(language === 'id' ? 'Gagal menghapus tunnel' : 'Failed to delete tunnel');
      }
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menghapus tunnel' : 'Failed to delete tunnel');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'id' ? 'Disalin ke clipboard!' : 'Copied to clipboard!');
  };

  const getClientCommands = (tunnel: Tunnel) => {
    return {
      npm: `npx tunlify-client -t ${tunnel.connection_token} -l 127.0.0.1:3000`,
      node: `tunlify -t ${tunnel.connection_token} -l 127.0.0.1:3000`,
      golang: `./tunlify-client -token=${tunnel.connection_token} -local=127.0.0.1:3000`
    };
  };

  const getDownloadUrls = () => {
    return {
      npm: 'https://www.npmjs.com/package/tunlify-client',
      windows: 'https://github.com/tunlify/client/releases/latest/download/tunlify-win.exe',
      macos: 'https://github.com/tunlify/client/releases/latest/download/tunlify-macos',
      linux: 'https://github.com/tunlify/client/releases/latest/download/tunlify-linux'
    };
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {language === 'id' ? 'Dashboard' : 'Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'id' ? `Selamat datang kembali, ${user?.name}!` : `Welcome back, ${user?.name}!`}
              </p>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createTunnel')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('createTunnel')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTunnel} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">{t('subdomain')}</Label>
                    <Input
                      id="subdomain"
                      value={formData.subdomain}
                      onChange={(e) => handleInputChange('subdomain', e.target.value)}
                      placeholder="myapp"
                      required
                      disabled={formLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'id' ? 'Akan menjadi: ' : 'Will become: '}
                      {formData.subdomain || 'myapp'}.{formData.location || 'id'}.tunlify.biz.id
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('location')}</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleInputChange('location', value)}
                      disabled={formLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'id' ? 'Pilih lokasi' : 'Select location'} />
                      </SelectTrigger>
                      <SelectContent>
                        {serverLocations.map((location) => (
                          <SelectItem key={location.id} value={location.region_code}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {language === 'id' 
                        ? 'Setelah tunnel dibuat, Anda akan mendapat token untuk menghubungkan aplikasi lokal.'
                        : 'After creating the tunnel, you will receive a token to connect your local application.'
                      }
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={formLoading}>
                      {formLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === 'id' ? 'Membuat...' : 'Creating...'}
                        </>
                      ) : (
                        language === 'id' ? 'Buat Tunnel' : 'Create Tunnel'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                      disabled={formLoading}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Total Tunnel' : 'Total Tunnels'}
                    </p>
                    <p className="text-2xl font-bold">{tunnels.length}</p>
                  </div>
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Tunnel Aktif' : 'Active Tunnels'}
                    </p>
                    <p className="text-2xl font-bold">
                      {tunnels.filter(t => t.client_connected).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Bandwidth' : 'Bandwidth'}
                    </p>
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'id' ? 'Tidak tersedia' : 'Not available'}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'id' ? 'Status' : 'Status'}
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      {language === 'id' ? 'Aktif' : 'Active'}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tunnels List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  {t('myTunnels')}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchTunnels}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {language === 'id' ? 'Refresh' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tunnels.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'id' ? 'Belum ada tunnel' : 'No tunnels yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'id' ? 'Buat tunnel pertama Anda untuk memulai' : 'Create your first tunnel to get started'}
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createTunnel')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tunnels.map((tunnel) => (
                    <div key={tunnel.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {tunnel.subdomain}.{tunnel.location}.tunlify.biz.id
                          </h3>
                          <Badge variant={tunnel.client_connected ? 'default' : 'secondary'}>
                            {tunnel.client_connected ? (language === 'id' ? 'Terhubung' : 'Connected') : (language === 'id' ? 'Tidak Terhubung' : 'Disconnected')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {t('location')}: {serverLocations.find(l => l.region_code === tunnel.location)?.name || tunnel.location}
                          </p>
                          <p>
                            {language === 'id' ? 'Dibuat' : 'Created'}: {new Date(tunnel.created_at).toLocaleDateString()}
                          </p>
                          {tunnel.last_connected && (
                            <p>
                              {language === 'id' ? 'Terakhir terhubung' : 'Last connected'}: {new Date(tunnel.last_connected).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTunnel(tunnel);
                            setSetupDialogOpen(true);
                          }}
                        >
                          <Terminal className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`https://${tunnel.subdomain}.${tunnel.location}.tunlify.biz.id`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`https://${tunnel.subdomain}.${tunnel.location}.tunlify.biz.id`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTunnel(tunnel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Dialog */}
          <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {language === 'id' ? 'Setup Tunnel Client' : 'Setup Tunnel Client'}
                </DialogTitle>
              </DialogHeader>
              
              {selectedTunnel && (
                <div className="space-y-6">
                  {/* Tunnel Info */}
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Tunnel URL:</strong> https://{selectedTunnel.subdomain}.{selectedTunnel.location}.tunlify.biz.id
                    </AlertDescription>
                  </Alert>

                  <Tabs defaultValue="npm" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="npm" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        NPM
                      </TabsTrigger>
                      <TabsTrigger value="binary" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Binary
                      </TabsTrigger>
                      <TabsTrigger value="golang" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Golang
                      </TabsTrigger>
                      <TabsTrigger value="token" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Token
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* NPM Installation */}
                    <TabsContent value="npm" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {language === 'id' ? 'NPM Client (Recommended)' : 'NPM Client (Recommended)'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {language === 'id' 
                            ? 'Cara termudah - kebanyakan developer sudah punya Node.js'
                            : 'Easiest way - most developers already have Node.js'
                          }
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'id' ? '1. Install Global (Sekali saja)' : '1. Install Global (One time)'}
                            </Label>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                              <code className="text-sm font-mono">npm install -g tunlify-client</code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => copyToClipboard('npm install -g tunlify-client')}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'id' ? '2. Jalankan Tunnel' : '2. Run Tunnel'}
                            </Label>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                              <code className="text-sm font-mono">
                                {getClientCommands(selectedTunnel).node}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => copyToClipboard(getClientCommands(selectedTunnel).node)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'id' ? 'Atau tanpa install (NPX)' : 'Or without install (NPX)'}
                            </Label>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                              <code className="text-sm font-mono">
                                {getClientCommands(selectedTunnel).npm}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => copyToClipboard(getClientCommands(selectedTunnel).npm)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Binary Download */}
                    <TabsContent value="binary" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          {language === 'id' ? 'Download Executable' : 'Download Executable'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {language === 'id' 
                            ? 'Download executable untuk OS Anda (tidak perlu install Node.js)'
                            : 'Download executable for your OS (no Node.js required)'
                          }
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button variant="outline" asChild>
                            <a href={getDownloadUrls().windows} target="_blank">
                              <Download className="h-4 w-4 mr-2" />
                              Windows
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href={getDownloadUrls().macos} target="_blank">
                              <Download className="h-4 w-4 mr-2" />
                              macOS
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href={getDownloadUrls().linux} target="_blank">
                              <Download className="h-4 w-4 mr-2" />
                              Linux
                            </a>
                          </Button>
                        </div>
                        
                        <div className="mt-4">
                          <Label className="text-sm font-medium">
                            {language === 'id' ? 'Jalankan setelah download' : 'Run after download'}
                          </Label>
                          <div className="bg-muted p-3 rounded-lg mt-1">
                            <code className="text-sm font-mono">
                              ./tunlify -t {selectedTunnel.connection_token} -l 127.0.0.1:3000
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => copyToClipboard(`./tunlify -t ${selectedTunnel.connection_token} -l 127.0.0.1:3000`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Golang Client */}
                    <TabsContent value="golang" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          {language === 'id' ? 'Golang Client' : 'Golang Client'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {language === 'id' 
                            ? 'Client Golang (perlu install Go compiler)'
                            : 'Golang client (requires Go compiler)'
                          }
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'id' ? '1. Download Source' : '1. Download Source'}
                            </Label>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                              <code className="text-sm font-mono">git clone https://github.com/tunlify/golang-client.git</code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => copyToClipboard('git clone https://github.com/tunlify/golang-client.git')}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'id' ? '2. Build & Run' : '2. Build & Run'}
                            </Label>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                              <code className="text-sm font-mono">
                                {getClientCommands(selectedTunnel).golang}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => copyToClipboard(getClientCommands(selectedTunnel).golang)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Connection Token */}
                    <TabsContent value="token" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          {language === 'id' ? 'Connection Token' : 'Connection Token'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={selectedTunnel.connection_token} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedTunnel.connection_token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {language === 'id' 
                            ? 'Token ini digunakan untuk menghubungkan client ke tunnel Anda. Jangan bagikan ke orang lain.'
                            : 'This token is used to connect your client to your tunnel. Do not share with others.'
                          }
                        </p>
                        
                        <Alert className="mt-4">
                          <Monitor className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{language === 'id' ? 'Contoh penggunaan:' : 'Usage examples:'}</strong>
                            <br />
                            • Web app: <code>-l 127.0.0.1:3000</code>
                            <br />
                            • API server: <code>-l 127.0.0.1:8080</code>
                            <br />
                            • Database: <code>-l 127.0.0.1:5432</code>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end">
                    <Button onClick={() => setSetupDialogOpen(false)}>
                      {language === 'id' ? 'Selesai' : 'Done'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}
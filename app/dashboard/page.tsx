'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import { 
  Plus, 
  Globe, 
  Activity, 
  Server, 
  Zap,
  BarChart3,
  Settings,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface Tunnel {
  id: string;
  subdomain: string;
  target_ip: string;
  target_port: number;
  location: string;
  status: 'active' | 'inactive';
  created_at: string;
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
  const [newTunnel, setNewTunnel] = useState({
    subdomain: '',
    target_ip: '',
    target_port: '',
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

  const fetchTunnels = async () => {
    try {
      const response = await fetch('/api/tunnels');
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
      const response = await fetch('/api/server-locations');
      if (response.ok) {
        const data = await response.json();
        setServerLocations(data);
      }
    } catch (error) {
      console.error('Failed to fetch server locations:', error);
    }
  };

  const handleCreateTunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tunnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTunnel,
          target_port: parseInt(newTunnel.target_port),
        }),
      });

      if (response.ok) {
        toast.success(language === 'id' ? 'Tunnel berhasil dibuat!' : 'Tunnel created successfully!');
        setCreateDialogOpen(false);
        setNewTunnel({ subdomain: '', target_ip: '', target_port: '', location: '' });
        fetchTunnels();
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal membuat tunnel' : 'Failed to create tunnel');
    }
  };

  const handleDeleteTunnel = async (tunnelId: string) => {
    try {
      const response = await fetch(`/api/tunnels/${tunnelId}`, {
        method: 'DELETE',
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
                      value={newTunnel.subdomain}
                      onChange={(e) => setNewTunnel({ ...newTunnel, subdomain: e.target.value })}
                      placeholder="myapp"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'id' ? 'Akan menjadi: ' : 'Will become: '}
                      {newTunnel.subdomain || 'myapp'}.tunlify.biz.id
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target_ip">
                      {language === 'id' ? 'IP Target' : 'Target IP'}
                    </Label>
                    <Input
                      id="target_ip"
                      value={newTunnel.target_ip}
                      onChange={(e) => setNewTunnel({ ...newTunnel, target_ip: e.target.value })}
                      placeholder="127.0.0.1"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target_port">
                      {language === 'id' ? 'Port Target' : 'Target Port'}
                    </Label>
                    <Input
                      id="target_port"
                      type="number"
                      value={newTunnel.target_port}
                      onChange={(e) => setNewTunnel({ ...newTunnel, target_port: e.target.value })}
                      placeholder="3000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('location')}</Label>
                    <Select
                      value={newTunnel.location}
                      onValueChange={(value) => setNewTunnel({ ...newTunnel, location: value })}
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
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {language === 'id' ? 'Buat Tunnel' : 'Create Tunnel'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
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
                      {tunnels.filter(t => t.status === 'active').length}
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
                    <p className="text-2xl font-bold">1.2GB</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'id' ? 'dari 50GB' : 'of 50GB'}
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
                      {language === 'id' ? 'Uptime' : 'Uptime'}
                    </p>
                    <p className="text-2xl font-bold">99.9%</p>
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
                            {tunnel.subdomain}.tunlify.biz.id
                          </h3>
                          <Badge variant={tunnel.status === 'active' ? 'default' : 'secondary'}>
                            {tunnel.status === 'active' ? t('active') : t('inactive')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {t('targetAddress')}: {tunnel.target_ip}:{tunnel.target_port}
                          </p>
                          <p>
                            {t('location')}: {serverLocations.find(l => l.region_code === tunnel.location)?.name || tunnel.location}
                          </p>
                          <p>
                            {language === 'id' ? 'Dibuat' : 'Created'}: {new Date(tunnel.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`https://${tunnel.subdomain}.tunlify.biz.id`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`https://${tunnel.subdomain}.tunlify.biz.id`} target="_blank" rel="noopener noreferrer">
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
        </motion.div>
      </div>
    </div>
  );
}
'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import {
  Building2, Palette, Bell, Save, Upload, Check, Shield,
  Globe, Mail, Phone, MapPin, CreditCard, Trash2, AlertTriangle,
  Plug, ToggleLeft, ToggleRight, ChevronRight, Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

const themeColors = [
  { value: '#4F46E5', label: 'Indigo' },
  { value: '#DC2626', label: 'Red' },
  { value: '#059669', label: 'Green' },
  { value: '#D97706', label: 'Amber' },
  { value: '#7C3AED', label: 'Purple' },
  { value: '#0891B2', label: 'Cyan' },
  { value: '#DB2777', label: 'Pink' },
  { value: '#1D4ED8', label: 'Blue' },
  { value: '#0F172A', label: 'Dark' },
  { value: '#16A34A', label: 'Forest' },
];

type TabKey = 'business' | 'branding' | 'notifications' | 'integrations' | 'danger';

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'business', label: 'Business Info', icon: Building2 },
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'danger', label: 'Danger Zone', icon: Shield },
];

const notificationSettings = [
  { id: 'notif-new-order', label: 'New Order Received', description: 'Alert when a new order is placed', defaultOn: true },
  { id: 'notif-order-status', label: 'Order Status Changes', description: 'When an order status is updated', defaultOn: true },
  { id: 'notif-low-stock', label: 'Low Stock Alerts', description: 'When inventory falls below minimum', defaultOn: true },
  { id: 'notif-delivery', label: 'Delivery Updates', description: 'Driver check-ins and delivery confirmations', defaultOn: true },
  { id: 'notif-payment', label: 'Payment Received', description: 'When a payment is confirmed', defaultOn: false },
  { id: 'notif-customer', label: 'New Customer Signup', description: 'When a new customer registers', defaultOn: false },
  { id: 'notif-report', label: 'Weekly Reports', description: 'Automated weekly summary email', defaultOn: true },
  { id: 'notif-subscription', label: 'Subscription Alerts', description: 'Billing and plan change notifications', defaultOn: true },
];

const integrations = [
  { id: 'int-stripe', name: 'Stripe', description: 'Payment processing & subscriptions', icon: '💳', connected: false, category: 'Payments' },
  { id: 'int-whatsapp', name: 'WhatsApp Business', description: 'Send order updates via WhatsApp', icon: '💬', connected: false, category: 'Messaging' },
  { id: 'int-email', name: 'Email (Resend)', description: 'Transactional email delivery', icon: '📧', connected: false, category: 'Messaging' },
  { id: 'int-maps', name: 'Google Maps', description: 'Route optimization for drivers', icon: '🗺️', connected: false, category: 'Logistics' },
  { id: 'int-xero', name: 'Xero', description: 'Accounting & invoicing sync', icon: '📊', connected: false, category: 'Finance' },
  { id: 'int-zapier', name: 'Zapier', description: 'Connect to 5,000+ apps', icon: '⚡', connected: false, category: 'Automation' },
];

export default function BusinessSettingsPage() {
  const { business, userProfile, refreshBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('business');
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(business?.primary_color || '#4F46E5');
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationSettings.map((n) => [n.id, n.defaultOn]))
  );
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [businessForm, setBusinessForm] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    business_type: business?.business_type || '',
    address: '',
    city: '',
    website: '',
    email: userProfile?.email || '',
  });

  const supabase = createClient();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Logo must be under 5MB'); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveBusinessSettings = async () => {
    if (!business?.id) return;
    setSaving(true);
    try {
      let logoUrl = business.logo_url;
      if (logoFile && userProfile?.id) {
        const ext = logoFile.name.split('.').pop();
        const path = `${userProfile.id}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(path, logoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessForm.name,
          phone: businessForm.phone,
          business_type: businessForm.business_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id);
      if (error) throw error;
      await refreshBusiness();
      toast.success('Business settings saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveBranding = async () => {
    if (!business?.id) return;
    setSaving(true);
    try {
      let logoUrl = business.logo_url;
      if (logoFile && userProfile?.id) {
        const ext = logoFile.name.split('.').pop();
        const path = `${userProfile.id}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(path, logoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }
      const { error } = await supabase
        .from('businesses')
        .update({ primary_color: selectedColor, logo_url: logoUrl, updated_at: new Date().toISOString() })
        .eq('id', business.id);
      if (error) throw error;
      await refreshBusiness();
      toast.success('Branding saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your business profile, branding, and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${tab.key === 'danger' ? 'text-danger hover:bg-danger/10 hover:text-danger' : ''}`}
                >
                  <tab.icon size={17} className="flex-shrink-0" />
                  {tab.label}
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="space-y-5">
                <div className="card-base p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Business Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={businessForm.name}
                        onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Business Type</label>
                      <select
                        className="input-field"
                        value={businessForm.business_type}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_type: e.target.value })}
                      >
                        <option value="bakery">🥖 Bakery</option>
                        <option value="butchery">🥩 Butchery</option>
                        <option value="restaurant">🍽️ Restaurant</option>
                        <option value="coffee-shop">☕ Coffee Shop</option>
                        <option value="catering">🍱 Catering</option>
                        <option value="distributor">🚚 Distributor</option>
                        <option value="manufacturer">🏭 Manufacturer</option>
                        <option value="wholesaler">📦 Wholesaler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Phone size={13} className="inline mr-1" />Phone Number
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                        placeholder="+27 82 555 1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Mail size={13} className="inline mr-1" />Business Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={businessForm.email}
                        onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                        placeholder="contact@yourbusiness.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <MapPin size={13} className="inline mr-1" />Address
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={businessForm.address}
                        onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Globe size={13} className="inline mr-1" />Website
                      </label>
                      <input
                        type="url"
                        className="input-field"
                        value={businessForm.website}
                        onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="card-base p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-primary" />
                    Security
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Password</p>
                        <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                      </div>
                      <button className="btn-secondary text-sm py-2 px-4">Change Password</button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <button className="btn-secondary text-sm py-2 px-4">Enable 2FA</button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveBusinessSettings}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><Save size={16} />Save Business Info</>
                  )}
                </button>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-5">
                <div className="card-base p-5">
                  <h3 className="font-semibold text-foreground mb-4">Business Logo</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border-2 border-border overflow-hidden flex items-center justify-center bg-muted flex-shrink-0">
                      {logoPreview || business?.logo_url ? (
                        <img
                          src={logoPreview || business?.logo_url || ''}
                          alt="Business logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 size={28} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="cursor-pointer block">
                        <div className="btn-secondary text-sm inline-flex items-center gap-2">
                          <Upload size={14} /> Upload Logo
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                      </label>
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                      <p className="text-xs text-muted-foreground">Recommended: 200×200px square</p>
                    </div>
                  </div>
                </div>

                <div className="card-base p-5">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    <Palette size={16} className="text-primary" />
                    Brand Color
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Used across your dashboard, invoices, and customer-facing pages</p>
                  <div className="flex gap-3 flex-wrap">
                    {themeColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-11 h-11 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color.value ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      >
                        {selectedColor === color.value && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: selectedColor }} />
                    <div>
                      <p className="text-sm font-medium text-foreground">Selected Color</p>
                      <p className="text-xs font-mono text-muted-foreground">{selectedColor}</p>
                    </div>
                  </div>
                </div>

                <div className="card-base p-5">
                  <h3 className="font-semibold text-foreground mb-4">Preview</h3>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="h-10 flex items-center px-4 gap-2" style={{ backgroundColor: selectedColor }}>
                      <div className="w-5 h-5 bg-white/30 rounded" />
                      <span className="text-white text-sm font-semibold">{businessForm.name || 'Your Business'}</span>
                    </div>
                    <div className="p-4 bg-muted/30 flex gap-3">
                      <div className="h-8 rounded-lg px-4 flex items-center text-white text-xs font-medium" style={{ backgroundColor: selectedColor }}>
                        Primary Button
                      </div>
                      <div className="h-8 rounded-lg px-4 flex items-center text-xs font-medium border border-border bg-card text-foreground">
                        Secondary
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveBranding}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><Save size={16} />Save Branding</>
                  )}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="card-base overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notification Preferences</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose what alerts you receive</p>
                  </div>
                  <div className="divide-y divide-border">
                    {notificationSettings.map((notif) => (
                      <div key={notif.id} className="flex items-center justify-between px-5 py-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-foreground">{notif.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                        </div>
                        <button
                          onClick={() => setNotifToggles((prev) => ({ ...prev, [notif.id]: !prev[notif.id] }))}
                          className="flex-shrink-0 transition-colors"
                        >
                          {notifToggles[notif.id] ? (
                            <ToggleRight size={28} className="text-primary" />
                          ) : (
                            <ToggleLeft size={28} className="text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-base p-5">
                  <h3 className="font-semibold text-foreground mb-4">Notification Channels</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'In-App Notifications', desc: 'Show alerts inside the dashboard', enabled: true },
                      { label: 'Email Notifications', desc: 'Send alerts to your business email', enabled: true },
                      { label: 'SMS Notifications', desc: 'Text message alerts (requires SMS setup)', enabled: false },
                    ].map((channel, i) => (
                      <div key={`channel-${i}`} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{channel.label}</p>
                          <p className="text-xs text-muted-foreground">{channel.desc}</p>
                        </div>
                        <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${channel.enabled ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
                          <div className="w-4 h-4 bg-white rounded-full shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Notification preferences saved!')}
                  className="btn-primary text-sm"
                >
                  <Save size={16} />Save Preferences
                </button>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-5">
                <div className="card-base overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Available Integrations</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Connect your favourite tools to WITH-IN</p>
                  </div>
                  <div className="divide-y divide-border">
                    {integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                        <span className="text-3xl flex-shrink-0">{integration.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{integration.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                        </div>
                        <button
                          onClick={() => toast.info(`${integration.name} integration coming soon!`)}
                          className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                            integration.connected
                              ? 'bg-success/10 text-success hover:bg-success/20' :'btn-secondary'
                          }`}
                        >
                          {integration.connected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-base p-5 border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <CreditCard size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">Subscription & Billing</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage your WITH-IN subscription, view invoices, and update payment methods.
                      </p>
                      <a href="/subscription" className="btn-primary text-sm mt-3 inline-flex">
                        Manage Subscription
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-5">
                <div className="card-base p-5 border-warning/30">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-warning" />
                    Export Business Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a full export of your business data including orders, customers, products, and reports.
                  </p>
                  <button
                    onClick={() => toast.info('Data export will be emailed to you within 24 hours.')}
                    className="btn-secondary text-sm"
                  >
                    Request Data Export
                  </button>
                </div>

                <div className="card-base p-5 border-warning/30">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-warning" />
                    Pause Business Account
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Temporarily pause your account. Your data will be preserved and you can reactivate at any time.
                  </p>
                  <button
                    onClick={() => toast.warning('Account pause requires confirmation — contact support.')}
                    className="btn-secondary text-sm border-warning/40 text-warning hover:bg-warning/10"
                  >
                    Pause Account
                  </button>
                </div>

                <div className="card-base p-5 border-danger/30 bg-danger/5">
                  <h3 className="font-semibold text-danger mb-1 flex items-center gap-2">
                    <Trash2 size={16} />
                    Delete Business Account
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your business account and all associated data. This action cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-danger">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        className="input-field border-danger/40 max-w-xs"
                        placeholder="Type DELETE"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                      />
                    </div>
                    <button
                      disabled={deleteConfirm !== 'DELETE'}
                      onClick={() => toast.error('Account deletion requires support verification. Please contact support@within.app')}
                      className="btn-primary text-sm bg-danger hover:bg-danger/90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={15} />
                      Delete Account Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}

'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Building2, User, Palette, Bell, Save, Upload, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const themeColors = [
  { value: '#4F46E5', label: 'Indigo' },
  { value: '#DC2626', label: 'Red' },
  { value: '#059669', label: 'Green' },
  { value: '#D97706', label: 'Amber' },
  { value: '#7C3AED', label: 'Purple' },
  { value: '#0891B2', label: 'Cyan' },
  { value: '#DB2777', label: 'Pink' },
  { value: '#1D4ED8', label: 'Blue' },
];

export default function SettingsPage() {
  const { business, userProfile, refreshBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState<'business' | 'profile' | 'notifications'>('business');
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(business?.primary_color || '#4F46E5');

  const [businessForm, setBusinessForm] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    business_type: business?.business_type || '',
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
          primary_color: selectedColor,
          logo_url: logoUrl,
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

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your business and account settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {([
            { key: 'business', label: 'Business', icon: Building2 },
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'notifications', label: 'Notifications', icon: Bell },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Business Settings */}
        {activeTab === 'business' && (
          <div className="max-w-2xl space-y-6">
            {/* Logo */}
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-4">Business Logo</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-border overflow-hidden flex items-center justify-center bg-muted">
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
                <div>
                  <label className="cursor-pointer">
                    <div className="btn-secondary text-sm">
                      <Upload size={14} /> Upload Logo
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-4">Business Information</h3>
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
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
              </div>
            </div>

            {/* Brand Color */}
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-4">
                <Palette size={16} className="inline mr-2" />
                Brand Color
              </h3>
              <div className="flex gap-3 flex-wrap">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color.value ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  >
                    {selectedColor === color.value && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Selected: <span className="font-mono">{selectedColor}</span>
              </p>
            </div>

            <button
              onClick={saveBusinessSettings}
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : (
                <><Save size={16} />Save Settings</>
              )}
            </button>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-4">Your Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input type="text" className="input-field" defaultValue={userProfile?.full_name || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <input type="email" className="input-field" defaultValue={userProfile?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <input type="text" className="input-field capitalize" defaultValue={userProfile?.role || ''} disabled />
                </div>
              </div>
              <button className="btn-primary text-sm mt-6">
                <Save size={16} />Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'New Orders', description: 'Get notified when a new order is placed', enabled: true },
                  { label: 'Low Stock Alerts', description: 'Alert when products fall below reorder level', enabled: true },
                  { label: 'Subscription Reminders', description: 'Reminders before trial/subscription expires', enabled: true },
                  { label: 'Delivery Updates', description: 'Updates on delivery status changes', enabled: false },
                  { label: 'Weekly Reports', description: 'Weekly summary of business performance', enabled: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">{notif.label}</p>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
              <button className="btn-primary text-sm mt-6">
                <Save size={16} />Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}

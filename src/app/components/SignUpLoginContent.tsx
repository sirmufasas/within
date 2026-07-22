'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Eye, EyeOff, ArrowRight, Check, Building2,
  ShoppingBag, Users, TrendingUp, Copy, LogIn, Upload, Palette,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import WithinLoader from '@/components/WithinLoader';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type SignUpFormData = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  password: string;
  confirmPassword: string;
  themeColor: string;
  agreeTerms: boolean;
};

const businessTypes = [
  { value: 'bakery', label: '🥖 Bakery / Padaria' },
  { value: 'butchery', label: '🥩 Butchery / Talho' },
  { value: 'restaurant', label: '🍽️ Restaurant / Restaurante' },
  { value: 'coffee-shop', label: '☕ Coffee Shop / Café' },
  { value: 'catering', label: '🍱 Catering / Catering' },
  { value: 'fruit-veg', label: '🥦 Fruit & Vegetable Supplier' },
  { value: 'cleaning', label: '🧹 Cleaning Supplies' },
  { value: 'distributor', label: '🚚 Distributor / Distribuidor' },
  { value: 'manufacturer', label: '🏭 Manufacturer / Fabricante' },
  { value: 'wholesaler', label: '📦 Wholesaler / Grossista' },
];

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

const demoAccounts = [
  {
    id: 'demo-admin',
    role: 'Business Admin',
    email: 'admin@padariasaojoao.pt',
    password: 'SaoJoao#2026',
    badge: 'Business',
    badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'demo-super',
    role: 'Super Admin',
    email: 'superadmin@within.app',
    password: 'Within@Super2026',
    badge: 'Platform',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
];

const platformStats = [
  { id: 'stat-businesses', label: 'Active Businesses', value: '247', icon: Building2 },
  { id: 'stat-orders', label: 'Orders This Month', value: '18,492', icon: ShoppingBag },
  { id: 'stat-customers', label: 'End Customers', value: '62,300+', icon: Users },
  { id: 'stat-growth', label: 'MoM Growth', value: '+23%', icon: TrendingUp },
];

export default function SignUpLoginContent() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Loading your workspace...');

  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const loginForm = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const signupForm = useForm<SignUpFormData>({
    defaultValues: {
      businessName: '', ownerName: '', email: '', phone: '',
      businessType: '', password: '', confirmPassword: '',
      themeColor: '#4F46E5', agreeTerms: false,
    },
  });

  const autofillCredentials = (account: typeof demoAccounts[0]) => {
    loginForm.setValue('email', account.email);
    loginForm.setValue('password', account.password);
    setActiveTab('login');
    toast.success(`${account.role} credentials filled in`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onLogin = async (data: LoginFormData) => {
    setLoginLoading(true);
    try {
      await signIn(data.email, data.password);
      setLoaderMessage('Loading your workspace...');
      setShowLoader(true);

      // Check if super admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('email', data.email)
        .maybeSingle();

      setTimeout(() => {
        if (profile?.role === 'super_admin') {
          router.push('/super-admin-panel');
        } else {
          router.push('/business-admin-dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setLoginLoading(false);
      loginForm.setError('email', { message: err.message || 'Invalid credentials' });
    }
  };

  const onSignup = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    if (!data.agreeTerms) {
      signupForm.setError('agreeTerms', { message: 'You must agree to the terms' });
      return;
    }
    setSignupLoading(true);
    try {
      // 1. Create auth user
      const authData = await signUp(data.email, data.password, {
        fullName: data.ownerName,
        role: 'owner',
      });

      const userId = authData?.user?.id;
      if (!userId) throw new Error('Signup failed — no user ID returned');

      // 2. Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split('.').pop();
        const path = `${userId}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(path, logoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('business-logos')
            .getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }

      // 3. Create business
      const slug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data: biz, error: bizError } = await supabase
        .from('businesses')
        .insert({
          slug: `${slug}-${Date.now()}`,
          name: data.businessName,
          business_type: data.businessType,
          phone: data.phone,
          logo_url: logoUrl,
          primary_color: selectedColor,
          subscription_status: 'trial',
          plan: 'starter',
          is_active: true,
        })
        .select()
        .single();

      if (bizError) throw bizError;

      // 4. Link user to business
      await supabase.from('business_users').insert({
        business_id: biz.id,
        user_id: userId,
        role: 'owner',
      });

      setLoaderMessage('Setting up your workspace...');
      setShowLoader(true);
      setTimeout(() => router.push('/business-admin-dashboard'), 2000);
    } catch (err: any) {
      setSignupLoading(false);
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  if (showLoader) {
    return <WithinLoader message={loaderMessage} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] within-gradient flex-col relative overflow-hidden flex-shrink-0">
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="/assets/images/download-1784730896538.png"
                alt="WITH-IN Logo"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <p className="text-white text-xl font-bold leading-tight">WITH-IN</p>
              <p className="text-indigo-200 text-xs">Business Management Platform</p>
            </div>
          </div>

          <div className="mt-16 flex-1">
            <h1 className="text-white text-4xl font-bold leading-tight">
              Your business,<br />
              <span className="text-indigo-200">fully managed.</span>
            </h1>
            <p className="text-indigo-200 text-base mt-4 leading-relaxed">
              Orders, inventory, customers, deliveries — all in one platform built for
              bakeries, restaurants, butcheries, and more.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Multi-location inventory & stock tracking',
                'Real-time order management & driver dispatch',
                'Customer portal & repeat order automation',
                'Revenue reports, P&L, and export tools',
              ].map((feature, i) => (
                <div key={`feature-${i}`} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  <p className="text-indigo-100 text-sm">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {platformStats.map((stat) => (
                <div key={stat.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className="text-indigo-200" />
                    <p className="text-indigo-200 text-xs">{stat.label}</p>
                  </div>
                  <p className="text-white text-xl font-bold tabular-nums">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-indigo-300 text-xs">
              Trusted by 247 businesses · 14-day free trial · No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 within-gradient rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/assets/images/download-1784730896538.png"
                alt="WITH-IN"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-bold text-foreground">WITH-IN</span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === 'login' ? 'Welcome back' : 'Start your free trial'}
              </h2>
              <p className="text-secondary-foreground text-sm mt-1">
                {activeTab === 'login' ? 'Sign in to your business workspace' : '14 days free — no credit card required'}
              </p>
            </div>

            <div className="flex bg-muted rounded-xl p-1 mb-6">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 fade-in">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="input-field"
                    placeholder="admin@yourbusiness.com"
                    {...loginForm.register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-danger text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    <button type="button" className="text-xs text-primary hover:underline font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter your password"
                      {...loginForm.register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-danger text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  {loginLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                  ) : (
                    <><LogIn size={16} />Sign In</>
                  )}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4 fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Business Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="My Business"
                      {...signupForm.register('businessName', { required: 'Business name is required' })}
                    />
                    {signupForm.formState.errors.businessName && (
                      <p className="text-danger text-xs mt-1">{signupForm.formState.errors.businessName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Smith"
                      {...signupForm.register('ownerName', { required: 'Your name is required' })}
                    />
                    {signupForm.formState.errors.ownerName && (
                      <p className="text-danger text-xs mt-1">{signupForm.formState.errors.ownerName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Business Type</label>
                  <select
                    className="input-field"
                    {...signupForm.register('businessType', { required: 'Select a business type' })}
                  >
                    <option value="">Select your business type...</option>
                    {businessTypes.map((bt) => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                  {signupForm.formState.errors.businessType && (
                    <p className="text-danger text-xs mt-1">{signupForm.formState.errors.businessType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Business Email</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="you@business.com"
                      {...signupForm.register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-danger text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+27 82 555 1234"
                      {...signupForm.register('phone', { required: 'Phone is required' })}
                    />
                    {signupForm.formState.errors.phone && (
                      <p className="text-danger text-xs mt-1">{signupForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Business Logo <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <div className="w-12 h-12 rounded-lg border border-border overflow-hidden flex-shrink-0">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 bg-muted">
                        <Upload size={18} className="text-muted-foreground" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="btn-secondary text-sm py-2 w-full text-center">
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Theme Color */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Palette size={14} className="inline mr-1" />
                    Brand Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {themeColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color.value ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pr-10"
                        placeholder="Min. 8 characters"
                        {...signupForm.register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Minimum 8 characters' },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-danger text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="input-field pr-10"
                        placeholder="Repeat password"
                        {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-danger text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-border"
                    {...signupForm.register('agreeTerms')}
                  />
                  <label htmlFor="agree-terms" className="text-sm text-secondary-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                  </label>
                </div>
                {signupForm.formState.errors.agreeTerms && (
                  <p className="text-danger text-xs">{signupForm.formState.errors.agreeTerms.message}</p>
                )}

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  {signupLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating workspace...</>
                  ) : (
                    <><ArrowRight size={16} />Start Free Trial</>
                  )}
                </button>
              </form>
            )}

            {/* Demo Credentials */}
            <div className="mt-6 border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="text-xs font-semibold text-foreground">Demo Accounts</p>
                <span className="text-xs text-muted-foreground ml-1">— click to autofill</span>
              </div>
              <div className="divide-y divide-border">
                {demoAccounts.map((account) => (
                  <div key={account.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${account.badgeColor}`}>
                          {account.badge}
                        </span>
                        <span className="text-sm font-medium text-foreground">{account.role}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => autofillCredentials(account)}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <LogIn size={12} />Use this
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">Email</span>
                        <span className="text-xs font-mono text-foreground flex-1 truncate">{account.email}</span>
                        <button type="button" onClick={() => copyToClipboard(account.email, 'Email')} className="text-muted-foreground hover:text-foreground">
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">Password</span>
                        <span className="text-xs font-mono text-foreground flex-1">••••••••••••</span>
                        <button type="button" onClick={() => copyToClipboard(account.password, 'Password')} className="text-muted-foreground hover:text-foreground">
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">Powered by WITH-IN © 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Key, Copy, RefreshCw, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function ApiAccessPage() {
  const { business, refreshBusiness } = useAuth();
  const supabase = createClient();
  const [revealed, setRevealed] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const apiKey = business?.api_key || '';
  const masked = apiKey ? `${apiKey.slice(0, 6)}${'\u2022'.repeat(24)}${apiKey.slice(-4)}` : '';

  const copyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied');
  };

  const regenerate = async () => {
    if (!business?.id) return;
    setRegenerating(true);
    try {
      const newKey = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0')).join('');
      const { error } = await supabase.from('businesses').update({ api_key: newKey }).eq('id', business.id);
      if (error) throw error;
      await refreshBusiness();
      setRevealed(true);
      toast.success('New API key generated \u2014 your old key no longer works');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Access</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enterprise plan feature</p>
        </div>

        <div className="card-base p-4 bg-warning/10 border-warning/30 flex items-start gap-3">
          <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Honest status:</span> your key below is real and yours to use, but
            WITH-IN doesn't have live public API endpoints yet for it to authenticate against. This page exists so
            your key is ready the moment that ships \u2014 nothing here will break or need to change when it does.
          </p>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Key size={18} className="text-primary" /></div>
            <div>
              <h3 className="font-bold text-foreground">Your API Key</h3>
              <p className="text-sm text-muted-foreground">Keep this secret \u2014 treat it like a password.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 text-sm font-mono bg-muted/50 px-4 py-3 rounded-lg truncate">
              {revealed ? apiKey : masked}
            </code>
            <button onClick={() => setRevealed((r) => !r)} className="btn-secondary text-sm px-3 py-3" title={revealed ? 'Hide' : 'Reveal'}>
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button onClick={copyKey} className="btn-secondary text-sm px-3 py-3" title="Copy">
              <Copy size={16} />
            </button>
          </div>
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            {regenerating && <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
            <RefreshCw size={14} /> {regenerating ? 'Regenerating...' : 'Regenerate Key'}
          </button>
        </div>
      </div>
    </BusinessLayout>
  );
}

/**
 * OnboardingChecklist — a retention nudge that shows how far a connected user
 * has set Sentinel up, read live from chain. Guides them through the funnel
 * (threshold -> policy -> reserve) and disappears once fully configured.
 */

import { useEffect, useState } from 'react';
import { readPolicy, readReserve, readThreshold } from '@defirisk/core';
import { appConfig } from '../config';
import { useWallet } from '../wallet/WalletProvider';

interface Step {
  key: string;
  label: string;
  done: boolean;
  hint: string;
}

export function OnboardingChecklist() {
  const { address } = useWallet();
  const [steps, setSteps] = useState<Step[] | null>(null);

  useEffect(() => {
    if (!address) { setSteps(null); return; }
    let cancelled = false;
    async function load() {
      try {
        const [threshold, policy, reserve] = await Promise.all([
          readThreshold(appConfig, address!).catch(() => 0),
          readPolicy(appConfig, address!).catch(() => null),
          readReserve(appConfig, address!).catch(() => 0),
        ]);
        if (cancelled) return;
        setSteps([
          { key: 'connect', label: 'Wallet connected', done: true, hint: '' },
          { key: 'threshold', label: 'Set a warning threshold', done: threshold > 0, hint: 'Alert Threshold Registry' },
          { key: 'policy', label: 'Activate a protection policy', done: !!policy?.active, hint: 'Liquidation Guardian' },
          { key: 'reserve', label: 'Fund a protection reserve', done: reserve > 0, hint: 'Liquidation Guardian' },
        ]);
      } catch {
        if (!cancelled) setSteps(null);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [address]);

  if (!steps) return null;
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null; // fully set up — hide

  return (
    <div style={{ padding: '18px 20px', marginBottom: '16px', background: 'linear-gradient(135deg, var(--gray-03) 0%, var(--gray-02) 100%)', border: '1px solid var(--gray-05)', borderRadius: 'var(--radius)' }} className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Finish setting up your protection</p>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--mono)' }}>{done}/{steps.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--gray-05)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ height: '100%', width: `${(done / steps.length) * 100}%`, background: 'linear-gradient(90deg, var(--gold), var(--mint))', transition: 'width 300ms' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', opacity: s.done ? 0.6 : 1 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: s.done ? 'var(--mint)' : 'var(--gray-05)', color: s.done ? '#000' : 'var(--gray-08)' }}>
              {s.done ? '✓' : ''}
            </span>
            <span style={{ color: s.done ? 'var(--gray-09)' : 'var(--gray-12)', fontWeight: s.done ? 400 : 600, textDecoration: s.done ? 'line-through' : 'none' }}>{s.label}</span>
            {!s.done && s.hint && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--gray-08)' }}>↓ {s.hint}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

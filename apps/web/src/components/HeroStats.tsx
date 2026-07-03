/**
 * HeroStats — live social proof for visitors who haven't connected yet.
 * Reads network-wide on-chain stats and shows a compact "real usage" strip.
 */

import { useEffect, useState } from 'react';
import { fetchActivityStats, type ActivityStats } from '@defirisk/core';
import { appConfig } from '../config';

export function HeroStats() {
  const [stats, setStats] = useState<ActivityStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchActivityStats(appConfig, { limit: 60 })
      .then((s) => { if (!cancelled) setStats(s); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  if (!stats || stats.totalEvents === 0) return null;

  const items = [
    { value: stats.uniqueWallets, label: stats.uniqueWallets === 1 ? 'wallet' : 'wallets' },
    { value: stats.totalTransactions, label: 'transactions' },
    { value: stats.protections, label: stats.protections === 1 ? 'protection' : 'protections' },
  ];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '18px', padding: '10px 18px', background: 'var(--gray-03)', border: '1px solid var(--gray-05)', borderRadius: '999px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gray-09)', fontWeight: 600 }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--mint)' }} /> Live on testnet
      </span>
      {items.map((it) => (
        <span key={it.label} style={{ fontSize: '13px', color: 'var(--gray-11)' }}>
          <strong style={{ color: 'var(--gray-12)', fontFamily: 'var(--mono)' }}>{it.value}</strong> {it.label}
        </span>
      ))}
    </div>
  );
}

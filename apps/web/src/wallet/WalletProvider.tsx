/**
 * WalletProvider — React context that surfaces Stellar wallet state to the app.
 *
 * Directly uses @creit.tech/stellar-wallets-kit for:
 *   • Wallet initialisation (FreighterModule, xBullModule, AlbedoModule)
 *   • Address retrieval  — StellarWalletsKit.getAddress()
 *   • Wallet connection  — StellarWalletsKit.authModal()
 *   • Disconnection      — StellarWalletsKit.disconnect()
 *   • Live state updates — StellarWalletsKit.on(KitEventType.STATE_UPDATED, …)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { KitEventType, Networks } from '@creit.tech/stellar-wallets-kit/types';

/* ── Context shape ─────────────────────────────────────────────────────── */

interface WalletContextValue {
  address: string | null;
  walletId: string | undefined;
  connecting: boolean;
  /** True when viewing a live sample account read-only (no wallet). */
  isDemo: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  openProfile: () => Promise<void>;
  /** Enter read-only demo mode against a live sample account. */
  viewDemo: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

/** A live testnet account with real thresholds, a guardian policy and events. */
export const DEMO_ADDRESS = 'GCFE3FPVH3MXUFKUUXKXEFVK4WHK4MQLFNOTBTNLGHJYM3UQGO535HSV';

/* ── Provider ──────────────────────────────────────────────────────────── */

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | undefined>();
  const [connecting, setConnecting] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Initialise the wallet kit once with the supported wallet modules
    StellarWalletsKit.init({
      modules: [new FreighterModule(), new xBullModule(), new AlbedoModule()],
      network: Networks.TESTNET,
    });

    // Listen for address changes (connect / network switch / account change).
    // A real wallet connection always exits demo mode.
    const unsub = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      if (event.payload.address) {
        setIsDemo(false);
        setAddress(event.payload.address);
      }
    });

    // Restore a previously connected session if one exists
    void StellarWalletsKit.getAddress()
      .then(({ address: addr }) => { if (addr) { setIsDemo(false); setAddress(addr); } })
      .catch(() => undefined);

    return unsub;
  }, []);

  /** Enter read-only demo mode against a live sample account. */
  const viewDemo = useCallback(() => {
    setIsDemo(true);
    setAddress(DEMO_ADDRESS);
    setWalletId(undefined);
  }, []);

  /**
   * Open the built-in auth modal so the user can pick a wallet.
   * After selection, retrieve the public key with getAddress().
   */
  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // Opens the wallet-picker modal
      const { address: addr } = await StellarWalletsKit.authModal();
      setAddress(addr);

      // Confirm address is accessible from the selected module
      await StellarWalletsKit.getAddress();

      setWalletId(StellarWalletsKit.selectedModule?.productId);
    } finally {
      setConnecting(false);
    }
  }, []);

  /** Disconnect from the currently selected wallet (or exit demo mode). */
  const disconnect = useCallback(async () => {
    if (!isDemo) {
      await StellarWalletsKit.disconnect().catch(() => undefined);
    }
    setIsDemo(false);
    setAddress(null);
    setWalletId(undefined);
  }, [isDemo]);

  /** Open the profile modal (shows connected address, copy button …). */
  const openProfile = useCallback(async () => {
    await StellarWalletsKit.profileModal();
  }, []);

  const value = useMemo(
    () => ({ address, walletId, connecting, isDemo, connect, disconnect, openProfile, viewDemo }),
    [address, walletId, connecting, isDemo, connect, disconnect, openProfile, viewDemo],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/* ── Hook ──────────────────────────────────────────────────────────────── */

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}

/* ── Utility ───────────────────────────────────────────────────────────── */

export function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

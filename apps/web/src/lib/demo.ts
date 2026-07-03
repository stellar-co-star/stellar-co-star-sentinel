import type { AppError } from '@defirisk/core';

/**
 * Shown when a write is attempted in read-only demo mode. Demo mode views a
 * live sample account so visitors can explore the full product without a wallet;
 * signing requires connecting their own wallet.
 */
export const DEMO_WRITE_ERROR: AppError = {
  kind: 'unknown',
  title: 'Demo mode is read-only',
  message: 'You are exploring a live sample account. Connect your own wallet to sign transactions and try it for real.',
};

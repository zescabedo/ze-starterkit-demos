'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { MemberDemoTier } from '@/lib/member-pricing-demo';

const SimulatedLoginModal = dynamic(
  () =>
    import('@/components/auth-demo/SimulatedLoginModal').then((m) => m.SimulatedLoginModal),
  { ssr: false }
);

const STORAGE_KEY = 'aba-demo-member-tier';

type State = {
  isAuthenticated: boolean;
  memberTier: MemberDemoTier | null;
  isReady: boolean;
};

export type SimulatedMemberAuthContextValue = State & {
  signIn: (tier: MemberDemoTier) => void;
  signOut: () => void;
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  setSignInModalOpen: (open: boolean) => void;
};

const SimulatedMemberAuthContext = createContext<SimulatedMemberAuthContextValue | null>(null);

function readTierFromStorage(): MemberDemoTier | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === 'bank' || raw === 'partner' || raw === 'academic') {
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

export function SimulatedMemberAuthProvider({ children }: { children: ReactNode }) {
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [state, setState] = useState<State>({
    isAuthenticated: false,
    memberTier: null,
    isReady: false,
  });

  useEffect(() => {
    const tier = readTierFromStorage();
    if (tier) {
      setState({ isAuthenticated: true, memberTier: tier, isReady: true });
    } else {
      setState({ isAuthenticated: false, memberTier: null, isReady: true });
    }
  }, []);

  const signIn = useCallback((tier: MemberDemoTier) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, tier);
    } catch {
      // ignore
    }
    setState({ isAuthenticated: true, memberTier: tier, isReady: true });
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSignInModalOpen(false);
    setState({ isAuthenticated: false, memberTier: null, isReady: true });
  }, []);

  const openSignInModal = useCallback(() => {
    setSignInModalOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      isSignInModalOpen: signInModalOpen,
      openSignInModal,
      setSignInModalOpen,
    }),
    [state, signIn, signOut, signInModalOpen]
  );

  return (
    <SimulatedMemberAuthContext.Provider value={value}>
      {children}
      <SimulatedLoginModal open={signInModalOpen} onOpenChange={setSignInModalOpen} />
    </SimulatedMemberAuthContext.Provider>
  );
}

export function useSimulatedMemberAuth(): SimulatedMemberAuthContextValue {
  const ctx = useContext(SimulatedMemberAuthContext);
  if (!ctx) {
    throw new Error('useSimulatedMemberAuth must be used within SimulatedMemberAuthProvider');
  }
  return ctx;
}

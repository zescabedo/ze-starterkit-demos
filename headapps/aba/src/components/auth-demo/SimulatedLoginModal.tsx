'use client';

import { useState } from 'react';

import {
  DEMO_MEMBER_PASSWORD,
  isValidDemoPassword,
  resolveDemoTier,
} from '@/lib/member-pricing-demo';
import { useSimulatedMemberAuth } from '@/contexts/SimulatedMemberAuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type SimulatedLoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SimulatedLoginModal({ open, onOpenChange }: SimulatedLoginModalProps) {
  const { signIn } = useSimulatedMemberAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidDemoPassword(password)) {
      setError('Invalid username or password.');
      return;
    }
    const tier = resolveDemoTier(username);
    if (!tier) {
      setError('Invalid username or password.');
      return;
    }
    signIn(tier);
    setUsername('');
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-background p-0 sm:max-w-md">
        <div className="bg-primary px-6 py-4 text-primary-foreground">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">Sign In</DialogTitle>
            <DialogDescription className="text-primary-foreground/90">
              Simulated member login for this demo environment.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="aba-demo-username">Username</Label>
            <Input
              id="aba-demo-username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              placeholder="BankMember, PartnerMember, or AcademicMember"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aba-demo-password">Password</Label>
            <Input
              id="aba-demo-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder={`Password: ${DEMO_MEMBER_PASSWORD}`}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <p className="text-xs text-muted-foreground">
            Use usernames <strong>BankMember</strong>, <strong>PartnerMember</strong>, or{' '}
            <strong>AcademicMember</strong> with password <strong>{DEMO_MEMBER_PASSWORD}</strong>.
          </p>
          <Button type="submit" className="w-full rounded-full">
            Sign In
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

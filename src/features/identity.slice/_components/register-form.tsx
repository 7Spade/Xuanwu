
"use client";

/**
 * Module: register-form
 * Purpose: Render the registration form fields and submit action.
 * Responsibilities: collect onboarding profile and trigger register callback
 * Constraints: deterministic logic, respect module boundaries
 */

import { Mail, User, Lock, Loader2 } from "lucide-react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Button } from "@/shadcn-ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shadcn-ui/input-group";
import { Label } from "@/shadcn-ui/label";

interface RegisterFormProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleRegister: () => void;
  isLoading: boolean;
}

/**
 * RegisterForm - Responsibility: Renders the input fields and button for user registration.
 */
export function RegisterForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleRegister,
  isLoading,
}: RegisterFormProps) {
  const { t } = useI18n();

  return (
    <form className="flex flex-1 flex-col space-y-4" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
      <div className="space-y-2">
        <Label htmlFor="r-name" className="text-[11px] font-semibold tracking-tight text-muted-foreground/80">{t('auth.digitalDesignation')}</Label>
        <InputGroup className="h-11 rounded-xl border border-border/45 bg-background/70 ring-1 ring-border/25 transition-colors focus-within:border-primary/45 focus-within:ring-primary/35">
          <InputGroupAddon className="pl-4">
            <User className="size-4 text-muted-foreground/45" />
          </InputGroupAddon>
          <InputGroupInput id="r-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.nickname')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-email" className="text-[11px] font-semibold tracking-tight text-muted-foreground/80">{t('auth.contactEndpoint')}</Label>
        <InputGroup className="h-11 rounded-xl border border-border/45 bg-background/70 ring-1 ring-border/25 transition-colors focus-within:border-primary/45 focus-within:ring-primary/35">
          <InputGroupAddon className="pl-4">
            <Mail className="size-4 text-muted-foreground/45" />
          </InputGroupAddon>
          <InputGroupInput id="r-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-pass" className="text-[11px] font-semibold tracking-tight text-muted-foreground/80">{t('auth.setSecurityKey')}</Label>
        <InputGroup className="h-11 rounded-xl border border-border/45 bg-background/70 ring-1 ring-border/25 transition-colors focus-within:border-primary/45 focus-within:ring-primary/35">
          <InputGroupAddon className="pl-4">
            <Lock className="size-4 text-muted-foreground/45" />
          </InputGroupAddon>
          <InputGroupInput id="r-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} className="font-medium" required />
        </InputGroup>
      </div>
      <Button type="submit" className="mt-auto h-11 w-full rounded-xl bg-primary text-sm font-semibold tracking-tight text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 ease-out hover:brightness-105 active:scale-[0.985]" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : t('auth.registerSovereignty')}
      </Button>
    </form>
  );
}

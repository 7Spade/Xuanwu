
"use client";

/**
 * Module: auth-tabs-root
 * Purpose: Compose the authentication dialog card and tabbed entry flow.
 * Responsibilities: host login/register forms and auxiliary auth actions
 * Constraints: deterministic logic, respect module boundaries
 */

import { Ghost, Loader2, ShieldCheck } from "lucide-react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Button } from "@/shadcn-ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shadcn-ui/card";
import { LanguageSwitcher } from "@/lib-ui/custom-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn-ui/tabs";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthTabsRootProps {
  isLoading: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  handleAuth: (type: 'login' | 'register') => void;
  handleAnonymous: () => void;
  openResetDialog: () => void;
}

/**
 * AuthTabsRoot - Responsibility: Manages the main authentication card, including tabs for login/register and the anonymous access option.
 */
export function AuthTabsRoot({
  isLoading,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  handleAuth,
  handleAnonymous,
  openResetDialog,
}: AuthTabsRootProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <Card className="z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-border/55 bg-card/82 shadow-[0_32px_70px_-30px_hsl(var(--foreground)/0.45)] backdrop-blur-2xl ring-1 ring-border/45">
        <CardHeader className="relative flex flex-col items-center pb-4 pt-8 sm:pt-9">
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          <div className="group relative flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 ring-1 ring-primary/20 shadow-sm shadow-primary/20">
            <ShieldCheck className="size-7 text-primary/90 transition-transform duration-300 group-hover:scale-105" />
          </div>
        </CardHeader>

        <CardContent className="px-5 sm:px-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-7 grid h-11 w-full grid-cols-2 rounded-xl border border-border/40 bg-muted/30 p-1">
              <TabsTrigger value="login" className="rounded-lg text-xs font-semibold tracking-tight text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg text-xs font-semibold tracking-tight text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <div className="flex min-h-[292px] flex-col">
              <TabsContent value="login" className="m-0 flex flex-1 flex-col space-y-4 duration-300 animate-in fade-in slide-in-from-left-2">
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleLogin={() => handleAuth('login')}
                  isLoading={isLoading}
                  onForgotPassword={openResetDialog}
                />
              </TabsContent>

              <TabsContent value="register" className="m-0 flex flex-1 flex-col space-y-4 duration-300 animate-in fade-in slide-in-from-right-2">
                <RegisterForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleRegister={() => handleAuth('register')}
                  isLoading={isLoading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-border/40 bg-muted/10 px-5 pb-7 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          <Button variant="ghost" className="h-12 w-full gap-2 rounded-xl border border-dashed border-border/55 text-xs font-semibold tracking-tight text-muted-foreground transition-all hover:border-primary/35 hover:bg-primary/5 hover:text-primary" onClick={handleAnonymous} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Ghost className="size-4" />}
            {t('auth.guestAccess')}
          </Button>
          <div className="flex select-none items-center justify-center gap-2 text-[10px] font-medium tracking-[0.06em] text-muted-foreground/50">
            <span>{t('auth.byLoggingIn')}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground/70"><ShieldCheck className="size-3" /> {t('auth.dimensionSecurityProtocol')}</span>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

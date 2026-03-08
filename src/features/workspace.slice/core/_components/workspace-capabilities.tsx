
"use client";

import { 
  Box, 
  Trash2, 
  FileText, 
  ListTodo, 
  ShieldCheck, 
  Trophy, 
  AlertCircle, 
  MessageSquare, 
  Layers, 
  Plus,
  Users,
  Settings2,
  Activity,
  Landmark,
  Info,
  Calendar,
  FileScan,
  Loader2,
} from "lucide-react";
import { useCallback, useState, useMemo } from "react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shadcn-ui/alert-dialog";
import { Badge } from "@/shadcn-ui/badge";
import { Button } from "@/shadcn-ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shadcn-ui/card";
import { Checkbox } from "@/shadcn-ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shadcn-ui/dialog";
import { toast } from "@/shadcn-ui/hooks/use-toast";
import { Label } from "@/shadcn-ui/label";

import { useApp } from '../_hooks/use-app';
import { type Capability } from "../_types";


import { useWorkspace } from './workspace-provider';

// Capabilities available for personal (user-owned) workspaces.
const PERSONAL_CAPABILITY_IDS = new Set([
  'tasks',
  'files',
  'daily',
  'issues',
  'schedule',
  'document-parser',
]);

// Capabilities that belong to permanent layers (Core, Governance, Projection) and
// must never appear in the mountable-capability picker.
const NON_MOUNTABLE_CAPABILITY_IDS = new Set([
  'capabilities', // Core
  'members',      // Governance
  'audit',        // Projection
]);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * WorkspaceCapabilities - Manages mounted "atomic capabilities" for the workspace.
 * REFACTORED: Now derives the owner type at runtime based on the workspace's `dimensionId`.
 */
export function WorkspaceCapabilities() {
  const { t } = useI18n();
  const { workspace, logAuditEvent, mountCapabilities, unmountCapability } = useWorkspace();
  const { state } = useApp();
  const { capabilitySpecs, accounts } = state;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(new Set());
  const [isMounting, setIsMounting] = useState(false);
  const [pendingUnmount, setPendingUnmount] = useState<Capability | null>(null);

  const ownerType = useMemo(() => 
    accounts[workspace.dimensionId]?.accountType ?? 'user',
    [accounts, workspace.dimensionId]
  );

  const mountedCapIds = useMemo(() => 
    (workspace?.capabilities || []).map((c: Capability) => c.id),
    [workspace?.capabilities]
  );
  
  const availableSpecs = useMemo(() => {
    let specs = capabilitySpecs;
    if (ownerType === 'user') {
      specs = specs.filter(spec => PERSONAL_CAPABILITY_IDS.has(spec.id));
    }
    // Exclude capabilities from permanent layers (Core, Governance, Projection) — these are not mountable.
    return specs.filter(spec => !NON_MOUNTABLE_CAPABILITY_IDS.has(spec.id) && !mountedCapIds.includes(spec.id));
  }, [capabilitySpecs, ownerType, mountedCapIds]);


  const handleAddCapabilities = useCallback(async () => {
    const templates = capabilitySpecs.filter(spec => selectedCaps.has(spec.id));
    
    if (templates.length > 0) {
      setIsMounting(true);
      try {
        await mountCapabilities(templates);
        templates.forEach(template => {
            logAuditEvent("Mounted Capability", template.name, 'create'); 
        });
        setIsAddOpen(false);
        setSelectedCaps(new Set());
        toast({ title: t('workspace.capabilitiesMounted', { count: templates.length }) });
      } catch (error: unknown) {
        console.error("Error mounting capabilities:", error);
        toast({
          variant: "destructive",
          title: t('workspace.mountingFailed'),
          description: getErrorMessage(error, "You may not have the required permissions."),
        });
      } finally {
        setIsMounting(false);
      }
    }
  }, [logAuditEvent, capabilitySpecs, selectedCaps, mountCapabilities]);


  const handleConfirmUnmount = useCallback(async () => {
    if (!pendingUnmount) return;
    try {
      await unmountCapability(pendingUnmount);
      logAuditEvent("Unmounted Capability", pendingUnmount.name, 'delete');
      toast({ title: t('workspace.capabilityUnmounted') });
    } catch (error: unknown) {
      console.error("Error unmounting capability:", error);
      toast({
        variant: "destructive",
        title: t('workspace.unmountingFailed'),
        description: getErrorMessage(error, "You may not have the required permissions."),
      });
    } finally {
      setPendingUnmount(null);
    }
  }, [logAuditEvent, unmountCapability, pendingUnmount]);

  const toggleCapSelection = (capId: string) => {
    setSelectedCaps(prev => {
        const next = new Set(prev);
        if (next.has(capId)) {
            next.delete(capId);
        } else {
            next.add(capId);
        }
        return next;
    });
  }

  const getIcon = (id: string) => {
    switch (id) {
      case 'members': return <Users className="size-5" />;
      case 'audit': return <Activity className="size-5" />;
      case 'files': return <FileText className="size-5" />;
      case 'tasks': return <ListTodo className="size-5" />;
      case 'quality-assurance': return <ShieldCheck className="size-5" />;
      case 'acceptance': return <Trophy className="size-5" />;
      case 'finance': return <Landmark className="size-5" />;
      case 'issues': return <AlertCircle className="size-5" />;
      case 'daily': return <MessageSquare className="size-5" />;
      case 'schedule': return <Calendar className="size-5" />;
      case 'docu-import': return <FileScan className="size-5" />;
      default: return <Layers className="size-5" />;
    }
  };

  const getSpecIcon = (type: string) => {
    switch (type) {
      case 'governance': return <Users className="size-6" />;
      case 'monitoring': return <Activity className="size-6" />;
      case 'data': return <FileText className="size-6" />;
      case 'ui': return <Settings2 className="size-6" />;
      default: return <Box className="size-6" />;
    }
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Box className="size-4" /> {t('workspace.mountedAtomicCapabilities')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="size-3.5" /> {t('workspace.mountNewCapability')}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(workspace.capabilities || []).map((cap: Capability) => (
          <Card key={cap.id} className="group overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/40">
            <CardHeader className="pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  {getIcon(cap.id)}
                </div>
                <Badge variant="outline" className="bg-background px-1.5 text-[9px] font-bold uppercase">
                  {cap.status === 'stable' ? t('workspace.production') : t('workspace.beta')}
                </Badge>
              </div>
              <CardTitle className="font-headline text-lg transition-colors group-hover:text-primary">{cap.name}</CardTitle>
              <CardDescription className="mt-1 text-[11px] leading-relaxed">{cap.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex items-center justify-between border-t border-border/10 bg-muted/5 py-4">
              <span className="font-mono text-[9px] text-muted-foreground opacity-60">SPEC_ID: {cap.id.toUpperCase()}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
                onClick={() => setPendingUnmount(cap)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {(workspace.capabilities || []).length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center">
            <div className="rounded-2xl bg-muted/40 p-4">
              <Box className="size-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">{t('workspace.noCapabilitiesMounted')}</p>
              <p className="text-[11px] text-muted-foreground">{t('workspace.addFirstCapability')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
              <Plus className="size-4" /> {t('workspace.mountFirstCapability')}
            </Button>
          </div>
        )}
      </div>

      {/* Mount Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) setSelectedCaps(new Set()); setIsAddOpen(open); }}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{t('workspace.mountAtomicCapability')}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2">
              <Info className="size-4 text-muted-foreground" />
              {ownerType === 'user' 
                ? t('workspace.personalWorkspaceCapabilitiesHint')
                : t('workspace.orgWorkspaceCapabilitiesHint')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto py-4 md:grid-cols-2">
            {availableSpecs.map((cap) => (
              <Label 
                key={cap.id} 
                htmlFor={`cap-${cap.id}`}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                  selectedCaps.has(cap.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
              >
                <Checkbox
                  id={`cap-${cap.id}`}
                  checked={selectedCaps.has(cap.id)}
                  onCheckedChange={() => toggleCapSelection(cap.id)}
                />
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  {getSpecIcon(cap.type)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold uppercase">{cap.name}</p>
                  <p className="mt-0.5 whitespace-normal text-[10px] leading-tight text-muted-foreground">{cap.description}</p>
                </div>
              </Label>
            ))}
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isMounting}>{t('common.cancel')}</Button>
              <Button onClick={handleAddCapabilities} disabled={selectedCaps.size === 0 || isMounting}>
                <span aria-live="polite" aria-busy={isMounting ? "true" : "false"}>
                  {isMounting ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" /> {t('workspace.mounting')}</>
                  ) : (
                    t('workspace.mountSelected', { count: selectedCaps.size })
                  )}
                </span>
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unmount Confirmation Dialog */}
      <AlertDialog open={!!pendingUnmount} onOpenChange={(open) => !open && setPendingUnmount(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('workspace.unmountCapability')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('workspace.unmountCapabilityDescription', { name: pendingUnmount?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmUnmount}>
              {t('workspace.unmount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useAppStore } from "@/lib/store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Check, 
  ChevronsUpDown, 
  Users, 
  Globe 
} from "lucide-react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function GlobalSwitcher() {
  const { organizations, activeOrgId, setActiveOrg, user } = useAppStore();
  const { db } = useFirebase();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const handleCreateOrg = async () => {
    if (!newOrgName.trim() || !user) return;
    
    const orgData = {
      name: newOrgName,
      description: "自定義維度描述",
      ownerId: user.id,
      role: "Owner",
      createdAt: serverTimestamp(),
      members: [{ id: user.id, name: user.name, email: user.email, role: 'Owner', status: 'active' }],
      teams: [],
      partnerGroups: []
    };

    await addDoc(collection(db, "organizations"), orgData);
    setNewOrgName("");
    setIsCreateOpen(false);
    toast({ title: "新維度已建立" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between shadow-sm border-border/60 hover:bg-accent/10 rounded-xl h-11">
            <div className="flex items-center gap-2 truncate">
              <Users className="w-4 h-4 text-primary" />
              <span className="truncate font-semibold text-xs">{activeOrg?.name || "選取維度"}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="start">
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-black px-2 py-1.5">可選維度</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem 
              key={org.id} 
              onSelect={() => setActiveOrg(org.id)}
              className="flex items-center justify-between cursor-pointer py-2.5 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs">{org.name}</span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">{org.role}</span>
                </div>
              </div>
              {activeOrgId === org.id && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer py-2.5 text-primary font-black uppercase text-[10px] tracking-widest"
            onSelect={(e) => { e.preventDefault(); setIsCreateOpen(true); }}
          >
            <Plus className="w-4 h-4" /> 建立新維度
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">建立新維度</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">維度名稱</Label>
            <Input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="例如: 核心研究中心" className="rounded-xl h-12" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">取消</Button>
            <Button onClick={handleCreateOrg} className="rounded-xl px-8 shadow-lg shadow-primary/20">啟動建立</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

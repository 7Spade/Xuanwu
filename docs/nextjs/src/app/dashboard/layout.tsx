"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UIAdapter } from "@/components/dashboard/ui-adapter";
import { useDimensionSync } from "@/hooks/use-dimension-sync";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, authInitialized } = useAppStore();
  const router = useRouter();

  // 啟動全域數據同步
  useDimensionSync();

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/login");
    }
  }, [user, authInitialized, router]);

  // 根除刷新登出守衛：在 Auth 確定前不顯示內容
  if (!authInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-4 bg-background">
        <div className="text-4xl animate-bounce">🐢</div>
        <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
          <Loader2 className="w-3 h-3 animate-spin" /> 維度主權恢復中...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-y-auto content-visibility-auto">
          <UIAdapter>
            {children}
          </UIAdapter>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

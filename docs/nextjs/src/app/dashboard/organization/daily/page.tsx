"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * DimensionDailyPage - 職責：維度層級動態牆
 * 零認知實現：直接從 Store 同步的 dailyLogs 渲染，完全對齊組織主權。
 */
export default function DimensionDailyPage() {
  const { dailyLogs } = useAppStore();
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title="維度動態牆" 
        description="全域空間的人員脈動聚合。物理存放於維度層級 dailyLogs，實現極致高內聚。"
      />

      {dailyLogs.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {dailyLogs.map((log) => (
            <div key={log.id} className="break-inside-avoid mb-6 group">
              <Card className="border-border/60 bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl rounded-3xl overflow-hidden relative border-l-4 border-l-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                        {log.author?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{log.author}</p>
                        <time className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, "MMM d, HH:mm") : "同步中..."}
                        </time>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90 font-medium italic pl-4 border-l-2 border-primary/10">
                    "{log.content}"
                  </p>

                  <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] h-5 gap-1 bg-background/50 border-primary/20 text-primary font-black uppercase tracking-tighter">
                      <MapPin className="w-2.5 h-2.5" /> {log.workspaceName || "維度層級"}
                    </Badge>
                    {log.workspaceId && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary rounded-lg"
                        onClick={() => router.push(`/dashboard/workspaces/${log.workspaceId}`)}
                      >
                        進入空間 <ExternalLink className="ml-1 w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-32 text-center flex flex-col items-center justify-center space-y-6 opacity-30">
          <div className="p-6 bg-muted/20 rounded-full border-2 border-dashed">
            <MessageSquare className="w-16 h-16 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold uppercase tracking-[0.2em]">動態虛無中</p>
        </div>
      )}
    </div>
  );
}

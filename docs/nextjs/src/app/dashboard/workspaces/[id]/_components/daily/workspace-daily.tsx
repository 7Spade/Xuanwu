"use client";

import { useWorkspace } from "../../workspace-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Clock, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/lib/store";
import { useLogger } from "@/hooks/use-logger";

/**
 * WorkspaceDaily - 職責：空間專屬動態牆
 * 零認知實現：透過 useLogger 自動處理存儲與 orgId。
 */
export function WorkspaceDaily() {
  const { workspace } = useWorkspace();
  const { dailyLogs, user } = useAppStore();
  const { logDaily } = useLogger(workspace.id, workspace.name);
  const [content, setContent] = useState("");

  // 只過濾出當前空間的動態
  const localLogs = useMemo(() => 
    dailyLogs.filter(log => log.workspaceId === workspace.id),
    [dailyLogs, workspace.id]
  );

  const handlePost = async () => {
    if (!content.trim()) return;
    await logDaily(content);
    setContent("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-[2.5rem] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">同步今日進度</h3>
        </div>
        <Textarea 
          placeholder="今天完成了哪些技術共振？" 
          className="min-h-[120px] bg-transparent border-none focus-visible:ring-0 p-0 text-base resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">發佈為: {user?.name}</p>
          <Button 
            size="sm" 
            className="rounded-full gap-2 font-black uppercase text-[10px] px-6"
            onClick={handlePost}
            disabled={!content.trim()}
          >
            <Send className="w-3.5 h-3.5" /> 發佈動態
          </Button>
        </div>
      </div>

      <div className="columns-1 gap-6 space-y-6">
        {localLogs.map(log => (
          <div key={log.id} className="p-6 bg-muted/20 border border-border/40 rounded-3xl space-y-4 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black border border-primary/20">
                  {log.author?.[0] || 'U'}
                </div>
                <span className="text-xs font-bold">{log.author}</span>
              </div>
              <time className="text-[9px] text-muted-foreground flex items-center gap-1 font-mono uppercase">
                <Clock className="w-3 h-3" /> 
                {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, "HH:mm") : "共振中"}
              </time>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 font-medium italic">"{log.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

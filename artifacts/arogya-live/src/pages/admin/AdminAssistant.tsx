import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useQueryAssistant } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export default function AdminAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello. I'm your district AI assistant. Ask me anything about facility performance, stock levels, or operational data across Hooghly."
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const askAssistant = useQueryAssistant();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askAssistant.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || askAssistant.isPending) return;

    const userQuery = query.trim();
    setQuery("");
    
    // Add user message immediately
    setMessages(prev => [
      ...prev, 
      { id: Date.now().toString(), role: "user", content: userQuery }
    ]);

    askAssistant.mutate(
      { data: { question: userQuery } },
      {
        onSuccess: (data) => {
          setMessages(prev => [
            ...prev,
            { 
              id: Date.now().toString(), 
              role: "assistant", 
              content: data.answer,
              sources: data.sources 
            }
          ]);
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            { 
              id: Date.now().toString(), 
              role: "assistant", 
              content: "I encountered an error trying to process your request. Please try again."
            }
          ]);
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto w-full">
        <div className="mb-4">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            District Assistant
          </h2>
          <p className="text-muted-foreground">Ask questions about your data in plain language.</p>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-slate-200">
          <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-primary text-white'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className={`p-3 sm:p-4 rounded-2xl shadow-sm text-sm sm:text-base ${
                    msg.role === 'user' 
                      ? 'bg-white border text-slate-900 rounded-tr-sm' 
                      : 'bg-primary text-primary-foreground rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="text-[10px] bg-white border text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                          Source: {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {askAssistant.isPending && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground rounded-tl-sm flex items-center gap-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing district data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          
          <div className="p-4 bg-white border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about stockouts, bed availability, or staff attendance..."
                className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary shadow-inner"
                disabled={askAssistant.isPending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full shrink-0 shadow-md bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
                disabled={!query.trim() || askAssistant.isPending}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="mt-2 text-center text-xs text-slate-400">
              AI may generate inaccurate information. Verify critical data using the dashboard.
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

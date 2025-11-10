import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Bot, User, DollarSign, HelpCircle, Package, Download } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for OWSCORP. I can help you find services, answer questions about pricing, and guide you through our marketplace. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const CHAT_URL = `https://tkdxumnvptxqnqqlrhzr.supabase.co/functions/v1/chat`;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, string> = {
      pricing: "Can you tell me about pricing for services?",
      faq: "What are the most frequently asked questions?",
      services: "What types of services are available on OWSCORP?",
    };
    
    if (quickMessages[action]) {
      handleSendMessage(quickMessages[action]);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZHh1bW52cHR4cW5xcWxyaHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzEwMzgsImV4cCI6MjA3NzcwNzAzOH0.SYabc3B9oL-le44zXmHWChtKwGOmwwfpDWMFKNaHxJ8`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (response.status === 429) {
        toast.error("Rate limit exceeded. Please try again later.");
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast.error("AI service payment required. Please contact support.");
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {}
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => prev.slice(0, -1));
      setIsLoading(false);
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(m => `${m.role === "user" ? "You" : "AI Assistant"}: ${m.content}`).join("\n\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground">Get help with services, pricing, and marketplace navigation</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Button
            variant="outline"
            onClick={() => handleQuickAction("pricing")}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Pricing Info
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickAction("faq")}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            FAQ
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickAction("services")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Services
          </Button>
          <Button
            variant="outline"
            onClick={handleExportChat}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Chat
          </Button>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat Assistant
              <Badge variant="secondary" className="ml-auto">Online</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;

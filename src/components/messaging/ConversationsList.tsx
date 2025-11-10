import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  service_id: string;
  customer_id: string;
  developer_id: string;
  updated_at: string;
  service: {
    title: string;
  };
  profiles: {
    display_name: string;
  };
  unread_count?: number;
}

interface ConversationsListProps {
  currentUserId: string;
  onSelectConversation: (conversationId: string, otherUserName: string) => void;
}

const ConversationsList = ({ currentUserId, onSelectConversation }: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          service_id,
          customer_id,
          developer_id,
          updated_at,
          service:services (title),
          profiles!conversations_customer_id_fkey (display_name)
        `)
        .or(`customer_id.eq.${currentUserId},developer_id.eq.${currentUserId}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data as any || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Conversations Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation with a service developer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {conversations.map((conv) => {
            const otherUserName = conv.profiles?.display_name || "User";
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id, otherUserName)}
                className="w-full p-4 hover:bg-accent text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{otherUserName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">{otherUserName}</p>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.service?.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationsList;

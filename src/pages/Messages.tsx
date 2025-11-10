import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ConversationsList from "@/components/messaging/ConversationsList";
import ChatInterface from "@/components/messaging/ChatInterface";

const Messages = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);
    };

    checkAuth();
  }, [navigate]);

  const handleSelectConversation = (conversationId: string, otherUserName: string) => {
    setSelectedConversationId(conversationId);
    setSelectedUserName(otherUserName);
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Messages</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ConversationsList
              currentUserId={currentUserId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <ChatInterface
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
                otherUserName={selectedUserName}
              />
            ) : (
              <div className="h-[600px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

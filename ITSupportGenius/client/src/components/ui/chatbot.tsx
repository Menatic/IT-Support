import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, X, Send, Bot, Loader2, Maximize2, ExternalLink,
  Shield, Network, PcCase, Zap, Server, UploadCloud, Lightbulb, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pulseCounter, setPulseCounter] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Increment pulse counter every 10 seconds when chat is closed to attract attention
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isOpen) {
      interval = setInterval(() => {
        setPulseCounter(prev => prev + 1);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    enabled: !!user && isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsSending(true);
      setIsTyping(true);
      const res = await apiRequest("POST", "/api/chat/messages", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
      setIsSending(false);
      // Delay turning off typing indicator for a more natural feel
      setTimeout(() => {
        setIsTyping(false);
      }, 500);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    },
    onError: (error) => {
      setIsSending(false);
      setIsTyping(false);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // If opening the chat, reset pulse counter
    if (!isOpen) {
      setPulseCounter(0);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    return format(new Date(date), "h:mm a");
  };

  const goToFullChat = () => {
    setIsOpen(false);
    setLocation("/chat");
  };

  // Quick responses with icons
  const quickResponses = [
    {
      text: "How do I reset my password?",
      icon: <Shield className="h-3.5 w-3.5" />,
    },
    {
      text: "My computer is running slow",
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    {
      text: "I need help with VPN access",
      icon: <Network className="h-3.5 w-3.5" />,
    },
    {
      text: "I can't connect to the printer",
      icon: <Server className="h-3.5 w-3.5" />,
    },
  ];

  // Calculate if there are unread messages (new bot responses)
  const hasUnreadMessages = messages?.some(msg => msg.isBot && !isOpen);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="relative">
        {/* Chat Button with notification indicator */}
        <Button
          onClick={toggleChat}
          className={`rounded-full shadow-lg group bg-gradient-to-r from-primary to-blue-600 ${
            pulseCounter % 2 === 1 && !isOpen
              ? "animate-bounce"
              : hasUnreadMessages 
                ? "animate-pulse" 
                : ""
          }`}
          size="icon"
        >
          <div className="relative">
            {isOpen ? (
              <X className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <>
                <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                {hasUnreadMessages && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </>
            )}
          </div>
        </Button>
        
        {/* Chat Window */}
        {isOpen && (
          <Card className="absolute bottom-16 right-0 w-[350px] sm:w-[420px] bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col border-none animate-fadeInUp" style={{ height: "550px", maxHeight: "85vh" }}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">IT Support Assistant</h3>
                  <p className="text-xs text-white/70">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={goToFullChat}
                  title="Open full chat page"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={toggleChat}
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef} 
              className="flex-1 p-4 overflow-y-auto bg-gray-50"
            >
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={msg.id} 
                      className={`flex items-start ${msg.isBot ? "" : "justify-end"} animate-fadeIn`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {msg.isBot && (
                        <div className="flex-shrink-0 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div 
                        className={`${
                          msg.isBot 
                            ? "ml-3 bg-white border border-gray-100" 
                            : "bg-primary/10 mr-3"
                        } p-3 rounded-lg shadow-sm max-w-[calc(100%-50px)]`}
                      >
                        {msg.isBot && (
                          <div className="flex items-center mb-1">
                            <Badge 
                              variant="outline" 
                              className="text-[10px] px-1.5 py-0 h-3.5 bg-blue-50 text-primary border-blue-100"
                            >
                              AI
                            </Badge>
                          </div>
                        )}
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      {!msg.isBot && (
                        <div className="flex-shrink-0 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                          <span className="text-xs font-medium">
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-start animate-fadeIn">
                      <div className="flex-shrink-0 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="ml-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 opacity-20 rounded-full bg-primary animate-ping"></div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    IT Support Assistant
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    I'm your AI-powered IT support assistant. How can I help you today?
                  </p>
                  
                  <div className="w-full">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="text-amber-500 h-4 w-4 mr-2" />
                      <p className="text-sm font-medium text-gray-700">Quick questions:</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 w-full">
                      {quickResponses.map((response, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start text-left h-auto px-3 py-2 w-full group hover:bg-primary/5 hover:border-primary/30 transition-colors"
                          onClick={() => setMessage(response.text)}
                        >
                          <div className="flex items-center">
                            <div className="mr-2 p-1.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {response.icon}
                            </div>
                            <span className="text-sm">{response.text}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary flex items-center"
                        onClick={goToFullChat}
                      >
                        <span>Open full chat page</span>
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="p-3">
                <div className="flex items-center">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full text-sm py-5 px-4 focus-visible:ring-offset-0 focus-visible:ring-primary/20 border-gray-200"
                    disabled={isSending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim() && !isSending) {
                          sendMessageMutation.mutate(message.trim());
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className={`ml-2 rounded-full ${isSending ? 'bg-gray-400' : 'bg-gradient-to-r from-primary to-blue-600'} hover:shadow-md transition-all w-10 h-10`}
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { 
  Send, Bot, Loader2, FileQuestion, UploadCloud, 
  Zap, Lightbulb, RefreshCw, Trash2, MessageCircle,
  CheckCircle, Server, Database, Wifi, Shield, PcCase, 
  Laptop, HardDrive, Network, BookOpen, Sparkles,
  Search, FileCode2, ShieldCheck, X, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsSending(true);
      const res = await apiRequest("POST", "/api/chat/messages", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
      setIsSending(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    },
    onError: (error) => {
      setIsSending(false);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/chat/messages");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({
        title: "Chat history cleared",
        description: "Your conversation history has been cleared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to clear history",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
  
  // Process message content to clean up formatting
  const processMessageContent = (content: string) => {
    // Replace ** text ** patterns with actual bold text
    return content.replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`)
                 .replace(/\*(.*?)\*/g, (_, p1) => `<em>${p1}</em>`)
                 .replace(/"(.*?)"/g, (_, p1) => `"${p1}"`);
  };

  // Categories for the issue library
  const categories = [
    { id: "all", name: "All Topics", icon: <Bot className="h-4 w-4" /> },
    { id: "hardware", name: "Hardware", icon: <PcCase className="h-4 w-4" /> },
    { id: "software", name: "Software", icon: <Laptop className="h-4 w-4" /> },
    { id: "network", name: "Network", icon: <Wifi className="h-4 w-4" /> },
    { id: "security", name: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "storage", name: "Storage", icon: <Database className="h-4 w-4" /> },
  ];

  // Common issues with categories
  const commonIssues = [
    {
      title: "Password Reset",
      description: "Step-by-step guide to reset your account password",
      icon: <Shield className="h-5 w-5" />,
      category: "security",
    },
    {
      title: "Network Connection",
      description: "Troubleshoot network connectivity issues",
      icon: <Wifi className="h-5 w-5" />,
      category: "network",
    },
    {
      title: "Software Installation",
      description: "Learn how to request and install new software",
      icon: <UploadCloud className="h-5 w-5" />,
      category: "software",
    },
    {
      title: "Slow Computer",
      description: "Tips to improve your computer's performance",
      icon: <Zap className="h-5 w-5" />,
      category: "hardware",
    },
    {
      title: "Disk Space Management",
      description: "Free up storage space on your device",
      icon: <HardDrive className="h-5 w-5" />,
      category: "storage",
    },
    {
      title: "Remote Access Setup",
      description: "Configure VPN or remote desktop connections",
      icon: <Network className="h-5 w-5" />,
      category: "network",
    },
    {
      title: "Email Configuration",
      description: "Set up and troubleshoot email clients",
      icon: <MessageCircle className="h-5 w-5" />,
      category: "software",
    },
    {
      title: "Printer Issues",
      description: "Resolve common printing problems",
      icon: <Server className="h-5 w-5" />,
      category: "hardware",
    },
  ];

  // Filter issues based on active category
  const filteredIssues = activeCategory === "all" 
    ? commonIssues 
    : commonIssues.filter(issue => issue.category === activeCategory);

  // Recommended starting prompts
  const quickResponses = [
    {
      text: "How do I reset my password?",
      icon: <Shield className="h-4 w-4" />,
      type: "Common issue",
      fullWidth: true
    },
    {
      text: "My computer is running slow",
      icon: <Zap className="h-4 w-4" />,
      type: "Popular question",
      fullWidth: true
    },
    {
      text: "I need help with VPN access",
      icon: <Network className="h-4 w-4" />,
      type: "Common issue",
      fullWidth: true
    },
    {
      text: "I can't connect to the printer",
      icon: <Server className="h-4 w-4" />,
      type: "Popular question",
      fullWidth: true
    },
    {
      text: "How do I request new hardware?",
      icon: <PcCase className="h-4 w-4" />,
      type: "Common issue",
      fullWidth: true
    },
    {
      text: "What's the process for software installation?",
      icon: <UploadCloud className="h-4 w-4" />,
      type: "Popular question",
      fullWidth: true
    },
  ];

  // Get a count of conversation exchanges (user message + bot response pairs)
  const conversationCount = messages ? Math.floor(messages.length / 2) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">AI Support Assistant</h1>
          </div>
          <p className="text-gray-500 mt-1">Get intelligent solutions to your IT issues with our AI-powered assistant</p>
        </div>
        <div className="flex space-x-2 self-end md:self-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => clearHistoryMutation.mutate()}
            disabled={clearHistoryMutation.isPending || !messages?.length}
            className="flex items-center"
          >
            {clearHistoryMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear History
          </Button>
          {conversationCount > 0 && (
            <Badge variant="outline" className="h-9 px-4 flex items-center gap-1.5 border-primary/30">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{conversationCount} conversation{conversationCount !== 1 ? 's' : ''}</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 animate-shine pointer-events-none"></div>
              <CardTitle className="flex items-center text-lg relative z-10">
                <div className="p-2 bg-white/20 rounded-full mr-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                IT Issue Library
              </CardTitle>
              <CardDescription className="text-white/80 text-sm relative z-10">
                Browse guides for common IT problems
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <div className="relative mb-2">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search issues..." 
                    className="pl-9 py-1.5 text-sm h-9 bg-white border-gray-200 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full px-3 h-8 ${
                        activeCategory === category.id 
                          ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700" 
                          : "border-gray-200 text-gray-700 hover:border-primary/30 hover:bg-primary/5"
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <span className="flex items-center">
                        <span className={`mr-1.5 ${activeCategory === category.id ? "text-white" : "text-gray-600"}`}>
                          {category.icon}
                        </span>
                        <span className="text-xs">{category.name}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="max-h-[calc(100vh-440px)] overflow-y-auto p-3 space-y-2">
                {filteredIssues.map((issue, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer ai-card-hover"
                    onClick={() => setMessage(`Help me with ${issue.title}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-2.5 rounded-full mr-3 bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border border-primary/10 shadow-sm">
                        {issue.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 text-sm flex items-center">
                          {issue.title}
                          {index < 2 && (
                            <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">Popular</span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{issue.description}</p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-500 border-gray-200 shadow-sm">
                          {issue.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-200px)] flex flex-col border-none overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 animate-shine pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2.5 rounded-full mr-3 animate-subtle-pulse">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center">
                      IT Support Assistant
                      <Badge className="ml-2 bg-white/20 text-white border-none text-xs">
                        AI
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-white/70 mt-0.5 text-sm flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></div>
                      Powered by Google Gemini AI
                    </CardDescription>
                  </div>
                </div>
                {isSending && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1.5">
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Processing...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-5 overflow-y-auto bg-gray-50"
              >
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-gray-500">Loading conversation history...</p>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-6 pb-2">
                    {messages.map((msg, idx) => (
                      <div
                        key={msg.id}
                        className={`flex items-start ${msg.isBot ? "" : "justify-end"} animate-fadeIn`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        {msg.isBot && (
                          <div className="flex-shrink-0 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md animate-subtle-pulse">
                            <Bot className="h-5 w-5" />
                          </div>
                        )}
                        <div
                          className={`${
                            msg.isBot
                              ? "ml-3 bg-white border border-gray-100 shadow-sm"
                              : "bg-gradient-to-r from-primary/5 to-blue-500/5 mr-3 border border-primary/10"
                          } p-4 rounded-xl max-w-md`}
                        >
                          {msg.isBot && (
                            <div className="flex items-center mb-1.5">
                              <span className="text-xs font-semibold text-primary mr-2">IT ASSISTANT</span>
                              <Badge variant="outline" className="text-xs px-2 py-0 h-4 bg-blue-50 text-primary border-blue-100">
                                AI
                              </Badge>
                              <div className="flex-grow"></div>
                              <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5 border-none">Verified response</Badge>
                            </div>
                          )}
                          <p 
                            className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: msg.isBot ? 
                                processMessageContent(msg.content) : 
                                msg.content 
                            }}
                          ></p>
                          <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-gray-100">
                            <p className="text-xs text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-gray-300" />
                              {msg.createdAt ? formatTime(msg.createdAt) : "Just now"}
                            </p>
                            {msg.isBot && (
                              <div className="flex space-x-1.5">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-50 hover:text-primary">
                                        <RefreshCw className="h-3.5 w-3.5 text-gray-400 hover:text-primary" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Regenerate response</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-green-50 hover:text-green-600">
                                        <CheckCircle className="h-3.5 w-3.5 text-gray-400 hover:text-green-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Mark as helpful</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        </div>
                        {!msg.isBot && (
                          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                            <span className="font-medium">
                              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      IT Support Assistant
                    </h3>
                    <p className="text-gray-500 max-w-md mb-8">
                      I'm your AI-powered IT support assistant. Ask me anything about IT problems, 
                      password resets, software issues, or hardware troubleshooting.
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-md px-4">
                      <div className="flex items-center">
                        <Lightbulb className="text-amber-500 h-5 w-5 mr-2" />
                        <h4 className="font-medium text-gray-700">Try asking about:</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        {quickResponses.map((response, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start text-left h-auto py-3 group border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all ai-card-hover"
                            onClick={() => setMessage(response.text)}
                            style={{ animationDelay: `${index * 75}ms` }}
                          >
                            <div className="flex items-center w-full">
                              <div className="mr-3 p-2.5 rounded-full bg-gradient-to-r from-primary/5 to-blue-500/5 text-gray-700 group-hover:from-primary/10 group-hover:to-blue-500/10 group-hover:text-primary border border-gray-200 group-hover:border-primary/30 transition-all">
                                {response.icon}
                              </div>
                              <div className="flex-1 flex flex-col">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">{response.text}</span>
                                <span className="text-[10px] text-gray-400">{response.type}</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="mt-auto">
                <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your IT support question here..."
                      className="flex-1 h-12 px-4 rounded-l-full rounded-r-none border-r-0 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
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
                      className="rounded-r-full rounded-l-none h-12 px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all"
                      disabled={isSending || !message.trim()}
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <span className="mr-2 hidden sm:inline">Send</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="mt-2 flex justify-between items-center px-3">
                    <p className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
                    <p className="text-xs text-gray-400">Powered by Google Gemini AI</p>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
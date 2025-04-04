import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Upload, 
  Loader2, 
  SearchCode,
  AlertTriangle,
  FileText,
  Terminal,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Log } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LogAnalyzer() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [systemId, setSystemId] = useState("unknown");
  const [viewMode, setViewMode] = useState<"direct" | "upload">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch all logs
  const { data: logs, isLoading } = useQuery<Log[]>({
    queryKey: ["/api/logs"],
  });
  
  // Upload/analyze log mutation
  const analyzeLogMutation = useMutation({
    mutationFn: async (formData: FormData | object) => {
      let res;
      if (formData instanceof FormData) {
        res = await fetch("/api/logs", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
      } else {
        res = await apiRequest("POST", "/api/logs", formData);
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to analyze log");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Log analyzed successfully",
        description: "Gemini AI has processed your log file",
      });
      setFileName("");
      setFileContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Log analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle direct text input submission
  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileContent.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide both a name and log content",
        variant: "destructive",
      });
      return;
    }
    
    analyzeLogMutation.mutate({
      name: fileName,
      content: fileContent,
      systemId,
    });
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("logFile") as HTMLInputElement;
    
    if (!fileInput.files || fileInput.files.length === 0 || !fileName.trim()) {
      toast({
        title: "Validation error",
        description: "Please select a file and provide a name",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("logFile", fileInput.files[0]);
    formData.append("name", fileName);
    formData.append("systemId", systemId);
    
    analyzeLogMutation.mutate(formData);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name && !fileName) {
        setFileName(file.name.split('.')[0]);
      }
    }
  };
  
  // Filter logs by search query
  const filteredLogs = logs?.filter(log => 
    log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.content && log.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.analysis && log.analysis.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Log Analyzer</h1>
        <Button
          variant="outline"
          onClick={() => setViewMode(viewMode === "direct" ? "upload" : "direct")}
        >
          {viewMode === "direct" ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Switch to File Upload
            </>
          ) : (
            <>
              <Terminal className="mr-2 h-4 w-4" />
              Switch to Direct Input
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Submit System Log</CardTitle>
            <CardDescription>
              {viewMode === "direct" 
                ? "Paste your log content for AI analysis" 
                : "Upload a log file for AI analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === "direct" ? (
              <form onSubmit={handleDirectSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="logName" className="text-sm font-medium">
                    Log Name
                  </label>
                  <Input
                    id="logName"
                    placeholder="e.g., Server Crash Log"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="systemId" className="text-sm font-medium">
                    System Identifier
                  </label>
                  <Select value={systemId} onValueChange={setSystemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-server">Main Server</SelectItem>
                      <SelectItem value="db-server">Database Server</SelectItem>
                      <SelectItem value="web-server">Web Server</SelectItem>
                      <SelectItem value="unknown">Other/Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="logContent" className="text-sm font-medium">
                    Log Content
                  </label>
                  <Textarea
                    id="logContent"
                    placeholder="Paste log content here..."
                    className="font-mono text-sm h-[300px]"
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={analyzeLogMutation.isPending}
                >
                  {analyzeLogMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SearchCode className="mr-2 h-4 w-4" />
                      Analyze Log
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="logName" className="text-sm font-medium">
                    Log Name
                  </label>
                  <Input
                    id="logName"
                    placeholder="e.g., Server Crash Log"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="systemId" className="text-sm font-medium">
                    System Identifier
                  </label>
                  <Select value={systemId} onValueChange={setSystemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-server">Main Server</SelectItem>
                      <SelectItem value="db-server">Database Server</SelectItem>
                      <SelectItem value="web-server">Web Server</SelectItem>
                      <SelectItem value="unknown">Other/Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="logFile" className="text-sm font-medium">
                    Log File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">
                      Drag and drop your log file here, or click to browse
                    </p>
                    <Input
                      id="logFile"
                      type="file"
                      className="max-w-xs"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={analyzeLogMutation.isPending}
                >
                  {analyzeLogMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading & Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="flex items-center text-sm text-gray-500">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              <span>Logs are analyzed using Gemini AI for anomaly detection</span>
            </div>
          </CardFooter>
        </Card>
        
        {/* Log Analysis Results Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Log History & Analysis</CardTitle>
                <CardDescription>
                  View past logs and AI-generated insights
                </CardDescription>
              </div>
              <div className="w-1/2">
                <div className="relative">
                  <SearchCode className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <Tabs defaultValue="table">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                    <TabsTrigger value="cards">Card View</TabsTrigger>
                  </TabsList>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
                
                <TabsContent value="table" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>System</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="font-medium">{log.name}</TableCell>
                          <TableCell>{log.systemId || "Unknown"}</TableCell>
                          <TableCell>{format(new Date(log.createdAt), "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            <Badge className={log.analysis ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {log.analysis ? "Analyzed" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="cards" className="m-0">
                  <div className="space-y-4">
                    {filteredLogs.map((log) => (
                      <Card key={log.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{log.name}</CardTitle>
                              <CardDescription>
                                {log.systemId || "Unknown"} • {format(new Date(log.createdAt), "MMM d, h:mm a")}
                              </CardDescription>
                            </div>
                            <Badge className={log.analysis ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {log.analysis ? "Analyzed" : "Pending"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {log.analysis ? (
                            <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm">
                              <h4 className="font-medium mb-1">AI Analysis:</h4>
                              <p className="whitespace-pre-wrap text-gray-700">{log.analysis}</p>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-600 text-sm">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analysis pending or no issues detected
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery ? "No logs match your search criteria" : "Upload your first log for analysis"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

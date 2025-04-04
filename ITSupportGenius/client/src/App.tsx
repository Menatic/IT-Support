import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tickets from "@/pages/tickets";
import LogAnalyzer from "@/pages/log-analyzer";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Chat from "@/pages/chat";
import AuthPage from "@/pages/auth-page";
import { Sidebar } from "@/components/ui/sidebar";
import { Topbar } from "@/components/ui/topbar";
import { Chatbot } from "@/components/ui/chatbot";
import { AuthProvider } from "@/hooks/use-auth";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute 
        path="/" 
        component={() => (
          <Layout>
            <Dashboard />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/tickets" 
        component={() => (
          <Layout>
            <Tickets />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/logs" 
        component={() => (
          <Layout>
            <LogAnalyzer />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/analytics" 
        component={() => (
          <Layout>
            <Analytics />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/settings" 
        component={() => (
          <Layout>
            <Settings />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/chat" 
        component={() => (
          <Layout>
            <Chat />
          </Layout>
        )} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

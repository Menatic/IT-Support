import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { GeminiService } from "./gemini";
import { insertTicketSchema, insertTicketCommentSchema, insertLogSchema, insertChatMessageSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });
const geminiService = new GeminiService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Ticket routes
  app.get("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const filters: { status?: string; requesterId?: number; assigneeId?: number } = {};
    
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.requester_id) filters.requesterId = parseInt(req.query.requester_id as string);
    if (req.query.assignee_id) filters.assigneeId = parseInt(req.query.assignee_id as string);
    
    // If employee role, only get their own tickets
    if (req.user!.role === "employee") {
      filters.requesterId = req.user!.id;
    }
    
    const tickets = await storage.getTickets(filters);
    res.json(tickets);
  });
  
  app.get("/api/tickets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const ticket = await storage.getTicket(parseInt(req.params.id));
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Only allow employees to view their own tickets
    if (req.user!.role === "employee" && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to view this ticket" });
    }
    
    res.json(ticket);
  });
  
  app.post("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        requesterId: req.user!.id,
      });
      
      const newTicket = await storage.createTicket(ticketData);
      res.status(201).json(newTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });
  
  app.patch("/api/tickets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const ticketId = parseInt(req.params.id);
    const ticket = await storage.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Only agents and admins can update tickets (except if employee is updating their own)
    if (req.user!.role === "employee" && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to update this ticket" });
    }
    
    try {
      // Only allow updating certain fields based on role
      let updatedData: Partial<typeof req.body> = {};
      
      if (req.user!.role === "admin" || req.user!.role === "agent") {
        // Agents and admins can update all ticket fields
        updatedData = req.body;
      } else {
        // Employees can only add comments, they can't change status, etc.
        if (req.body.description) {
          updatedData.description = req.body.description;
        }
      }
      
      const updatedTicket = await storage.updateTicket(ticketId, updatedData);
      res.json(updatedTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });
  
  // Ticket comments routes
  app.get("/api/tickets/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const ticketId = parseInt(req.params.id);
    const ticket = await storage.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Only allow employees to view comments for their own tickets
    if (req.user!.role === "employee" && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to view these comments" });
    }
    
    const comments = await storage.getTicketComments(ticketId);
    res.json(comments);
  });
  
  app.post("/api/tickets/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const ticketId = parseInt(req.params.id);
    const ticket = await storage.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Only allow employees to comment on their own tickets
    if (req.user!.role === "employee" && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to comment on this ticket" });
    }
    
    try {
      const commentData = insertTicketCommentSchema.parse({
        ticketId,
        userId: req.user!.id,
        content: req.body.content,
      });
      
      const newComment = await storage.createTicketComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  // Log analyzer routes
  app.get("/api/logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Employees can only see their own logs
    const userId = req.user!.role === "employee" ? req.user!.id : undefined;
    const logs = await storage.getLogs(userId);
    res.json(logs);
  });
  
  app.get("/api/logs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const log = await storage.getLog(parseInt(req.params.id));
    
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }
    
    // Only allow employees to view their own logs
    if (req.user!.role === "employee" && log.userId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to view this log" });
    }
    
    res.json(log);
  });
  
  app.post("/api/logs", upload.single("logFile"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file && !req.body.content) {
        return res.status(400).json({ message: "No log file or content provided" });
      }
      
      const logContent = req.file 
        ? req.file.buffer.toString("utf-8") 
        : req.body.content;
      
      const logData = insertLogSchema.parse({
        name: req.body.name,
        content: logContent,
        userId: req.user!.id,
        systemId: req.body.systemId || "unknown",
      });
      
      const newLog = await storage.createLog(logData);
      
      // Process with Gemini API
      try {
        const analysis = await geminiService.analyzeLog(logContent);
        await storage.updateLogAnalysis(newLog.id, analysis);
        newLog.analysis = analysis;
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Don't fail the request, just return the log without analysis
      }
      
      res.status(201).json(newLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to upload log" });
    }
  });
  
  // System metrics routes
  app.get("/api/system-metrics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const metrics = await storage.getSystemMetrics();
    res.json(metrics);
  });
  
  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const messages = await storage.getChatMessages(req.user!.id);
    res.json(messages);
  });
  
  app.post("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // First save the user message
      const userMessageData = insertChatMessageSchema.parse({
        userId: req.user!.id,
        isBot: false,
        content: req.body.content,
      });
      
      const userMessage = await storage.createChatMessage(userMessageData);
      
      // Get response from Gemini API
      try {
        const botResponse = await geminiService.getChatResponse(req.body.content);
        
        // Save bot response
        const botMessageData = insertChatMessageSchema.parse({
          userId: req.user!.id,
          isBot: true,
          content: botResponse,
        });
        
        const botMessage = await storage.createChatMessage(botMessageData);
        
        res.status(201).json({
          userMessage,
          botMessage,
        });
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        
        // Save fallback bot response
        const botMessageData = insertChatMessageSchema.parse({
          userId: req.user!.id,
          isBot: true,
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        });
        
        const botMessage = await storage.createChatMessage(botMessageData);
        
        res.status(201).json({
          userMessage,
          botMessage,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  app.delete("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Delete all chat messages for the current user
      await storage.clearChatMessages(req.user!.id);
      res.json({ success: true, message: "Chat history cleared successfully" });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });
  
  // User routes (for admin)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const users = await storage.getUsers();
    res.json(users);
  });

  const httpServer = createServer(app);
  return httpServer;
}

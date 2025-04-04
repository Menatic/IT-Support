import {
  users,
  tickets,
  ticketComments,
  logs,
  systemMetrics,
  chatMessages,
  type User,
  type InsertUser,
  type Ticket,
  type InsertTicket,
  type TicketComment,
  type InsertTicketComment,
  type Log,
  type InsertLog,
  type SystemMetric,
  type InsertSystemMetric,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "./auth";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTickets(filters?: { status?: string; requesterId?: number; assigneeId?: number }): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, data: Partial<InsertTicket>): Promise<Ticket | undefined>;
  
  // Ticket comments
  getTicketComments(ticketId: number): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  
  // Logs
  getLog(id: number): Promise<Log | undefined>;
  getLogs(userId?: number): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  updateLogAnalysis(id: number, analysis: string): Promise<Log | undefined>;
  
  // System metrics
  getSystemMetrics(): Promise<SystemMetric[]>;
  getSystemMetric(systemId: string): Promise<SystemMetric | undefined>;
  createOrUpdateSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  
  // Chat messages
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(userId: number): Promise<void>;
  
  // Session store
  sessionStore: any; // Using 'any' to avoid SessionStore type issue
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private ticketComments: Map<number, TicketComment>;
  private logs: Map<number, Log>;
  private systemMetrics: Map<string, SystemMetric>;
  private chatMessages: Map<number, ChatMessage>;
  
  sessionStore: any; // Using any type for sessionStore
  currentId: {
    user: number;
    ticket: number;
    comment: number;
    log: number;
    systemMetric: number;
    chatMessage: number;
  };

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.ticketComments = new Map();
    this.logs = new Map();
    this.systemMetrics = new Map();
    this.chatMessages = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    this.currentId = {
      user: 1,
      ticket: 1,
      comment: 1,
      log: 1,
      systemMetric: 1,
      chatMessage: 1,
    };
    
    // Create a test user with proper password hashing
    this.initializeTestUser();
    
    // Add some system metrics
    this.createOrUpdateSystemMetric({
      systemId: "main-server",
      systemName: "Main Server",
      status: "healthy",
      cpuUsage: 24,
      memoryUsage: 42,
      diskUsage: 67,
    });
    
    this.createOrUpdateSystemMetric({
      systemId: "db-server",
      systemName: "Database Server",
      status: "warning",
      cpuUsage: 56,
      memoryUsage: 78,
      diskUsage: 32,
    });
    
    this.createOrUpdateSystemMetric({
      systemId: "web-server",
      systemName: "Web Server",
      status: "healthy",
      cpuUsage: 18,
      memoryUsage: 45,
      diskUsage: 23,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }
  
  async getTickets(filters?: { status?: string; requesterId?: number; assigneeId?: number }): Promise<Ticket[]> {
    let tickets = Array.from(this.tickets.values());
    
    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(ticket => ticket.status === filters.status);
      }
      
      if (filters.requesterId) {
        tickets = tickets.filter(ticket => ticket.requesterId === filters.requesterId);
      }
      
      if (filters.assigneeId) {
        tickets = tickets.filter(ticket => ticket.assigneeId === filters.assigneeId);
      }
    }
    
    // Sort by created date (newest first)
    return tickets.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentId.ticket++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const ticket: Ticket = { ...insertTicket, id, createdAt, updatedAt, resolvedAt: null };
    this.tickets.set(id, ticket);
    return ticket;
  }
  
  async updateTicket(id: number, data: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket: Ticket = {
      ...ticket,
      ...data,
      updatedAt: new Date(),
      resolvedAt: data.status === 'resolved' ? new Date() : ticket.resolvedAt,
    };
    
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  // Ticket comments
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    return Array.from(this.ticketComments.values())
      .filter(comment => comment.ticketId === ticketId)
      .sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }
  
  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const id = this.currentId.comment++;
    const createdAt = new Date();
    const comment: TicketComment = { ...insertComment, id, createdAt };
    this.ticketComments.set(id, comment);
    return comment;
  }
  
  // Logs
  async getLog(id: number): Promise<Log | undefined> {
    return this.logs.get(id);
  }
  
  async getLogs(userId?: number): Promise<Log[]> {
    let logs = Array.from(this.logs.values());
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    return logs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.currentId.log++;
    const createdAt = new Date();
    const log: Log = { ...insertLog, id, analysis: null, createdAt };
    this.logs.set(id, log);
    return log;
  }
  
  async updateLogAnalysis(id: number, analysis: string): Promise<Log | undefined> {
    const log = this.logs.get(id);
    if (!log) return undefined;
    
    const updatedLog: Log = {
      ...log,
      analysis,
    };
    
    this.logs.set(id, updatedLog);
    return updatedLog;
  }
  
  // System metrics
  async getSystemMetrics(): Promise<SystemMetric[]> {
    return Array.from(this.systemMetrics.values());
  }
  
  async getSystemMetric(systemId: string): Promise<SystemMetric | undefined> {
    return this.systemMetrics.get(systemId);
  }
  
  async createOrUpdateSystemMetric(insertMetric: InsertSystemMetric): Promise<SystemMetric> {
    const id = this.currentId.systemMetric++;
    const updatedAt = new Date();
    const metric: SystemMetric = { ...insertMetric, id, updatedAt };
    this.systemMetrics.set(insertMetric.systemId, metric);
    return metric;
  }
  
  // Chat messages
  async getChatMessages(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    
    return messages.slice(-limit);
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId.chatMessage++;
    const createdAt = new Date();
    const message: ChatMessage = { ...insertMessage, id, createdAt };
    this.chatMessages.set(id, message);
    return message;
  }
  
  async clearChatMessages(userId: number): Promise<void> {
    // Get all message IDs for this user
    const messageIds = Array.from(this.chatMessages.entries())
      .filter(([_, message]) => message.userId === userId)
      .map(([id, _]) => id);
    
    // Delete each message
    messageIds.forEach(id => {
      this.chatMessages.delete(id);
    });
  }
  
  // Initialize a test user with credentials admin/admin123
  async initializeTestUser() {
    try {
      // First check if test user exists
      const existingUser = await this.getUserByUsername('admin');
      if (existingUser) {
        console.log('Test user already exists');
        return;
      }
      
      // Create a correctly hashed password
      const hashedPassword = await hashPassword('admin123');
      console.log('Creating test user with properly hashed password');
      
      await this.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        department: 'IT',
      });
      
      console.log('Test user created successfully');
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  }
}

export const storage = new MemStorage();

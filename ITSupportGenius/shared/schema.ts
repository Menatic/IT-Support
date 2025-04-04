import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "agent", "employee"] }).notNull().default("employee"),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ticket schema
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["open", "pending", "in_progress", "resolved", "closed"] })
    .notNull()
    .default("open"),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] })
    .notNull()
    .default("medium"),
  category: text("category").notNull(),
  requesterId: integer("requester_id").notNull(),
  assigneeId: integer("assignee_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Ticket comments
export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Logs for analysis
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  analysis: text("analysis"),
  systemId: text("system_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System health metrics
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  systemId: text("system_id").notNull(),
  systemName: text("system_name").notNull(),
  status: text("status", { enum: ["healthy", "warning", "critical"] }).notNull(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(),
  diskUsage: integer("disk_usage").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  isBot: boolean("is_bot").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  department: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  category: true,
  requesterId: true,
  assigneeId: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).pick({
  ticketId: true,
  userId: true,
  content: true,
});

export const insertLogSchema = createInsertSchema(logs).pick({
  name: true,
  content: true,
  userId: true,
  systemId: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).pick({
  systemId: true,
  systemName: true,
  status: true,
  cpuUsage: true,
  memoryUsage: true,
  diskUsage: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  isBot: true,
  content: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricsSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

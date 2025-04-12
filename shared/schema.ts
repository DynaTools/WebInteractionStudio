import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Conversation Sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  userId: text("user_id").notNull(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isTutor: boolean("is_tutor").notNull(),
  audioUrl: text("audio_url"),
});

// Insert Schemas
export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  content: true,
  isTutor: true,
  audioUrl: true,
});

// Types
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Custom Types for API
export type WhisperRequest = {
  audio: Buffer;
};

export type ChatRequest = {
  userMessage: string;
};

export type TTSRequest = {
  text: string;
};

export type User = {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
};

export type InsertUser = {
  username: string;
  password: string;
  isAdmin?: boolean;
};

export type AccessToken = {
  id: number;
  token: string;
  description: string;
  isActive: boolean;
  usageCount: number;
  maxUsage: number | null; // null significa uso ilimitado
  expiresAt: Date | null; // null significa que não expira
  createdAt: Date;
  createdBy: number; // ID do usuário que criou o token
};

export type InsertAccessToken = {
  token: string;
  description: string;
  isActive: boolean;
  maxUsage: number | null;
  expiresAt: Date | null;
  createdBy: number;
};

/** @format */

import {
	sqliteTable,
	text,
	integer,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	password: text("password").notNull(),
});

export const audioTracks = sqliteTable("audio_tracks", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	originalFilename: text("original_filename").notNull(),
	originalPath: text("original_path").notNull(),
	extendedPaths: text("extended_paths").default("[]"), // JSON as text
	duration: integer("duration"),
	extendedDurations: text("extended_durations").default("[]"), // JSON as text
	bpm: integer("bpm"),
	key: text("key"),
	format: text("format"),
	bitrate: integer("bitrate"),
	status: text("status").notNull().default("uploaded"), // status can be: uploaded, processing, regenerate, completed, error
	settings: text("settings"), // JSON as text
	versionCount: integer("version_count").notNull().default(1),
	userId: integer("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
	username: true,
	password: true,
});

export const insertAudioTrackSchema = createInsertSchema(audioTracks).pick({
	originalFilename: true,
	originalPath: true,
	userId: true,
});

export const updateAudioTrackSchema = createInsertSchema(audioTracks)
	.pick({
		extendedPaths: true,
		duration: true,
		extendedDurations: true,
		bpm: true,
		key: true,
		format: true,
		bitrate: true,
		status: true,
		settings: true,
		versionCount: true,
	})
	.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAudioTrack = z.infer<typeof insertAudioTrackSchema>;
export type UpdateAudioTrack = z.infer<typeof updateAudioTrackSchema>;
export type AudioTrack = typeof audioTracks.$inferSelect;

export const processingSettingsSchema = z.object({
	introLength: z.number().min(8).max(64).default(16),
	outroLength: z.number().min(8).max(64).default(16),
	preserveVocals: z.boolean().default(true),
	beatDetection: z.enum(["auto", "librosa", "madmom"]).default("auto"),
});

export type ProcessingSettings = z.infer<typeof processingSettingsSchema>;

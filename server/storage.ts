/** @format */

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
	users,
	audioTracks,
	type User,
	type InsertUser,
	type AudioTrack,
	type InsertAudioTrack,
	type UpdateAudioTrack,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { join } from "path";

// Use SQLite for local development
const sqlite = new Database("local-database.db");
const db = drizzle(sqlite);

// Auto-migrate on startup
try {
	migrate(db, { migrationsFolder: "./migrations" });
} catch (error) {
	console.log("Migration skipped (migrations folder not found or no migrations needed)");
}

export interface IStorage {
	getUser(id: number): Promise<User | undefined>;
	getUserByUsername(username: string): Promise<User | undefined>;
	createUser(user: InsertUser): Promise<User>;
	getAudioTrack(id: number): Promise<AudioTrack | undefined>;
	createAudioTrack(track: InsertAudioTrack): Promise<AudioTrack>;
	updateAudioTrack(
		id: number,
		update: UpdateAudioTrack
	): Promise<AudioTrack | undefined>;
	getAudioTracksByUserId(userId: number): Promise<AudioTrack[]>;
}

export class SqliteStorage implements IStorage {
	async getUser(id: number): Promise<User | undefined> {
		const result = await db.select().from(users).where(eq(users.id, id));
		return result[0];
	}

	async getUserByUsername(username: string): Promise<User | undefined> {
		const result = await db
			.select()
			.from(users)
			.where(eq(users.username, username));
		return result[0];
	}

	async createUser(insertUser: InsertUser): Promise<User> {
		const result = await db.insert(users).values(insertUser).returning();
		return result[0];
	}

	async getAudioTrack(id: number): Promise<AudioTrack | undefined> {
		const result = await db
			.select()
			.from(audioTracks)
			.where(eq(audioTracks.id, id));
		const track = result[0];
		if (track) {
			// Parse JSON fields for SQLite
			return {
				...track,
				extendedPaths: track.extendedPaths ? JSON.parse(track.extendedPaths as string) : [],
				extendedDurations: track.extendedDurations ? JSON.parse(track.extendedDurations as string) : [],
				settings: track.settings ? JSON.parse(track.settings as string) : null,
			};
		}
		return track;
	}

	async createAudioTrack(track: InsertAudioTrack): Promise<AudioTrack> {
		const trackData = {
			...track,
			extendedPaths: JSON.stringify(track.extendedPaths || []),
			extendedDurations: JSON.stringify(track.extendedDurations || []),
			settings: track.settings ? JSON.stringify(track.settings) : null,
		};
		const result = await db.insert(audioTracks).values(trackData).returning();
		const createdTrack = result[0];
		return {
			...createdTrack,
			extendedPaths: createdTrack.extendedPaths ? JSON.parse(createdTrack.extendedPaths as string) : [],
			extendedDurations: createdTrack.extendedDurations ? JSON.parse(createdTrack.extendedDurations as string) : [],
			settings: createdTrack.settings ? JSON.parse(createdTrack.settings as string) : null,
		};
	}

	async updateAudioTrack(
		id: number,
		update: UpdateAudioTrack
	): Promise<AudioTrack | undefined> {
		const updateData = {
			...update,
			extendedPaths: update.extendedPaths ? JSON.stringify(update.extendedPaths) : undefined,
			extendedDurations: update.extendedDurations ? JSON.stringify(update.extendedDurations) : undefined,
			settings: update.settings ? JSON.stringify(update.settings) : undefined,
		};
		const result = await db
			.update(audioTracks)
			.set(updateData)
			.where(eq(audioTracks.id, id))
			.returning();
		const updatedTrack = result[0];
		if (updatedTrack) {
			return {
				...updatedTrack,
				extendedPaths: updatedTrack.extendedPaths ? JSON.parse(updatedTrack.extendedPaths as string) : [],
				extendedDurations: updatedTrack.extendedDurations ? JSON.parse(updatedTrack.extendedDurations as string) : [],
				settings: updatedTrack.settings ? JSON.parse(updatedTrack.settings as string) : null,
			};
		}
		return updatedTrack;
	}

	async getAudioTracksByUserId(userId: number): Promise<AudioTrack[]> {
		const tracks = await db.select().from(audioTracks).where(eq(audioTracks.userId, userId));
		return tracks.map(track => ({
			...track,
			extendedPaths: track.extendedPaths ? JSON.parse(track.extendedPaths as string) : [],
			extendedDurations: track.extendedDurations ? JSON.parse(track.extendedDurations as string) : [],
			settings: track.settings ? JSON.parse(track.settings as string) : null,
		}));
	}

	async deleteAllUserTracks(userId: number): Promise<void> {
		await db.delete(audioTracks).where(eq(audioTracks.userId, userId));
	}
}

export const storage = new SqliteStorage();

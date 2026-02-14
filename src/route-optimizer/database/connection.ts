/**
 * Database connection management
 * 
 * Note: This uses expo-sqlite which needs to be installed.
 * Run: npx expo install expo-sqlite
 */

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import { DATABASE_CONFIG } from '../config';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabaseAsync(DATABASE_CONFIG.name);
  await initializeDatabase(dbInstance);
  
  return dbInstance;
}

/**
 * Initialize database schema
 */
async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync(CREATE_TABLES_SQL);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

/**
 * Reset the database (for testing)
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS route_performances;
    DROP TABLE IF EXISTS weight_adjustments;
  `);
  await db.execAsync(CREATE_TABLES_SQL);
}

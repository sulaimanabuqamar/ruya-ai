/**
 * Mock implementation of expo-sqlite for testing using better-sqlite3
 */

import Database from 'better-sqlite3';

class MockSQLiteDatabase {
  private db: Database.Database;

  constructor(name: string) {
    // Use in-memory database for testing
    this.db = new Database(':memory:');
  }

  async runAsync(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowId?: number }> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...(params || []));
      return { 
        changes: result.changes,
        lastInsertRowId: Number(result.lastInsertRowid)
      };
    } catch (error) {
      console.error('SQL Error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  }

  async getAllAsync(sql: string, params?: any[]): Promise<any[]> {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...(params || []));
    } catch (error) {
      console.error('SQL Error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  }

  async getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...(params || []));
      return result as T || null;
    } catch (error) {
      console.error('SQL Error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  }

  async execAsync(sql: string): Promise<void> {
    try {
      this.db.exec(sql);
    } catch (error) {
      console.error('SQL Error:', error, 'SQL:', sql);
      throw error;
    }
  }

  async closeAsync(): Promise<void> {
    this.db.close();
  }
}

const dbInstances = new Map<string, MockSQLiteDatabase>();

export async function openDatabaseAsync(name: string): Promise<MockSQLiteDatabase> {
  if (!dbInstances.has(name)) {
    dbInstances.set(name, new MockSQLiteDatabase(name));
  }
  return dbInstances.get(name)!;
}

export type SQLiteDatabase = MockSQLiteDatabase;


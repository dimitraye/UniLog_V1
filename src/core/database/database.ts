
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'unilog.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

/**
 * Returns the application's SQLite database.
 * Opens and initializes the connection only once.
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await openDatabaseAsync(DATABASE_NAME);

      // Enable Write-Ahead Logging
      await database.execAsync('PRAGMA journal_mode = WAL;');

      // Enable foreign key constraints
      await database.execAsync('PRAGMA foreign_keys = ON;');

      // Run pending database migrations
      await runMigrations(database);

      return database;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

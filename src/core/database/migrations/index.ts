
import { SQLiteDatabase } from 'expo-sqlite';

interface Migration {
  version: number;
  description: string;
  up: (database: SQLiteDatabase) => Promise<void>;
}

/**
 * List of all database migrations.
 * Add new migrations at the end of this array.
 */

const migrations: Migration[] = [
  {
    version: 1,
    description: 'Create initial media and manga tables',

    up: async (database) => {
      await database.execAsync(`
        -- =========================================
        -- TABLE: media
        -- Informations communes à tous les médias
        -- =========================================

        CREATE TABLE media (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          cover TEXT,

          category TEXT NOT NULL CHECK (
            category IN (
              'manga',
              'webtoon',
              'game',
              'book',
              'series',
              'movie'
            )
          ),

          release_date TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );


        -- =========================================
        -- TABLE: manga_details
        -- Informations spécifiques aux mangas
        -- =========================================

        CREATE TABLE manga_details (
          media_id TEXT PRIMARY KEY NOT NULL,

          authors TEXT,
          illustrators TEXT,
          publisher TEXT,

          genres TEXT,
          themes TEXT,
          demographic TEXT,

          original_language TEXT,
          serialization TEXT,

          publication_status TEXT CHECK (
            publication_status IS NULL OR
            publication_status IN (
              'ongoing',
              'completed',
              'hiatus',
              'cancelled'
            )
          ),

          total_volumes INTEGER CHECK (
            total_volumes IS NULL OR total_volumes >= 0
          ),

          start_date TEXT,
          end_date TEXT,

          FOREIGN KEY (media_id)
            REFERENCES media(id)
            ON DELETE CASCADE
        );


        -- =========================================
        -- TABLE: manga_collections
        -- Suivi personnel du manga
        -- =========================================

        CREATE TABLE manga_collections (
          id TEXT PRIMARY KEY NOT NULL,

          manga_id TEXT NOT NULL UNIQUE,

          reading_status TEXT NOT NULL DEFAULT 'plan_to_read'
            CHECK (
              reading_status IN (
                'plan_to_read',
                'reading',
                'completed',
                'on_hold',
                'dropped'
              )
            ),

          rating REAL CHECK (
            rating IS NULL OR
            (rating >= 0 AND rating <= 10)
          ),

          started_at TEXT,
          completed_at TEXT,
          notes TEXT,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,

          FOREIGN KEY (manga_id)
            REFERENCES media(id)
            ON DELETE CASCADE
        );


        -- =========================================
        -- TABLE: manga_volumes
        -- Informations sur les tomes
        -- =========================================

        CREATE TABLE manga_volumes (
          id TEXT PRIMARY KEY NOT NULL,

          manga_id TEXT NOT NULL,
          volume_number TEXT NOT NULL,
          title TEXT,

          isbn TEXT,
          publisher TEXT,
          release_date TEXT,
          original_language TEXT,

          page_count INTEGER CHECK (
            page_count IS NULL OR page_count >= 0
          ),

          cover TEXT,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,

          FOREIGN KEY (manga_id)
            REFERENCES media(id)
            ON DELETE CASCADE
        );


        -- =========================================
        -- TABLE: manga_ownership
        -- Possessions physiques et numériques
        -- =========================================

        CREATE TABLE manga_ownership (
          id TEXT PRIMARY KEY NOT NULL,

          collection_id TEXT NOT NULL,

          scope TEXT NOT NULL CHECK (
            scope IN ('series', 'volume')
          ),

          manga_volume_id TEXT,

          format TEXT NOT NULL CHECK (
            format IN ('physical', 'digital')
          ),

          acquired_at TEXT,
          created_at TEXT NOT NULL,

          FOREIGN KEY (collection_id)
            REFERENCES manga_collections(id)
            ON DELETE CASCADE,

          FOREIGN KEY (manga_volume_id)
            REFERENCES manga_volumes(id)
            ON DELETE CASCADE,

          CHECK (
            (scope = 'series' AND manga_volume_id IS NULL)
            OR
            (scope = 'volume' AND manga_volume_id IS NOT NULL)
          )
        );


        -- =========================================
        -- INDEXES
        -- Optimisation des recherches
        -- =========================================

        CREATE INDEX idx_media_category
          ON media(category);

        CREATE INDEX idx_media_title
          ON media(title);

        CREATE INDEX idx_manga_volumes_manga
          ON manga_volumes(manga_id);

        CREATE INDEX idx_manga_ownership_collection
          ON manga_ownership(collection_id);

        CREATE INDEX idx_manga_ownership_volume
          ON manga_ownership(manga_volume_id);
      `);
    },
  },
];


/**
 * Creates the migration tracking table.
 */
async function initializeMigrationTable(
  database: SQLiteDatabase
): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Returns the current database schema version.
 */
async function getCurrentVersion(
  database: SQLiteDatabase
): Promise<number> {
  const result = await database.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) AS version FROM schema_migrations'
  );

  return result?.version ?? 0;
}

/**
 * Executes all pending migrations.
 */
export async function runMigrations(
  database: SQLiteDatabase
): Promise<void> {
  await initializeMigrationTable(database);

  const currentVersion = await getCurrentVersion(database);

  const pendingMigrations = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pendingMigrations) {
    await database.withTransactionAsync(async () => {
      await migration.up(database);

      await database.runAsync(
        `INSERT INTO schema_migrations (version, description)
         VALUES (?, ?)`,
        migration.version,
        migration.description
      );
    });

    console.log(
      `Migration ${migration.version} applied: ${migration.description}`
    );
  }
}

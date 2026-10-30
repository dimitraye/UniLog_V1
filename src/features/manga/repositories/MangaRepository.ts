
import { getDatabase } from '@/core/database/database';
import type { Manga } from '../models/Manga';

/**
 * Represents a manga row returned by SQLite.
 * SQLite stores JSON arrays as TEXT and optional values as NULL.
 */
interface MangaRow {
  id: string;
  title: string;
  description: string | null;
  cover: string | null;
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;

  authors: string | null;
  illustrators: string | null;
  publisher: string | null;

  genres: string | null;
  themes: string | null;
  demographic: string | null;

  originalLanguage: string | null;
  serialization: string | null;
  publicationStatus: Manga['publicationStatus'] | null;

  totalVolumes: number | null;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Converts a nullable JSON string into a string array.
 */
function parseStringArray(value: string | null): string[] | undefined {
  if (value === null) {
    return undefined;
  }

  return JSON.parse(value) as string[];
}

/**
 * Manga repository.
 * Handles database operations related to manga.
 */
export const MangaRepository = {

  /**
   * Creates a manga and its specific details.
   */
  async create(manga: Manga): Promise<void> {
    const database = await getDatabase();

    await database.withTransactionAsync(async () => {

      // Insert common media information
      await database.runAsync(
        `INSERT INTO media (
          id,
          title,
          description,
          cover,
          category,
          release_date,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        manga.id,
        manga.title,
        manga.description ?? null,
        manga.cover ?? null,
        manga.category,
        manga.releaseDate ?? null,
        manga.createdAt,
        manga.updatedAt
      );

      // Insert manga-specific information
      await database.runAsync(
        `INSERT INTO manga_details (
          media_id,
          authors,
          illustrators,
          publisher,
          genres,
          themes,
          demographic,
          original_language,
          serialization,
          publication_status,
          total_volumes,
          start_date,
          end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        manga.id,
        manga.authors ? JSON.stringify(manga.authors) : null,
        manga.illustrators ? JSON.stringify(manga.illustrators) : null,
        manga.publisher ?? null,
        manga.genres ? JSON.stringify(manga.genres) : null,
        manga.themes ? JSON.stringify(manga.themes) : null,
        manga.demographic ?? null,
        manga.originalLanguage ?? null,
        manga.serialization ?? null,
        manga.publicationStatus ?? null,
        manga.totalVolumes ?? null,
        manga.startDate ?? null,
        manga.endDate ?? null
      );
    });
  },

  /**
   * Retrieves a manga using its ID.
   */
  async getById(id: string): Promise<Manga | null> {
    const database = await getDatabase();

    const row = await database.getFirstAsync<MangaRow>(
      `SELECT
        m.id,
        m.title,
        m.description,
        m.cover,
        m.release_date AS releaseDate,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt,

        d.authors,
        d.illustrators,
        d.publisher,
        d.genres,
        d.themes,
        d.demographic,
        d.original_language AS originalLanguage,
        d.serialization,
        d.publication_status AS publicationStatus,
        d.total_volumes AS totalVolumes,
        d.start_date AS startDate,
        d.end_date AS endDate

      FROM media m

      INNER JOIN manga_details d
        ON m.id = d.media_id

      WHERE m.id = ?
        AND m.category = 'manga'
      `,
      id
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      cover: row.cover ?? undefined,
      category: 'manga',

      releaseDate: row.releaseDate ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,

      authors: parseStringArray(row.authors),
      illustrators: parseStringArray(row.illustrators),
      publisher: row.publisher ?? undefined,

      genres: parseStringArray(row.genres),
      themes: parseStringArray(row.themes),
      demographic: row.demographic ?? undefined,

      originalLanguage: row.originalLanguage ?? undefined,
      serialization: row.serialization ?? undefined,
      publicationStatus: row.publicationStatus ?? undefined,

      totalVolumes: row.totalVolumes ?? undefined,
      startDate: row.startDate ?? undefined,
      endDate: row.endDate ?? undefined,
    };
  },
};


export type MangaReadingStatus =
  | 'plan_to_read'
  | 'reading'
  | 'completed'
  | 'on_hold'
  | 'dropped';

export interface MangaCollection {
  id: string;
  mangaId: string;

  // Suivi personnel
  readingStatus: MangaReadingStatus;

  // Évaluation personnelle (0 à 10)
  rating?: number;

  // Dates de lecture
  startedAt?: string;
  completedAt?: string;

  // Notes personnelles
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

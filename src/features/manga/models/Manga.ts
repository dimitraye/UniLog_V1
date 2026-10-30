
import type { Media } from '@/shared/types/Media';

export type MangaPublicationStatus =
  | 'ongoing'
  | 'completed'
  | 'hiatus'
  | 'cancelled';

export interface Manga extends Media {
  category: 'manga';

  // Informations générales
  authors?: string[];
  illustrators?: string[];
  publisher?: string;

  // Classification
  genres?: string[];
  themes?: string[];
  demographic?: string;

  // Publication
  originalLanguage?: string;
  serialization?: string;
  publicationStatus?: MangaPublicationStatus;

  // Volumes
  totalVolumes?: number;

  // Dates
  startDate?: string;
  endDate?: string;
}

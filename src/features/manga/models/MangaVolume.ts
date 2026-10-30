
export interface MangaVolume {
  id: string;
  mangaId: string;

  // Identification
  volumeNumber: string;
  title?: string;

  // Informations éditoriales
  isbn?: string;
  publisher?: string;
  releaseDate?: string;
  originalLanguage?: string;

  // Informations complémentaires
  pageCount?: number;
  cover?: string;

  createdAt: string;
  updatedAt: string;
}

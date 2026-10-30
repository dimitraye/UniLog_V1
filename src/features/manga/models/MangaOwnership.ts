
export type MangaFormat =
  | 'physical'
  | 'digital';

export type MangaOwnership =
  | {
      id: string;
      collectionId: string;

      scope: 'series';
      format: MangaFormat;

      acquiredAt?: string;
      createdAt: string;
    }
  | {
      id: string;
      collectionId: string;

      scope: 'volume';
      mangaVolumeId: string;
      format: MangaFormat;

      acquiredAt?: string;
      createdAt: string;
    };

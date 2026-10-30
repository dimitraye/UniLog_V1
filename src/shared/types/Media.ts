
export type MediaCategory =
  | 'manga'
  |  'webtoon'
  | 'game'
  | 'book'
  | 'series'
  | 'movie';

export interface Media {
  id: string;
  title: string;
  description?: string;
  cover?: string;

  category: MediaCategory;

  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

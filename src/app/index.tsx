
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MangaRepository } from '@/features/manga/repositories/MangaRepository';
import type { Manga } from '@/features/manga/models/Manga';

import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

export default function HomeScreen() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState('');

  async function testSQLite() {
    setIsTesting(true);
    setResult('');

    const now = new Date().toISOString();

    const testManga: Manga = {
      id: `test-manga-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: 'One Piece',
      category: 'manga',

      authors: ['Eiichiro Oda'],
      genres: ['Action', 'Aventure'],
      publicationStatus: 'ongoing',
      totalVolumes: 100,

      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Enregistrer le manga
      await MangaRepository.create(testManga);

      // 2. Récupérer le manga depuis SQLite
      const savedManga = await MangaRepository.getById(testManga.id);

      // 3. Vérifier le résultat
      if (!savedManga) {
        throw new Error('Le manga enregistré est introuvable.');
      }

      if (
        savedManga.title !== testManga.title ||
        savedManga.authors?.[0] !== 'Eiichiro Oda' ||
        savedManga.genres?.length !== 2
      ) {
        throw new Error('Les données récupérées ne correspondent pas.');
      }

      console.log('Manga successfully saved:', savedManga);

      setResult(
        `SUCCÈS !\n\nTitre : ${savedManga.title}\nAuteur : ${savedManga.authors?.[0]}\nGenres : ${savedManga.genres?.join(', ')}\nTomes : ${savedManga.totalVolumes}`
      );
    } catch (error) {
      console.error('SQLite test failed:', error);

      setResult(
        `ÉCHEC DU TEST :\n${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">UniLog</ThemedText>

        <ThemedText type="subtitle">
          Test de la base de données
        </ThemedText>

        <Pressable
          onPress={testSQLite}
          disabled={isTesting}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            isTesting && styles.disabled,
          ]}
        >
          <ThemedText type="smallBold">
            {isTesting ? 'Test en cours...' : 'Tester SQLite'}
          </ThemedText>
        </Pressable>

        {result !== '' && (
          <ThemedView type="backgroundElement" style={styles.resultContainer}>
            <ThemedText>{result}</ThemedText>
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.three,
    backgroundColor: '#4B75D1',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  resultContainer: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
});

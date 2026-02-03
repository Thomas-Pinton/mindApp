import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getGratitudes, getReflections, getSavedQuotes, Reflection } from '@/services/database';

type MemoryItem =
    | { type: 'reflection', data: Reflection }
    | { type: 'gratitude', data: { id: number, content: string, date: string } }
    | { type: 'quote', data: { id: number, text: string, author: string, date: string } };

export default function MemoriesScreen() {
    const [memories, setMemories] = useState<MemoryItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadMemories() {
                const [reflections, gratitudes, quotes] = await Promise.all([
                    getReflections(),
                    getGratitudes(),
                    getSavedQuotes()
                ]);

                const combined: MemoryItem[] = [
                    ...reflections.map(r => ({ type: 'reflection' as const, data: r })),
                    ...gratitudes.map(g => ({ type: 'gratitude' as const, data: g })),
                    ...quotes.map(q => ({ type: 'quote' as const, data: q }))
                ].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

                setMemories(combined);
            }
            loadMemories();
        }, [])
    );

    const renderItem: ListRenderItem<MemoryItem> = ({ item }) => {
        if (item.type === 'reflection') {
            return (
                <ThemedView style={styles.card}>
                    <ThemedText style={styles.date}>{new Date(item.data.date).toLocaleDateString()}</ThemedText>
                    <ThemedText type="subtitle" style={styles.label}>Evening Reflection</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.prompt}>{item.data.prompt}</ThemedText>
                    <ThemedText style={styles.answer}>{item.data.answer}</ThemedText>
                </ThemedView>
            );
        } else if (item.type === 'gratitude') {
            return (
                <ThemedView style={styles.card}>
                    <ThemedText style={styles.date}>{new Date(item.data.date).toLocaleDateString()}</ThemedText>
                    <ThemedText type="subtitle" style={styles.label}>Daily Gratitude</ThemedText>
                    <ThemedText style={styles.answer}>{item.data.content}</ThemedText>
                </ThemedView>
            );
        } else {
            return (
                <ThemedView style={styles.card}>
                    <ThemedText style={styles.date}>{new Date(item.data.date).toLocaleDateString()}</ThemedText>
                    <ThemedText type="subtitle" style={styles.label}>Quote of the Day</ThemedText>
                    <ThemedText style={styles.answer}>"{item.data.text}"</ThemedText>
                    <ThemedText style={[styles.answer, { marginTop: 4, fontStyle: 'italic', opacity: 0.7 }]}>- {item.data.author}</ThemedText>
                </ThemedView>
            );
        }
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="book.fill"
                    style={styles.headerImage}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Memories</ThemedText>
            </ThemedView>

            <FlatList
                data={memories}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.type}-${item.data.id}`}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false} // Since it's inside a ScrollView (ParallaxScrollView)
                ListEmptyComponent={
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText>No memories saved yet.</ThemedText>
                    </ThemedView>
                }
            />
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    listContent: {
        gap: 16,
        marginBottom: 32,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#353636', // Fallback, should use theme color ideally
        borderWidth: 1,
        borderColor: '#404040',
    },
    date: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    prompt: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#4a90e2',
    },
    answer: {
        opacity: 0.9,
    },
    emptyContainer: {
        marginTop: 20,
        alignItems: 'center',
    }
});

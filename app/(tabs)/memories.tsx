import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, ListRenderItem, StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { deleteGratitude, deleteReflection, getGratitudes, getReflections, getSavedQuotes, Reflection, removeSavedQuote } from '@/services/database';

import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MemoryItem =
    | { type: 'reflection', data: Reflection }
    | { type: 'gratitude', data: { id: number, content: string, date: string } }
    | { type: 'quote', data: { id: number, text: string, author: string, date: string } };

export default function MemoriesScreen() {
    const [memories, setMemories] = useState<MemoryItem[]>([]);
    const { primaryColor } = useSettings();
    const colorScheme = useColorScheme() ?? 'light';
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MemoryItem | null>(null);

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

    const handleDelete = (item: MemoryItem) => {
        setItemToDelete(item);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'reflection') {
                await deleteReflection(itemToDelete.data.id);
            } else if (itemToDelete.type === 'gratitude') {
                await deleteGratitude(itemToDelete.data.id);
            } else if (itemToDelete.type === 'quote') {
                await removeSavedQuote(itemToDelete.data.text, itemToDelete.data.author);
            }

            // Refresh functionality
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
        } catch (error) {
            console.error("Failed to delete item:", error);
            Alert.alert("Error", "Failed to delete item.");
        } finally {
            setDeleteModalVisible(false);
            setItemToDelete(null);
        }
    };

    const renderItem: ListRenderItem<MemoryItem> = ({ item }) => {
        if (item.type === 'reflection') {
            return (
                <TouchableOpacity onLongPress={() => handleDelete(item)} activeOpacity={0.8}>
                    <ThemedView style={styles.card}>
                        <ThemedText style={styles.date}>{new Date(item.data.date).toLocaleDateString()}</ThemedText>
                        <ThemedText type="subtitle" style={styles.label}>Evening Reflection</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.prompt}>{item.data.prompt}</ThemedText>
                        <ThemedText style={styles.answer}>{item.data.answer}</ThemedText>
                    </ThemedView>
                </TouchableOpacity>
            );
        } else if (item.type === 'gratitude') {
            return (
                <TouchableOpacity onLongPress={() => handleDelete(item)} activeOpacity={0.8}>
                    <ThemedView style={styles.card}>
                        <ThemedText style={styles.date}>{new Date(item.data.date).toLocaleDateString()}</ThemedText>
                        <ThemedText type="subtitle" style={styles.label}>Daily Gratitude</ThemedText>
                        <ThemedText style={styles.answer}>{item.data.content}</ThemedText>
                    </ThemedView>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity onLongPress={() => handleDelete(item)} activeOpacity={0.8}>
                    <ThemedView style={styles.card}>
                        <ThemedText style={styles.date}>{new Date(item.data.date).toLocaleDateString()}</ThemedText>
                        <ThemedText type="subtitle" style={styles.label}>Quote of the Day</ThemedText>
                        <ThemedText style={styles.answer}>"{item.data.text}"</ThemedText>
                        <ThemedText style={[styles.answer, { marginTop: 4, fontStyle: 'italic', opacity: 0.7 }]}>- {item.data.author}</ThemedText>
                    </ThemedView>
                </TouchableOpacity>
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

            <ConfirmationModal
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Memory"
                message="Are you sure you want to delete this memory?"
                confirmText="Delete"
                cancelText="Cancel"
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
        // backgroundColor: '#353636', // Fallback, should use theme color ideally
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        // color: '#4a90e2', // Dynamic now
    },
    answer: {
        opacity: 0.9,
    },
    emptyContainer: {
        marginTop: 20,
        alignItems: 'center',
    }
});

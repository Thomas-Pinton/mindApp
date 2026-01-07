import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { deleteGratitude, getDailyPrompt, getTodayGratitudes, getTodayReflection, saveGratitude, saveReflection, updateGratitude } from '@/services/database';

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso" }
];

function QuoteOfTheDay() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  return (
    <ThemedView style={styles.quoteContainer}>
      <ThemedText type="subtitle" style={styles.quoteTitle}>Quote of the Day</ThemedText>
      <ThemedText style={styles.quoteText}>"{quote.text}"</ThemedText>
      <ThemedText style={styles.quoteAuthor}>- {quote.author}</ThemedText>
    </ThemedView>
  );
}

const REFLECTIONS = [
  "What made you smile today?",
  "What is one thing you learned today?",
  "How did you take care of yourself today?",
  "What are you grateful for right now?",
  "What was the most challenging part of your day, and how did you handle it?"
];

function GratitudePrompt() {
  const [gratitudes, setGratitudes] = useState<{ id: number, content: string }[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const loadGratitudes = useCallback(async () => {
    const data = await getTodayGratitudes();
    setGratitudes(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGratitudes();
    }, [loadGratitudes])
  );

  const handleSave = async () => {
    if (!newGratitude.trim()) {
      Alert.alert('Empty', 'Please write something before saving.');
      return;
    }

    await saveGratitude(newGratitude);
    setNewGratitude('');
    await loadGratitudes();
  };

  const handleUpdate = async (id: number) => {
    if (!editContent.trim()) {
      Alert.alert('Empty', 'Cannot save empty gratitude.');
      return;
    }
    await updateGratitude(id, editContent);
    setEditingId(null);
    setEditContent('');
    await loadGratitudes();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Gratitude', 'Are you sure you want to delete this gratitude?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGratitude(id);
          await loadGratitudes();
        },
      },
    ]);
  };

  const startEditing = (item: { id: number, content: string }) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  return (
    <ThemedView style={styles.quoteContainer}>
      <ThemedText type="subtitle" style={styles.quoteTitle}>Daily Gratitude</ThemedText>
      <ThemedText style={styles.quoteText}>What are you grateful for today?</ThemedText>

      <ThemedView style={styles.gratitudeList}>
        {gratitudes.map((item) => (
          <ThemedView key={item.id} style={styles.gratitudeItemRow}>
            {editingId === item.id ? (
              <ThemedView style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editContent}
                  onChangeText={setEditContent}
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleUpdate(item.id)}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#4a90e2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#999" />
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.gratitudeContent}
                  onPress={() => startEditing(item)}>
                  <ThemedText>• {item.content}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <IconSymbol name="trash.fill" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="I am grateful for..."
          placeholderTextColor="#999"
          value={newGratitude}
          onChangeText={setNewGratitude}
          multiline
          blurOnSubmit
          submitBehavior="submit"
          onSubmitEditing={handleSave}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSave}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color="#4a90e2" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

function ReflectionPrompt() {
  const [reflection, setReflection] = useState(REFLECTIONS[0]);
  const [answer, setAnswer] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function loadToday() {
        // Ensure we get the stable daily prompt first
        const dailyPrompt = await getDailyPrompt(REFLECTIONS);
        setReflection(dailyPrompt);

        // Then check if there's an answer for it already (or just any answer for today)
        const existing = await getTodayReflection();
        if (existing) {
          // If we saved one today, use its prompt and answer (handles edge case where we saved before DB update)
          // But ideally 'dailyPrompt' should match 'existing.prompt' if everything aligns.
          // We'll trust 'existing' if it exists to show what was saved.
          setReflection(existing.prompt);
          setAnswer(existing.answer);
        } else {
          setAnswer('');
        }
      }
      loadToday();
    }, [])
  );

  return (
    <ThemedView style={styles.quoteContainer}>
      <ThemedText type="subtitle" style={styles.quoteTitle}>Evening Reflection</ThemedText>
      <ThemedText style={styles.quoteText}>{reflection}</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Type your thoughts here..."
        placeholderTextColor="#999"
        value={answer}
        onChangeText={setAnswer}
        multiline
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          if (!answer.trim()) {
            Alert.alert('Empty', 'Please write something before saving.');
            return;
          }
          saveReflection(reflection, answer);
          // Don't clear answer on save anymore, as it acts as an edit
          Alert.alert('Saved', 'Your reflection has been saved.');
        }}
      >
        <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
        <ThemedText style={styles.saveButtonText}>Save Reflection</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const [hours, setHours] = useState(new Date().getHours());

  useEffect(() => {
    // Update hours every minute to ensure correct greeting/content even if app stays open
    const interval = setInterval(() => {
      setHours(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const isEvening = hours >= 18;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <ThemedText type="title" style={styles.header}>{getGreeting()}, username</ThemedText>
        {isEvening ? (
          <>
            <ReflectionPrompt />
            <GratitudePrompt />
          </>
        ) : (
          <QuoteOfTheDay />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  quoteContainer: {
    marginTop: 12,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  quoteTitle: {
    marginBottom: 8,
    fontSize: 18,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    textAlign: 'right',
    marginTop: 8,
    opacity: 0.6,
  },
  input: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff', // Assuming dark theme dominance or handled via themed view effectively
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  gratitudeList: {
    gap: 8,
    marginVertical: 12,
  },
  gratitudeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gratitudeContent: {
    flex: 1,
    marginRight: 8,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    padding: 4,
    fontSize: 14, // Match default text size roughly
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 4,
  }
});

import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { saveReflection } from '@/services/database';

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

function ReflectionPrompt() {
  const [reflection, setReflection] = useState(REFLECTIONS[0]);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    setReflection(REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)]);
  }, []);

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
          setAnswer('');
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
        {isEvening ? <ReflectionPrompt /> : <QuoteOfTheDay />}
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
});

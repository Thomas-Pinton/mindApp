import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, LayoutAnimation, Platform, ScrollView, TextInput, TouchableOpacity, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSnackbar } from '@/context/SnackbarContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createStyles } from './index.styles';

import { deleteGratitude, getDailyPrompt, getDailyQuote, getTodayGratitudes, getTodayReflection, isQuoteSaved, removeSavedQuote, saveGratitude, saveQuote, saveReflection, updateGratitude } from '@/services/database';

function useThemeStyles() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colorScheme, colors), [colorScheme, colors]);
  return { styles, colors, colorScheme };
}

function QuoteOfTheDay() {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isSaved, setIsSaved] = useState(false);
  const { styles, colors } = useThemeStyles();

  useEffect(() => {
    async function loadQuote() {
      const dailyQuote = await getDailyQuote();
      setQuote(dailyQuote);
      if (dailyQuote.text) {
        const saved = await isQuoteSaved(dailyQuote.text, dailyQuote.author);
        setIsSaved(saved);
      }
    }
    loadQuote();
  }, []);

  const { showSnackbar } = useSnackbar();

  const handleSaveQuote = async () => {
    if (isSaved) {
      await removeSavedQuote(quote.text, quote.author);
      setIsSaved(false);
    } else {
      await saveQuote(quote.text, quote.author);
      setIsSaved(true);
    }
  };

  return (
    <ThemedView style={styles.quoteContainer}>
      <ThemedText type="subtitle" style={styles.quoteTitle}>Quote of the Day</ThemedText>
      <ThemedText style={styles.quoteText}>"{quote.text}"</ThemedText>
      <ThemedText style={styles.quoteAuthor}>- {quote.author}</ThemedText>
      <TouchableOpacity style={styles.saveQuoteButton} onPress={handleSaveQuote}>
        <IconSymbol
          name={isSaved ? "bookmark.fill" : "bookmark"}
          size={24}
          color={isSaved ? colors.savedIcon : colors.iconSecondary}
        />
      </TouchableOpacity>
    </ThemedView>
  );
}

function MorningRoutine() {
  const [routineItems, setRoutineItems] = useState([
    { id: 1, label: "Make bed", checked: false },
    { id: 2, label: "Drink water", checked: false },
    { id: 3, label: "Stretch", checked: false },
    { id: 4, label: "Read 10 mins", checked: false },
  ]);
  const { styles, colors } = useThemeStyles();

  const toggleItem = (id: number) => {
    setRoutineItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <ThemedView style={styles.routineContainer}>
      <ThemedText type="subtitle" style={styles.routineTitle}>Morning Routine</ThemedText>
      {routineItems.map(item => (
        <TouchableOpacity key={item.id} style={styles.routineItem} onPress={() => toggleItem(item.id)}>
          <IconSymbol
            name={item.checked ? "checkmark.circle.fill" : "circle"}
            size={24}
            color={item.checked ? colors.primaryButton : colors.iconTertiary}
          />
          <ThemedText style={[styles.routineText, item.checked && styles.routineTextDone]}>{item.label}</ThemedText>
        </TouchableOpacity>
      ))}
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface GratitudePromptProps {
  onFocus?: () => void;
  onAdd?: () => void;
}

function GratitudePrompt({ onFocus, onAdd }: GratitudePromptProps) {
  const [gratitudes, setGratitudes] = useState<{ id: number, content: string }[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const { showSnackbar, hideSnackbar } = useSnackbar();
  const { styles, colors } = useThemeStyles();

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await loadGratitudes();
    // Scroll to bottom after adding
    if (onAdd) {
      setTimeout(onAdd, 100);
    }
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

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const confirmDelete = async (id: number) => {
    // Delete from DB
    await deleteGratitude(id);

    // Update local state without re-fetching
    // We don't need to animate here because it's already hidden via pendingDeleteId
    // But we need to remove it from the list so when we clear pendingDeleteId it doesn't reappear
    setGratitudes(current => current.filter(item => item.id !== id));
    setPendingDeleteId(null);
  };

  const handleDelete = (id: number) => {
    if (pendingDeleteId && pendingDeleteId !== id) {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      confirmDelete(pendingDeleteId);
    }

    const item = gratitudes.find(g => g.id === id);
    const message = item ? `Gratitude "${item.content}" deleted` : 'Gratitude deleted';

    // Animate the disappearance
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPendingDeleteId(id);

    showSnackbar(message, undoDelete);

    deleteTimerRef.current = setTimeout(() => {
      confirmDelete(id);
    }, 3000);
  };

  const undoDelete = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    // Animate the reappearance
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPendingDeleteId(null);
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
        {gratitudes.filter(item => item.id !== pendingDeleteId).map((item) => (
          <ThemedView key={item.id} style={styles.gratitudeItemRow}>
            {editingId === item.id ? (
              <ThemedView style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editContent}
                  onChangeText={setEditContent}
                  autoFocus
                  placeholderTextColor={colors.textTertiary}
                />
                <TouchableOpacity onPress={() => handleUpdate(item.id)}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.successIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <IconSymbol name="trash.fill" size={24} color={colors.deleteIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.cancelIcon} />
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.gratitudeContent}
                  onPress={() => startEditing(item)}>
                  <ThemedText style={styles.gratitudeText}>• {item.content}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <IconSymbol name="trash.fill" size={20} color={colors.deleteIcon} />
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
          placeholderTextColor={colors.textTertiary}
          value={newGratitude}
          onChangeText={setNewGratitude}
          multiline
          blurOnSubmit={false}
          submitBehavior="submit"
          onSubmitEditing={handleSave}
          returnKeyType="send"
          onFocus={onFocus}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSave}
        >
          <IconSymbol name="arrow.up" size={20} color="#fff" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

function ReflectionPrompt() {
  const [reflection, setReflection] = useState(REFLECTIONS[0]);
  const [answer, setAnswer] = useState('');
  const { showSnackbar } = useSnackbar();
  const { styles, colors } = useThemeStyles();

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
        placeholderTextColor={colors.textTertiary}
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
          showSnackbar('Reflection saved');
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
  const scrollRef = useRef<ScrollView>(null);
  const { styles } = useThemeStyles();

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

  const handleInputFocus = () => {
    // Wait a bit for keyboard to start showing
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText type="title" style={styles.header}>{getGreeting()}, Thomas</ThemedText>
            {!isEvening ? (
              <>
                <ReflectionPrompt />
                <GratitudePrompt onFocus={handleInputFocus} onAdd={handleInputFocus} />
              </>
            ) : (
              <>
                <QuoteOfTheDay />
                <MorningRoutine />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

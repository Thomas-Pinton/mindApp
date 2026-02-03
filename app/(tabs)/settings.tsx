import { StyleSheet, Switch } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
    const {
        showDailyQuote,
        setShowDailyQuote,
        showMorningRoutine,
        setShowMorningRoutine,
        showEveningReflection,
        setShowEveningReflection,
        showDailyGratitude,
        setShowDailyGratitude,
    } = useSettings();
    const colorScheme = useColorScheme() ?? 'light';
    const activeThumbColor = '#fff';
    const activeTrackColor = Colors[colorScheme].primaryButton;
    const trackColor = { false: '#767577', true: activeTrackColor };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="gearshape.fill"
                    style={styles.headerImage}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Settings</ThemedText>
            </ThemedView>
            <ThemedView style={styles.contentContainer}>
                <ThemedView style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Morning</ThemedText>

                    <ThemedView style={styles.row}>
                        <ThemedText style={styles.label}>Daily Quote</ThemedText>
                        <Switch
                            trackColor={trackColor}
                            thumbColor={activeThumbColor}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setShowDailyQuote}
                            value={showDailyQuote}
                        />
                    </ThemedView>

                    <ThemedView style={styles.row}>
                        <ThemedText style={styles.label}>Morning Routine</ThemedText>
                        <Switch
                            trackColor={trackColor}
                            thumbColor={activeThumbColor}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setShowMorningRoutine}
                            value={showMorningRoutine}
                        />
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Evening</ThemedText>

                    <ThemedView style={styles.row}>
                        <ThemedText style={styles.label}>Evening Reflection</ThemedText>
                        <Switch
                            trackColor={trackColor}
                            thumbColor={activeThumbColor}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setShowEveningReflection}
                            value={showEveningReflection}
                        />
                    </ThemedView>

                    <ThemedView style={styles.row}>
                        <ThemedText style={styles.label}>Daily Gratitude</ThemedText>
                        <Switch
                            trackColor={trackColor}
                            thumbColor={activeThumbColor}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setShowDailyGratitude}
                            value={showDailyGratitude}
                        />
                    </ThemedView>
                </ThemedView>
            </ThemedView>
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
        paddingBottom: 16,
    },
    contentContainer: {
        padding: 4,
        gap: 24,
    },
    section: {
        gap: 0,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 0,
    },
    label: {
        fontSize: 16,
    },
});

import { getAllSettings, saveSetting } from '@/services/database';
import React, { createContext, useContext, useEffect, useState } from 'react';

type SettingsContextType = {
    showDailyQuote: boolean;
    setShowDailyQuote: (value: boolean) => void;
    showMorningRoutine: boolean;
    setShowMorningRoutine: (value: boolean) => void;
    showEveningReflection: boolean;
    setShowEveningReflection: (value: boolean) => void;
    showDailyGratitude: boolean;
    setShowDailyGratitude: (value: boolean) => void;
    isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [showDailyQuote, setShowDailyQuoteState] = useState(true);
    const [showMorningRoutine, setShowMorningRoutineState] = useState(true);
    const [showEveningReflection, setShowEveningReflectionState] = useState(true);
    const [showDailyGratitude, setShowDailyGratitudeState] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await getAllSettings();
            setShowDailyQuoteState(settings.setting_dailyQuote);
            setShowMorningRoutineState(settings.setting_morningRoutine);
            setShowEveningReflectionState(settings.setting_eveningReflection);
            setShowDailyGratitudeState(settings.setting_dailyGratitude);
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = async (key: string, value: boolean, setter: (v: boolean) => void) => {
        setter(value);
        try {
            await saveSetting(key, value);
        } catch (e) {
            console.error(`Failed to save setting ${key}`, e);
        }
    };

    const setShowDailyQuote = (value: boolean) => {
        updateSetting('setting_dailyQuote', value, setShowDailyQuoteState);
    };

    const setShowMorningRoutine = (value: boolean) => {
        updateSetting('setting_morningRoutine', value, setShowMorningRoutineState);
    };

    const setShowEveningReflection = (value: boolean) => {
        updateSetting('setting_eveningReflection', value, setShowEveningReflectionState);
    };

    const setShowDailyGratitude = (value: boolean) => {
        updateSetting('setting_dailyGratitude', value, setShowDailyGratitudeState);
    };

    return (
        <SettingsContext.Provider
            value={{
                showDailyQuote,
                setShowDailyQuote,
                showMorningRoutine,
                setShowMorningRoutine,
                showEveningReflection,
                setShowEveningReflection,
                showDailyGratitude,
                setShowDailyGratitude,
                isLoading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

import { ColorPalette } from '@/constants/theme';
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
    primaryColorIndex: number;
    setPrimaryColorIndex: (index: number) => void;
    primaryColor: string;
    isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [showDailyQuote, setShowDailyQuoteState] = useState(true);
    const [showMorningRoutine, setShowMorningRoutineState] = useState(true);
    const [showEveningReflection, setShowEveningReflectionState] = useState(true);
    const [showDailyGratitude, setShowDailyGratitudeState] = useState(true);
    const [primaryColorIndex, setPrimaryColorIndexState] = useState(0);
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
            setPrimaryColorIndexState(settings.setting_primaryColorIndex ?? 0);
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = async (key: string, value: boolean | number, setter: (v: any) => void) => {
        setter(value);
        try {
            // @ts-ignore - saveSetting expects boolean, but we need to support numbers too now.
            // We should update saveSetting signature too, but for now we can rely on how it's implemented or update it.
            // Actually, looking at saveSetting, it does `value ? 1 : 0`. That won't work for index > 1.
            // I need to update saveSetting in database.ts as well to handle numbers correctly.
            await saveSetting(key, value as any);
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

    const setPrimaryColorIndex = (index: number) => {
        updateSetting('setting_primaryColorIndex', index, setPrimaryColorIndexState);
    };

    const primaryColor = ColorPalette[primaryColorIndex] || ColorPalette[0];

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
                primaryColorIndex,
                setPrimaryColorIndex,
                primaryColor,
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

import { TextToSpeech } from '@capacitor-community/text-to-speech';

import { hasNativePlugin } from './capacitor';

const defaultLang = 'es-ES';

export function isSpeechSupported(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return hasNativePlugin('TextToSpeech') || 'speechSynthesis' in window;
}

export async function stopSpeaking(): Promise<void> {
    if (!isSpeechSupported()) {
        return;
    }

    try {
        await TextToSpeech.stop();
    } catch {
        // Nothing playing or the engine was already stopped.
    }
}

export async function speakText(
    text: string,
    lang: string = defaultLang,
): Promise<void> {
    if (!isSpeechSupported() || text.trim() === '') {
        return;
    }

    await stopSpeaking();

    await TextToSpeech.speak({
        text,
        lang,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
    });
}

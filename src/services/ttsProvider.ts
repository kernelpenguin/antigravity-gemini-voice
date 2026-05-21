import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export interface ITtsProvider {
    synthesizeSpeech(text: string): Promise<Uint8Array>;
}

export class GcpTtsProvider implements ITtsProvider {
    private client: TextToSpeechClient;

    constructor() {
        this.client = new TextToSpeechClient();
    }

    async synthesizeSpeech(text: string): Promise<Uint8Array> {
        const request = {
            input: { text },
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' },
            audioConfig: { audioEncoding: 'MP3' as const, speakingRate: 1.1 },
        };

        const [response] = await this.client.synthesizeSpeech(request);
        
        if (!response.audioContent) {
            throw new Error("Resposta da API de TTS não contém conteúdo de áudio.");
        }

        return response.audioContent as Uint8Array;
    }
}

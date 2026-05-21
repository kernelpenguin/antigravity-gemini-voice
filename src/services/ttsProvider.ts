import { TextToSpeechClient } from '@google-cloud/text-to-speech';

/**
 * Interface que abstrai o provedor de Text-to-Speech.
 * Garante o princípio de Inversão de Dependência (SOLID).
 */
export interface ITtsProvider {
    /**
     * Sintetiza uma string de texto em um buffer de áudio.
     * @param text O texto a ser sintetizado.
     * @returns Um buffer (Uint8Array) contendo o áudio codificado (ex: MP3).
     * @throws Error caso a API falhe ou a resposta não contenha áudio.
     */
    synthesizeSpeech(text: string): Promise<Uint8Array>;
}

/**
 * Implementação do provedor de TTS utilizando a infraestrutura do Google Cloud.
 */
export class GcpTtsProvider implements ITtsProvider {
    private client: TextToSpeechClient;

    constructor() {
        this.client = new TextToSpeechClient();
    }

    async synthesizeSpeech(text: string): Promise<Uint8Array> {
        // Configuração de requisição otimizada para latência e naturalidade (Neural2)
        const request = {
            input: { text },
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' },
            audioConfig: { audioEncoding: 'MP3' as const, speakingRate: 1.1 },
        };

        // Chamada assíncrona para a API REST/gRPC do Google
        const [response] = await this.client.synthesizeSpeech(request);
        
        if (!response.audioContent) {
            throw new Error("Resposta da API de TTS não contém conteúdo de áudio.");
        }

        return response.audioContent as Uint8Array;
    }
}

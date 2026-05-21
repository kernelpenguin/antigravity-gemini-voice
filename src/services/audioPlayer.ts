import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';

/**
 * Interface que abstrai a camada de hardware (Sistema Operacional) para reprodução de áudio.
 */
export interface IAudioPlayer {
    /**
     * Reproduz os dados de áudio binários.
     * @param audioData Array de bytes representando o arquivo de áudio.
     * @returns Uma Promise que é resolvida quando o áudio finaliza a reprodução.
     */
    play(audioData: Uint8Array): Promise<void>;
}

/**
 * Implementação cruzada (cross-platform) baseada em drivers do sistema (ALSA/PulseAudio/afplay).
 */
export class SystemAudioPlayer implements IAudioPlayer {
    // Instancia o player desativando logs verbosos desnecessários
    private player = require('play-sound')({});
    
    // Promisificação nativa para garantir a performance do Event Loop do Node.js
    private writeFileAsync = util.promisify(fs.writeFile);
    private unlinkAsync = util.promisify(fs.unlink);

    async play(audioData: Uint8Array): Promise<void> {
        // Aloca arquivo temporário com carimbo de tempo para evitar colisões de estado
        const tempFilePath = path.join(os.tmpdir(), `ag_tts_${Date.now()}.mp3`);
        
        // I/O não bloqueante: grava o arquivo em disco sem paralisar a thread principal do VS Code
        await this.writeFileAsync(tempFilePath, audioData, 'binary');
        
        return new Promise<void>((resolve, reject) => {
            // Delega a execução para o processo filho do SO (spawn)
            this.player.play(tempFilePath, async (err: Error | null) => {
                // Bloco finally simulado: assegura limpeza do disco para evitar memory/disk leaks (Clean Code)
                try {
                    await this.unlinkAsync(tempFilePath);
                } catch (cleanupErr) {
                    console.error("Falha ao limpar arquivo temporário:", cleanupErr);
                }

                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

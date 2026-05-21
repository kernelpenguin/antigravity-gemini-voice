import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';

export interface IAudioPlayer {
    play(audioData: Uint8Array): Promise<void>;
}

export class SystemAudioPlayer implements IAudioPlayer {
    private player = require('play-sound')({});
    private writeFileAsync = util.promisify(fs.writeFile);
    private unlinkAsync = util.promisify(fs.unlink);

    async play(audioData: Uint8Array): Promise<void> {
        const tempFilePath = path.join(os.tmpdir(), `ag_tts_${Date.now()}.mp3`);
        
        // I/O Assíncrono para não bloquear o Event Loop (O(N) em espaço de buffer, mas ótimo tempo/bloqueio)
        await this.writeFileAsync(tempFilePath, audioData, 'binary');
        
        return new Promise<void>((resolve, reject) => {
            this.player.play(tempFilePath, async (err: Error | null) => {
                // Ensure cleanup always happens (Clean Code / Resource Management)
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

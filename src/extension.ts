import * as vscode from 'vscode';
import textToSpeech from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';

// Configuração do reprodutor de áudio cross-platform (ALSA/PulseAudio no Linux)
const player = require('play-sound')({});

// Instanciação do cliente GCP. Requer a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS.
const ttsClient = new textToSpeech.TextToSpeechClient();

export function activate(context: vscode.ExtensionContext) {
    console.log('Extensão Anti-Gravity Gemini Voice ativada.');

    let disposable = vscode.commands.registerCommand('antigravity.readSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('Nenhum editor ativo detectado no Anti-Gravity.');
            return;
        }

        const selection = editor.selection;
        const textToRead = editor.document.getText(selection);

        if (!textToRead || textToRead.trim() === '') {
            vscode.window.showInformationMessage('Por favor, selecione o texto ou a resposta do agente para leitura.');
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Sintetizando resposta...",
            cancellable: false
        }, async (progress) => {
            try {
                await synthesizeAndPlay(textToRead);
            } catch (error) {
                vscode.window.showErrorMessage(`Falha na execução do TTS: ${error}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

/**
 * Função responsável por requisitar a síntese de voz e reproduzir o buffer.
 * Utiliza o modelo Neural2 otimizado para latência e naturalidade.
 */
async function synthesizeAndPlay(text: string): Promise<void> {
    const request = {
        input: { text: text },
        // Seleção de voz baseada no padrão de alta qualidade do GCP
        voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' },
        audioConfig: { audioEncoding: 'MP3' as const, speakingRate: 1.1 },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    
    // Alocação em diretório temporário mitigando problemas de I/O em workspaces restritos
    const tempFilePath = path.join(os.tmpdir(), `ag_tts_${Date.now()}.mp3`);
    const writeFileAsync = util.promisify(fs.writeFile);
    
    await writeFileAsync(tempFilePath, response.audioContent as Uint8Array, 'binary');
    
    return new Promise<void>((resolve, reject) => {
        player.play(tempFilePath, (err: Error | null) => {
            if (err) {
                reject(err);
            } else {
                // Limpeza do arquivo temporário após reprodução
                fs.unlink(tempFilePath, () => {});
                resolve();
            }
        });
    });
}

export function deactivate() {}

import * as vscode from 'vscode';
import { ITtsProvider } from '../services/ttsProvider';
import { IAudioPlayer } from '../services/audioPlayer';

export class ReadSelectionCommand {
    constructor(
        private ttsProvider: ITtsProvider,
        private audioPlayer: IAudioPlayer
    ) {}

    async execute(editor: vscode.TextEditor | undefined): Promise<void> {
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

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Sintetizando resposta...",
            cancellable: false
        }, async () => {
            try {
                const audioData = await this.ttsProvider.synthesizeSpeech(textToRead);
                await this.audioPlayer.play(audioData);
            } catch (error) {
                vscode.window.showErrorMessage(`Falha na execução do TTS: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
}

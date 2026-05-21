import * as vscode from 'vscode';
import { GcpTtsProvider } from './services/ttsProvider';
import { SystemAudioPlayer } from './services/audioPlayer';
import { ReadSelectionCommand } from './commands/readSelection';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extensão Anti-Gravity Gemini Voice ativada.');

    // Injeção de Dependências (Composition Root - Clean Architecture)
    const ttsProvider = new GcpTtsProvider();
    const audioPlayer = new SystemAudioPlayer();
    const readSelectionCommand = new ReadSelectionCommand(ttsProvider, audioPlayer);

    const disposable = vscode.commands.registerCommand('antigravity.readSelection', async () => {
        await readSelectionCommand.execute(vscode.window.activeTextEditor);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

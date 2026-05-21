import * as vscode from 'vscode';
import { ITtsProvider } from '../services/ttsProvider';
import { IAudioPlayer } from '../services/audioPlayer';

/**
 * Caso de Uso (Use Case): Capturar texto selecionado e transformá-lo em fala.
 * Atua como o orquestrador das regras de negócio do domínio.
 */
export class ReadSelectionCommand {
    /**
     * Injeção das dependências via construtor (Inversão de Controle).
     */
    constructor(
        private ttsProvider: ITtsProvider,
        private audioPlayer: IAudioPlayer
    ) {}

    /**
     * Executa a orquestração de validações e chamadas.
     * @param editor Referência opcional para o editor de texto ativo.
     */
    async execute(editor: vscode.TextEditor | undefined): Promise<void> {
        // Regra 1: Aborta execução rápida se o contexto for inválido (Fail-fast)
        if (!editor) {
            vscode.window.showErrorMessage('Nenhum editor ativo detectado no Anti-Gravity.');
            return;
        }

        const selection = editor.selection;
        const textToRead = editor.document.getText(selection);

        // Regra 2: Economiza recursos não enviando requisições vazias para a API
        if (!textToRead || textToRead.trim() === '') {
            vscode.window.showInformationMessage('Por favor, selecione o texto ou a resposta do agente para leitura.');
            return;
        }

        // Interação com a UI não bloqueante: Notificação com spinner de carregamento
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Sintetizando resposta...",
            cancellable: false
        }, async () => {
            try {
                // Passo A: Consumo de CPU/Rede terceirizado via API externa (Alta performance local)
                const audioData = await this.ttsProvider.synthesizeSpeech(textToRead);
                
                // Passo B: Execução paralela delegada ao SO via processo filho (Alta performance local)
                await this.audioPlayer.play(audioData);
            } catch (error) {
                // Regra 3: Tratamento de erro elegante, impedindo o crash da extensão principal
                vscode.window.showErrorMessage(`Falha na execução do TTS: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
}

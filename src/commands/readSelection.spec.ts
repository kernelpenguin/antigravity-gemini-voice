import * as vscode from 'vscode';
import { ReadSelectionCommand } from '../../src/commands/readSelection';
import { ITtsProvider } from '../../src/services/ttsProvider';
import { IAudioPlayer } from '../../src/services/audioPlayer';

describe('ReadSelectionCommand', () => {
    let mockTtsProvider: jest.Mocked<ITtsProvider>;
    let mockAudioPlayer: jest.Mocked<IAudioPlayer>;
    let command: ReadSelectionCommand;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockTtsProvider = {
            synthesizeSpeech: jest.fn()
        };

        mockAudioPlayer = {
            play: jest.fn()
        };

        command = new ReadSelectionCommand(mockTtsProvider, mockAudioPlayer);
    });

    it('Deve abortar a execução e notificar erro caso não haja editor ativo', async () => {
        await command.execute(undefined);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Nenhum editor ativo detectado no Anti-Gravity.');
        expect(mockTtsProvider.synthesizeSpeech).not.toHaveBeenCalled();
    });

    it('Deve abortar a execução e notificar caso a seleção de texto seja vazia', async () => {
        const mockEditor: any = {
            selection: {},
            document: {
                getText: jest.fn().mockReturnValue('   ') // Apenas espaços
            }
        };

        await command.execute(mockEditor);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Por favor, selecione o texto ou a resposta do agente para leitura.');
        expect(mockTtsProvider.synthesizeSpeech).not.toHaveBeenCalled();
    });

    it('Deve orquestrar a síntese e a reprodução com sucesso dado um texto válido', async () => {
        const fakeText = 'Texto de teste';
        const fakeBuffer = new Uint8Array([1, 2, 3]);

        const mockEditor: any = {
            selection: {},
            document: {
                getText: jest.fn().mockReturnValue(fakeText)
            }
        };

        mockTtsProvider.synthesizeSpeech.mockResolvedValue(fakeBuffer);
        mockAudioPlayer.play.mockResolvedValue(undefined);

        await command.execute(mockEditor);

        expect(mockTtsProvider.synthesizeSpeech).toHaveBeenCalledWith(fakeText);
        expect(mockAudioPlayer.play).toHaveBeenCalledWith(fakeBuffer);
        expect(vscode.window.showErrorMessage).not.toHaveBeenCalled();
    });

    it('Deve notificar erro caso a API de TTS falhe', async () => {
        const fakeText = 'Texto de falha';

        const mockEditor: any = {
            selection: {},
            document: {
                getText: jest.fn().mockReturnValue(fakeText)
            }
        };

        const apiError = new Error('Falha de rede (503)');
        mockTtsProvider.synthesizeSpeech.mockRejectedValue(apiError);

        await command.execute(mockEditor);

        expect(mockTtsProvider.synthesizeSpeech).toHaveBeenCalledWith(fakeText);
        expect(mockAudioPlayer.play).not.toHaveBeenCalled();
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Falha na execução do TTS: Falha de rede (503)');
    });
});

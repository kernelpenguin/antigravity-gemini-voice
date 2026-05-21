export const window = {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    withProgress: jest.fn().mockImplementation(async (options, task) => {
        return task(); // Executa a tarefa diretamente no teste sem progress UI
    }),
    activeTextEditor: undefined
};

export const ProgressLocation = {
    Notification: 15
};

export const commands = {
    registerCommand: jest.fn()
};

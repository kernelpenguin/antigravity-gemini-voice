"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.ProgressLocation = exports.window = void 0;
exports.window = {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    withProgress: jest.fn().mockImplementation(async (options, task) => {
        return task(); // Executa a tarefa diretamente no teste sem progress UI
    }),
    activeTextEditor: undefined
};
exports.ProgressLocation = {
    Notification: 15
};
exports.commands = {
    registerCommand: jest.fn()
};
//# sourceMappingURL=vscode.js.map
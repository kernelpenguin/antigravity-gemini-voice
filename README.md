# Anti-Gravity Gemini Voice Interface

[Português (BR)](#português-br) | [English](#english)

---

## Português (BR)

### Visão geral

A **Anti-Gravity Gemini Voice Interface** é uma Prova de Conceito (PoC) de extensão para VS Code voltada à síntese de voz (*Text-to-Speech*) com o Google Cloud TTS. O objetivo é demonstrar uma arquitetura limpa, testável e preparada para evoluir para cenários mais amplos de interação por voz.

### Funcionalidades

- Converte texto selecionado no editor em áudio.
- Integração com Google Cloud Text-to-Speech.
- Reprodução de áudio multiplataforma via `play-sound`.
- Estrutura orientada a **Clean Architecture** e injeção de dependências.
- Suíte de testes com Jest e abordagem de **strict TDD**.

### Arquitetura

O projeto segue os princípios de **Clean Architecture (Ports and Adapters)**, separando claramente domínio, aplicação e infraestrutura.

A documentação completa da arquitetura está disponível em:

- [`docs/architecture.md`](docs/architecture.md)

Resumo dos principais componentes:

- **Domínio / aplicação**: comando responsável por processar a seleção do editor.
- **Portas**: abstrações para síntese de voz e reprodução de áudio.
- **Infraestrutura**: implementações com Google Cloud TTS e player de áudio do sistema operacional.
- **Testes**: uso de mocks para isolar dependências externas.

### Estrutura do repositório

```text
.
├── src/
├── docs/
│   └── architecture.md
├── __mocks__/
├── LICENSE.md
├── README.md
├── package.json
└── tsconfig.json
```

### Requisitos

- Node.js compatível com a versão da extensão.
- VS Code `^1.90.0`.
- Credenciais válidas do Google Cloud configuradas localmente.

### Instalação

```bash
npm install
npm run compile
```

### Configuração do Google Cloud

Defina a variável de ambiente apontando para o arquivo JSON da service account:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
```

### Uso

1. Abra o projeto no VS Code.
2. Pressione `F5` para iniciar o **Extension Development Host**.
3. Selecione um texto no editor.
4. Abra a Command Palette.
5. Execute o comando:

```text
Gemini TTS: Sintetizar Texto Selecionado
```

### Testes

```bash
npm test
```

### Licença

Este projeto está licenciado sob a [MIT License](LICENSE.md).

---

## English

### Overview

**Anti-Gravity Gemini Voice Interface** is a VS Code extension PoC for text-to-speech using Google Cloud TTS. It is designed to demonstrate a clean, testable architecture with a path toward broader voice-driven interaction scenarios.

### Features

- Converts selected editor text into audio.
- Google Cloud Text-to-Speech integration.
- Cross-platform audio playback via `play-sound`.
- Built with **Clean Architecture** and dependency injection.
- Jest test suite with a **strict TDD** approach.

### Architecture

The project follows **Clean Architecture (Ports and Adapters)**, clearly separating domain, application, and infrastructure concerns.

Full architecture documentation is available at:

- [`docs/architecture.md`](docs/architecture.md)

Main components:

- **Domain / application**: command responsible for processing the editor selection.
- **Ports**: abstractions for speech synthesis and audio playback.
- **Infrastructure**: Google Cloud TTS and operating-system audio player implementations.
- **Tests**: mocks used to isolate external dependencies.

### Repository structure

```text
.
├── src/
├── docs/
│   └── architecture.md
├── __mocks__/
├── LICENSE.md
├── README.md
├── package.json
└── tsconfig.json
```

### Requirements

- Node.js compatible with the extension target.
- VS Code `^1.90.0`.
- Valid Google Cloud credentials configured locally.

### Installation

```bash
npm install
npm run compile
```

### Google Cloud setup

Set the environment variable to your service account JSON file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### Usage

1. Open the project in VS Code.
2. Press `F5` to launch the **Extension Development Host**.
3. Select text in the editor.
4. Open the Command Palette.
5. Run:

```text
Gemini TTS: Sintetizar Texto Selecionado
```

### Tests

```bash
npm test
```

### License

This project is licensed under the [MIT License](LICENSE.md).

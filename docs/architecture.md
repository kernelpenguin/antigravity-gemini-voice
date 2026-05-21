[English](#english) | [Português (BR)](#português-br)

---

# Anti-Gravity Gemini Voice Interface / Interface de Voz Gemini Anti-Gravity

## Português (BR)

### 1. Visão Geral

Este documento descreve a arquitetura da extensão **Anti-Gravity Gemini Voice Interface**. A solução transforma texto selecionado em áudio por meio da integração com **Google Cloud Text-to-Speech** e reproduz o resultado no sistema operacional, dentro do ambiente do **VS Code**.

A implementação segue uma abordagem inspirada em **Clean Architecture**, com o caso de uso central isolado de detalhes de infraestrutura, como a API do Google e o mecanismo de reprodução de áudio.

### 2. Princípios de Arquitetura

A organização do código segue estes princípios:

- **Separação de responsabilidades**: o comando orquestra o fluxo; os serviços cuidam de síntese e reprodução.
- **Dependência de abstrações**: `ReadSelectionCommand` depende de interfaces (`ITtsProvider` e `IAudioPlayer`), não de implementações concretas.
- **Infraestrutura isolada**: a integração com o Google Cloud TTS e a reprodução via sistema operacional ficam concentradas em adaptadores.
- **Testabilidade**: o caso de uso permite testes unitários com mocks, sem chamadas reais à API externa nem execução de áudio no ambiente local.

### 3. Diagrama de Casos de Uso

```mermaid
usecaseDiagram
    actor Usuário as "Usuário / User"
    
    package "Anti-Gravity Gemini Voice Interface" {
        usecase UC1 as "Acionar Leitura de Seleção / Trigger Selection Reading"
        usecase UC2 as "Notificar Erro / Notify Error"
        usecase UC3 as "Sintetizar Áudio / Synthesize Audio"
        usecase UC4 as "Reproduzir Áudio / Play Audio"
    }
    
    actor GCP as "Google Cloud TTS"
    actor SO as "Sistema Operacional / Operating System"

    Usuário --> UC1
    UC1 ..> UC2 : <<extend>>
    UC1 ..> UC3 : <<include>>
    UC3 --> GCP
    UC3 ..> UC4 : <<include>>
    UC4 --> SO
```

### 4. Diagrama de Classes

```mermaid
classDiagram
    class ReadSelectionCommand {
        -ITtsProvider ttsProvider
        -IAudioPlayer audioPlayer
        +execute(editor: TextEditor | undefined) Promise~void~
    }

    class ITtsProvider {
        <<interface>>
        +synthesizeSpeech(text: String) Promise~Uint8Array~
    }

    class IAudioPlayer {
        <<interface>>
        +play(audioData: Uint8Array) Promise~void~
    }

    class GcpTtsProvider {
        -TextToSpeechClient client
        +synthesizeSpeech(text: String) Promise~Uint8Array~
    }

    class SystemAudioPlayer {
        -player
        +play(audioData: Uint8Array) Promise~void~
    }

    ReadSelectionCommand --> ITtsProvider
    ReadSelectionCommand --> IAudioPlayer
    ITtsProvider <|-- GcpTtsProvider
    IAudioPlayer <|-- SystemAudioPlayer
```

### 5. Fluxo de Execução

```mermaid
sequenceDiagram
    actor User as Usuário / User
    participant VSCode as VS Code API
    participant Command as ReadSelectionCommand
    participant TTS as ITtsProvider
    participant Audio as IAudioPlayer
    
    User->>VSCode: Executa 'antigravity.readSelection' / Runs 'antigravity.readSelection'
    VSCode->>Command: execute(activeTextEditor)
    
    alt Editor inexistente / No active editor
        Command->>VSCode: showErrorMessage("Nenhum editor ativo detectado no Anti-Gravity.")
        Command-->>User: Aborta execução / Abort execution
    else Seleção vazia / Empty selection
        Command->>VSCode: showInformationMessage("Por favor, selecione o texto ou a resposta do agente para leitura.")
        Command-->>User: Aborta execução / Abort execution
    else Seleção válida / Valid selection
        Command->>VSCode: withProgress(Notification)
        Command->>TTS: synthesizeSpeech(text)
        TTS-->>Command: Promise<Uint8Array>
        
        alt Falha na síntese / Synthesis failure
            Command->>VSCode: showErrorMessage("Falha na execução do TTS: ...")
        else Áudio sintetizado com sucesso / Audio synthesized successfully
            Command->>Audio: play(Uint8Array)
            note over Audio: Grava arquivo temporário em disco / Writes temporary file to disk
            Audio->>SO: Reproduz arquivo .mp3 / Plays .mp3 file
            SO-->>Audio: Retorno do processo / Process return
            note over Audio: Remove arquivo temporário / Deletes temporary file
            Audio-->>Command: Promise<void>
        end
    end
```

### 6. Estratégia de Testes

Os testes validam o comportamento do caso de uso `ReadSelectionCommand`, isolando as dependências de infraestrutura por meio de mocks.

- **Cobertura**: cenários de sucesso, ausência de editor ativo, seleção vazia e falhas na síntese de áudio.
- **Objetivo**: garantir comportamento previsível sem depender da API do Google Cloud nem da reprodução real de áudio.
- **Ferramenta**: Jest.

### 7. Organização do repositório

```text
.
├── src/
│   ├── commands/
│   │   └── readSelection.ts
│   ├── services/
│   │   ├── audioPlayer.ts
│   │   └── ttsProvider.ts
│   └── extension.ts
├── docs/
│   └── architecture.md
├── __mocks__/
├── package.json
└── tsconfig.json
```

### 8. Licença

Este projeto está licenciado sob a MIT License. Consulte [`LICENSE.md`](../LICENSE.md) no repositório raiz.

## English

### 1. Overview

This document describes the architecture of the **Anti-Gravity Gemini Voice Interface** extension. The solution turns selected text into audio through **Google Cloud Text-to-Speech** integration and plays the result through the operating system inside the **VS Code** environment.

The implementation follows an approach inspired by **Clean Architecture**, with the central use case isolated from infrastructure details such as the Google API and the audio playback mechanism.

### 2. Architecture Principles

The code organization follows these principles:

- **Separation of concerns**: the command orchestrates the flow; services handle synthesis and playback.
- **Dependency on abstractions**: `ReadSelectionCommand` depends on interfaces (`ITtsProvider` and `IAudioPlayer`), not on concrete implementations.
- **Isolated infrastructure**: integration with Google Cloud TTS and operating-system playback is concentrated in adapters.
- **Testability**: the use case enables unit tests with mocks, without real external API calls or local audio playback.

### 3. Use Case Diagram

```mermaid
usecaseDiagram
    actor User as "User / Usuário"
    
    package "Anti-Gravity Gemini Voice Interface" {
        usecase UC1 as "Trigger Selection Reading / Acionar Leitura de Seleção"
        usecase UC2 as "Notify Error / Notificar Erro"
        usecase UC3 as "Synthesize Audio / Sintetizar Áudio"
        usecase UC4 as "Play Audio / Reproduzir Áudio"
    }
    
    actor GCP as "Google Cloud TTS"
    actor OS as "Operating System / Sistema Operacional"

    User --> UC1
    UC1 ..> UC2 : <<extend>>
    UC1 ..> UC3 : <<include>>
    UC3 --> GCP
    UC3 ..> UC4 : <<include>>
    UC4 --> OS
```

### 4. Class Diagram

```mermaid
classDiagram
    class ReadSelectionCommand {
        -ITtsProvider ttsProvider
        -IAudioPlayer audioPlayer
        +execute(editor: TextEditor | undefined) Promise~void~
    }

    class ITtsProvider {
        <<interface>>
        +synthesizeSpeech(text: String) Promise~Uint8Array~
    }

    class IAudioPlayer {
        <<interface>>
        +play(audioData: Uint8Array) Promise~void~
    }

    class GcpTtsProvider {
        -TextToSpeechClient client
        +synthesizeSpeech(text: String) Promise~Uint8Array~
    }

    class SystemAudioPlayer {
        -player
        +play(audioData: Uint8Array) Promise~void~
    }

    ReadSelectionCommand --> ITtsProvider
    ReadSelectionCommand --> IAudioPlayer
    ITtsProvider <|-- GcpTtsProvider
    IAudioPlayer <|-- SystemAudioPlayer
```

### 5. Execution Flow

```mermaid
sequenceDiagram
    actor User as User / Usuário
    participant VSCode as VS Code API
    participant Command as ReadSelectionCommand
    participant TTS as ITtsProvider
    participant Audio as IAudioPlayer
    
    User->>VSCode: Runs 'antigravity.readSelection' / Executa 'antigravity.readSelection'
    VSCode->>Command: execute(activeTextEditor)
    
    alt No active editor / Editor inexistente
        Command->>VSCode: showErrorMessage("Nenhum editor ativo detectado no Anti-Gravity.")
        Command-->>User: Abort execution / Aborta execução
    else Empty selection / Seleção vazia
        Command->>VSCode: showInformationMessage("Por favor, selecione o texto ou a resposta do agente para leitura.")
        Command-->>User: Abort execution / Aborta execução
    else Valid selection / Seleção válida
        Command->>VSCode: withProgress(Notification)
        Command->>TTS: synthesizeSpeech(text)
        TTS-->>Command: Promise<Uint8Array>
        
        alt Synthesis failure / Falha na síntese
            Command->>VSCode: showErrorMessage("Falha na execução do TTS: ...")
        else Audio synthesized successfully / Áudio sintetizado com sucesso
            Command->>Audio: play(Uint8Array)
            note over Audio: Writes temporary file to disk / Grava arquivo temporário em disco
            Audio->>OS: Plays .mp3 file / Reproduz arquivo .mp3
            OS-->>Audio: Process return / Retorno do processo
            note over Audio: Deletes temporary file / Remove arquivo temporário
            Audio-->>Command: Promise<void>
        end
    end
```

### 6. Testing Strategy

The tests validate the behavior of the `ReadSelectionCommand` use case, isolating infrastructure dependencies through mocks.

- **Coverage**: successful execution, no active editor, empty selection, and audio synthesis failures.
- **Goal**: ensure predictable behavior without depending on the Google Cloud API or real audio playback.
- **Tooling**: Jest.

### 7. Repository Structure

```text
.
├── src/
│   ├── commands/
│   │   └── readSelection.ts
│   ├── services/
│   │   ├── audioPlayer.ts
│   │   └── ttsProvider.ts
│   └── extension.ts
├── docs/
│   └── architecture.md
├── __mocks__/
├── package.json
└── tsconfig.json
```

### 8. License

This project is licensed under the MIT License. See [`LICENSE.md`](../LICENSE.md) in the repository root.

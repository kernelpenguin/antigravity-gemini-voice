# Anti-Gravity Gemini Voice Interface

## 1. Visão Geral

Este documento descreve a arquitetura da extensão Anti-Gravity Gemini Voice Interface. A solução converte texto selecionado em áudio via integração com Google Cloud TTS, operando dentro do Extension Host do VS Code. O projeto implementa os princípios de Clean Architecture (Ports and Adapters).

## 2. Princípios de Arquitetura

A organização do código segue os seguintes princípios:

- **Separação de responsabilidades**: comando, provedores e reprodução de áudio ficam em camadas distintas.
- **Dependência de abstrações**: o domínio depende de interfaces, não de implementações concretas.
- **Infraestrutura isolada**: integração com Google Cloud TTS e player do sistema operacional fica concentrada em adaptadores.
- **Testabilidade**: o uso de interfaces e mocks permite testes unitários sem acesso real a APIs externas.

## 3. Diagrama de Casos de Uso

```mermaid
usecaseDiagram
    actor Usuário as "Usuário (Dev)"
    
    package "Anti-Gravity Voice Extension" {
        usecase UC1 as "Acionar Leitura de Seleção"
        usecase UC2 as "Notificar Erro (Sem Seleção/Editor)"
        usecase UC3 as "Sintetizar Áudio"
        usecase UC4 as "Reproduzir Áudio"
    }
    
    actor GCP as "Google Cloud TTS (API)"
    actor SO as "Sistema Operacional (Áudio)"

    Usuário --> UC1
    UC1 ..> UC2 : <<extend>>
    UC1 ..> UC3 : <<include>>
    UC3 --> GCP
    UC3 ..> UC4 : <<include>>
    UC4 --> SO
```

## 4. Diagrama de Classes (UML)

```mermaid
classDiagram
    class ReadSelectionCommand {
        -ITtsProvider ttsProvider
        -IAudioPlayer audioPlayer
        +execute(editor: TextEditor) Promise~void~
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

## 5. Fluxo de Execução

```mermaid
sequenceDiagram
    actor User as Usuário
    participant VSCode as VS Code API
    participant Command as ReadSelectionCommand
    participant TTS as ITtsProvider (GCP)
    participant Audio as IAudioPlayer (SO)
    
    User->>VSCode: Executa 'antigravity.readSelection'
    VSCode->>Command: execute(activeEditor)
    
    alt Editor inválido ou seleção vazia
        Command->>VSCode: showErrorMessage / showInformationMessage
        Command-->>User: Aborta execução
    else Seleção válida
        Command->>VSCode: withProgress(Notification)
        Command->>TTS: synthesizeSpeech(text)
        TTS-->>Command: Promise<Uint8Array>
        
        alt Falha na API
            Command->>VSCode: showErrorMessage(erro)
        else Sucesso na API
            Command->>Audio: play(Uint8Array)
            note over Audio: Escreve arquivo temporário no disco
            Audio->>SO: Toca arquivo (.mp3)
            SO-->>Audio: Retorno do processo
            note over Audio: Exclui arquivo temporário do disco
            Audio-->>Command: Promise<void>
        end
    end
```

## 6. Estratégia de Testes

Os testes validam o comportamento do domínio (`ReadSelectionCommand`), isolando a infraestrutura por meio de mocks.

- **Cobertura**: cenários de sucesso, entrada inválida e falhas de API.
- **Objetivo**: garantir comportamento previsível sem depender de chamadas reais ao Google Cloud.
- **Ferramenta**: Jest.

## 7. Organização do repositório

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

## 8. Licença

Este projeto está licenciado sob a MIT License. Consulte [`LICENSE.md`](../LICENSE.md) no repositório raiz.

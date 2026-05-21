# Documentação Arquitetural: Anti-Gravity Gemini Voice Interface

## 1. Visão Geral

Este documento descreve a arquitetura da extensão Anti-Gravity Gemini Voice Interface. A solução converte texto selecionado em áudio via integração com Google Cloud TTS, operando dentro do Extension Host do VS Code. O projeto implementa os princípios de Clean Architecture (Ports and Adapters).

## 2. Diagrama de Casos de Uso

O diagrama abaixo mapeia as interações entre o Ator (Usuário do Editor) e o sistema.

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

## 3. Diagrama de Classes (UML)

A estrutura de classes demonstra a Inversão de Dependência. O domínio (`ReadSelectionCommand`) interage apenas com abstrações (`ITtsProvider` e `IAudioPlayer`).

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

## 4. Diagrama de Sequência

O fluxo de execução descreve o caminho dos dados desde o acionamento do comando até a limpeza de recursos.

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
            note over Audio: Escreve arquivo temp. no disco
            Audio->>SO: Toca arquivo (.mp3)
            SO-->>Audio: Retorno do processo
            note over Audio: Exclui arquivo temp. do disco
            Audio-->>Command: Promise<void>
        end
    end
```

## 5. Estratégia de Testes

Os testes validam o comportamento do domínio (`ReadSelectionCommand`), isolando a infraestrutura via *Mocks*. A suíte utiliza `Jest`.

* **Cobertura:** Casos de sucesso, tratamento de entradas inválidas (editor nulo, seleção vazia) e resiliência a falhas de API.
* **Complexidade:** Isolamento garante tempo de execução `O(1)` nas suítes e prevenção de requisições reais para APIs tarifadas.

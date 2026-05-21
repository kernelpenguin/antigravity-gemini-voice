# Anti-Gravity Gemini Voice Interface

Esta extensão para o Anti-Gravity (baseado no VS Code) implementa uma Prova de Conceito (PoC) para síntese de voz (Text-to-Speech) utilizando a API do Google Cloud, com o objetivo final de integrar o modelo Gemini (*Live Voice*).

## Funcionalidades
* **Síntese de Texto:** Converte textos selecionados no editor em áudio usando a voz neural `pt-BR-Neural2-B`.
* **Cross-platform:** Utiliza `play-sound` para reprodução, abstraindo as diferentes configurações de áudio (ALSA/PulseAudio no Linux, etc.).

## Segurança e Padrões Corporativos
O projeto foi estruturado seguindo rigorosas convenções de segurança e engenharia de software:
* Nenhuma credencial ou *secret* é embutida no código-fonte. Todas são importadas via variáveis de ambiente (`GOOGLE_APPLICATION_CREDENTIALS`).
* A tipagem estrita do TypeScript está ativada.
* Tratamento de erros assíncronos e limpeza adequada de arquivos de áudio temporários do disco.

## Instalação e Teste
1. Instale as dependências: `npm install`
2. Compile a extensão: `npm run compile`
3. Configure as credenciais do GCP:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
   ```
4. Pressione `F5` para iniciar o ambiente de *Extension Development Host*.
5. Selecione um texto, abra a Command Palette e digite `Gemini TTS: Sintetizar Texto Selecionado`.

# 🌸 Kawaii Stream Goal Widget

Um widget de meta de doação altamente personalizável estilo anime, com roleta de eventos, múltiplos mascotes e temas.

![Preview](https://via.placeholder.com/800x400?text=Kawaii+Widget+Preview)

## ✨ Funcionalidades

*   **3 Temas Visuais:** Kawaii (Rosa/Anime), Mario (Retro/Pixel), Neon (Cyberpunk).
*   **9 Mascotes Animados:** Gato Gamer, Shiba, Luma, Robô, Coelho, Fantasma, Slime, Axolote e Dragão.
*   **Metas Flexíveis:** Escolha entre uma meta única ou "Modo Escadinha" (Sub-goals).
*   **Roleta de Eventos (Gacha):** Sorteia automaticamente uma atividade (ex: "Karaokê", "Sorteio") quando uma meta é atingida.
*   **Efeitos:** Chuva de confete, partículas flutuantes e animações de "shake".

## 📦 Como Criar o Executável (.exe)

Para transformar este projeto em um programa de computador que você pode instalar e abrir sem o navegador:

1.  **Instale as dependências:**
    Abra o terminal na pasta do projeto e execute:
    ```bash
    npm install
    ```

2.  **Gere o Executável:**
    Execute o comando abaixo. Isso vai compilar o código React e depois empacotar com o Electron.
    ```bash
    npm run dist
    ```

3.  **Encontre o arquivo:**
    Após o término do processo, uma nova pasta chamada `dist-electron` será criada. Dentro dela, você encontrará o instalador (ex: `KawaiiWidget Setup 1.0.0.exe`).

## 🚀 Como Rodar em Modo de Desenvolvimento

1.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
2.  (Opcional) Em outro terminal, inicie a janela do Electron para testar como desktop:
    ```bash
    npm run electron
    ```

---

## 🎥 Como Adicionar ao OBS Studio

Você pode adicionar este widget de duas formas:

### Opção 1: Usando o Aplicativo (.exe)

1.  Abra o aplicativo **KawaiiWidget** que você gerou.
2.  No OBS, adicione uma fonte de **Captura de Janela**.
3.  Selecione a janela do KawaiiWidget.
4.  Segure `ALT` e arraste as bordas vermelhas no OBS para recortar apenas a parte do widget, escondendo o menu de configurações lateral.

### Opção 2: Fonte de Navegador (Sem instalar nada)

1.  Rode o projeto localmente com `npm run dev`.
2.  No OBS, adicione uma fonte de **Navegador**.
3.  URL: `http://localhost:5173` (ou a porta que aparecer no seu terminal).
4.  Width: `1920`, Height: `1080`.
5.  Use a opção "Interagir" do OBS para configurar suas metas.

---

## ⚙️ Configurando a Roleta e Metas

1.  No painel esquerdo (Settings Panel):
2.  Vá até a seção **Goal Logic**.
    *   Selecione **Sub-Goals (Escadinha)** se quiser que a roleta gire várias vezes a cada X valor (ex: a cada R$50).
3.  Vá até **Event Roulette**.
    *   Ative o checkbox.
    *   Escreva seus eventos na caixa de texto (um por linha).
4.  Sempre que a meta for atingida (simule clicando nos botões verdes de teste), a roleta irá girar!

## 🛠 Tecnologias

*   React + Vite
*   Electron
*   Tailwind CSS
*   Lucide React (Ícones)
# 🌸 Kawaii Stream Goal Widget

Um widget de meta de doação altamente personalizável estilo anime, com roleta de eventos, múltiplos mascotes e temas.

![Preview](https://via.placeholder.com/800x400?text=Kawaii+Widget+Preview)

## ✨ Funcionalidades

*   **3 Temas Visuais:** Kawaii (Rosa/Anime), Mario (Retro/Pixel), Neon (Cyberpunk).
*   **9 Mascotes Animados:** Gato Gamer, Shiba, Luma, Robô, Coelho, Fantasma, Slime, Axolote e Dragão.
*   **Metas Flexíveis:** Escolha entre uma meta única ou "Modo Escadinha" (Sub-goals).
*   **Roleta de Eventos (Gacha):** Sorteia automaticamente uma atividade (ex: "Karaokê", "Sorteio") quando uma meta é atingida.
*   **Efeitos:** Chuva de confete, partículas flutuantes e animações de "shake".

## 🚀 Como Rodar o Projeto

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

1.  Abra o terminal na pasta do projeto.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm start
    ```
4.  O projeto abrirá em seu navegador (geralmente em `http://localhost:3000`).

---

## 🎥 Como Adicionar ao OBS Studio

Como este é um aplicativo web que roda localmente e possui um painel de controle embutido, existem duas formas principais de colocá-lo na sua live:

### Opção 1: Captura de Janela (Recomendado para facilitar ajustes)

Esta opção permite que você altere as metas e configurações em tempo real no seu navegador e veja o resultado no OBS instantaneamente.

1.  Abra o projeto no seu navegador (Chrome, Firefox, etc).
2.  No OBS, em **Fontes** (Sources), clique no `+` e selecione **Captura de Janela** (Window Capture).
3.  Selecione a janela do seu navegador onde o widget está aberto.
4.  **Importante (Recorte):**
    *   A tela do aplicativo é dividida em duas partes (Painel à esquerda, Widget à direita).
    *   No OBS, segure a tecla `ALT` e arraste as bordas da captura vermelha para **recortar** a imagem, escondendo o painel de configurações esquerdo e deixando apenas o Widget visível.
5.  Posicione o widget onde quiser na sua cena.
6.  *Dica:* Para deixar o fundo transparente, você pode aplicar um filtro de **Color Key** no OBS para remover a cor de fundo da área de preview (se configurado com uma cor sólida).

### Opção 2: Fonte de Navegador (Browser Source)

1.  No OBS, em **Fontes**, clique no `+` e selecione **Navegador** (Browser).
2.  No campo **URL**, coloque: `http://localhost:3000`
3.  Defina a largura (Width) como `1920` e altura (Height) como `1080`.
4.  Clique em OK.
5.  Assim como na Opção 1, segure `ALT` e arraste as bordas para recortar e mostrar apenas o widget.
6.  **Para interagir (Configurar):**
    *   Clique com o botão direito na fonte do Navegador no OBS.
    *   Clique em **Interagir** (Interact).
    *   Uma janela abrirá onde você pode clicar nos botões e alterar as configurações dentro do próprio OBS.

## ⚙️ Configurando a Roleta e Metas

1.  No painel esquerdo (Settings Panel):
2.  Vá até a seção **Goal Logic**.
    *   Selecione **Sub-Goals (Escadinha)** se quiser que a roleta gire várias vezes a cada X valor (ex: a cada R$50).
3.  Vá até **Event Roulette**.
    *   Ative o checkbox.
    *   Escreva seus eventos na caixa de texto (um por linha). Exemplo:
        ```
        Cantar uma música
        Imitar um NPC
        Sorteio de Key
        10 Flexões
        ```
4.  Sempre que a meta for atingida (simule clicando nos botões verdes de teste), a roleta irá girar!

---

## 🛠 Tecnologias

*   React
*   TypeScript
*   Tailwind CSS
*   Lucide React (Ícones)

# StreamBuddies

Projeto de salas de áudio/vídeo com WebRTC mesh: cada participante envia seu áudio/vídeo diretamente aos demais participantes.

## Estrutura
- `index.html`: frontend para GitHub Pages.
- `public/index.html`: cópia servida pelo Express no Render.
- `server.js`: servidor de sinalização Socket.IO.
- `package.json`: dependências e comando de inicialização.

## GitHub Pages
Configure Settings > Pages > Deploy from a branch > `main` > `/ (root)`.
O arquivo `index.html` da raiz é usado pelo Pages.

## Render
Crie um Web Service apontando para este repositório:
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: vazio
- Plano Free serve para testes.

O frontend aponta para `https://streambuddies.onrender.com`. Se o endereço do serviço mudar, altere `SERVER_URL` no `index.html` e em `public/index.html`.

## Limitações importantes
- O WebRTC mesh cria uma conexão P2P para cada par. Com 8 participantes, cada aparelho mantém até 7 conexões; vídeo pode consumir bastante banda e CPU.
- O projeto usa STUN público para facilitar conexões. Algumas redes exigem TURN; sem TURN, certas conexões podem falhar.
- O Render hospeda somente a sinalização. O áudio/vídeo não passa pelo Render.
- O navegador precisa de HTTPS e permissão de câmera/microfone.
- Android pode impedir que o navegador e uma chamada do WhatsApp usem o microfone simultaneamente. Isso depende do aparelho e da prioridade de áudio do sistema.
- Esta é uma base funcional para testes, não uma plataforma de produção auditada. Teste com poucos participantes primeiro.

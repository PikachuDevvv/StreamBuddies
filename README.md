# StreamBuddies Site

MVP de salas de voz WebRTC com sinalização Socket.IO. Até 8 conexões por sala. O streamer recebe uma faixa de áudio separada por convidado.

## Requisitos
- Node.js 18 ou superior
- Internet para STUN e para convidados remotos
- Hospedagem HTTPS para uso fora do próprio computador (microfone exige contexto seguro)

## Executar no Windows
1. Instale Node.js LTS: https://nodejs.org/
2. Extraia esta pasta.
3. Abra o Terminal nesta pasta.
4. Execute `npm install`
5. Execute `npm start`
6. Abra http://localhost:3000

Para amigos em celulares e fora da sua rede, publique a pasta/servidor em um host Node com HTTPS (por exemplo, Render, Railway ou VPS com proxy HTTPS). Não exponha a porta local do PC diretamente à internet.

## Limitações desta versão
- O servidor é de sinalização; mídia usa WebRTC peer-to-peer.
- STUN está configurado. Algumas redes restritivas exigem um servidor TURN próprio.
- O encaminhamento local para o helper Windows é experimental e depende de manter a aba do streamer aberta.
- Esta versão não é uma substituição do WhatsApp: os convidados entram pelo link do StreamBuddies.

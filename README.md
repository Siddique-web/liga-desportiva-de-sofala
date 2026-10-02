# L.D.S. — Liga Desportiva de Sofala (site + Loja + Scouting)

Site institucional (React + TypeScript + Vite) com backend Node (Express + SQLite).

## Arrancar
    npm install
    cp .env.example .env     # edite: senha do treinador, números M-Pesa/e-Mola, NIB, WhatsApp, SMTP
    npm run dev              # site http://localhost:5173  (API em :3001)

Produção (um só processo, serve o site e a API):

    npm run build && NODE_ENV=production npm start     # http://localhost:3001

## Estrutura da página inicial
Notícias (carrossel) · Classificação · Match Center (campo centrado + galeria) · Plantel · Loja Oficial · Área de Sócios · Eventos e Comunidade · Conquistas · Historial.
Conteúdo editável em `src/data.ts` (`NOTICIAS`, `SOCIOS`, `EVENTOS`, `GALERIA`, `TREINADOR`); imagens em `public/img/`.
Director Técnico: **Mussa Osman**.

## Páginas
- `#/loja` — Loja Oficial: galeria, tamanhos, stock, carrinho, checkout com **M-Pesa / e-Mola / transferência**, resumo com instruções, upload de comprovativo ou WhatsApp.
- `#/recrutamento` — Formulário de scouting validado em TypeScript (`src/validation.ts`), upload de CV/foto/vídeo (ou link YouTube/Drive) com barra de progresso.
- `#/admin` — Painel técnico (login): candidatos filtráveis, vídeo integrado, 4 critérios de 1–5 estrelas, estados, notas privadas; encomendas (validar pagamento, ver comprovativo, cancelar repõe stock); stock.

O treinador inicial é criado no 1.º arranque com `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`.

## Notificações
Ao mudar o estado de um candidato (`Em Análise`, `Convocado para Testes`, `Rejeitado`) é enviado e-mail via SMTP. Sem `SMTP_HOST`, o e-mail é simulado (consola + tabela `notifications`). Textos em `MSG` no `server/index.js`; para SMS, ligue um provider dentro da função `notify()`.

## Dados e segurança
- Base de dados: `data/lds.db` (SQLite). Uploads: `data/uploads/` — **fora de pasta pública**, servidos só a treinadores autenticados (`/api/admin/files/…`, com suporte a Range para vídeo). Faça backup de `data/`.
- Sessão por cookie HttpOnly/SameSite=Strict assinado (HMAC), palavras-passe com scrypt, limite de tentativas de login, validação de tipo/tamanho de ficheiros (PDF 5 MB, foto 3 MB, vídeo 100 MB), nomes de ficheiro aleatórios, stock descontado em transação.
- Em produção use HTTPS (proxy Nginx/Caddy) e defina `SESSION_SECRET` fixo. Para muitos vídeos, mova `data/uploads` para armazenamento de objetos (S3/R2).
- Fotos reais dos produtos: preencha a coluna `images` (JSON de URLs) em `products`; sem fotos usa ilustrações SVG.

## Plantel com fotos
Cartões em retrato com foto, número, posição, estado e estatísticas. Fotos em `public/jogadores/<nº>.jpg` (ver `LEIA-ME.txt`); sem foto aparece o emblema.

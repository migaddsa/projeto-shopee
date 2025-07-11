const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const GRUPO_MODELOS = process.env.GRUPO_MODELOS || "Modelos";
const GRUPO_DESTINO_1 = process.env.GRUPO_DESTINO_1 || "Divulgação 1";
const GRUPO_DESTINO_2 = process.env.GRUPO_DESTINO_2 || ""; // se quiser

const WHAPI_INSTANCE_ID = process.env.WHAPI_INSTANCE_ID;
const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado com sucesso!');
});

client.on('message', async msg => {
  const chat = await msg.getChat();

  if (chat.isGroup && chat.name === GRUPO_MODELOS) {
    const messageText = msg.body;
    const linkMatch = messageText.match(/https:\/\/s\.shopee\.com\.br\/\S+/);

    if (!linkMatch) return;

    const shortLink = linkMatch[0];

    try {
      const response = await axios.get(shortLink, { maxRedirects: 0, validateStatus: null });
      const finalLink = response.headers.location;

      if (!finalLink || !finalLink.includes("shopee.com.br/product")) return;

      const finalLinkWithUtm = finalLink.split("?")[0] + `?utm_source=an_${WHAPI_INSTANCE_ID}&utm_medium=affiliates&utm_campaign=divulgacao`;

      const updatedText = messageText.replace(shortLink, finalLinkWithUtm);

      if (GRUPO_DESTINO_1) client.sendMessage(GRUPO_DESTINO_1, updatedText);
      if (GRUPO_DESTINO_2) client.sendMessage(GRUPO_DESTINO_2, updatedText);

      console.log(`✅ Mensagem encaminhada com link atualizado: ${finalLinkWithUtm}`);
    } catch (error) {
      console.error("❌ Erro ao expandir o link:", error.message);
    }
  }
});

client.initialize();

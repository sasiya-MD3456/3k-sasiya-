const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    disconnectReason, 
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
    owner: "947xxxxxxxx", // මෙතනට ඔයාගේ නම්බර් එක දාන්න (e.g. 94771234567)
    prefix: "."
};

async function startNexus() {
    // Session එක save වෙන්න folder එකක් හදනවා
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        // --- 🛠️ CHROME FIX (Pairing Code එක එන්න මේක අනිවාර්යයි) ---
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🤖 TELEGRAM PAIRING LOGIC ---
    tgBot.onText(/\/start/, (msg) => {
        const welcomeMsg = `⚡ *WELCOME TO ${botConfig.botName}* ⚡\n\n` +
            `මෙම බොට් හරහා ඔබට ඉතා පහසුවෙන් Pairing Code එක ලබාගත හැක.\n\n` +
            `👉 කරුණාකර ඔබගේ WhatsApp අංකය රටේ කේතය සහිතව එවන්න.\n` +
            `*(නිදසුන: 94770475809)*`;
        tgBot.sendMessage(msg.chat.id, welcomeMsg, { parse_mode: 'Markdown' });
    });

    tgBot.on('message', async (msg) => {
        const text = msg.text;
        // නම්බර් එකක්ද කියලා චෙක් කරනවා
        if (text && /^\d+$/.test(text) && text.length > 9) {
            const chatId = msg.chat.id;
            try {
                tgBot.sendMessage(chatId, "⏳ කරුණාකර මොහොතක් රැඳී සිටින්න, Pairing Code එක සකසමින් පවතී...");
                await delay(3000); // පොඩි වෙලාවක් දෙනවා Connection එක හැදෙන්න
                
                // WhatsApp Pairing Code Request
                let code = await sock.requestPairingCode(text.replace(/[^0-9]/g, ''));
                
                const successMsg = `🔥 *YOUR PAIRING CODE:* \n\n` +
                    `👉   *${code}* 👈\n\n` +
                    `මෙම කේතය ඔබගේ WhatsApp හි Linked Devices -> Link with phone number හරහා ඇතුළත් කරන්න.`;
                
                tgBot.sendMessage(chatId, successMsg, { parse_mode: 'Markdown' });
            } catch (e) {
                tgBot.sendMessage(chatId, "❌ වැරදීමක් සිදුවිය. ඔබගේ අංකය නිවැරදිදැයි පරීක්ෂා කර නැවත උත්සාහ කරන්න.");
                console.error(e);
            }
        }
    });

    // --- 📩 WHATSAPP MESSAGE HANDLER (COMMANDS) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            const isCmd = body.startsWith(botConfig.prefix);
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(" ");

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        const menu = `🚀 *${botConfig.botName}* 🚀\n\n` +
                                     `👑 *Owner:* Sasiya MD\n` +
                                     `⚡ *Prefix:* ${botConfig.prefix}\n\n` +
                                     `🎵 *.song* [name]\n🎥 *.video* [name]\n🤖 *.ai* [text]\n🖼️ *.img* [query]\n\n` +
                                     `_Powered by Developer Nexus_`;
                        await sock.sendMessage(from, { text: menu }, { quoted: mek });
                        break;

                    case 'song':
                        if (!text) return sock.sendMessage(from, { text: "සින්දුවක නම දෙන්න!" });
                        const s = await yts(text);
                        const v = s.videos[0];
                        await sock.sendMessage(from, { audio: { url: `https://api.download-lagu-mp3.com/@api/json/mp3/${v.videoId}` }, mimetype: 'audio/mp4' }, { quoted: mek });
                        break;
                }
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== disconnectReason.loggedOut;
            if (shouldReconnect) startNexus();
        } else if (connection === 'open') {
            console.log('✅ NEXUS-MD ලින්ක් වුණා මචං!');
        }
    });

    // --- 🌐 KEEP-ALIVE SERVER (H10 Fix) ---
    app.get('/', (req, res) => res.send('Nexus-MD Telegram Pairing Service is Online! 🚀'));
    app.listen(PORT, () => console.log(`Dashboard running on port ${PORT}`));
}

startNexus();

const { default: makeWASocket, useMultiFileAuthState, Browsers, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// --- ⚙️ BOT CONFIGURATION ---
let botConfig = {
    isPublic: true, // Web Dashboard එකෙන් මාරු කළ හැක
    prefix: ".",
    owner: "947xxxxxxxx", // ඔයාගේ නම්බර් එක මෙතනට (උදා: 94712345678)
    botName: "NEXUS-MD V3"
};

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const bot = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS("Desktop"),
        printQRInTerminal: false
    });

    // --- 🔑 WEB PAIRING CODE LOGIC ---
    if (!bot.authState.creds.registered) {
        setTimeout(async () => {
            let code = await bot.requestPairingCode(botConfig.owner);
            console.log(`\n======================================`);
            console.log(`🔥 YOUR PAIRING CODE: ${code}`);
            console.log(`======================================\n`);
        }, 5000);
    }

    // --- 🌐 WEB DASHBOARD (CONTROL PANEL) ---
    app.get('/', (req, res) => {
        res.send(`
            <body style="background:#0a0a0a; color:cyan; font-family:sans-serif; text-align:center; padding:50px;">
                <h1 style="text-shadow: 0 0 10px cyan;">${botConfig.botName} DASHBOARD</h1>
                <div style="border:2px solid cyan; padding:20px; display:inline-block; border-radius:15px; background:#111;">
                    <p>Current Mode: <b style="color:${botConfig.isPublic ? '#00ff00' : '#ff0000'}">${botConfig.isPublic ? 'PUBLIC' : 'PRIVATE'}</b></p>
                    <a href="/mode?set=public"><button style="background:green; color:white; border:none; padding:10px 20px; cursor:pointer; margin:5px;">PUBLIC MODE</button></a>
                    <a href="/mode?set=private"><button style="background:red; color:white; border:none; padding:10px 20px; cursor:pointer; margin:5px;">PRIVATE MODE</button></a>
                </div>
                <p style="margin-top:20px;">Owner: ${botConfig.owner}</p>
            </body>
        `);
    });

    app.get('/mode', (req, res) => {
        botConfig.isPublic = req.query.set === 'public';
        res.redirect('/');
    });

    bot.ev.on('creds.update', saveCreds);

    // --- 📩 MESSAGE HANDLER ---
    bot.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const sender = mek.key.participant || from;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
            const isCmd = body.startsWith(botConfig.prefix);
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(" ");
            const isGroup = from.endsWith('@g.us');
            const isOwner = sender.includes(botConfig.owner);

            // 🔒 Mode Check
            if (!botConfig.isPublic && !isOwner) return;

            // --- 🛡️ ANTI-LINK ---
            if (isGroup && body.includes('chat.whatsapp.com')) {
                const groupMetadata = await bot.groupMetadata(from);
                const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
                if (!isAdmin) {
                    await bot.sendMessage(from, { delete: mek.key });
                    await bot.groupParticipantsUpdate(from, [sender], "remove");
                }
            }

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        const menu = `🚀 *${botConfig.botName} PRO*\n\n` +
                                     `*Mode:* ${botConfig.isPublic ? 'Public' : 'Private'}\n\n` +
                                     `*DOWNLOAD CMDs*\n` +
                                     `🎵 .song [name]\n🎥 .video [name]\n🖼️ .img [query]\n\n` +
                                     `*GROUP CMDs*\n` +
                                     `🚫 .kick [reply]\n➕ .add [number]\n📢 .hidetag [text]\n🔓 .open / .close\n\n` +
                                     `*AI CMDs*\n` +
                                     `🤖 .ai [text]\n📝 .gpt [query]`;
                        await bot.sendMessage(from, { text: menu }, { quoted: mek });
                        break;

                    case 'song':
                        if (!text) return bot.sendMessage(from, { text: "සින්දුවක නම දෙන්න!" });
                        const s = await yts(text);
                        const v = s.videos[0];
                        const res = await axios.get(`https://api.download-lagu-mp3.com/@api/json/mp3/${v.videoId}`);
                        await bot.sendMessage(from, { 
                            audio: { url: res.data.result.url }, 
                            mimetype: 'audio/mp4',
                            fileName: `${v.title}.mp3`
                        }, { quoted: mek });
                        break;

                    case 'video':
                        if (!text) return bot.sendMessage(from, { text: "වීඩියෝ නම දෙන්න!" });
                        const vs = await yts(text);
                        const vi = vs.videos[0];
                        const vres = await axios.get(`https://api.download-lagu-mp3.com/@api/json/mp4/${vi.videoId}`);
                        await bot.sendMessage(from, { 
                            video: { url: vres.data.result.url }, 
                            caption: vi.title 
                        }, { quoted: mek });
                        break;

                    case 'kick':
                        if (!isGroup || !isOwner) return;
                        let users = mek.message.extendedTextMessage?.contextInfo?.participant;
                        await bot.groupParticipantsUpdate(from, [users], "remove");
                        break;

                    case 'hidetag':
                        if (!isGroup || !isOwner) return;
                        const groupMeta = await bot.groupMetadata(from);
                        bot.sendMessage(from, { text: text, mentions: groupMeta.participants.map(a => a.id) });
                        break;

                    case 'ai':
                        const aiRes = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
                        await bot.sendMessage(from, { text: aiRes.data.success }, { quoted: mek });
                        break;
                }
            }
        } catch (e) { console.log(e); }
    });

    app.listen(PORT, () => console.log(`Web Dashboard live on port ${PORT}`));
}

startNexus();

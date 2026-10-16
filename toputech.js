const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8000;

// ═══════════════════════════════════════════
//   🔧 MIDDLEWARE
// ═══════════════════════════════════════════
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Trust Heroku/Render proxy
app.set('trust proxy', 1);

// Serve static files (CSS, JS, images kwenye public/)
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════
//   📱 ROUTES
// ═══════════════════════════════════════════
try {
    const qrRouter = require('./qr');
    const pairRouter = require('./pair');
    
    // API routes
    app.use('/qr', qrRouter);
    app.use('/code', pairRouter);
    
    console.log("✅ Routers loaded successfully");
} catch (e) {
    console.log("⚠️ Router error:", e.message);
}

// ═══════════════════════════════════════════
//   🏠 HOME PAGE
// ═══════════════════════════════════════════
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ═══════════════════════════════════════════
//   📱 PAIR PAGE (HTML)
// ═══════════════════════════════════════════
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

// ═══════════════════════════════════════════
//   🩺 HEALTH CHECK
// ═══════════════════════════════════════════
app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        bot: "RAHMANI-XMD",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════════
//   🚫 404 HANDLER
// ═══════════════════════════════════════════
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        path: req.path,
        bot: "RAHMANI-XMD",
        available_routes: ["/", "/pair", "/code", "/qr", "/health"]
    });
});

// ═══════════════════════════════════════════
//   🚨 ERROR HANDLER
// ═══════════════════════════════════════════
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err.message);
    if (!res.headersSent) {
        res.status(500).json({
            error: "Internal Server Error",
            bot: "RAHMANI-XMD"
        });
    }
});

// ═══════════════════════════════════════════
//   🚀 START SERVER
// ═══════════════════════════════════════════
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   ⚡ RAHMANI-XMD PAIRING SERVER ⚡       ║
║   Session Generator · Public Mode       ║
╚══════════════════════════════════════════╝

🚀 Server is running on port: ${PORT}
🌐 Local URL: http://localhost:${PORT}

📱 Routes:
   🏠 Home:      /
   📱 Pair Page: /pair
   🔑 Pair API:  /code?number=xxx
   📷 QR Code:   /qr
   🩺 Health:    /health

✅ Ready to receive requests!
`);
});

// ═══════════════════════════════════════════
//   🚨 GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════
process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM received, closing server...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⚠️ SIGINT received, closing server...');
    process.exit(0);
});

module.exports = app;

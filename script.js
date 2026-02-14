// Canvas setup
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const textContainer = document.getElementById('texto-regalo');
const contador = document.getElementById('contador');

// State management
let state = 'start'; 
let heartY = 250;
let trunkHeight = 0;
let branchesGrown = 0;
const branchData = []; // Aquí guardaremos los corazones para que sean FIJOS

const GROUND_Y = 450;
const HEART_START_Y = 200;
const TARGET_HEART_Y = 420;

// 1. GENERAR EL CORAZÓN (Borde y Relleno) UNA SOLA VEZ
function prepararArbol() {
    // Primero el borde (para que siempre tenga la forma de corazón perfecta)
    for(let i=0; i<60; i++) {
        let t = (i / 59) * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        branchData.push({ dx: x * 6, dy: y * 6, size: 10, isBorder: true });
    }
    // Luego el relleno (puntos aleatorios ADENTRO de la forma)
    for(let i=0; i<400; i++) {
        let t = Math.random() * Math.PI * 2;
        let r = Math.random() * 0.8; // Menor a 1 para que estén adentro
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        branchData.push({ dx: x * 6 * r, dy: y * 6 * r, size: 5 + Math.random() * 8, isBorder: false });
    }
}
prepararArbol();

// Initial render
drawHeart(300, HEART_START_Y, 1, true);

canvas.addEventListener('click', () => {
    if (state === 'start') {
        state = 'falling';
        animateFalling();
    }
});

function animateFalling() {
    const duration = 1500;
    const startTime = Date.now();
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        heartY = HEART_START_Y + (TARGET_HEART_Y - HEART_START_Y) * (1 - Math.pow(1 - progress, 3));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGround();
        drawHeart(300, heartY, 1 - progress * 0.3, true);
        if (progress < 1) requestAnimationFrame(animate);
        else { state = 'trunk'; animateTrunk(); }
    }
    animate();
}

function animateTrunk() {
    const duration = 2000;
    const startTime = Date.now();
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        trunkHeight = 150 * (1 - Math.pow(1 - progress, 2));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGround();
        drawTrunk(300, GROUND_Y, trunkHeight);
        if (progress < 1) requestAnimationFrame(animate);
        else { state = 'branches'; animateBranches(); }
    }
    animate();
}

function animateBranches() {
    const duration = 4000;
    const startTime = Date.now();
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        branchesGrown = Math.floor(progress * branchData.length);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGround();
        drawTrunk(300, GROUND_Y, trunkHeight);
        drawBranches(300, GROUND_Y - trunkHeight, branchesGrown);
        if (progress < 1) requestAnimationFrame(animate);
        else { state = 'complete'; showFinalMessage(); }
    }
    animate();
}

function drawTrunk(x, baseY, height) {
    ctx.save();
    ctx.translate(x, baseY);
    ctx.beginPath();
    ctx.fillStyle = '#4b2c20'; // Café madera sólido
    ctx.moveTo(-20, 0); ctx.lineTo(0, -height); ctx.lineTo(20, 0);
    ctx.fill();
    ctx.restore();
}

function drawBranches(baseX, topY, count) {
    for (let i = 0; i < count; i++) {
        const b = branchData[i];
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(75, 44, 32, 0.15)'; // Ramas muy finas
        ctx.moveTo(baseX, topY);
        ctx.lineTo(baseX + b.dx, topY + b.dy);
        ctx.stroke();
        drawRedHeart(baseX + b.dx, topY + b.dy, b.size);
    }
}

function drawRedHeart(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.fillStyle = '#ff1a1a';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 8;
    ctx.moveTo(0, -size / 2);
    ctx.bezierCurveTo(size / 2, -size, size, -size / 3, 0, size / 2);
    ctx.bezierCurveTo(-size, -size / 3, -size / 2, -size, 0, -size / 2);
    ctx.fill();
    ctx.restore();
}

function drawHeart(x, y, scale, showText) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.fillStyle = '#ff3366';
    const s = 40;
    ctx.moveTo(0, -s/2); ctx.bezierCurveTo(s/2, -s, s, -s/3, 0, s/2);
    ctx.bezierCurveTo(-s, -s/3, -s/2, -s, 0, -s/2);
    ctx.fill();
    ctx.restore();
    if (showText && state === 'start') {
        ctx.font = 'bold 24px Arial'; ctx.fillStyle = 'white'; ctx.textAlign = 'center';
        ctx.fillText('¡PRESÍONAME!', x, y + 60);
    }
}

function drawGround() {
    ctx.fillStyle = '#1a3d1a';
    ctx.fillRect(0, GROUND_Y, canvas.width, 50);
}

function showFinalMessage() {
    canvas.style.transform = "translateX(120px)"; // Movimiento suave
    setTimeout(() => {
        textContainer.classList.remove('hidden');
        textContainer.style.opacity = "1";
        startTimer();
    }, 1000);
}

function startTimer() {
    const startDate = new Date('2025-09-10T09:35:00');
    setInterval(() => {
        const diff = new Date() - startDate;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        contador.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }, 1000);
}
// --- CÓDIGO PARA LOS CORAZONES DEL FONDO ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

// Ajustar el tamaño del fondo a la pantalla
function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBg);
resizeBg();

let heartsBg = [];

function drawBgHearts() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Crear corazones poco a poco
    if (heartsBg.length < 40) {
        heartsBg.push({
            x: Math.random() * bgCanvas.width,
            y: bgCanvas.height + 20,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 1 + 0.3,
            opacity: Math.random() * 0.4 + 0.1
        });
    }

    heartsBg.forEach((h, i) => {
        h.y -= h.speed; // Los corazones suben
        bgCtx.globalAlpha = h.opacity;
        bgCtx.fillStyle = '#ff4d6d';
        bgCtx.beginPath();
        
        // Dibujo del corazón pequeño
       let s = h.size;
            // Esto dibuja el círculo (estrella)
            bgCtx.arc(h.x, h.y, s / 2, 0, Math.PI * 2);
            bgCtx.fill();
        bgCtx.fill();

        // Si se sale de la pantalla, lo quitamos para que no trabe la PC
        if (h.y < -20) heartsBg.splice(i, 1);
    });

    requestAnimationFrame(drawBgHearts);
}

// Arrancar la animación del fondo
drawBgHearts();
// ... (aquí termina lo que ya tenías de los corazones del fondo)

// --- CÓDIGO FINAL PARA LA MÚSICA ---
document.addEventListener('click', function() {
    const audio = document.getElementById('miMusica');
    if (audio) {
        audio.play();
        console.log("¡Música sonando para Sophie!");
    }
}, { once: true });

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const selectionScreen = document.getElementById("selection-screen");
const canvasContainer = document.getElementById("canvas-container");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const victoryRestart = document.getElementById("victoryRestart");

const livesEl = document.getElementById("lives");
const jumpsEl = document.getElementById("jumps");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const messageEl = document.getElementById("message");
const objectiveText = document.getElementById("objectiveText");

const journalModal = document.getElementById("journal-modal");
const journalBtn = document.getElementById("journalBtn");
const closeJournal = document.getElementById("closeJournal");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const dialogBox = document.getElementById("dialog-box");
const closeDialog = document.getElementById("closeDialog");
const npcName = document.getElementById("npc-name");
const textContent = document.getElementById("text-content");

const gameOver = document.getElementById("game-over");
const victory = document.getElementById("victory");

const leoImage = new Image();
leoImage.src = "Personagem/Léo.png";

let dpr = 1;
let gameRunning = false;
let animationId = null;
let lastTime = 0;
let messageTimer = 0;

const keys = { left: false, right: false, jumpQueued: false };

const selectedCharacter = {
    name: "Alex",
    type: "emoji",
    emoji: "🏃"
};

const player = {
    x: 120,
    y: 434,
    w: 58,
    h: 76,
    vx: 0,
    vy: 0,
    speed: 380,
    acceleration: 2500,
    friction: 2300,
    jumpForce: 755,
    gravity: 1850,
    jumpsLeft: 5,
    maxJumps: 5,
    grounded: false,
    facing: 1,
    walkTime: 0,
    squash: 0,
    spawnX: 120,
    spawnY: 434,
    invulnerable: 0
};

const world = {
    width: 7900,
    cameraX: 0,
    shake: 0
};

let lives = 3;
let checkpoint = 0;
let phaseState = "intro";
let currentChallenge = null;
let collectedFragments = 0;
let dialogueLocked = false;

// Plataformas estilo dunas de areia e elevações desérticas
const platforms = [
    { x: 0, y: 510, w: 520, h: 70, safe: true },
    { x: 650, y: 450, w: 190, h: 28, safe: true },
    { x: 930, y: 390, w: 190, h: 28, safe: true },
    { x: 1210, y: 445, w: 210, h: 28, safe: true },
    { x: 1510, y: 365, w: 210, h: 28, safe: true },
    { x: 1810, y: 455, w: 230, h: 28, safe: true },
    { x: 2140, y: 410, w: 250, h: 28, safe: true },
    { x: 2500, y: 510, w: 460, h: 70, safe: true },
    { x: 2960, y: 510, w: 4940, h: 70, safe: true }
];

const hazards = [
    { x: 1930, y: 422, w: 45, h: 33, type: "rock" },
    { x: 2250, y: 377, w: 45, h: 33, type: "rock" },
    { x: 3180, y: 477, w: 42, h: 33, type: "cactus" },
    { x: 3990, y: 477, w: 45, h: 33, type: "rock" },
    { x: 4810, y: 477, w: 40, h: 33, type: "rock" },
    { x: 5380, y: 477, w: 42, h: 33, type: "cactus" },
    { x: 6510, y: 477, w: 45, h: 33, type: "rock" }
];

const checkpoints = [
    { x: 0, y: 510 },
    { x: 1810, y: 455 },
    { x: 2500, y: 510 },
    { x: 3580, y: 510 },
    { x: 4390, y: 510 },
    { x: 5660, y: 510 },
    { x: 6240, y: 510 },
    { x: 6900, y: 510 }
];

const rocks = [
    { x: 1950, y: 0, size: 28, active: false, vy: 0, delay: 0 },
    { x: 2100, y: 0, size: 23, active: false, vy: 0, delay: .4 },
    { x: 2280, y: 0, size: 31, active: false, vy: 0, delay: .8 }
];

const scorpions = [
    { x: 2620, y: 472, w: 46, h: 38, active: false, speed: 115, chase: false },
    { x: 2790, y: 472, w: 46, h: 38, active: false, speed: 130, chase: false },
    { x: 5710, y: 472, w: 48, h: 40, active: false, speed: 155, chase: false }
];

const animals = {
    fox: { x: 3210, y: 450, triggered: false, answered: false },
    camel: { x: 3890, y: 450, triggered: false, answered: false },
    lizard: { x: 5050, y: 450, triggered: false, answered: false }
};

const finalArea = {
    x: 6360,
    triggered: false,
    answered: false,
    fragmentTaken: false
};

const particles = [];
const clouds = [
    { x: 300, y: 75, s: 1.1 },
    { x: 1400, y: 105, s: .8 },
    { x: 2600, y: 60, s: 1.2 },
    { x: 4100, y: 95, s: .9 },
    { x: 5500, y: 55, s: 1.1 },
    { x: 6900, y: 90, s: .8 }
];

// Perguntas ajustadas conforme o Roteiro Educativo
const questions = {
    fox: {
        name: "Raposa-do-deserto 🦊",
        text: "Como a raposa-do-deserto lida melhor com o calor extremo e a termorregulação?",
        options: [
            "A) Possui adaptações como orelhas grandes para dissipar o calor corporal.",
            "B) Bebe grandes quantidades de água de hora em hora.",
            "C) Mantém uma camada densa de gordura corporal."
        ],
        correct: 0,
        success: "Exato! As grandes orelhas ricas em vasos sanguíneos ajudam na dissipação do calor."
    },
    camel: {
        name: "Camelo 🐪",
        text: "Qual é a principal adaptação fisiológica do camelo em relação à economia de água?",
        options: [
            "A) Mecanismos eficientes de conservação e tolerância à desidratação.",
            "B) Armazenar água líquida pura diretamente dentro de suas corcovas.",
            "C) Eliminar suor excessivo para resfriar a pele constantemente."
        ],
        correct: 0,
        success: "Correto! O camelo consegue conservar água minimizando perdas na urina e suor."
    },
    lizard: {
        name: "Lagarto 🦎",
        text: "Qual estratégia comportamental os répteis do deserto usam nas horas mais quentes?",
        options: [
            "A) Procurar abrigo sob pedras e cavernas para evitar a radiação direta.",
            "B) Ficar expostos ao sol direto para acelerar a respiração.",
            "C) Entrar na água do oásis durante todo o dia."
        ],
        correct: 0,
        success: "Muito bem! Entrar em abrigos sombreados é essencial para o controle comportamental de temperatura."
    },
    final: {
        name: "Escorpião • Desafio Final 🦂",
        text: "Como os animais conseguem sobreviver ao ambiente desértico?",
        options: [
            "A) Desenvolvendo adaptações fisiológicas e comportamentais específicas (termorregulação e conservação de água).",
            "B) Ignorando a variação de temperatura do bioma.",
            "C) Dependendo exclusivamente de rios abundantes."
        ],
        correct: 0,
        success: "Parabéns! Você demonstrou pleno conhecimento sobre as adaptações do deserto."
    }
};

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function W() { return canvas.clientWidth; }
function H() { return canvas.clientHeight; }

function resetGame() {
    lives = 3;
    checkpoint = 0;
    collectedFragments = 0;
    phaseState = "intro";
    currentChallenge = null;
    dialogueLocked = false;

    animals.fox.triggered = false;
    animals.fox.answered = false;
    animals.camel.triggered = false;
    animals.camel.answered = false;
    animals.lizard.triggered = false;
    animals.lizard.answered = false;
    finalArea.triggered = false;
    finalArea.answered = false;
    finalArea.fragmentTaken = false;

    scorpions.forEach(s => {
        s.active = false;
        s.chase = false;
    });

    rocks.forEach(r => {
        r.active = false;
        r.vy = 0;
    });

    player.x = 120;
    player.y = 434;
    player.spawnX = player.x;
    player.spawnY = player.y;
    player.vx = 0;
    player.vy = 0;
    player.jumpsLeft = 5;
    player.grounded = true;
    player.invulnerable = 0;

    world.cameraX = 0;
    world.shake = 0;

    gameOver.hidden = true;
    victory.hidden = true;
    dialogBox.hidden = true;

    objectiveText.textContent = "Fale com a Raposa-do-deserto";
    showMessage("Dra. Helena: Explore o bioma do deserto!");
    updateHud();
}

function startGame() {
    selectionScreen.hidden = true;
    canvasContainer.hidden = false;
    resizeCanvas();
    resetGame();

    gameRunning = true;
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
}

function loop(time) {
    if (!gameRunning) return;

    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;

    update(dt, time);
    render(time);

    animationId = requestAnimationFrame(loop);
}

function update(dt, time) {
    if (!dialogueLocked) {
        updateInput(dt);
        updatePlayer(dt);
        updatePhaseEvents(time);
        updateCamera(dt);
    }

    updateRocks(dt);
    updateScorpions(dt);
    updateParticles(dt);
    updateHud();

    if (player.invulnerable > 0) player.invulnerable -= dt;
    if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 30);

    // Queda na areia profunda
    if (player.y > H() + 220) {
        loseLife("Você afundou na areia movediça!");
    }
}

function updateInput(dt) {
    const direction = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);

    if (direction !== 0) {
        player.vx += direction * player.acceleration * dt;
        player.vx = Math.max(-player.speed, Math.min(player.speed, player.vx));
        player.facing = direction;
        player.walkTime += dt * (7 + Math.abs(player.vx) / 60);
    } else {
        const amount = player.friction * dt;
        player.vx = Math.abs(player.vx) <= amount ? 0 : player.vx - Math.sign(player.vx) * amount;
    }

    if (keys.jumpQueued) {
        if (player.jumpsLeft > 0) doJump();
        keys.jumpQueued = false;
    }
}

function doJump() {
    player.vy = -player.jumpForce;
    player.jumpsLeft--;
    player.grounded = false;
    player.squash = -0.12;
    spawnDust(player.x + player.w / 2, player.y + player.h, 8);
}

function updatePlayer(dt) {
    const oldY = player.y;

    player.vy += player.gravity * dt;
    player.vy = Math.min(player.vy, 1250);

    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(world.width - player.w, player.x));
    player.y += player.vy * dt;

    player.grounded = false;

    if (player.vy >= 0) {
        for (const p of platforms) {
            const horizontal = player.x + player.w - 8 > p.x && player.x + 8 < p.x + p.w;
            const crossedTop = oldY + player.h <= p.y && player.y + player.h >= p.y;

            if (horizontal && crossedTop) {
                player.y = p.y - player.h;
                player.vy = 0;
                player.grounded = true;
                player.jumpsLeft = player.maxJumps;
                player.squash = 0.08;
                spawnDust(player.x + player.w / 2, p.y, 5);
                break;
            }
        }
    }

    for (const h of hazards) {
        if (rectsOverlap(player.x + 8, player.y + 8, player.w - 16, player.h - 10, h.x, h.y, h.w, h.h)) {
            loseLife("Cuidado com os obstáculos do deserto!");
            return;
        }
    }

    if (player.grounded && Math.abs(player.vx) > 50 && Math.random() < dt * 10) {
        spawnDust(player.x + player.w / 2, player.y + player.h - 3, 1);
    }

    player.squash += (0 - player.squash) * Math.min(1, dt * 8);
}

function updatePhaseEvents(time) {
    if (phaseState === "intro" && player.x > 120) {
        phaseState = "parkour";
        objectiveText.textContent = "Atravesse o deserto até a Raposa";
        openNarrator(
            "Dra. Helena",
            "Bem-vindo ao Deserto! Seu objetivo é entender como os animais sobrevivem a elevadas temperaturas e à pouca água. Encontre a Raposa-do-deserto!"
        );
    }

    if (phaseState === "parkour" && player.x > 1730) {
        phaseState = "rocks";
        checkpoint = 1;
        player.spawnX = 1810;
        player.spawnY = 427;
        objectiveText.textContent = "Cuidado com o desabamento de pedras";
        showMessage("O terreno rochoso está instável!");
        rocks.forEach(r => r.active = true);
    }

    if (phaseState === "rocks" && player.x > 2350) {
        phaseState = "scorpions";
        checkpoint = 2;
        player.spawnX = 2500;
        player.spawnY = 434;
        objectiveText.textContent = "Evite o escorpião do deserto";
        scorpions[0].active = true;
        scorpions[1].active = true;
        showMessage("🦂 Escorpiões detectados no caminho!");
    }

    if (phaseState === "scorpions" && player.x > 2970) {
        scorpions.forEach(s => s.chase = false);
        phaseState = "fox";
        checkpoint = 2;
        objectiveText.textContent = "Fale com a Raposa-do-deserto";
        if (!animals.fox.answered) openQuestion("fox");
    }

    if (phaseState === "fox" && animals.fox.answered && player.x > 3500) {
        phaseState = "camel";
        checkpoint = 3;
        player.spawnX = 3580;
        player.spawnY = 434;
        objectiveText.textContent = "Encontre o Camelo no Oásis";
        if (!animals.camel.answered && !dialogueLocked) openQuestion("camel");
    }

    if (phaseState === "camel" && animals.camel.answered && player.x > 4270) {
        phaseState = "cave";
        checkpoint = 4;
        player.spawnX = 4390;
        player.spawnY = 434;
        objectiveText.textContent = "Explore a Caverna";
        showMessage("Entrada da caverna logo à frente...");
    }

    if (phaseState === "cave" && player.x > 4930) {
        phaseState = "lizard";
        objectiveText.textContent = "Fale com o Lagarto";
        if (!animals.lizard.answered) openQuestion("lizard");
    }

    if (phaseState === "lizard" && animals.lizard.answered && player.x > 5530) {
        phaseState = "chase2";
        checkpoint = 5;
        player.spawnX = 5660;
        player.spawnY = 434;
        objectiveText.textContent = "Corra até a saída do cânion";
        scorpions[2].active = true;
        scorpions[2].chase = true;
        showMessage("🦂 Um escorpião se aproxima!");
    }

    if (phaseState === "chase2" && player.x > 6140) {
        scorpions[2].chase = false;
        phaseState = "final";
        checkpoint = 6;
        player.spawnX = 6240;
        player.spawnY = 434;
        objectiveText.textContent = "Complete o desafio final";
        if (!finalArea.answered) openQuestion("final");
    }

    if (phaseState === "final" && finalArea.answered && !finalArea.fragmentTaken && player.x > 6750) {
        finalArea.fragmentTaken = true;
        collectedFragments = 1;
        phaseState = "fragment";
        objectiveText.textContent = "Pegue o Fragmento do Calor";
        openNarrator("Dra. Helena", "Parabéns! Você conquistou o Fragmento do Calor e compreendeu a fisiologia do bioma desértico.");
        setTimeout(() => {
            if (gameRunning) {
                phaseState = "exit";
                objectiveText.textContent = "Atravesse o portal de saída";
                showMessage("🔥 Fragmento do Calor Adquirido!");
            }
        }, 1500);
    }

    if (phaseState === "exit" && player.x > 7580) {
        phaseState = "done";
        gameRunning = false;
        victory.hidden = false;
    }
}

function updateRocks(dt) {
    const rockStart = 1770;
    const rockEnd = 2400;

    if (player.x < rockStart || player.x > rockEnd) return;

    for (const rock of rocks) {
        if (!rock.active) continue;

        if (rock.y < 50) {
            rock.y = -50;
            rock.vy = 120 + Math.random() * 80;
        }

        rock.vy += 1300 * dt;
        rock.y += rock.vy * dt;

        if (rock.y > 500) {
            rock.y = -50 - Math.random() * 100;
            rock.vy = 120 + Math.random() * 80;
        }

        if (rectsOverlap(player.x + 10, player.y + 10, player.w - 20, player.h - 12,
            rock.x - rock.size / 2, rock.y - rock.size / 2, rock.size, rock.size)) {
            loseLife("Uma pedra atingiu você!");
            return;
        }
    }
}

function updateScorpions(dt) {
    for (const s of scorpions) {
        if (!s.active) continue;

        if (s.chase) {
            const direction = player.x > s.x ? 1 : -1;
            s.x += direction * s.speed * dt;

            if (rectsOverlap(player.x + 8, player.y + 8, player.w - 16, player.h - 12,
                s.x, s.y, s.w, s.h)) {
                loseLife("O escorpião atingiu você!");
                return;
            }
        } else {
            s.x += Math.sin(performance.now() / 700 + s.x) * 18 * dt;
        }
    }
}

function updateCamera(dt) {
    const target = player.x - W() * .38;
    const maxCamera = Math.max(0, world.width - W());
    const desired = Math.max(0, Math.min(maxCamera, target));
    world.cameraX += (desired - world.cameraX) * Math.min(1, dt * 5);
}

function loseLife(reason) {
    if (player.invulnerable > 0 || !gameRunning) return;

    lives--;
    world.shake = 10;
    spawnBurst(player.x + player.w / 2, player.y + player.h / 2, true);

    if (lives <= 0) {
        gameRunning = false;
        gameOver.hidden = false;
        updateHud();
        return;
    }

    player.x = player.spawnX;
    player.y = player.spawnY;
    player.vx = 0;
    player.vy = 0;
    player.jumpsLeft = 5;
    player.grounded = true;
    player.invulnerable = 1.6;

    showMessage(`${reason} • Vida perdida`);
}

function openNarrator(name, text) {
    dialogueLocked = true;
    npcName.textContent = name;
    textContent.textContent = text;
    dialogBox.hidden = false;
}

function openQuestion(type) {
    if (dialogueLocked) return;

    currentChallenge = type;
    dialogueLocked = true;

    const q = questions[type];
    npcName.textContent = q.name;

    textContent.innerHTML = `
        <strong>${q.text}</strong>
        <div class="question-options">
            ${q.options.map((option, i) =>
                `<button type="button" class="answer-btn" data-answer="${i}">${option}</button>`
            ).join("")}
        </div>
    `;

    dialogBox.hidden = false;

    document.querySelectorAll(".answer-btn").forEach(btn => {
        btn.addEventListener("click", () => answerQuestion(Number(btn.dataset.answer)));
    });
}

function answerQuestion(answer) {
    const q = questions[currentChallenge];

    if (answer === q.correct) {
        if (currentChallenge === "fox") animals.fox.answered = true;
        if (currentChallenge === "camel") animals.camel.answered = true;
        if (currentChallenge === "lizard") animals.lizard.answered = true;
        if (currentChallenge === "final") finalArea.answered = true;

        dialogBox.hidden = true;
        dialogueLocked = false;
        showMessage(q.success);
        currentChallenge = null;
    } else {
        textContent.insertAdjacentHTML(
            "beforeend",
            `<div class="hint">💡 Pista: pense nas estratégias fisiológicas para sobreviver ao calor e pouca água!</div>`
        );
    }
}

closeDialog.addEventListener("click", () => {
    if (currentChallenge) return;
    dialogBox.hidden = true;
    dialogueLocked = false;
});

function updateHud() {
    livesEl.textContent = "♥".repeat(lives) + "♡".repeat(3 - lives);
    jumpsEl.textContent = `${player.jumpsLeft} / ${player.maxJumps}`;

    const progress = Math.min(100, Math.max(0, (player.x / 7800) * 100));
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.floor(progress)}%`;
}

function render(time) {
    const width = W();
    const height = H();

    ctx.clearRect(0, 0, width, height);
    drawSky(width, height, time);

    const shakeX = world.shake ? (Math.random() - .5) * world.shake : 0;
    const shakeY = world.shake ? (Math.random() - .5) * world.shake : 0;

    ctx.save();
    ctx.translate(-world.cameraX + shakeX, shakeY);

    drawFarDunes(time, height);
    drawWorldGround(height);
    drawPlatforms(time);
    drawOasisAndCave(height);
    drawHazards(time);
    drawRocks();
    drawScorpions(time);
    drawAnimals(time);
    drawFinalArea(time);
    drawCheckpointFlags();
    drawPlayer(time);

    ctx.restore();

    drawParticles();
    drawVignette(width, height);
}

// CÉU: Ensolarado de Deserto
function drawSky(width, height, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#fbc02d");
    gradient.addColorStop(0.4, "#fdd835");
    gradient.addColorStop(1, "#fff59d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (const cloud of clouds) {
        drawCloud(cloud.x - world.cameraX * .18, cloud.y, cloud.s);
    }
}

function drawCloud(x, y, s) {
    if (x < -180 || x > W() + 180) return;
    ctx.beginPath();
    ctx.arc(x, y, 20 * s, Math.PI, 0);
    ctx.arc(x + 24 * s, y - 10 * s, 25 * s, Math.PI, 0);
    ctx.arc(x + 55 * s, y, 18 * s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
}

// DUNAS DE AREIA AO FUNDO (Fiel ao Deserto)
function drawFarDunes(time, height) {
    const base = height * 0.68;

    ctx.fillStyle = "#e0a96d";
    ctx.beginPath();
    ctx.moveTo(-100, height);
    for (let x = -100; x <= W() + 200; x += 40) {
        const worldX = x + world.cameraX * 0.2;
        const y = base - 35 + Math.sin(worldX / 140) * 35 + Math.cos(worldX / 70) * 15;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(W() + 200, height);
    ctx.closePath();
    ctx.fill();
}

// AREIA MOVEDIÇA / DUNAS INFERIORES
function drawWorldGround(height) {
    const sandY = Math.min(height - 80, 545);

    ctx.fillStyle = "#c28d4b";
    ctx.fillRect(-100, sandY, world.width + 300, height + 200);

    ctx.fillStyle = "#d49e5b";
    ctx.fillRect(-100, sandY - 4, world.width + 300, 5);
}

// OÁSIS E ENTRADA DA CAVERNA (Roteiro)
function drawOasisAndCave(height) {
    // Oásis próximo ao camelo (x ~ 3700 - 4100)
    ctx.fillStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.ellipse(3950, 510, 140, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Palmeira no oásis
    ctx.fillStyle = "#795548";
    ctx.fillRect(3840, 420, 16, 90);
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.arc(3848, 415, 35, 0, Math.PI * 2);
    ctx.fill();

    // Entrada da Caverna (x ~ 4700 - 5100)
    ctx.fillStyle = "#3e2723";
    ctx.beginPath();
    ctx.arc(4880, 510, 75, Math.PI, 0);
    ctx.fill();
}

// PLATAFORMAS DE AREIA E PEDRA
function drawPlatforms(time) {
    for (const p of platforms) {
        const gradient = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
        gradient.addColorStop(0, "#edd6b1");
        gradient.addColorStop(1, "#c9a675");

        ctx.fillStyle = "rgba(0,0,0,.15)";
        roundRect(p.x + 8, p.y + 9, p.w, p.h, 8);
        ctx.fill();

        ctx.fillStyle = gradient;
        roundRect(p.x, p.y, p.w, p.h, 7);
        ctx.fill();

        ctx.fillStyle = "#faf0d9";
        roundRect(p.x, p.y, p.w, 6, 5);
        ctx.fill();
    }
}

function drawHazards(time) {
    for (const h of hazards) {
        if (h.type === "cactus") drawCactus(h.x, h.y, time);
        else drawRock(h.x, h.y);
    }
}

function drawCactus(x, y, time) {
    ctx.save();
    ctx.translate(x, y + Math.sin(time / 500 + x) * 1);
    ctx.fillStyle = "#2e7d32";
    roundRect(15, 0, 14, 34, 7); ctx.fill();
    roundRect(2, 10, 12, 8, 5); ctx.fill();
    roundRect(28, 17, 12, 8, 5); ctx.fill();
    ctx.restore();
}

function drawRock(x, y) {
    ctx.fillStyle = "#795548";
    ctx.beginPath();
    ctx.moveTo(x, y + 33);
    ctx.lineTo(x + 8, y + 8);
    ctx.lineTo(x + 26, y);
    ctx.lineTo(x + 45, y + 10);
    ctx.lineTo(x + 40, y + 33);
    ctx.closePath();
    ctx.fill();
}

function drawRocks() {
    for (const r of rocks) {
        if (!r.active || r.y < -100) continue;

        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.y / 100);
        ctx.fillStyle = "#6d4c41";
        ctx.beginPath();
        ctx.arc(0, 0, r.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawScorpions(time) {
    for (const s of scorpions) {
        if (!s.active) continue;

        ctx.save();
        ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
        ctx.scale(s.chase ? 1.15 : 1, 1.15);

        ctx.fillStyle = "#3e2723";
        ctx.beginPath();
        ctx.ellipse(0, 4, 19, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#bf360c";
        ctx.beginPath();
        ctx.arc(0, -2, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#3e2723";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -7, 20, Math.PI, Math.PI * 1.75);
        ctx.stroke();

        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.moveTo(i * 12, 0);
            ctx.lineTo(i * 24, -10);
            ctx.lineTo(i * 28, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function drawAnimals(time) {
    drawAnimal("🦊", animals.fox.x, animals.fox.y, time, animals.fox.triggered);
    drawAnimal("🐪", animals.camel.x, animals.camel.y, time, animals.camel.triggered);
    drawAnimal("🦎", animals.lizard.x, animals.lizard.y, time, animals.lizard.triggered);

    if (animals.fox.answered) drawCheck(animals.fox.x + 28, animals.fox.y - 10);
    if (animals.camel.answered) drawCheck(animals.camel.x + 28, animals.camel.y - 10);
    if (animals.lizard.answered) drawCheck(animals.lizard.x + 28, animals.lizard.y - 10);
}

function drawAnimal(emoji, x, y, time, active) {
    const bob = Math.sin(time / 300 + x) * 3;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.font = "64px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(emoji, 0, 0);

    if (active) {
        ctx.fillStyle = "rgba(255,238,150,.18)";
        ctx.beginPath();
        ctx.arc(0, -38, 45 + Math.sin(time / 250) * 4, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawCheck(x, y) {
    ctx.fillStyle = "#64d39a";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b1a13";
    ctx.font = "900 13px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✓", x, y);
}

function drawFinalArea(time) {
    if (phaseState === "final" || phaseState === "fragment" || phaseState === "exit") {
        ctx.fillStyle = "rgba(255,210,90,.12)";
        ctx.fillRect(finalArea.x - 50, 340, 650, 170);

        ctx.fillStyle = "#f4ca67";
        ctx.font = "900 13px Inter";
        ctx.textAlign = "center";
        ctx.fillText("DESAFIO FINAL DA FASE", finalArea.x + 260, 335);
    }

    if (!finalArea.fragmentTaken) {
        const x = 7040;
        const y = 425;
        const pulse = Math.sin(time / 260) * 6;

        ctx.save();
        ctx.translate(x, y + pulse);

        const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 65);
        glow.addColorStop(0, "rgba(255,112,67,.8)");
        glow.addColorStop(1, "rgba(255,112,67,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 65, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ff7043";
        drawDiamond(0, 0, 23);
        ctx.fill();

        ctx.fillStyle = "#f0b84e";
        ctx.font = "900 11px Inter";
        ctx.textAlign = "center";
        ctx.fillText("FRAGMENTO DO CALOR", 0, -38);
        ctx.restore();
    }

    ctx.strokeStyle = "#64d39a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(7700, 430, 42, 66, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#a7ffd1";
    ctx.font = "900 11px Inter";
    ctx.textAlign = "center";
    ctx.fillText("SAÍDA DA FASE 1", 7700, 350);
}

function drawCheckpointFlags() {
    for (let i = 1; i < checkpoints.length; i++) {
        const cp = checkpoints[i];
        ctx.fillStyle = "rgba(31,30,25,.8)";
        ctx.fillRect(cp.x, cp.y - 70, 3, 70);
        ctx.fillStyle = i <= checkpoint ? "#72d69a" : "#d8a15a";
        ctx.beginPath();
        ctx.moveTo(cp.x + 3, cp.y - 68);
        ctx.lineTo(cp.x + 38, cp.y - 57);
        ctx.lineTo(cp.x + 3, cp.y - 47);
        ctx.closePath();
        ctx.fill();
    }
}

function drawPlayer(time) {
    if (player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0) return;

    const moving = Math.abs(player.vx) > 30 && player.grounded;
    const bob = moving ? Math.sin(player.walkTime) * 3 : 0;
    const stretch = 1 + player.squash;
    const squashX = 2 - stretch;

    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h);
    ctx.fillStyle = "rgba(20,12,7,.3)";
    ctx.beginPath();
    ctx.ellipse(0, 3, 28 + Math.abs(player.vx) / 35, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(player.facing, 1);
    ctx.translate(0, bob);
    ctx.scale(squashX, stretch);

    if (selectedCharacter.type === "image" && leoImage.complete && leoImage.naturalWidth) {
        ctx.drawImage(leoImage, -40, -78, 80, 80);
    } else {
        ctx.font = "62px 'Segoe UI Emoji'";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(selectedCharacter.emoji, 0, 0);
    }

    ctx.restore();
}

function spawnDust(x, y, amount = 4) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - .5) * 80,
            vy: -Math.random() * 70,
            size: 2 + Math.random() * 3,
            life: .35 + Math.random() * .25,
            maxLife: .6,
            color: "rgba(255,225,166,.75)"
        });
    }
}

function spawnBurst(x, y, danger = false) {
    for (let i = 0; i < (danger ? 24 : 16); i++) {
        particles.push({
            x, y,
            vx: (Math.random() - .5) * 250,
            vy: (Math.random() - .5) * 250,
            size: 2 + Math.random() * 4,
            life: .5 + Math.random() * .5,
            maxLife: 1,
            color: danger ? "#ff6338" : "#ffe07c"
        });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 400 * dt;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - world.cameraX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawVignette(width, height) {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, height * .2, width / 2, height / 2, width * .75);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,.28)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function showMessage(text) {
    messageEl.textContent = text;
    messageEl.classList.add("show");
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => messageEl.classList.remove("show"), 2200);
}

function setJump() {
    if (!gameRunning || dialogueLocked) return;
    keys.jumpQueued = true;
}

function setKeyFromEvent(e, down) {
    const code = e.code;
    const key = e.key.toLowerCase();

    if (code === "KeyA" || key === "a" || code === "ArrowLeft" || key === "arrowleft") keys.left = down;
    if (code === "KeyD" || key === "d" || code === "ArrowRight" || key === "arrowright") keys.right = down;

    if (down && (
        code === "KeyW" || key === "w" ||
        code === "ArrowUp" || key === "arrowup" ||
        code === "Space" || key === " "
    )) setJump();

    if (
        code === "KeyA" || code === "KeyD" ||
        code === "ArrowLeft" || code === "ArrowRight" ||
        code === "KeyW" || code === "ArrowUp" || code === "Space"
    ) e.preventDefault();
}

window.addEventListener("keydown", e => setKeyFromEvent(e, true), { passive: false });
window.addEventListener("keyup", e => setKeyFromEvent(e, false), { passive: false });

window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;
    keys.jumpQueued = false;
});

function bindTouch(id, onPress, onRelease) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("pointerdown", e => {
        e.preventDefault();
        el.setPointerCapture?.(e.pointerId);
        onPress();
    });

    el.addEventListener("pointerup", e => {
        e.preventDefault();
        onRelease?.();
    });

    el.addEventListener("pointercancel", () => onRelease?.());
}

bindTouch("btn-left", () => keys.left = true, () => keys.left = false);
bindTouch("btn-right", () => keys.right = true, () => keys.right = false);
bindTouch("btn-jump", () => setJump(), () => {});

document.querySelectorAll(".character-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".character-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        selectedCharacter.name = card.dataset.name;
        selectedCharacter.type = card.dataset.type;
        selectedCharacter.emoji = card.dataset.emoji || "🏃";
    });
});

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    gameOver.hidden = true;
    startGame();
});

victoryRestart.addEventListener("click", () => {
    victory.hidden = true;
    startGame();
});

journalBtn.addEventListener("click", () => journalModal.hidden = false);
closeJournal.addEventListener("click", () => journalModal.hidden = true);

journalModal.addEventListener("click", e => {
    if (e.target === journalModal) journalModal.hidden = true;
});

fullscreenBtn.addEventListener("click", async () => {
    try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
    } catch {}
});

window.addEventListener("resize", resizeCanvas);

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function drawDiamond(cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * .7, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size * .7, cy);
    ctx.closePath();
}

function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}
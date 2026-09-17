let selectedCharacter = null;
let isPaused = false;

/* =========================================================
   SISTEMA DE TELA CHEIA E PAUSE
   ========================================================= */
function enableFullscreen() {
  const docEl = document.documentElement;

  if (docEl.requestFullscreen) {
    docEl.requestFullscreen();
  } else if (docEl.webkitRequestFullscreen) {
    docEl.webkitRequestFullscreen();
  }

  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

function setupAutoFullscreen() {
  const enterFullscreenOnFirstInteraction = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      enableFullscreen();
    }
    window.removeEventListener('click', enterFullscreenOnFirstInteraction);
    window.removeEventListener('keydown', enterFullscreenOnFirstInteraction);
    window.removeEventListener('touchstart', enterFullscreenOnFirstInteraction);
  };

  window.addEventListener('click', enterFullscreenOnFirstInteraction);
  window.addEventListener('keydown', enterFullscreenOnFirstInteraction);
  window.addEventListener('touchstart', enterFullscreenOnFirstInteraction);
}

function setupPauseOnExitFullscreen() {
  const handleFullscreenChange = () => {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

    if (!isFullscreen) {
      triggerPauseGame('Jogo Pausado: Tela cheia desativada');
    }
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      triggerPauseGame('Jogo Pausado: Você saiu da aba');
    }
  });
}

function triggerPauseGame(reason = 'Jogo Pausado') {
  const canvasContainer = document.getElementById('canvas-container');
  if (isPaused || canvasContainer.classList.contains('hidden')) return;

  isPaused = true;

  let pauseOverlay = document.getElementById('pause-overlay');
  
  if (!pauseOverlay) {
    const pauseHTML = `
      <div id="pause-overlay" class="splash-screen" style="z-index: 300; opacity: 1;">
        <div class="splash-card">
          <h1 class="splash-title">⏸️ JOGO PAUSADO</h1>
          <p id="pause-reason" class="splash-subtitle" style="margin-bottom: 10px;"></p>
          <button class="fullscreen-btn" onclick="resumeGame()">
            ▶️ CONTINUAR (TELA CHEIA)
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', pauseHTML);
    pauseOverlay = document.getElementById('pause-overlay');
  } else {
    pauseOverlay.classList.remove('hidden');
    pauseOverlay.style.opacity = '1';
  }

  const reasonElement = document.getElementById('pause-reason');
  if (reasonElement) reasonElement.innerText = reason;
}

function resumeGame() {
  const pauseOverlay = document.getElementById('pause-overlay');
  if (pauseOverlay) {
    pauseOverlay.classList.add('hidden');
  }

  isPaused = false;
  enableFullscreen();
}

/* =========================================================
   FLUXO PRINCIPAL: SPLASH -> LOGIN -> LOBBY
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  setupAutoFullscreen();
  setupPauseOnExitFullscreen();

  const splashScreen = document.getElementById('splash-screen');
  const cactusFill = document.getElementById('splash-cactus-fill');
  const statusElement = document.getElementById('splash-loading-status');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  const loginScreen = document.getElementById('loginScreen');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const displayUsername = document.getElementById('displayUsername');
  const submitBtn = document.getElementById('submitBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Ajusta animação das barrinhas de estatísticas
  document.querySelectorAll('.stat-bar-fill').forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.setProperty('--target-width', targetWidth);
  });

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && fullscreenBtn) {
    fullscreenBtn.classList.remove('hidden');
  }

  // 1. ANIMAÇÃO DE CARREGAMENTO INICIAL (SPLASH SCREEN)
  const totalDuration = 3000;
  const intervalTime = 40;
  let elapsedTime = 0;

  const initialInterval = setInterval(() => {
    elapsedTime += intervalTime;
    const percentage = Math.min(Math.round((elapsedTime / totalDuration) * 100), 100);

    if (cactusFill) cactusFill.style.height = percentage + '%';
    if (statusElement) statusElement.innerText = `Iniciando jogo (${percentage}%)...`;

    if (percentage >= 100) {
      clearInterval(initialInterval);

      if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
          splashScreen.style.display = 'none';

          // Verificar se o usuário já tem login salvo no localStorage
          const savedUsername = localStorage.getItem('aventura_username');
          if (savedUsername) {
            displayUsername.innerText = savedUsername;
            openLobby();
          } else {
            loginScreen.classList.remove('hidden');
          }
        }, 400);
      }
    }
  }, intervalTime);

  // 2. SISTEMA DE LOGIN E SALVAMENTO (localStorage)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    if (!username) return;

    submitBtn.style.opacity = '0.7';
    submitBtn.innerText = 'CRIANDO...';

    localStorage.setItem('aventura_username', username);

    setTimeout(() => {
      displayUsername.innerText = username;
      loginScreen.classList.add('hidden');
      openLobby();

      submitBtn.style.opacity = '1';
      submitBtn.innerText = 'CONFIRMAR PERFIL!';
    }, 600);
  });

  // 3. SISTEMA DE LOGOUT / TROCAR CONTA
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('aventura_username');
      usernameInput.value = '';

      // Oculta o Lobby
      document.querySelector('.top-hud').classList.add('hidden');
      document.getElementById('character-select-screen').classList.add('hidden');
      document.querySelector('.bottom-hud').classList.add('hidden');

      // Exibe a tela de Login
      loginScreen.classList.remove('hidden');
    });
  }
});

/* Função para Abrir o Lobby e Animar os Cards */
function openLobby() {
  document.querySelector('.top-hud').classList.remove('hidden');
  document.getElementById('character-select-screen').classList.remove('hidden');
  document.querySelector('.bottom-hud').classList.remove('hidden');

  setTimeout(() => {
    document.querySelectorAll('.stats-container').forEach(container => {
      container.classList.add('stats-animated');
    });
  }, 300);
}

/* =========================================================
   SELEÇÃO DE PERSONAGEM E INÍCIO DE FASE
   ========================================================= */
function chooseCharacter(name, color, imagePath, event) {
  selectedCharacter = { name, color, imagePath };

  const cards = document.querySelectorAll('.card-character');
  cards.forEach(card => card.classList.remove('selected'));

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('selected');
  }

  const nameHud = document.getElementById('hud-character-name');
  if (nameHud) {
    nameHud.style.opacity = '0';
    nameHud.style.transform = 'translateY(-5px)';
    
    setTimeout(() => {
      nameHud.innerText = name.toUpperCase();
      nameHud.style.opacity = '1';
      nameHud.style.transform = 'translateY(0)';
    }, 150);
  }

  const startBtn = document.getElementById('start-btn');
  startBtn.classList.remove('disabled');
  startBtn.disabled = false;
}

function confirmStart() {
  if (!selectedCharacter) return;

  const loadingHTML = `
    <div id="loading-screen" class="splash-screen" style="z-index: 150; opacity: 1;">
      <div class="splash-card">
        <h1 class="splash-title">ENTRANDO NO DESERTO...</h1>
        <p class="splash-subtitle" style="text-transform: uppercase;">💡 Mantenha a hidratação e busque pontos de sombra!</p>
        <div class="cactus-loading-container">
          <div class="cactus-wrapper">
            <span class="cactus-bg">🌵</span>
            <div id="progress-cactus-fill" class="cactus-fill">
              <span class="cactus-fg">🌵</span>
            </div>
          </div>
          <div id="loading-status" class="splash-loading-status">Carregando ecossistema (0%)...</div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', loadingHTML);

  const duration = 3000;
  const intervalTime = 40;
  let elapsedTime = 0;

  const progressInterval = setInterval(() => {
    elapsedTime += intervalTime;
    const percentage = Math.min(Math.round((elapsedTime / duration) * 100), 100);

    const fillElement = document.getElementById('progress-cactus-fill');
    const statusElement = document.getElementById('loading-status');

    if (fillElement) fillElement.style.height = percentage + '%';
    if (statusElement) statusElement.innerText = `Carregando ecossistema (${percentage}%)...`;

    if (elapsedTime >= duration) {
      clearInterval(progressInterval);

      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.remove();

          document.getElementById('character-select-screen').classList.add('hidden');
          document.querySelector('.top-hud').classList.add('hidden');
          document.querySelector('.bottom-hud').classList.add('hidden');

          startPhase1();
        }, 400);
      }
    }
  }, intervalTime);
}

function startPhase1() {
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.classList.remove('hidden');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#e7a858';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00a8f8';
  ctx.beginPath();
  ctx.arc(480, 320, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#503018';
  ctx.fillRect(430, 180, 100, 50);

  ctx.fillStyle = selectedCharacter.color;
  ctx.fillRect(50, 570, 24, 24);

  ctx.fillStyle = '#000000';
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText('FASE 1: DESERTO', 20, 40);
}
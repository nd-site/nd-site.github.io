// Ô ĂN QUAN - PROFESSIONAL V4.5 ULTIMATE
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- PREMIUM COLORS ---
const COLORS = {
    bg: '#0f172a',
    p1: '#ef4444',
    p2: '#3b82f6',
    board: '#1e293b',
    pit: '#0f172a',
    pitActive: '#1e293b',
    text: '#ffffff',
    stone: '#f8fafc',
    quan: '#fbbf24', // Gold
    accent: '#6366f1'
};

// --- CORE STATE ---
let user = { id: "", lastViolation: 0 };
let board = [10, 5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5];
let pState = { scores: { p1: 0, p2: 0 }, current: 1 };
let game = {
    roomID: null,
    mode: 'lobby',
    isOnline: false,
    side: 1,
    animating: false,
    hovered: -1,
    gameOver: false,
    targetJoinID: null
};
let lastMoveTime = 0;
let cellRects = {};

// --- INITIALIZATION ---
function init() {
    const savedID = localStorage.getItem('nd_quan_id');
    if (savedID) {
        user.id = savedID;
        showPage('lobbyPage');
        document.getElementById('userGreeting').innerText = `ID: ${user.id}`;
        connectFirebase();
        fetchGlobalRooms();
    } else {
        showPage('authPage');
    }
    initLayout();
    window.addEventListener('resize', initLayout);
    requestAnimationFrame(renderLoop);
}

function showPage(pid) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
    const target = document.getElementById(pid);
    if (target) { target.style.display = 'flex'; target.classList.add('active'); target.scrollTop = 0; }
}

function login() {
    const id = document.getElementById('playerIDInput').value.trim().toUpperCase();
    if (!id) return alert("Vui lòng nhập ID!");
    localStorage.setItem('nd_quan_id', id);
    window.location.reload();
}

function logout() {
    localStorage.removeItem('nd_quan_id');
    window.location.reload();
}

function initLayout() {
    // Dynamic scaling for canvas
    const bw = 700, bh = 220;
    const bx = (canvas.width - bw) / 2, by = (canvas.height - bh) / 2;

    // Quan pits (Ovals)
    cellRects[0] = { x: bx - 110, y: by, w: 110, h: bh, type: 'quan' };
    cellRects[6] = { x: bx + bw, y: by, w: 110, h: bh, type: 'quan' };

    // Side pits
    for (let i = 1; i <= 5; i++) {
        cellRects[i] = { x: bx + (i - 1) * (bw / 5), y: by + bh / 2, w: bw / 5, h: bh / 2, type: 'p1' };
    }
    for (let i = 7; i <= 11; i++) {
        cellRects[i] = { x: bx + (11 - i) * (bw / 5), y: by, w: bw / 5, h: bh / 2, type: 'p2' };
    }
}

// --- RENDERING ---
function renderLoop() {
    draw();
    requestAnimationFrame(renderLoop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sync UI
    const s1 = document.getElementById('p1Score'), s2 = document.getElementById('p2Score');
    const b1 = document.getElementById('scoreBoxP1'), b2 = document.getElementById('scoreBoxP2');
    if (s1) s1.innerText = pState.scores.p1;
    if (s2) s2.innerText = pState.scores.p2;
    if (b1) b1.style.borderColor = (pState.current === 1) ? COLORS.p1 : 'transparent';
    if (b2) b2.style.borderColor = (pState.current === 2) ? COLORS.p2 : 'transparent';

    // Board Base
    ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.fillStyle = COLORS.board;
    ctx.roundRect((canvas.width - 760) / 2, (canvas.height - 240) / 2, 760, 240, 40);
    ctx.fill(); ctx.shadowBlur = 0;

    for (let i = 0; i < 12; i++) {
        const r = cellRects[i];
        const isHover = (i === game.hovered && !game.animating);
        const isActiveSide = (pState.current === 1 && r.type === 'p1') || (pState.current === 2 && r.type === 'p2');

        ctx.save();
        if (r.type === 'quan') {
            // Draw Quan Pits
            ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, 48, 108, 0, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.pit; ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = isHover ? COLORS.quan : 'rgba(255,255,255,0.05)';
            ctx.stroke();
        } else {
            // Draw Regular Pits
            ctx.fillStyle = isActiveSide ? (r.type === 'p1' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)') : COLORS.pit;
            if (isHover) ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.roundRect(r.x + 8, r.y + 8, r.w - 16, r.h - 16, 20);
            ctx.fill();
            ctx.lineWidth = isActiveSide ? 3 : 1;
            ctx.strokeStyle = isActiveSide ? (r.type === 'p1' ? COLORS.p1 : COLORS.secondary) : 'rgba(255,255,255,0.05)';
            ctx.stroke();
        }

        // Draw Number & Stones
        ctx.fillStyle = board[i] > 0 ? COLORS.text : 'rgba(255,255,255,0.1)';
        ctx.font = '800 28px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(board[i], r.x + r.w / 2, r.y + r.h / 2 + 10);

        // Visual stones (cluster)
        drawStones(r, i, board[i]);
        ctx.restore();
    }

    // Draw Floating Hand during animation
    if (animationState.handVisible && animationState.handCount > 0) {
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(255,255,255,0.5)';
        ctx.fillStyle = COLORS.stone;
        for (let i = 0; i < Math.min(animationState.handCount, 10); i++) {
            const ox = Math.cos(i * 0.8) * 12;
            const oy = Math.sin(i * 0.8) * 12;
            ctx.beginPath();
            ctx.arc(animationState.handX + ox, animationState.handY + oy - 40, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = COLORS.text;
        ctx.font = '700 14px "Plus Jakarta Sans"';
        ctx.fillText(animationState.handCount, animationState.handX, animationState.handY - 60);
        ctx.restore();
    }
}

function drawStones(r, idx, count) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const stonesToDraw = Math.min(count, 12);
    for (let i = 0; i < stonesToDraw; i++) {
        const angle = (i / stonesToDraw) * Math.PI * 2 + (idx * 0.5);
        const dist = 32 + (i % 3) * 4;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = (idx === 0 || idx === 6) ? COLORS.quan : COLORS.stone;
        if (idx === 0 || idx === 6) {
            ctx.shadowBlur = 10; ctx.shadowColor = COLORS.quan;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// --- GAME LOGIC ---
let animationState = { handX: 0, handY: 0, handVisible: false, handCount: 0 };

async function distribute(startIdx, direction, sync = true) {
    if (game.animating) return;
    game.animating = true;

    if (game.isOnline && sync) {
        db.ref('rooms/' + game.roomID + '/moveEvent').set({
            startIdx, direction, actor: user.id, board: [...board], timestamp: Date.now()
        });
    }

    let hand = board[startIdx];
    board[startIdx] = 0;
    animationState.handCount = hand;
    animationState.handVisible = true;

    let current = startIdx;
    const get_next = idx => (direction === 'CW') ? (idx + 1) % 12 : (idx - 1 + 12) % 12;

    while (true) {
        while (hand > 0) {
            current = get_next(current);
            const targetCell = cellRects[current];
            // Move "hand" to target cell
            animationState.handX = targetCell.x + targetCell.w / 2;
            animationState.handY = targetCell.y + targetCell.h / 2;

            await sleep(250); // Travel time
            board[current]++;
            hand--;
            animationState.handCount = hand;
            await sleep(100); // Drop time
        }

        let nxt = get_next(current);
        if (board[nxt] > 0 && nxt !== 0 && nxt !== 6) {
            await sleep(300); // Thinking/Picking time
            hand = board[nxt];
            board[nxt] = 0;
            animationState.handCount = hand;
            current = nxt;
            continue;
        } else break;
    }

    animationState.handVisible = false;

    // Capture loop
    while (true) {
        let a = get_next(current), a2 = get_next(a);
        if (a !== 0 && a !== 6 && board[a] === 0 && board[a2] > 0) {
            let captured = board[a2];
            if (pState.current === 1) pState.scores.p1 += captured; else pState.scores.p2 += captured;
            board[a2] = 0; current = a2;
            await sleep(600);
            continue;
        } else break;
    }

    pState.current = (pState.current === 1) ? 2 : 1;
    checkRefill();
    checkGameOver();
    game.animating = false;
    if (game.isOnline && sync) syncFull();
}

function checkRefill() {
    let side = pState.current === 1 ? [1, 2, 3, 4, 5] : [7, 8, 9, 10, 11];
    if (side.every(idx => board[idx] === 0)) {
        let score = pState.current === 1 ? pState.scores.p1 : pState.scores.p2;
        if (score >= 5) {
            side.forEach(idx => board[idx] = 1);
            if (pState.current === 1) pState.scores.p1 -= 5; else pState.scores.p2 -= 5;
        } else finishGame();
    }
}

function checkGameOver() { if (board[0] === 0 && board[6] === 0) finishGame(); }

function finishGame() {
    for (let i = 1; i <= 5; i++) { pState.scores.p1 += board[i]; board[i] = 0; }
    for (let i = 7; i <= 11; i++) { pState.scores.p2 += board[i]; board[i] = 0; }
    game.gameOver = true;
    document.getElementById('winModal').style.display = 'flex';
    document.getElementById('winStatusText').innerText = pState.scores.p1 > pState.scores.p2 ? "P1 CHIẾN THẮNG" : "P2 CHIẾN THẮNG";
}

// --- MULTIPLAYER & MODALS ---
let db;
function connectFirebase() {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp({
            apiKey: "AIzaSyDIHXhqSNYhIIozxC5dZ-mTcfXAPzPZgog",
            authDomain: "ndlabs-0.firebaseapp.com",
            databaseURL: "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "ndlabs-0"
        });
        db = firebase.database();
    }
}

function openCreateModal() { document.getElementById('createModal').style.display = 'flex'; }
function closeCreateModal() { document.getElementById('createModal').style.display = 'none'; }

function confirmCreate() {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    const config = {
        name: document.getElementById('roomNameInput').value || "Phòng của " + user.id,
        pass: document.getElementById('roomPassInput').value || null,
        public: document.getElementById('publicToggle').checked,
        spectate: document.getElementById('spectateToggle').checked,
        owner: user.id, status: 'waiting', board, scores: { p1: 0, p2: 0 }, current: 1
    };
    db.ref('rooms/' + id).set(config).then(() => {
        game.roomID = id; game.isOnline = true; game.side = 1; game.mode = 'online';
        document.getElementById('currentRoomID').innerText = id;
        showPage('gamePage');
        closeCreateModal();
        listenToRoom();
    });
}

function joinByCode() {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (code) joinRoom(code);
}

function joinRoom(rid) {
    db.ref('rooms/' + rid).once('value', snap => {
        const r = snap.val();
        if (!r) return alert("Phòng không tồn tại!");
        if (r.status !== 'waiting') return alert("Phòng đã bắt đầu hoặc đầy!");

        game.targetJoinID = rid;
        if (r.pass) {
            document.getElementById('passwordModal').style.display = 'flex';
        } else {
            executeJoin(rid);
        }
    });
}

function closePassModal() { document.getElementById('passwordModal').style.display = 'none'; }
function confirmJoinWithPass() {
    const passInput = document.getElementById('roomJoinPassInput').value;
    db.ref('rooms/' + game.targetJoinID).once('value', snap => {
        if (snap.val().pass === passInput) {
            closePassModal();
            executeJoin(game.targetJoinID);
        } else alert("Sai mật khẩu!");
    });
}

function executeJoin(rid) {
    game.roomID = rid; game.isOnline = true; game.side = 2; game.mode = 'online';
    db.ref('rooms/' + rid).update({ status: 'playing', p2: user.id });
    document.getElementById('currentRoomID').innerText = rid;
    showPage('gamePage');
    listenToRoom();
}

function listenToRoom() {
    db.ref('rooms/' + game.roomID).on('value', snap => {
        const d = snap.val(); if (!d || game.animating) return;
        board = d.board; pState.scores = d.scores || { p1: 0, p2: 0 }; pState.current = d.current;

        const turnText = document.getElementById('turnStatus');
        if (turnText) {
            if (pState.current === game.side) {
                turnText.innerText = "LƯỢT CỦA BẠN"; turnText.style.color = "#10b981";
            } else {
                turnText.innerText = `LƯỢT ĐỐI THỦ (P${pState.current})`; turnText.style.color = "var(--accent)";
            }
        }
    });
    db.ref('rooms/' + game.roomID + '/moveEvent').on('value', snap => {
        const m = snap.val();
        if (m && m.actor !== user.id && m.timestamp > lastMoveTime) {
            lastMoveTime = m.timestamp;
            if (m.board) board = [...m.board];
            distribute(m.startIdx, m.direction, false);
        }
    });
}

function syncFull() {
    if (game.isOnline) db.ref('rooms/' + game.roomID).update({ board, scores: pState.scores, current: pState.current });
}

function fetchGlobalRooms() {
    db.ref('rooms').orderByChild('public').equalTo(true).on('value', snap => {
        const list = document.getElementById('publicRooms'); list.innerHTML = '';
        const rooms = snap.val(); if (!rooms) return list.innerHTML = '<p class="empty-msg">Không có phòng công khai...</p>';
        Object.keys(rooms).forEach(rid => {
            const r = rooms[rid]; if (r.status !== 'waiting') return;
            const item = document.createElement('div');
            item.className = 'room-entry';
            item.style = 'background: rgba(255,255,255,0.03); padding: 15px; border-radius: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05);';
            item.innerHTML = `<div><b style="color:var(--accent)">${r.name}</b><br><small style="opacity:0.4">ID: ${r.owner}</small></div>
                <button onclick="joinRoom('${rid}')" class="btn btn-primary" style="padding: 10px 20px; font-size: 13px;">Tham gia</button>`;
            list.appendChild(item);
        });
    });
}

// --- FULLSCREEN ---
function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

// --- INPUTS ---
canvas.addEventListener('mousemove', e => {
    if (game.animating || game.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    game.hovered = -1;
    for (let i = 0; i < 12; i++) {
        const r = cellRects[i]; if (i === 0 || i === 6) continue;
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
            const side = pState.current === 1 ? [1, 2, 3, 4, 5] : [7, 8, 9, 10, 11];
            if (side.includes(i) && board[i] > 0) {
                if (game.isOnline && pState.current !== game.side) continue;
                game.hovered = i;
            }
        }
    }
});

canvas.addEventListener('click', e => {
    if (game.hovered !== -1 && !game.animating && !game.gameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const cell = cellRects[game.hovered];
        let isBottom = (game.hovered >= 1 && game.hovered <= 5);
        let dir = (x < cell.x + cell.w / 2) ? (isBottom ? 'CCW' : 'CW') : (isBottom ? 'CW' : 'CCW');
        distribute(game.hovered, dir);
    }
});

function requestQuit() { if (confirm("Bạn có chắc chắn muốn rời khỏi trận đấu?")) window.location.reload(); }

// Polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2;
        this.beginPath(); this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r);
        this.closePath(); return this;
    };
}

init();

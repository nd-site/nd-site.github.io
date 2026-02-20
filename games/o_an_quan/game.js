// Ô ĂN QUAN - PROFESSIONAL V4.2 CORE
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- COLORS ---
const COLORS = {
    bg: '#0f172a',
    p1: '#ef4444',
    p2: '#3b82f6',
    pit: '#1e293b',
    pitHover: '#334155',
    text: '#f8fafc',
    stone: '#ffffff',
    quan: '#facc15'
};

// --- GLOBAL STATE ---
let user = { id: "", violations: 0, penalty: 0 };
let board = [10, 5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5];
let pState = { scores: { p1: 0, p2: 0 }, current: 1 };
let game = { mode: 'lobby', roomID: null, isOnline: false, side: 1, animating: false, hovered: -1, gameOver: false };
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
    draw();
}

function showPage(pid) {
    // Ẩn tất cả các trang một cách triệt để
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    // Chỉ hiện trang được chỉ định
    const target = document.getElementById(pid);
    if (target) {
        target.style.display = 'flex';
        target.classList.add('active');
        // Cuộn về đầu trang
        target.scrollTop = 0;
    }
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
    const bw = 700, bh = 220;
    const bx = (canvas.width - bw) / 2, by = (canvas.height - bh) / 2;
    // Quan pits
    cellRects[0] = { x: bx - 100, y: by, w: 100, h: bh, type: 'quan' };
    cellRects[6] = { x: bx + bw, y: by, w: 100, h: bh, type: 'quan' };
    // Side pits (Distributed for calculation simplicity)
    for (let i = 1; i <= 5; i++) cellRects[i] = { x: bx + (i - 1) * (bw / 5), y: by + bh / 2, w: bw / 5, h: bh / 2, type: 'p1' };
    for (let i = 7; i <= 11; i++) cellRects[i] = { x: bx + (11 - i) * (bw / 5), y: by, w: bw / 5, h: bh / 2, type: 'p2' };
}

// --- RENDERING ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Kết nối UI điểm số
    const p1S = document.getElementById('p1Score');
    const p2S = document.getElementById('p2Score');
    const b1 = document.getElementById('scoreBoxP1');
    const b2 = document.getElementById('scoreBoxP2');

    if (p1S) p1S.innerText = pState.scores.p1;
    if (p2S) p2S.innerText = pState.scores.p2;

    // Hiệu ứng sáng cho box điểm khi tới lượt
    if (b1) {
        b1.style.borderColor = pState.current === 1 ? COLORS.p1 : 'transparent';
        b1.style.background = pState.current === 1 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)';
        b1.style.boxShadow = pState.current === 1 ? '0 0 30px rgba(239, 68, 68, 0.2)' : 'none';
    }
    if (b2) {
        b2.style.borderColor = pState.current === 2 ? COLORS.p2 : 'transparent';
        b2.style.background = pState.current === 2 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)';
        b2.style.boxShadow = pState.current === 2 ? '0 0 30px rgba(59, 130, 246, 0.2)' : 'none';
    }

    // Vẽ Bàn cờ Premium (Bóng đổ và viền sắc nét)
    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillStyle = COLORS.board;
    // Board rộng hơn chút để ôm trọn các ô
    ctx.roundRect((canvas.width - 740) / 2, (canvas.height - 240) / 2, 740, 240, 40);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 12; i++) {
        const r = cellRects[i];
        let hover = (i === game.hovered && !game.animating);
        let sideActive = (pState.current === 1 && r.type === 'p1') || (pState.current === 2 && r.type === 'p2');

        if (r.type === 'quan') {
            ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, 45, 105, 0, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.pit;
            ctx.fill();
            // Glow cho Quan
            ctx.shadowBlur = (hover) ? 20 : 5;
            ctx.shadowColor = COLORS.quan;
            ctx.strokeStyle = hover ? COLORS.quan : 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            // Hiệu ứng màu theo phe và trạng thái lượt
            if (sideActive) {
                ctx.fillStyle = (r.type === 'p1') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)';
            } else {
                ctx.fillStyle = COLORS.pit;
            }
            if (hover) ctx.fillStyle = (r.type === 'p1') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';

            ctx.roundRect(r.x + 8, r.y + 8, r.w - 16, r.h - 16, 20);
            ctx.fill();

            ctx.strokeStyle = sideActive ? (r.type === 'p1' ? COLORS.p1 : COLORS.p2) : 'rgba(255,255,255,0.05)';
            ctx.lineWidth = sideActive ? 3 : 1;
            ctx.stroke();
        }

        // Hiển thị số quân (Vị trí chuẩn tâm ô)
        ctx.fillStyle = board[i] > 0 ? COLORS.text : 'rgba(255,255,255,0.2)';
        ctx.font = '800 28px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(board[i], r.x + r.w / 2, r.y + r.h / 2 + 10);
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

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
    let current = startIdx;
    const get_next = idx => (direction === 'CW') ? (idx + 1) % 12 : (idx - 1 + 12) % 12;

    while (true) {
        while (hand > 0) {
            current = get_next(current);
            board[current]++; hand--;
            draw(); await sleep(150);
        }
        let nxt = get_next(current);
        if (board[nxt] > 0 && nxt !== 0 && nxt !== 6) {
            hand = board[nxt]; board[nxt] = 0;
            current = nxt; await sleep(400);
            continue;
        } else break;
    }

    // Capture logic
    while (true) {
        let a = get_next(current), a2 = get_next(a);
        if (a !== 0 && a !== 6 && board[a] === 0 && board[a2] > 0) {
            let captured = board[a2];
            if (pState.current === 1) pState.scores.p1 += captured; else pState.scores.p2 += captured;
            board[a2] = 0; current = a2;
            draw(); await sleep(600);
            continue;
        } else break;
    }

    pState.current = (pState.current === 1) ? 2 : 1;
    checkRefill();
    checkGameOver();
    game.animating = false;
    if (game.isOnline && sync) syncFull();
    draw();
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

// --- FIREBASE REDUX ---
const firebaseConfig = {
    apiKey: "AIzaSyDIHXhqSNYhIIozxC5dZ-mTcfXAPzPZgog",
    authDomain: "ndlabs-0.firebaseapp.com",
    databaseURL: "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ndlabs-0",
    databaseURL: "https://ndlabs-0-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let db;
function connectFirebase() {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
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
        game.roomID = id; game.isOnline = true; game.side = 1;
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
        if (!r) return alert("Phòng khong tồn tại!");
        if (r.status !== 'waiting') return alert("Phòng đã bắt đầu!");
        if (r.pass) {
            const p = prompt("Nhập mật khẩu phòng:");
            if (p !== r.pass) return alert("Sai mật khẩu!");
        }
        game.roomID = rid; game.isOnline = true; game.side = 2;
        db.ref('rooms/' + rid).update({ status: 'playing', player2: user.id });
        document.getElementById('currentRoomID').innerText = rid;
        showPage('gamePage');
        listenToRoom();
    });
}

function listenToRoom() {
    db.ref('rooms/' + game.roomID).on('value', snap => {
        const d = snap.val(); if (!d || game.animating) return;
        board = d.board;
        pState.scores = d.scores || { p1: 0, p2: 0 };
        pState.current = d.current;

        const turnText = document.getElementById('turnStatus');
        if (turnText) {
            if (pState.current === game.side) {
                turnText.innerText = "LƯỢT CỦA BẠN";
                turnText.style.color = "#10b981";
            } else {
                turnText.innerText = `LƯỢT ĐỐI THỦ (P${pState.current})`;
                turnText.style.color = "var(--accent)";
            }
        }
        draw();
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
    db.ref('rooms/' + game.roomID).update({ board, scores: pState.scores, current: pState.current });
}

// --- FULLSCREEN ---
function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen();
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
        const r = cellRects[i];
        if (i === 0 || i === 6) continue;
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
            const side = pState.current === 1 ? [1, 2, 3, 4, 5] : [7, 8, 9, 10, 11];
            if (side.includes(i) && board[i] > 0) {
                if (game.isOnline && pState.current !== game.side) continue;
                game.hovered = i;
            }
        }
    }
    draw();
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

function fetchGlobalRooms() {
    db.ref('rooms').orderByChild('public').equalTo(true).on('value', snap => {
        const list = document.getElementById('publicRooms'); list.innerHTML = '';
        const rooms = snap.val(); if (!rooms) return list.innerHTML = '<p style="opacity:0.3;text-align:center;padding:20px;">Không có phòng trống...</p>';
        Object.keys(rooms).forEach(rid => {
            const r = rooms[rid]; if (r.status !== 'waiting') return;
            const item = document.createElement('div');
            item.style = 'padding:14px; background:rgba(255,255,255,0.05); border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;';
            item.innerHTML = `<div><b>${r.name}</b><br><small style="opacity:0.4">Chủ: ${r.owner}</small></div>
                <button onclick="joinRoom('${rid}')" class="btn btn-primary" style="padding:8px 16px; font-size:12px">Ghép</button>`;
            list.appendChild(item);
        });
    });
}

function requestQuit() { if (confirm("Thoát trận ngay bây giờ?")) window.location.reload(); }

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

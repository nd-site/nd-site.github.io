// EduSpace Practice Logic
// Handles game modes, question rendering, and scoring.

const gameData = {
    isRunning: false,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    mode: 'mc-mixed',
    stopCount: 20,
    repeatCount: 0,
    processedCount: 0,
    currentWord: null,
    effectiveMode: '',
    timeLeft: 60,
    timer: null,
    markedForReview: [], // Words marked with Shift+Enter
    isFlashcardFlipped: false
};

// Text-to-Speech function
function speakWord(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Mark current word for later review
function markForReview() {
    if (gameData.currentWord && !gameData.markedForReview.includes(gameData.currentWord)) {
        gameData.markedForReview.push(gameData.currentWord);
        showShortcutFeedback('📌 Đã đánh dấu để ôn lại!');
    }
}

// Show brief feedback for shortcuts
function showShortcutFeedback(message) {
    let feedback = document.getElementById('shortcut-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'shortcut-feedback';
        document.body.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.classList.add('show');
    setTimeout(() => feedback.classList.remove('show'), 1500);
}

// Flip flashcard
function flipFlashcard() {
    const card = document.querySelector('.flashcard');
    if (card) {
        gameData.isFlashcardFlipped = !gameData.isFlashcardFlipped;
        card.classList.toggle('flipped', gameData.isFlashcardFlipped);
        playSound('correct');
    }
}

// Mode Selection Initialization
function initPractice() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            gameData.mode = card.getAttribute('data-mode');
        });
    });

    // Comprehensive Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (!gameData.isRunning) return;

        const feedbackEl = document.getElementById('feedback-area');
        const inputAreaEl = document.getElementById('input-area');
        const isFlashcardMode = gameData.mode === 'flashcards';
        const isFeedbackVisible = feedbackEl && !feedbackEl.classList.contains('hidden');

        // Shift + Enter: Mark for review
        if (e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            markForReview();
            return;
        }

        // Enter: Next question or submit answer
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            if (isFeedbackVisible) {
                nextQuestion();
                return;
            }
            if (isFlashcardMode) {
                nextQuestion();
                return;
            }
            if (inputAreaEl && !inputAreaEl.classList.contains('hidden')) {
                checkInputAnswer();
                return;
            }
        }

        // Arrow Left/Right: Flip flashcard
        if (isFlashcardMode && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            flipFlashcard();
            return;
        }

        // Space: Flip flashcard (alternative)
        if (isFlashcardMode && e.key === ' ' && !isFeedbackVisible) {
            e.preventDefault();
            flipFlashcard();
            return;
        }

        // S key: Speak/pronounce current word
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            if (gameData.currentWord && gameData.currentWord.en) {
                speakWord(gameData.currentWord.en);
                showShortcutFeedback('🔊 Đang phát âm...');
            }
            return;
        }

        // Multiple choice shortcuts (1, 2, 3, 4)
        if (['1', '2', '3', '4'].includes(e.key) && !isFeedbackVisible) {
            const index = parseInt(e.key) - 1;
            const buttons = document.querySelectorAll('#options-area .option-btn');
            if (buttons[index]) {
                buttons[index].click();
            }
        }
    });
}

function startGame() {
    saveData();
    const validVocab = vocabData.filter(v => v.en && v.vi);
    if (validVocab.length < 1) {
        alert('Cần ít nhất 1 từ vựng trong danh sách để bắt đầu luyện tập!');
        return;
    }

    gameData.questions = JSON.parse(JSON.stringify(validVocab));
    gameData.stopCount = gameData.mode === 'speed-run' ? 999 : 20;
    gameData.currentQuestionIndex = 0;
    gameData.score = 0;
    gameData.streak = 0;
    gameData.isRunning = true;
    gameData.processedCount = 0;
    gameData.timeLeft = 60;

    shuffleArray(gameData.questions);

    const gameView = document.getElementById('game-view');
    if (gameView) {
        gameView.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (gameData.mode === 'speed-run') {
        startTimer();
    }

    updateProgress();
    loadQuestion();
}

function startTimer() {
    clearInterval(gameData.timer);
    gameData.timer = setInterval(() => {
        gameData.timeLeft--;
        if (dom.progressText) dom.progressText.textContent = `Thời gian: ${gameData.timeLeft}s | Đúng: ${gameData.score}`;
        if (gameData.timeLeft <= 0) {
            clearInterval(gameData.timer);
            stopGame();
        }
    }, 1000);
}

function stopGame() {
    gameData.isRunning = false;
    clearInterval(gameData.timer);

    // Show results summary modal instead of alert
    const accuracy = gameData.processedCount > 0 ? Math.round((gameData.score / gameData.processedCount) * 100) : 0;

    const summaryModal = document.getElementById('game-summary-modal');
    if (summaryModal) {
        document.getElementById('summary-score').textContent = `${gameData.score}/${gameData.processedCount}`;
        document.getElementById('summary-accuracy').textContent = `${accuracy}%`;
        summaryModal.classList.remove('hidden');
    }
}

function closeSummary() {
    const summaryModal = document.getElementById('game-summary-modal');
    if (summaryModal) summaryModal.classList.add('hidden');

    const gameView = document.getElementById('game-view');
    if (gameView) {
        gameView.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function loadQuestion() {
    if (!gameData.isRunning) return;
    if (gameData.processedCount >= gameData.stopCount) { stopGame(); return; }

    if (gameData.currentQuestionIndex >= gameData.questions.length) {
        gameData.currentQuestionIndex = 0;
        shuffleArray(gameData.questions);
    }

    const currentWord = gameData.questions[gameData.currentQuestionIndex];
    gameData.currentWord = currentWord;
    renderQuestionUI(currentWord);
}

function renderQuestionUI(word) {
    dom.optionsArea.innerHTML = '';
    dom.optionsArea.classList.add('hidden');
    dom.inputArea.classList.add('hidden');
    dom.feedbackArea.classList.add('hidden');
    dom.answerInput.value = '';
    dom.correctAnswerDisplay.classList.add('hidden');
    dom.questionHint.textContent = '';

    let question = '';
    let mode = gameData.mode;

    if (mode === 'mc-mixed' || mode.startsWith('mc-') || mode === 'speed-run') {
        dom.optionsArea.classList.remove('hidden');
    } else if (mode === 'flashcards') {
        dom.optionsArea.classList.remove('hidden');
    } else {
        dom.inputArea.classList.remove('hidden');
        dom.answerInput.focus();
    }

    let effectiveMode = mode === 'mc-mixed'
        ? ['mc-eng-viet', 'mc-viet-eng', 'mc-ipa-viet'][Math.floor(Math.random() * 3)]
        : mode;

    gameData.effectiveMode = effectiveMode;

    // Vivid Colors: Apply random theme to game view
    const themes = ['indigo', 'rose', 'emerald', 'amber'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    document.getElementById('game-view').setAttribute('data-theme', randomTheme);

    switch (effectiveMode) {
        case 'flashcards':
            question = word.en;
            dom.questionHint.textContent = "Nhấp vào phông chữ để xem nghĩa:";
            renderFlashcard(word);
            break;
        case 'mc-eng-viet':
        case 'input-eng-viet':
            question = word.en;
            dom.questionHint.textContent = word.type ? `(${word.type})` : '';
            if (effectiveMode.includes('mc')) generateOptions(word, 'vi');
            break;
        case 'speed-run':
            effectiveMode = 'mc-eng-viet'; // Speed run uses mixed or eng-viet
        case 'mc-viet-eng':
        case 'input-viet-eng':
            question = word.vi;
            if (effectiveMode.includes('mc')) generateOptions(word, 'en');
            break;
        case 'mc-ipa-viet':
        case 'input-ipa-viet':
            question = word.ipa || word.en;
            dom.questionHint.textContent = "Nhìn phiên âm chọn nghĩa:";
            if (effectiveMode.includes('mc')) generateOptions(word, 'vi');
            break;
    }
    dom.questionText.textContent = question;
}

function generateOptions(correctWord, answerKey) {
    const correctValue = (correctWord[answerKey] || '').toLowerCase().trim();
    let potentialDistractors = vocabData.filter(w => {
        const val = (w[answerKey] || '').toLowerCase().trim();
        return val !== '' && val !== correctValue;
    });

    const uniqueDistractors = [];
    const seenValues = new Set([correctValue]);
    shuffleArray(potentialDistractors);

    for (const word of potentialDistractors) {
        const val = word[answerKey].toLowerCase().trim();
        if (!seenValues.has(val)) {
            uniqueDistractors.push(word);
            seenValues.add(val);
        }
        if (uniqueDistractors.length >= 3) break;
    }

    const options = [correctWord, ...uniqueDistractors];
    shuffleArray(options);

    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn group';
        const label = String.fromCharCode(65 + idx); // A, B, C, D
        btn.innerHTML = `
            <span class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">${label}</span>
            <span class="flex-1">${opt[answerKey]}</span>
        `;
        btn.onclick = () => checkMCAnswer(opt, correctWord);
        dom.optionsArea.appendChild(btn);
    });
}

function checkMCAnswer(selected, correct) {
    if (!dom.feedbackArea.classList.contains('hidden')) return;
    const isCorrect = selected === correct;
    handleFeedback(isCorrect);

    const key = gameData.effectiveMode.includes('viet-eng') ? 'en' : 'vi';
    const buttons = dom.optionsArea.querySelectorAll('button');
    buttons.forEach(btn => {
        const btnText = btn.querySelector('.flex-1').textContent;
        if (btnText === correct[key]) btn.classList.add('correct');
        else if (btnText === selected[key] && !isCorrect) btn.classList.add('wrong');
    });
}

function checkInputAnswer() {
    if (!dom.feedbackArea.classList.contains('hidden')) return;
    const input = dom.answerInput.value.trim().toLowerCase();
    const key = gameData.effectiveMode.includes('viet-eng') ? 'en' : 'vi';
    const correctVal = gameData.currentWord[key].toLowerCase();
    const isCorrect = input === correctVal || (input.length > 2 && correctVal.includes(input));
    handleFeedback(isCorrect);
}

function playSound(type) {
    const sound = document.getElementById(`sound-${type}`);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play error:", e));
    }
}

function triggerVisualFeedback(type) {
    const gameView = document.getElementById('game-view');
    gameView.classList.remove('correct-flash', 'wrong-flash');
    void gameView.offsetWidth; // Trigger reflow
    gameView.classList.add(`${type}-flash`);
    setTimeout(() => gameView.classList.remove(`${type}-flash`), 600);
}

function handleFeedback(isCorrect) {
    gameData.processedCount++;
    playSound(isCorrect ? 'correct' : 'wrong');
    triggerVisualFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
        gameData.score++;
        gameData.streak++;
        dom.feedbackMessage.textContent = "Tuyệt vời! +10đ 🎉";
        dom.feedbackMessage.className = "text-3xl font-black text-emerald-500 mb-6";

        if (gameData.mode === 'speed-run') {
            setTimeout(nextQuestion, 400); // Fast transition for speed run
        }
    } else {
        gameData.streak = 0;
        dom.feedbackMessage.textContent = "Ồ, chưa đúng rồi... 😔";
        dom.feedbackMessage.className = "text-3xl font-black text-red-500 mb-6";
        dom.correctAnswerDisplay.classList.remove('hidden');
        const key = gameData.effectiveMode.includes('viet-eng') ? 'en' : 'vi';
        dom.correctText.textContent = gameData.currentWord[key];
    }

    if (gameData.mode !== 'speed-run') {
        dom.feedbackArea.classList.remove('hidden');
    }
    updateProgress();
}

function renderFlashcard(word) {
    dom.optionsArea.classList.remove('hidden');
    dom.optionsArea.innerHTML = '';
    dom.optionsArea.className = "flashcard-container";
    gameData.isFlashcardFlipped = false;

    // Create flashcard wrapper
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'flashcard-wrapper';

    // Create the main card
    const card = document.createElement('div');
    card.className = 'flashcard';

    // Front side (English)
    const front = document.createElement('div');
    front.className = 'flashcard-face flashcard-front';
    front.innerHTML = `
        <span class="flashcard-label">TỪ VỰNG</span>
        <button class="flashcard-speak" onclick="event.stopPropagation(); speakWord('${word.en.replace(/'/g, "\\'")}')">🔊</button>
        <h3 class="flashcard-word">${word.en}</h3>
        <p class="flashcard-type">${word.type || 'noun'}</p>
        <span class="flashcard-hint">← → hoặc Space để lật</span>
    `;

    // Back side (Vietnamese + IPA)
    const back = document.createElement('div');
    back.className = 'flashcard-face flashcard-back';
    back.innerHTML = `
        <span class="flashcard-label">NGHĨA</span>
        <h3 class="flashcard-meaning">${word.vi}</h3>
        <p class="flashcard-ipa">${word.ipa || ''}</p>
        <p class="flashcard-usage">${word.usage || ''}</p>
    `;

    card.appendChild(front);
    card.appendChild(back);
    cardWrapper.appendChild(card);

    cardWrapper.onclick = () => {
        gameData.isFlashcardFlipped = !gameData.isFlashcardFlipped;
        card.classList.toggle('flipped', gameData.isFlashcardFlipped);
        playSound('correct');
    };

    dom.optionsArea.appendChild(cardWrapper);

    // Navigation buttons
    const navContainer = document.createElement('div');
    navContainer.className = 'flashcard-nav';

    // Mark for review button
    const markBtn = document.createElement('button');
    markBtn.className = 'flashcard-mark-btn';
    markBtn.innerHTML = '📌 Đánh dấu';
    markBtn.onclick = (e) => {
        e.stopPropagation();
        markForReview();
    };
    navContainer.appendChild(markBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'flashcard-next-btn';
    nextBtn.innerHTML = 'Tiếp theo <span>→</span>';
    nextBtn.onclick = (e) => {
        e.stopPropagation();
        nextQuestion();
    };
    navContainer.appendChild(nextBtn);

    dom.optionsArea.appendChild(navContainer);

    // Keyboard shortcuts hint
    const shortcutsHint = document.createElement('div');
    shortcutsHint.className = 'shortcuts-hint';
    shortcutsHint.innerHTML = `
        <span><kbd>←</kbd><kbd>→</kbd> Lật thẻ</span>
        <span><kbd>S</kbd> Phát âm</span>
        <span><kbd>Enter</kbd> Tiếp theo</span>
        <span><kbd>Shift</kbd>+<kbd>Enter</kbd> Đánh dấu</span>
    `;
    dom.optionsArea.appendChild(shortcutsHint);
}

function nextQuestion() {
    gameData.currentQuestionIndex++;
    loadQuestion();
}

function updateProgress() {
    if (dom.streakCounter) dom.streakCounter.textContent = `🔥 Chuỗi: ${gameData.streak}`;
    if (dom.progressText) dom.progressText.textContent = `Câu hỏi ${gameData.processedCount}/${gameData.stopCount}`;
    const percent = Math.min((gameData.processedCount / gameData.stopCount) * 100, 100);
    if (dom.progressBar) dom.progressBar.style.width = `${percent}%`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

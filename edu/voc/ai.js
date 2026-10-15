// Helper to get selected languages
function getSelectedLanguages() {
    const targetSelect = document.getElementById('target-lang');
    const translationSelect = document.getElementById('translation-lang');
    return {
        target: targetSelect ? targetSelect.value : 'English',
        translation: translationSelect ? translationSelect.value : 'Vietnamese'
    };
}

// Auto-fill Logic using global eduspaceAI service
async function fillDataWithAI() {
    if (dom.fillAiBtn.disabled) return;

    const itemsToProcess = vocabData
        .map((item, index) => ({ ...item, _id: index }))
        .filter(item => !item.isLocked && ((item.en && item.en.trim()) || (item.vi && item.vi.trim())));

    if (itemsToProcess.length === 0) {
        const originalText = dom.fillAiBtn.textContent;
        dom.fillAiBtn.textContent = '⚠️ Trống hoặc đã khóa';
        setTimeout(() => { if (dom.fillAiBtn) dom.fillAiBtn.textContent = originalText; }, 2000);
        return;
    }

    dom.fillAiBtn.disabled = true;
    const originalBtnText = dom.fillAiBtn.textContent;
    dom.fillAiBtn.textContent = `⏳ Đang xử lý ${itemsToProcess.length} từ...`;

    const langs = getSelectedLanguages();
    const prompt = `
    You are an expert ${langs.target}-${langs.translation} lexicographer.
    Task: Review and complete the missing information for the following vocabulary list. Only fill in missing fields or improve existing fields if they are clearly wrong or incomplete.
    Data List: ${JSON.stringify(itemsToProcess.map(it => ({ id: it._id, en: it.en, vi: it.vi, ipa: it.ipa, type: it.type, usage: it.usage })))}
    Requirements for each entry:
    1. 'en': Correct ${langs.target} word using its native writing script (e.g., 你好 for Chinese, 猫 for Japanese, etc.). Do NOT use pinyin, romaji, or latin transliterations. Only capitalize the first letter if the language supports casing (e.g., English, French, Spanish, German).
    2. 'vi': Accurate ${langs.translation} translation. Only capitalize the first letter if the language supports casing.
    3. 'ipa': Standard IPA transcription or the standard phonetic guide for ${langs.target} (e.g., Pinyin with tone marks for Chinese like 'nǐ hǎo', Romaji/Furigana for Japanese).
    4. 'type': Part of speech (n, v, adj, adv).
    5. 'usage': Example sentence in ${langs.target} (using native writing script) with the ${langs.translation} translation in parentheses.
    Return JSON array of objects with original "id". Raw JSON array only.
    `;

    try {
        const resultText = await window.eduspaceAI.call({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
        });

        const match = resultText.match(/\[[\s\S]*\]/);
        if (match) {
            const results = JSON.parse(match[0]);
            let successCount = 0;
            results.forEach(res => {
                const targetEntry = vocabData[res.id];
                if (targetEntry && !targetEntry.isLocked) {
                    if (res.en) targetEntry.en = autoCapitalize(String(res.en).trim());
                    if (res.vi) targetEntry.vi = autoCapitalize(String(res.vi).trim());
                    if (res.ipa) targetEntry.ipa = String(res.ipa).trim();
                    if (res.type) targetEntry.type = String(res.type).trim();
                    if (res.usage) targetEntry.usage = autoCapitalize(String(res.usage).trim());
                    successCount++;

                    const row = dom.vocabTableBody.querySelector(`tr[data-original-index="${res.id}"]`);
                    if (row) {
                        const inputs = row.querySelectorAll('input, textarea');
                        if (inputs.length >= 5) {
                            inputs[0].value = targetEntry.en;
                            inputs[1].value = targetEntry.ipa;
                            inputs[2].value = targetEntry.type;
                            inputs[3].value = targetEntry.vi;
                            inputs[4].value = targetEntry.usage;
                            inputs.forEach(tx => autoHeight(tx));
                        }
                    }
                }
            });
            localStorage.setItem('eduspace_vocab', JSON.stringify(vocabData));
            dom.fillAiBtn.textContent = `✅ Thành công ${successCount} từ!`;
        } else {
            dom.fillAiBtn.textContent = `❌ Lỗi định dạng AI`;
        }
    } catch (e) {
        dom.fillAiBtn.textContent = `❌ Lỗi kết nối`;
        console.error(e);
    }

    setTimeout(() => {
        if(dom.fillAiBtn) {
            dom.fillAiBtn.textContent = originalBtnText;
            dom.fillAiBtn.disabled = false;
        }
    }, 2000);
}

window.fillSingleRowWithAI = async function (index) {
    const item = vocabData[index];
    if (!item) return;

    if (item.isLocked) {
        alert("Từ này đã bị khóa. Vui lòng bỏ khóa trước khi dùng AI.");
        return;
    }

    const row = dom.vocabTableBody.querySelector(`tr[data-original-index="${index}"]`);
    if (!row) return;

    // Show loading on the button
    const btn = row.querySelector('button[title="Tự động điền AI cho từ này"]');
    const origBtnHTML = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
    btn.disabled = true;

    const langs = getSelectedLanguages();
    const prompt = `
    You are an expert ${langs.target}-${langs.translation} lexicographer.
    Task: Review and complete the missing information for this single vocabulary item.
    Data: ${JSON.stringify({ id: index, en: item.en, vi: item.vi, ipa: item.ipa, type: item.type, usage: item.usage })}
    Requirements:
    1. 'en': Correct ${langs.target} word using its native writing script (e.g., 你好 for Chinese, 猫 for Japanese, etc.). Do NOT use pinyin, romaji, or latin transliterations. Only capitalize the first letter if the language supports casing (e.g., English, French, Spanish, German).
    2. 'vi': Accurate ${langs.translation} translation. Only capitalize the first letter if the language supports casing.
    3. 'ipa': Standard IPA transcription or the standard phonetic guide for ${langs.target} (e.g., Pinyin with tone marks for Chinese like 'nǐ hǎo', Romaji/Furigana for Japanese).
    4. 'type': Part of speech (n, v, adj, adv).
    5. 'usage': Example sentence in ${langs.target} (using native writing script) with the ${langs.translation} translation in parentheses.
    Return a single JSON object. Raw JSON object only, no markdown formatting.
    `;

    try {
        const resultText = await window.eduspaceAI.call({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
        });

        const match = resultText.match(/\{[\s\S]*\}/);
        if (match) {
            const res = JSON.parse(match[0]);
            if (res.en) item.en = autoCapitalize(String(res.en).trim());
            if (res.vi) item.vi = autoCapitalize(String(res.vi).trim());
            if (res.ipa) item.ipa = String(res.ipa).trim();
            if (res.type) item.type = String(res.type).trim();
            if (res.usage) item.usage = autoCapitalize(String(res.usage).trim());

            const inputs = row.querySelectorAll('input, textarea');
            if (inputs.length >= 5) {
                inputs[0].value = item.en;
                inputs[1].value = item.ipa;
                inputs[2].value = item.type;
                inputs[3].value = item.vi;
                inputs[4].value = item.usage;
                inputs.forEach(tx => autoHeight(tx));
            }
            localStorage.setItem('eduspace_vocab', JSON.stringify(vocabData));
            btn.innerHTML = `✅`;
        } else {
            btn.innerHTML = `❌`;
        }
    } catch (e) {
        btn.innerHTML = `❌`;
        console.error(e);
    }

    setTimeout(() => {
        if(btn) {
            btn.innerHTML = origBtnHTML;
            btn.disabled = false;
        }
    }, 2000);
}

window.checkVocabWithAI = async function () {
    if (dom.checkAiBtn.disabled) return;

    const itemsToProcess = vocabData
        .map((item, index) => ({ ...item, _id: index }))
        .filter(item => !item.isLocked && item.en && item.vi); // Only check items that have both En and Vi and are unlocked

    if (itemsToProcess.length === 0) {
        alert('Không có từ vựng nào cần kiểm tra (các từ đã bị khóa hoặc chưa có dữ liệu sẽ bị bỏ qua).');
        return;
    }

    dom.checkAiBtn.disabled = true;
    const originalBtnHTML = dom.checkAiBtn.innerHTML;
    dom.checkAiBtn.innerHTML = `⏳ Đang kiểm tra...`;

    const langs = getSelectedLanguages();
    const prompt = `
    You are an expert ${langs.target} teacher. Review the following vocabulary list to find ERRORS.
    Check if the native ${langs.target} word ('en') matches the ${langs.translation} meaning ('vi'). Also check if the phonetic/IPA ('ipa'), type, and usage are correct.
    For languages like Chinese, Japanese, Korean, 'en' must be written in their native script (e.g., Chinese characters, Kanji, Hangul), and the romanized/transcribed phonetic guide (e.g., Pinyin, Romaji) must go to the 'ipa' field.
    Data List: ${JSON.stringify(itemsToProcess.map(it => ({ id: it._id, en: it.en, vi: it.vi, ipa: it.ipa, type: it.type, usage: it.usage })))}
    Return ONLY a JSON array containing objects for the items that have ERRORS. If all are correct, return an empty array [].
    For items with errors, return:
    { "id": original_id, "en": corrected_en, "vi": corrected_vi, "ipa": corrected_ipa, "type": corrected_type, "usage": corrected_usage, "reason": "brief explanation of the error" }
    Raw JSON array only.
    `;

    try {
        const resultText = await window.eduspaceAI.call({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
        });

        const match = resultText.match(/\[[\s\S]*\]/);
        if (match) {
            const results = JSON.parse(match[0]);
            
            if (results.length === 0) {
                dom.checkAiBtn.innerHTML = `✅ Tất cả đều chính xác!`;
            } else {
                dom.checkAiBtn.innerHTML = `⚠️ Phát hiện ${results.length} lỗi!`;
                
                // Highlight and apply corrections
                results.forEach(res => {
                    const targetEntry = vocabData[res.id];
                    if (targetEntry && !targetEntry.isLocked) {
                        const row = dom.vocabTableBody.querySelector(`tr[data-original-index="${res.id}"]`);
                        if (row) {
                            row.classList.add('bg-red-50'); // Highlight row
                            
                            const inputs = row.querySelectorAll('input, textarea');
                            if (inputs.length >= 5) {
                                // Briefly show reason in a tooltip or console
                                console.log(`Row ${res.id} correction reason: ${res.reason}`);
                                
                                // Auto apply correction
                                if (res.en) { targetEntry.en = res.en; inputs[0].value = res.en; inputs[0].classList.add('text-red-600'); }
                                if (res.ipa) { targetEntry.ipa = res.ipa; inputs[1].value = res.ipa; }
                                if (res.type) { targetEntry.type = res.type; inputs[2].value = res.type; }
                                if (res.vi) { targetEntry.vi = res.vi; inputs[3].value = res.vi; inputs[3].classList.add('text-red-600'); }
                                if (res.usage) { targetEntry.usage = res.usage; inputs[4].value = res.usage; }
                                inputs.forEach(tx => autoHeight(tx));
                            }
                        }
                    }
                });
                localStorage.setItem('eduspace_vocab', JSON.stringify(vocabData));
            }
        } else {
            dom.checkAiBtn.innerHTML = `❌ Lỗi định dạng AI`;
        }
    } catch (e) {
        dom.checkAiBtn.innerHTML = `❌ Lỗi kết nối`;
        console.error(e);
    }

    setTimeout(() => {
        if(dom.checkAiBtn) {
            dom.checkAiBtn.innerHTML = originalBtnHTML;
            dom.checkAiBtn.disabled = false;
        }
        // Remove red highlights after 5 seconds
        document.querySelectorAll('#vocab-table tr.bg-red-50').forEach(r => r.classList.remove('bg-red-50'));
        document.querySelectorAll('#vocab-table .text-red-600').forEach(i => i.classList.remove('text-red-600'));
    }, 5000);
}

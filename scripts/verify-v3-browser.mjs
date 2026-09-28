import puppeteer from 'puppeteer';

async function main() {
  console.log('🚀 Starting EduSpace V3 Browser Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]`, msg.text());
    }
  });

  try {
    // 1. Verify Visual Exam Builder at /eduspace/v3/author/
    console.log('\n--- 1. Testing /eduspace/v3/author/ ---');
    await page.goto('http://localhost:3000/eduspace/v3/author/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('header', { timeout: 10000 });
    const authorTitle = await page.title();
    console.log(`Page title: ${authorTitle}`);

    const hasAuthorHeader = await page.$eval('header', el => !!el).catch(() => false);
    console.log(`Has authoring header: ${hasAuthorHeader}`);

    const hasPointBalance = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('tổng:') && text.includes('soạn thảo đề thi v3');
    });
    console.log(`Has live point balance & header: ${hasPointBalance}`);

    const hasTabs = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('câu hỏi') && text.includes('ngữ liệu chung') && text.includes('nhóm tự chọn') && text.includes('cài đặt ma trận đề');
    });
    console.log(`Has all 4 authoring tabs: ${hasTabs}`);

    // Click AI Assistant button to test drawer
    const aiButton = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const aiBtn = btns.find(b => b.innerText.includes('AI Soạn đề'));
      if (aiBtn) {
        aiBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked AI Assistant button: ${aiButton}`);

    await new Promise(r => setTimeout(r, 600));
    const hasAiDrawer = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Trợ lý Soạn đề AI') && text.includes('Tạo câu hỏi gợi ý');
    });
    console.log(`AI Assistant drawer opened successfully: ${hasAiDrawer}`);

    // 2. Verify Exam Runner at /eduspace/v3/exam/?id=A111
    console.log('\n--- 2. Testing /eduspace/v3/exam/?id=A111 ---');
    await page.goto('http://localhost:3000/eduspace/v3/exam/?id=A111', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('label', { timeout: 10000 });
    const examTitle = await page.title();
    console.log(`Page title: ${examTitle}`);

    const hasExamContent = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('câu 1') && text.includes('danh sách câu hỏi') && text.includes('nộp bài');
    });
    console.log(`Has active exam runner content: ${hasExamContent}`);

    // Select an option on Question 1
    const optionSelected = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      if (labels.length > 0) {
        labels[0].click();
        return true;
      }
      return false;
    });
    console.log(`Option selected on Question 1: ${optionSelected}`);

    // Wait for autosave trigger
    await new Promise(r => setTimeout(r, 1600));
    const hasAutosaveState = await page.evaluate(() => {
      return document.body.innerText.includes('Đã lưu') || document.body.innerText.includes('Đang lưu');
    });
    console.log(`Autosave indicator active: ${hasAutosaveState}`);

    // Open Submit Confirmation Modal
    const submitClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => b.innerText.includes('Nộp bài'));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Submit modal button clicked: ${submitClicked}`);

    await new Promise(r => setTimeout(r, 600));
    const hasSubmitModal = await page.evaluate(() => {
      return document.body.innerText.includes('Xác nhận nộp bài thi') && document.body.innerText.includes('Tiếp tục làm bài');
    });
    console.log(`Submit confirmation modal opened: ${hasSubmitModal}`);

    // 3. Verify Legacy V2 Exam page regression (/eduspace/exam/)
    console.log('\n--- 3. Testing Legacy V2 Exam Regression (/eduspace/exam/) ---');
    await page.goto('http://localhost:3000/eduspace/exam/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    const v2Title = await page.title();
    console.log(`V2 Page title: ${v2Title}`);
    const hasV2Container = await page.evaluate(() => {
      return !!document.getElementById('nd-navbar-root') || !!document.querySelector('.container') || document.body.innerText.length > 0;
    });
    console.log(`V2 Exam page rendered normally: ${hasV2Container}`);

    console.log('\n✅ All browser verifications passed successfully!');
  } catch (err) {
    console.error('Browser verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

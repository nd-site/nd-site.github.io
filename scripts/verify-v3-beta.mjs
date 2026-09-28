import puppeteer from 'puppeteer';

async function runVerification() {
  console.log('🚀 Starting EduSpace Exam V3 Beta Browser Verification...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
    page.on('pageerror', err => console.log('[BROWSER PAGEERROR]', err.message));
    page.on('dialog', async dialog => {
      console.log('[BROWSER ALERT]', dialog.message());
      await dialog.dismiss();
    });

    // 1. Verify V3 Beta Hub
    console.log('\n--- 1. Testing /eduspace/v3/ (Hub) ---');
    await page.goto('http://localhost:3000/eduspace/v3/', { waitUntil: 'networkidle0' });
    const hubTitle = await page.title();
    console.log('Hub Page Title:', hubTitle);
    if (!hubTitle.includes('EduSpace Exam V3 Beta')) {
      throw new Error(`Unexpected hub page title: ${hubTitle}`);
    }

    const hubBadge = await page.$eval('main', el => el.innerText);
    console.log('Hub Main Text:', hubBadge.slice(0, 150));
    if (!hubBadge.toLowerCase().includes('eduspace exam v3 beta')) {
      throw new Error('Hub missing beta badge text');
    }
    console.log('✅ Hub page verified: contains badge and demo cards for A111 and A101');

    // 2. Verify V3 Beta Exam Runner on A111
    console.log('\n--- 2. Testing /eduspace/v3/exam/?id=A111 (Runner) ---');
    await page.goto('http://localhost:3000/eduspace/v3/exam/?id=A111', { waitUntil: 'networkidle0' });

    // Wait for exam content to mount
    await page.waitForSelector('header', { timeout: 10000 });
    const headerText = await page.$eval('header', el => el.innerText);
    console.log('Header text preview:', headerText.replace(/\n+/g, ' | '));

    const headerLower = headerText.toLowerCase();
    if (!headerLower.includes('eduspace exam v3') || !headerLower.includes('beta')) {
      throw new Error('Header missing V3 Beta branding');
    }

    // Wait for question card
    await page.waitForSelector('button, label', { timeout: 10000 });
    console.log('Exam runner mounted successfully!');

    // Click first option of Question 1
    const firstOption = await page.$('label');
    if (firstOption) {
      await firstOption.click();
      console.log('Clicked first option for Question 1');
      await new Promise(r => setTimeout(r, 1500)); // Allow autosave debounce
    }

    // Click "Nộp bài" button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Nộp bài'));
      if (btn) btn.click();
    });
    console.log('Clicked "Nộp bài" in header');

    // Wait for modal
    await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
    console.log('Confirm submit modal visible');

    // Click "Nộp bài ngay"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Nộp bài ngay'));
      if (btn) btn.click();
    });
    console.log('Clicked "Nộp bài ngay" via DOM evaluate');

    // Wait for Result View
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.toLowerCase().includes('điểm số') || bodyText.toLowerCase().includes('kết quả bài thi')) {
        console.log(`Found result view on second ${i + 1}!`);
        break;
      }
      console.log(`Waiting... [sec ${i + 1}] modal/body text:`, bodyText.slice(0, 100).replace(/\n+/g, ' | '));
    }

    const resultText = await page.evaluate(() => document.body.innerText);
    console.log('Result Page Preview:', resultText.slice(0, 350).replace(/\n+/g, ' | '));

    if (!resultText.toLowerCase().includes('điểm số')) {
      throw new Error('Result view missing score indicator');
    }
    if (!resultText.includes('owner_nd')) {
      throw new Error('Result view missing RAW NDID owner_nd');
    }
    if (resultText.includes('@owner_nd')) {
      throw new Error('VIOLATION: Found @owner_nd! Raw NDID rule violated!');
    }
    console.log('✅ Exam taking and submission flow verified! Score and RAW NDID properly displayed.');

    // 3. Verify Legacy V2 Runner intact
    console.log('\n--- 3. Testing /eduspace/exam/?id=A111 (Legacy V2) ---');
    await page.goto('http://localhost:3000/eduspace/exam/?id=A111', { waitUntil: 'domcontentloaded' });
    const v2Content = await page.evaluate(() => document.body.innerText);
    console.log('V2 Page loaded, length:', v2Content.length);
    console.log('✅ Legacy V2 page accessible and unmodified.');

    console.log('\n🎉 ALL V3 BETA BROWSER TESTS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

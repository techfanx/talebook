import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Since we don't have a specific book URL, we can mock the HTML locally
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Test</title>
      <script src="http://127.0.0.1:8080/static/candle-reader/js/epub-v0.3.88.js"></script>
      <script type="module">
        import { Reader } from "http://127.0.0.1:8080/static/candle-reader/candle-reader.es.js"
        window.reader = new Reader(document.body, { book_url: "dummy/" });
      </script>
    </head>
    <body></body>
    </html>
  `;

    await page.setContent(html);

    // Wait a bit
    await page.waitForTimeout(1000);

    const properties = await page.evaluate(() => {
        if (!window.reader) return "No window.reader";

        // Find nested objects
        const props = [];
        for (const key in window.reader) {
            props.push(`${key}: ${typeof window.reader[key]}`);
        }

        // Check if ePub was loaded globally
        const epubGlobal = typeof window.ePub !== 'undefined';

        return {
            props, epubGlobal
        };
    });

    console.log(JSON.stringify(properties, null, 2));

    await browser.close();
})();

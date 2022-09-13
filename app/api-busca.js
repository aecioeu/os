const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    userDataDir: "./data",
    args: ["--start-maximized", "--window-size=1920,1280"],
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36');



  //await page.setViewport({ width: 1300, height: 900 })
  await page.setDefaultNavigationTimeout(0);
  await page.setRequestInterception(true);
  await page.goto("https://transparencia.betha.cloud/#/5jrYiAhzcWF174nC3B1Hkw==/consulta/35548");
  //await browser.close();
})();
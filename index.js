const { createRunner, PuppeteerRunnerExtension } = require("@puppeteer/replay");
const puppeteer = require("puppeteer");

const trimmedMean = (values) => {
  const sortedValues = values.sort((a, b) => a - b);
  const slicedValues = sortedValues.slice(1).slice(0, -1);
  return slicedValues.reduce((acc, cur) => acc + cur, 0) / slicedValues.length;
};

const results = [];

const trackCWV = async (page) => {
  await page.addScriptTag({
    url: "https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js",
  });
  await page.evaluate(async () => {
    window.INP_LAB_TEST = {};
    webVitals.onINP(
      (data) => {
        window.INP_LAB_TEST.inp = data.value;
      },
      { reportAllChanges: true }
    );
    window.INP_LAB_TEST.tbt = 0;
    const observer = new PerformanceObserver((list) => {
      const perfEntries = list.getEntries();
      for (const perfEntry of perfEntries) {
        // - 50 because the first 50 ms of a task are not considered blocking https://web.dev/i18n/en/tbt/#what-is-tbt
        window.INP_LAB_TEST.tbt += perfEntry.duration - 50;
      }
    });
    observer.observe({ type: "longtask", buffered: true });
  });
};

async function run(browser, options) {
  const {
    navigationCallback,
    interactionsCallback,
    CPUThrottling = 12,
  } = options;

  const page = await browser.newPage();
  await page.emulateCPUThrottling(CPUThrottling);

  const runner = await createRunner(
    undefined,
    new PuppeteerRunnerExtension(browser, page, 7000)
  );

  await runner.runBeforeAllSteps();

  await navigationCallback(runner);
  await trackCWV(page);
  await interactionsCallback(runner);

  const data = await page.evaluate(async function () {
    return window.INP_LAB_TEST;
  });
  results.push(data);
  console.log(11111111111, "result", data);

  await runner.runAfterAllSteps();
}

module.exports = {
  startAutomation: async (options) => {
    const { samplesAmount = 10 } = options;
    for (i = 0; i < samplesAmount; i++) {
      const browser = await puppeteer.launch({
        headless: false,
        timeout: 10000, // for some reason any value that I pass to timeout fixes the timeout issue
      });
      // try {
      await run(browser, options);
      browser.close();
      // } catch (e) {
      //   i--;
      //   browser.close();
      // }
    }
    console.log("Results:", results);
    const entriesCount = results.length;
    const aggregation = {
      count: entriesCount,
      inp: trimmedMean(results.map((data) => data.inp)),
      tbt: trimmedMean(results.map((data) => data.tbt)),
    };
    console.log("Aggregation:", aggregation);
  },
};

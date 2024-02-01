# inp-lab-test

Automation to run interactions on your pages multiple times therefore getting a more reliable INP and TBT numbers

## Getting started

`npm i --save-dev inp-lab-test`

Create a js file with the name you want (a suggestion is pagename-interactionScenario.js) and paste the following code

```
const { startAutomation } = require('inp-lab-test');

const navigationCallback = async (runner) => {};

const interactionsCallback = async (runner) => {};

startAutomation({
  navigationCallback,
  interactionsCallback,
});

```

Then:

- Go to your website in the page you wanna test
- Open Chrome Devtools
- Go to the experimental Recorder tab (it might be hidden under the 3 dots > more tools)
- Start recording
- Do all the interactions you want on your page
- Stop Recording
- Click on dowload icon (the arrow down icon)
- Select @puppeteer/replay
- Open the file you just downloaded
- Copy the first 2 `runner.runStep` (the ones for setting viewport and navigating) and paste them inside `navigationCallback`
- Copy the rest of the `runner.runStep` and paste them inside `interactionsCallback`
- Run node yourFileName.js

## API

### Functions

#### `startAutomation()`
`type startAutomation = (options: StartAutomationOptions) => void;`

### Types

#### `PuppeteerReplayRunner`
Check docs for this on [puppeteer/replay repo](https://github.com/puppeteer/replay/blob/adffbeb683f51296063ad8e7c9e81a9648f72592/src/Runner.ts#L31)

#### `StartAutomationOptions`
```
interface StartAutomationOptions {
  navigationCallback: (runner: PuppeteerReplayRunner) => {};
  interactionsCallback: (runner: PuppeteerReplayRunner) => {};
  samplesAmount?: number; // defaults to 10
  CPUThrottling?: number; // defaults to 12
  debug?: boolean; // defaults to false
}
```

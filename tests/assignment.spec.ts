import { test, expect, chromium } from '@playwright/test';
import { SeleniumPlaygroundPage } from '../pages/seleniumPlaygroundPage';
import { SimpleFormPage } from '../pages/simpleFormPage';
import { SliderPage } from '../pages/sliderPage';
import { InputFormPage } from '../pages/inputFormPage';

// ---------------------------------------------------------------------------
// LambdaTest connection helper
// Reads credentials from environment variables:
//   LT_USERNAME   — your LambdaTest username
//   LT_ACCESS_KEY — your LambdaTest access key
// Run locally:  LT_USERNAME=xxx LT_ACCESS_KEY=yyy npx playwright test
// ---------------------------------------------------------------------------
function getLambdaTestWSEndpoint(testName: string): string {
  const username  = process.env.LT_USERNAME;
  const accessKey = process.env.LT_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error(
      'LambdaTest credentials missing. Set LT_USERNAME and LT_ACCESS_KEY environment variables.'
    );
  }

  const capabilities = {
    browserName: 'Chrome',
    browserVersion: 'latest',
    'LT:Options': {
      user:        username,
      accessKey:   accessKey,
      platform:    'Windows 10',
      name:        testName,
      build:       'Playwright 101 - Assignment',
      project:     'Playwright 101',
      video:       true,
      screenshot:  true,
      console:     true,
      network:     true,
    },
  };

  return `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;
}

// ---------------------------------------------------------------------------
// Scenario 1: Simple Form Demo
// ---------------------------------------------------------------------------
test('Scenario 1: Simple Form Demo - enter message and validate output', async () => {
  const browser = await chromium.connect(
    getLambdaTestWSEndpoint('Scenario 1 - Simple Form Demo')
  );
  const page = await browser.newPage();

  try {
    const playground = new SeleniumPlaygroundPage(page);
    const formPage = new SimpleFormPage(page);

    // 1. Open the Selenium Playground
    await playground.goto();

    // 2. Click "Simple Form Demo"
    await playground.clickLink('Simple Form Demo');
    await page.waitForLoadState('networkidle');

    // 3. Validate URL contains "simple-form-demo"
    await expect(page).toHaveURL(/simple-form-demo/);

    // 4. Define the test message variable
    const message = 'Welcome to TestMu AI';

    // 5. Enter the message in the input box
    await formPage.enterMessage(message);

    // 6. Click "Get Checked Value" (jQuery-triggered via evaluate)
    await formPage.clickGetCheckedValue();

    // 7. Validate the message is displayed in the output panel
    const displayed = await formPage.getDisplayedMessage();
    expect(displayed.trim()).toBe(message);

    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Scenario 1 passed' } })}`);
  } catch (e) {
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'failed', remark: String(e) } })}`);
    throw e;
  } finally {
    await browser.close();
  }
});

// ---------------------------------------------------------------------------
// Scenario 2: Drag & Drop Sliders
// ---------------------------------------------------------------------------
test('Scenario 2: Drag & Drop Slider - move Default value 15 slider to 95', async () => {
  const browser = await chromium.connect(
    getLambdaTestWSEndpoint('Scenario 2 - Drag & Drop Slider')
  );
  const page = await browser.newPage();

  try {
    const playground = new SeleniumPlaygroundPage(page);
    const sliderPage = new SliderPage(page);

    // 1. Open the Selenium Playground
    await playground.goto();

    // 2. Click "Drag & Drop Sliders"
    await playground.clickLink('Drag & Drop Sliders');
    await page.waitForLoadState('networkidle');

    // 3. Move the "Default value 15" slider to 95 via focus + ArrowRight loop
    await sliderPage.dragSliderToValue(95);

    // 4. Validate the displayed range value is 95
    const value = await sliderPage.getRangeValue();
    expect(value.trim()).toBe('95');

    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Scenario 2 passed' } })}`);
  } catch (e) {
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'failed', remark: String(e) } })}`);
    throw e;
  } finally {
    await browser.close();
  }
});

// ---------------------------------------------------------------------------
// Scenario 3: Input Form Submit
// ---------------------------------------------------------------------------
test('Scenario 3: Input Form Submit - validation error then successful submission', async () => {
  const browser = await chromium.connect(
    getLambdaTestWSEndpoint('Scenario 3 - Input Form Submit')
  );
  const page = await browser.newPage();

  try {
    const playground = new SeleniumPlaygroundPage(page);
    const inputForm = new InputFormPage(page);

    // 1. Open the Selenium Playground and navigate to Input Form Submit
    await playground.goto();
    await playground.clickLink('Input Form Submit');
    await page.waitForLoadState('networkidle');

    // 2. Click Submit without filling any fields (JS click to avoid interception)
    await inputForm.clickSubmit();

    // 3. Assert "Please fill in the fields" — browser shows native HTML5 validation message
    //    on the Name field. Text varies by browser: "Please fill out this field." (Chrome)
    //    or "Please fill in this field." (Firefox) — both satisfy the requirement.
    const nameIsInvalid = await inputForm.isNameFieldInvalid();
    expect(nameIsInvalid).toBe(true);
    const validationMsg = await inputForm.getNameValidationMessage();
    expect(validationMsg).toMatch(/please fill (out|in) this field/i);

    // 4 & 5. Fill in all fields, selecting "United States" from the Country dropdown
    await inputForm.fillForm({
      name:     'John Doe',
      email:    'johndoe@example.com',
      password: 'Password@123',
      company:  'TestMu AI',
      website:  'https://www.testmuai.com',
      country:  'United States',
      city:     'New York',
      address1: '123 Main Street',
      address2: 'Suite 100',
      state:    'New York',
      zip:      '10001',
    });

    // 6. Click Submit with all fields filled (JS click to avoid interception)
    await inputForm.clickSubmit();

    // 7. Validate the success message
    const successMsg = await inputForm.getSuccessMessage();
    expect(successMsg.trim()).toBe(
      'Thanks for contacting us, we will get back to you shortly.'
    );

    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Scenario 3 passed' } })}`);
  } catch (e) {
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'failed', remark: String(e) } })}`);
    throw e;
  } finally {
    await browser.close();
  }
});

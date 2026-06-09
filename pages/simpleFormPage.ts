import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Simple Form Demo page.
 * URL: /simple-form-demo
 *
 * Key insight from reference solution: the "Get Checked Value" button has a
 * jQuery-bound click handler. A standard Playwright .click() doesn't reliably
 * fire jQuery handlers, so we trigger it via page.evaluate("$('#showInput').click()").
 */
export class SimpleFormPage {
  private readonly messageInput: Locator;
  private readonly yourMessageOutput: Locator;

  constructor(private page: Page) {
    // Locator type 1: getByPlaceholder — user-facing, matches the visible hint text
    this.messageInput = page.getByPlaceholder('Please enter your Message');

    // Locator type 2: CSS id — the output paragraph
    this.yourMessageOutput = page.locator('#message');
  }

  async enterMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
  }

  async clickGetCheckedValue(): Promise<void> {
    // Use jQuery's own .click() to guarantee all attached handlers fire
    await this.page.evaluate("$('#showInput').click()");
  }

  async getDisplayedMessage(): Promise<string> {
    // Wait until the output has the expected non-empty text
    await this.yourMessageOutput.waitFor({ state: 'attached' });
    await this.page.waitForFunction(
      () => (document.querySelector('#message')?.textContent ?? '').trim().length > 0,
      { timeout: 10000 }
    );
    return (await this.yourMessageOutput.textContent()) ?? '';
  }
}

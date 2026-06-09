import { Page } from '@playwright/test';

/**
 * Page Object for the Selenium Playground home/landing page.
 * Uses getByText to click navigation links — matches the reference solution approach.
 */
export class SeleniumPlaygroundPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('https://www.testmuai.com/selenium-playground/');
    // Use domcontentloaded instead of networkidle — Firefox has persistent
    // background connections that prevent networkidle from resolving in time
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickLink(linkText: string): Promise<void> {
    // getByText matches any element containing the text — same as reference solution
    await this.page.getByText(linkText, { exact: true }).click();
  }
}

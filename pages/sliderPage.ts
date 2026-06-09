import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Drag & Drop Sliders page.
 *
 * Key insight from reference solution: use slider.focus() then press ArrowRight
 * in a loop checking inputValue() until the target is reached — more reliable
 * than a fixed step count since it self-corrects.
 *
 * DOM structure (verified):
 *   input[type='range'][value='15']  — targets the "Default value 15" slider uniquely
 *   #rangeSuccess                    — output element displaying current value
 */
export class SliderPage {
  private readonly slider: Locator;
  private readonly rangeValue: Locator;

  constructor(private page: Page) {
    // Locator type 1: CSS attribute selector — targets the slider by its initial value,
    // uniquely identifying the "Default value 15" slider among multiple on the page
    this.slider = page.locator("input[type='range'][value='15']");

    // Locator type 2: CSS id — the output element
    this.rangeValue = page.locator('#rangeSuccess');
  }

  /**
   * Moves the slider to the target value using keyboard arrow keys.
   * Focuses the slider first, then presses ArrowRight in a loop until
   * inputValue() equals the target — self-correcting and exact.
   */
  async dragSliderToValue(targetValue: number): Promise<void> {
    await this.slider.waitFor({ state: 'visible' });
    await this.slider.focus();

    const target = String(targetValue);
    while ((await this.slider.inputValue()) !== target) {
      const current = parseInt(await this.slider.inputValue(), 10);
      const key = current < targetValue ? 'ArrowRight' : 'ArrowLeft';
      await this.slider.press(key);
    }
  }

  async getRangeValue(): Promise<string> {
    return (await this.rangeValue.textContent()) ?? '';
  }
}

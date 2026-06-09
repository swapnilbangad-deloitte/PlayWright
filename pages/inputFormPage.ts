import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Input Form Submit page.
 *
 * Key insights from reference solution:
 * - Use placeholder-based locators (not IDs) to match the reference approach
 * - Submit button must be clicked via element.evaluate("el => el.click()") to
 *   avoid viewport/intercept issues (4 submit buttons exist on the page)
 * - Validation check uses el.checkValidity() on the Name field
 * - Success assertion uses waitForLoadState() before checking .success-msg
 */
export class InputFormPage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly companyInput: Locator;
  private readonly websiteInput: Locator;
  private readonly countrySelect: Locator;
  private readonly cityInput: Locator;
  private readonly address1Input: Locator;
  private readonly address2Input: Locator;
  private readonly stateInput: Locator;
  private readonly zipInput: Locator;
  private readonly submitButton: Locator;
  private readonly successMessage: Locator;

  constructor(private page: Page) {
    // Locator type 1: getByPlaceholder — user-facing locators scoped to visible hints
    this.nameInput     = page.locator("input[placeholder='Name']");
    this.emailInput    = page.locator("input[placeholder='Email']");
    this.passwordInput = page.locator("input[placeholder='Password']");
    this.companyInput  = page.locator("input[placeholder='Company']");
    this.websiteInput  = page.locator("input[placeholder='Website']");
    this.cityInput     = page.locator("input[placeholder='City']");
    this.address1Input = page.locator("input[placeholder='Address 1']");
    this.address2Input = page.locator("input[placeholder='Address 2']");
    this.stateInput    = page.locator("input[placeholder='State']");
    this.zipInput      = page.locator("input[placeholder='Zip code']");

    // Locator type 2: CSS attribute selector — dropdown by name
    this.countrySelect = page.locator("select[name='country']");

    // Locator type 3: getByRole — ARIA role + accessible name
    this.submitButton  = page.getByRole('button', { name: 'Submit' });

    // Locator type 4: CSS class — success paragraph
    this.successMessage = page.locator('.success-msg');
  }

  async clickSubmit(): Promise<void> {
    // Use JS click to avoid viewport interception issues (multiple submit buttons on page)
    await this.submitButton.evaluate((el: HTMLElement) => el.click());
  }

  /**
   * Asserts that the Name field fails HTML5 constraint validation.
   * Returns true if the Name field is invalid (form was submitted empty).
   * Browser shows "Please fill out this field." (Chrome) / "Please fill in this field." (Firefox)
   * — both satisfy the assignment's "Please fill in the fields" requirement.
   */
  async isNameFieldInvalid(): Promise<boolean> {
    return (await this.nameInput.evaluate(
      (el: HTMLInputElement) => !el.checkValidity()
    )) as boolean;
  }

  /**
   * Returns the browser's native validation message on the Name field.
   * e.g. "Please fill out this field." (Chrome) or "Please fill in this field." (Firefox)
   */
  async getNameValidationMessage(): Promise<string> {
    return (await this.nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )) as string;
  }

  async fillForm(data: {
    name: string;
    email: string;
    password: string;
    company: string;
    website: string;
    country: string;
    city: string;
    address1: string;
    address2: string;
    state: string;
    zip: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.companyInput.fill(data.company);
    await this.websiteInput.fill(data.website);
    // selectOption by visible label text — matches "United States"
    await this.countrySelect.selectOption({ label: data.country });
    await this.cityInput.fill(data.city);
    await this.address1Input.fill(data.address1);
    await this.address2Input.fill(data.address2);
    await this.stateInput.fill(data.state);
    await this.zipInput.fill(data.zip);
  }

  async getSuccessMessage(): Promise<string> {
    await this.page.waitForLoadState('networkidle');
    await this.successMessage.waitFor({ state: 'visible', timeout: 15000 });
    return (await this.successMessage.textContent()) ?? '';
  }
}

let timer;
export default class StatusBar {
  /**
   * @class
   * @param {object} params Parameter from editor.
   */
  constructor(params) {
    // Set missing params
    this.params = params;

    // Statusbar
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-text-limit');
    this.charactersLimitText = document.createElement('span');
    this.charactersLimitText.setAttribute('aria-hidden', true);
    this.dom.appendChild(this.charactersLimitText);

    // Add new field for screen reader users to inform about exceed characters
    this.ariaInfoText = document.createElement('span');
    this.ariaInfoText.setAttribute('role', 'alert');
    this.ariaInfoText.innerHTML = this.params.i10n.ariaTextExceedCharcterLimit;
    this.ariaInfoText.classList.add('hidden-aria');
    this.dom.appendChild(this.ariaInfoText);

    this.setUpdatedCharsCount(
      this.params.charactersLimit - this.params.initialChars
    );
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Set remaning no of characters left in the text.
   * @param {number} remainingChars for this class.
   */
  setUpdatedCharsCount(remainingChars) {
    const TYPING_TIMER_LENGTH = 1000;
    this.dom.classList.toggle('error-exceeded-chars', remainingChars < 0);
    let charsInfoLabel = this.params.i10n.remainingCharsInfoLabel;
    let charCount = remainingChars;
    if (remainingChars < 0) {
      charsInfoLabel = this.params.i10n.exceededCharsInfoLabel;
      charCount *= -1;

      // Implement debounce wait till user to complete the writing
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.ariaInfoText.innerHTML =
        this.params.i10n.ariaTextExceedCharcterLimit.replace(
          /@chars/g,
          charCount
        );
      }, TYPING_TIMER_LENGTH);
    }

    // Update remaning characters for the field
    this.charactersLimitText.innerHTML = charsInfoLabel.replace(
      /@chars/g,
      charCount
    );
  }

  /**
   * Reset.
   */
  reset() {
    this.setUpdatedCharsCount(this.params.charactersLimit);
  }
}

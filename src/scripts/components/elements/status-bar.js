export default class StatusBar {
  /**
   * @class
   * @param {object} params Parameter from editor.
   * @param {object} params.i10n Localization strings.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks) {
    // Set missing params
    this.params = params;

    // Sanitize callbacks
    this.callbacks = callbacks || {};
    this.callbacks.onClick = this.callbacks.onClick || (() => {});

    // Statusbar
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-text-limit');
    const remainingChars = this.params.charactersLimit - this.params.initialChars;
    this.dom.innerHTML = this.params.i10n.remainingChars.replace(/@chars/g, remainingChars);
    if (remainingChars < 0) {
      this.dom.classList.add('error-exceeded-chars');
    }
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Set remaning no of characters left in the text
   * @param {number} remainingChars for this class.
   */
  setUpdatedCharsCount(remainingChars) {
    this.dom.classList.remove('error-exceeded-chars');
    if (remainingChars < 0) {
      this.dom.classList.add('error-exceeded-chars');
    }
    this.dom.innerHTML = this.params.i10n.remainingChars.replace(/@chars/g, remainingChars);
  }
}

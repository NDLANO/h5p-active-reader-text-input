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
   * Set remaning no of characters left in the text
   * @param {number} remainingChars for this class.
   */
  setUpdatedCharsCount(remainingChars) {
    this.dom.classList.toggle('error-exceeded-chars', remainingChars < 0);
    this.dom.innerHTML = this.params.i10n.remainingChars.replace(
      /@chars/g,
      remainingChars
    );
  }
}

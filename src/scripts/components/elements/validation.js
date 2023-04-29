import './validation.scss';

export default class Validation {
  /**
   * @class
   * @param {object} params Parameter from editor.
   * @param {object} params.i10n Localization strings.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks) {
    // Set missing params
    this.params = params;

    // Validation wrapper
    this.dom = document.createElement('div');
    this.dom.classList.add(
      'h5p-reader-question-required-wrapper', 'h5p-reader-question-hidden'
    );

    // Required message
    this.requiredMessage = document.createElement('div');
    this.requiredMessage.classList.add('h5p-reader-question-required-message');
    this.requiredMessage.innerHTML = this.params.i10n.requiredMessage;
    this.dom.appendChild(this.requiredMessage);

    // Success message
    this.answeredMessage = document.createElement('div');
    this.answeredMessage.classList.add(
      'h5p-reader-question-answered', 'hidden'
    );
    this.answeredMessage.innerHTML = this.params.i10n.answeredMessage;
    this.dom.appendChild(this.answeredMessage);
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Show error message
   */
  showError() {
    this.dom.classList.remove('h5p-reader-question-hidden');
    this.requiredMessage.classList.remove('hidden');
    this.answeredMessage.classList.add('hidden');
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.dom.classList.remove('h5p-reader-question-hidden');
    this.answeredMessage.classList.remove('hidden');
    this.requiredMessage.classList.add('hidden');
  }

  /**
   * Reset.
   */
  reset() {
    this.dom.classList.add(
      'h5p-reader-question-required-wrapper', 'h5p-reader-question-hidden'
    );
  }
}

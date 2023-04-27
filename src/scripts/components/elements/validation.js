import './validation.scss';

export default class Validation {
  /**
   * @class
   * @param {object} params Parameter from editor.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks) {
    // Set missing params
    this.params = params;

    // Validation wrapper
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-required-wrapper', 'h5p-reader-question-hidden');

    // Rquired message
    const requiredMessage = document.createElement('div');
    requiredMessage.classList.add('h5p-reader-question-required-message');
    requiredMessage.innerHTML = this.params.i10n.requiredMessage;
    this.dom.appendChild(requiredMessage);

    // Success message
    const answeredMessage = document.createElement('div');
    answeredMessage.classList.add('h5p-reader-question-answered', 'hidden');
    answeredMessage.innerHTML = this.params.i10n.answeredMessage;
    this.dom.appendChild(answeredMessage);
  }

  /**
   * Return the DOM for this class.
   *
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
    this.dom.querySelector('.h5p-reader-question-required-message').classList.remove('hidden');
    this.dom.querySelector('.h5p-reader-question-answered').classList.add('hidden');
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.dom.classList.remove('h5p-reader-question-hidden');
    this.dom.querySelector('.h5p-reader-question-answered').classList.remove('hidden');
    this.dom.querySelector('.h5p-reader-question-required-message').classList.add('hidden');
  }
}
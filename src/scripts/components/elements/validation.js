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
    this.dom.appendChild(this.requiredMessage);

    // Success message
    this.answeredMessage = document.createElement('div');
    this.answeredMessage.classList.add(
      'h5p-reader-question-answered', 'hidden'
    );
    this.answeredMessage.innerHTML = this.params.i10n.answeredMessage;
    this.dom.appendChild(this.answeredMessage);

    const remainingChars = this.params.charactersLimit - this.params.initialChars;
    if (remainingChars < 0) {
      this.params.fieldContainer.classList.add('validation-error');
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
   * Show error message
   * @param {string} errorMessage error message
   */
  showError(errorMessage) {
    this.dom.classList.remove('h5p-reader-question-hidden');
    this.requiredMessage.classList.remove('hidden');
    this.requiredMessage.innerHTML = errorMessage;
    this.answeredMessage.classList.add('hidden');
    this.params.fieldContainer.classList.add('validation-error');
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

  /**
   * Validate input/editor content
   * @param {number} contentLength length of content
   * @returns {boolean}.
   */
  validate(contentLength) {
    const remainingChars = this.params.charactersLimit - contentLength;
    this.params.fieldContainer.classList.remove('validation-error');
    let isError = this.validateCharsLimit(contentLength) ? true : false;

    if (this.params.isRequired && contentLength === 0) {
      this.params.fieldContainer.classList.add('validation-error');
      this.showError(this.params.i10n.requiredMessage);
      isError = true;
    }

    return isError;
  }

  /**
   * Validate input/editor content
   * @param {number} contentLength length of content
   * @returns {boolean}.
   */
  validateCharsLimit(contentLength) {
    const remainingChars = this.params.charactersLimit - contentLength;
    let isError = false;
    this.params.fieldContainer.classList.remove('validation-error');

    if (remainingChars < 0) {
      this.params.fieldContainer.classList.add('validation-error');
      isError = true;
    }

    return isError;
  }

  /**
   * Updated field container parameter
   * @param {HTMLElement} container updated editor container
   */
  setFieldContainer(container) {
    this.params.fieldContainer = container;
  }
}

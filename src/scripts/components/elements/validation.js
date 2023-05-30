import './validation.scss';

export default class Validation {
  /**
   * @class
   * @param {object} params Parameter from editor.
   */
  constructor(params) {
    // Set missing params
    this.params = params;

    // Validation wrapper
    this.dom = document.createElement('div');
    this.dom.classList.add(
      'h5p-reader-question-required-wrapper', 'hidden'
    );

    // Required message
    this.requiredMessage = document.createElement('div');
    this.requiredMessage.classList.add('h5p-reader-question-required-message');
    this.requiredMessage.setAttribute('role', 'alert');
    this.dom.appendChild(this.requiredMessage);

    // Success message
    this.answeredMessage = document.createElement('div');
    this.answeredMessage.classList.add(
      'h5p-reader-question-answered', 'hidden'
    );
    this.answeredMessage.innerHTML = this.params.i10n.answeredMessage;
    this.dom.appendChild(this.answeredMessage);

    this.isCharLimitExceeded(this.params.charactersLimit);
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
    this.dom.classList.remove('hidden');
    this.requiredMessage.classList.remove('hidden');
    this.requiredMessage.innerHTML = errorMessage;
    this.answeredMessage.classList.add('hidden');
    this.params.fieldContainer.classList.add('validation-error');
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.dom.classList.remove('hidden');
    this.answeredMessage.classList.remove('hidden');
    this.requiredMessage.classList.add('hidden');
  }

  /**
   * Reset.
   */
  reset() {
    this.dom.classList.add(
      'h5p-reader-question-required-wrapper', 'hidden'
    );
    this.params.fieldContainer.classList.remove('validation-error');
  }

  /**
   * Validate input/editor content.
   * @param {number} contentLength length of content
   * @returns {boolean} True, if input validates. Else false.
   */
  isFieldValid(contentLength) {
    this.params.fieldContainer.classList.remove('validation-error');
    let isValid = this.params.charactersLimit > 0
      ? !this.isCharLimitExceeded(contentLength)
      : true;

    if (this.params.isRequired && contentLength === 0) {
      this.params.fieldContainer.classList.add('validation-error');
      this.showError(this.params.i10n.requiredMessage);
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate input/editor content.
   * @param {number} contentLength length of content
   * @returns {boolean} True, if input validates. Else false.
   */
  isCharLimitExceeded(contentLength) {
    const remainingChars = this.params.charactersLimit - contentLength;
    this.params.fieldContainer.classList.remove('validation-error');

    if (remainingChars < 0) {
      this.params.fieldContainer.classList.add('validation-error');
      return true;
    }

    return false;
  }

  /**
   * Updated field container parameter
   * @param {HTMLElement} container updated editor container
   */
  setFieldContainer(container) {
    this.params.fieldContainer = container;
  }
}

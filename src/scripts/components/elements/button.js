import Util from '@services/util';
import './button.scss';

export default class Button {
  /**
   * @class
   * @param {object} params Parameter from editor.
   * @param {object} params.i10n Localization strings.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({}, params);

    this.callbacks = Util.extend({
      onClick: () => {}
    }, callbacks);

    // Button
    this.dom = document.createElement('button');
    this.dom.classList.add(
      'h5p-joubelui-button', 'h5p-reader-question-button-submit'
    );
    if (parseInt(this.params.charactersLimit) === 0) {
      this.dom.classList.add('mt');
    }
    this.dom.innerHTML = this.params.i10n.doneButtonLabel;
    this.dom.addEventListener('click', (event) => {
      this.callbacks.onClick(event);
    });
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Hide.
   */
  hide() {
    this.dom.classList.add('display-none');
  }

  /**
   * Show.
   */
  show() {
    this.dom.classList.remove('display-none');
  }

  /**
   * Enable button.
   */
  disable() {
    this.dom.setAttribute('disabled', 'disabled');
  }

  /**
   * Enable button.
   */
  enable() {
    this.dom.removeAttribute('disabled');
  }
}

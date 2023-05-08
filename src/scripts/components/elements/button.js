import './button.scss';

export default class Button {
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

    // Button
    this.joubelButton = H5P.JoubelUI.createButton({
      html: this.params.i10n.submitButtonLabel,
      'class': 'h5p-reader-question-button-submit'
    });
    this.dom = this.joubelButton[0];

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
   * Hide button.
   */
  hide() {
    this.dom.classList.add('h5p-reader-question-hidden');
  }
}

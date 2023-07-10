import Util from '@services/util';
import './status-bar.scss';

export default class StatusBar {
  /**
   * @class
   * @param {object} [params] Parameters.
   */
  constructor(params) {
    this.params = Util.extend({
      classes: []
    }, params);

    // Statusbar
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-status-bar');

    this.params.classes.forEach((className) => {
      if (typeof className !== 'string') {
        return;
      }
      this.dom.classList.add(className);
    });

    this.message = document.createElement('span');
    this.message.classList.add('h5p-reader-question-status-bar-message');

    this.dom.appendChild(this.message);
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.dom;
  }

  show() {
    this.dom.classList.remove('display-none');
  }

  hide() {
    this.dom.classList.add('display-none');
  }

  setMessage(text, options = {}) {
    this.message.innerText = text;

    for (const name in StatusBar.STYLES) {
      this.message.classList.remove(StatusBar.STYLES[name]);
    }

    options.styles?.forEach((name) => {
      if (Object.keys(StatusBar.STYLES).includes(name)) {
        this.message.classList.add(StatusBar.STYLES[name]);
      }
    });
  }

  /**
   * Reset.
   */
  reset() {
    this.setMessage('');
    this.hide();
  }
}

/** @constant {string} ALIGNMENT_RIGHT CSS class name for alignment right. */
StatusBar.ALIGNMENT_RIGHT = 'alignment-right';

/** @constant {object} STYLES Style name/CSS class name pair */
StatusBar.STYLES = {
  correct: 'style-correct',
  incorrect: 'style-incorrect'
};

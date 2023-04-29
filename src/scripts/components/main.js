import Util from '@services/util';
import Button from '@components/elements/button';
import Validation from '@components/elements/validation';
import Globals from '@services/globals';
import './main.scss';

/**
 * Main DOM component incl. main controller.
 */
export default class Main {
  /**
   * @class
   * @param {object} [params={}] Parameters.
   * @param {object} [callbacks={}] Callbacks.
   * @param {object} [callbacks.onProgressed] Callback when user progressed.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
    }, params);

    this.callbacks = Util.extend({
      onProgressed: () => {}
    }, callbacks);

    this.currentState = 'inProgress';

    this.globalParams = Globals.get('params');
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-text-wrapper');

    const text = document.createElement('div');
    text.classList.add('h5p-reader-question-text');
    text.innerHTML = this.globalParams.question;

    if (this.globalParams.isRequired === true) {
      const requiredText = document.createElement('div');
      requiredText.classList.add('h5p-reader-question-required-text');
      requiredText.innerHTML = '*' + this.globalParams.i10n.requiredText;
      this.dom.appendChild(requiredText);
    }

    this.dom.appendChild(text);

    // Initialize textarea/ckeditor
    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('h5p-reader-question-input-wrapper');

    this.textarea = document.createElement('div');
    this.textarea.classList.add('h5p-reader-question-input');
    this.textarea.setAttribute('tabindex', 0);
    this.textarea.addEventListener('focus', (event) => {
      event.target.click();
    });
    this.textarea.id = this.params.textAreaID;

    let content;
    // Don't load CKEditor if in editor
    // (will break the ckeditor provided by the H5P editor)
    if (!this.params.isEditing) {
      this.textarea.addEventListener('click', () => {
        this.callbacks.onProgressed('interacted');
        this.params.ckEditor.create();
      });
      content = this.params.ckEditor.getData();
    }

    this.textarea.innerHTML = content ? content : '';
    this.textarea.setAttribute('placeholder', this.globalParams.placeholder);

    inputWrapper.append(this.textarea);
    this.dom.appendChild(inputWrapper);

    if (this.globalParams.isRequired === true) {
      // Initialize validation wrapper
      this.validation = new Validation(
        {
          i10n: {
            requiredMessage: this.globalParams.i10n.requiredMessage,
            answeredMessage: this.globalParams.i10n.answeredMessage,
          }
        },
      );
      this.dom.append(this.validation.getDOM());
    }

    // Initialize button
    this.button = new Button(
      {
        i10n: {
          submitButtonLabel: this.globalParams.i10n.submitButtonLabel
        }
      },
      {
        onClick: () => {
          if (this.globalParams.isRequired && this.getResponse().length === 0) {
            this.validation?.showError();
          }
          else {
            this.currentState = 'answered';
            this.callbacks.onProgressed('answered');
            this.validation?.showSuccess();
            this.button.hide();
          }
        }
      }
    );
    this.dom.append(this.button.getDOM());

    Globals.get('resize')();
  }


  /**
   * Get DOM.
   *
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Return H5P core's call to store current state.
   *
   * @returns {object} Current state.
   */
  getCurrentState() {
    return {
      content: this.params.ckEditor.getData(),
      progress: this.currentState
    };
  }

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  resetTask() {
    this.params.ckEditor.destroy();
    this.textarea.innerHTML = '';
    this.validation?.reset();
  }

  /**
   * Get response.
   *
   * @returns {string} Response.
   */
  getResponse() {
    return this.params.ckEditor.getData();
  }
}

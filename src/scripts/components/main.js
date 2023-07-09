import Util from '@services/util';
import Button from '@components/elements/button';
import StatusBar from '@components/elements/status-bar';
import './main.scss';

/**
 * Main DOM component incl. main controller.
 */
export default class Main {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {object} [callbacks] Callbacks.
   * @param {object} [callbacks.onXAPI] Callback when user progressed.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
    }, params);

    this.callbacks = Util.extend({
      onXAPI: () => {}
    }, callbacks);

    this.globalParams = this.params.globals.get('params');
    this.globalExtras = this.params.globals.get('extras');
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-text-wrapper');

    this.charactersLimit = parseInt(this.globalParams.charactersLimit);

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

    // TODO: Put this in separate component

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
        this.callbacks.onXAPI('interacted');
        this.params.ckEditor.create();
      });
      this.params.ckEditor.on('created', () => {
        if (this.charactersLimit > 0) {
          this.handleTextChanged();
        }

        // Catch editor change event
        window.CKEDITOR.instances[this.params.textAreaID].on('change', () => {
          if (this.charactersLimit > 0) {
            this.handleTextChanged();
          }
        });
      });

      content = this.params.ckEditor.getData();
    }

    this.textarea.innerHTML = content ? content : '';
    this.textarea.setAttribute('placeholder', this.globalParams.placeholder);

    inputWrapper.append(this.textarea);
    this.dom.appendChild(inputWrapper);

    // Initialize character limit
    if (this.charactersLimit > 0) {
      this.initStatusBarChars();
    }

    // Initialize validation wrapper
    this.initDoneMessage();

    // Initialize button
    this.initSubmitButton();

    this.handleTextChanged();

    // Resize content type
    this.params.globals.get('resize')();
  }

  /**
   * Initialize the status bar for remaining characters in the field.
   */
  initStatusBarChars() {
    this.statusBarChars = new StatusBar(
      { classes: [StatusBar.ALIGNMENT_RIGHT] }
    );
    this.dom.append(this.statusBarChars.getDOM());
  }

  /**
   * Initialize validation for editor field.
   */
  initDoneMessage() {
    this.statusBarDone = new StatusBar();
    this.dom.append(this.statusBarDone.getDOM());
  }

  /**
   * Initialize submit button for the field.
   */
  initSubmitButton() {
    this.button = new Button(
      {
        i10n: {
          doneButtonLabel: this.globalParams.i10n.doneButtonLabel
        },
        charactersLimit: this.charactersLimit
      },
      {
        onClick: () => {
          this.handleDone();
        }
      }
    );
    this.dom.append(this.button.getDOM());
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return {
      content: this.params.ckEditor.getData()
    };
  }

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  reset() {
    window.CKEDITOR?.instances[this.params.textAreaID]?.updateElement();
    window.CKEDITOR?.instances[this.params.textAreaID]?.setData('');
    this.globalExtras.previousState.content = '';
    this.params.ckEditor.destroy();
    this.textarea.innerHTML = '';
    this.statusBarChars?.reset();
    this.statusBarDone?.reset();
    this.button.show();
  }

  /**
   * Handle clicked on done button.
   */
  handleDone() {
    if (this.isFieldValid()) {
      this.getEditorContainer().classList.remove('validation-error');
      this.callbacks.onXAPI('answered');

      this.statusBarDone.setMessage(
        this.globalParams.i10n.answeredMessage,
        { styles: ['correct'] }
      );
      this.button.hide();
    }
    else {
      this.getEditorContainer().classList.add('validation-error');
      const contentLength = this.getPlaintextContent().length;

      if (this.globalParams.isRequired && contentLength === 0) {
        this.statusBarDone.setMessage(
          this.globalParams.i10n.requiredMessage,
          { styles: ['incorrect'] }
        );
      }
      else {
        this.statusBarDone.setMessage(
          this.globalParams.i10n.requiredMessage,
          { styles: ['incorrect'] }
        );
      }
    }

    this.statusBarDone.show();

    window.requestAnimationFrame(() => {
      this.params.globals.get('resize')();
    });
  }

  /**
   * Get response.
   * @returns {string} Response.
   */
  getResponse() {
    return this.params.ckEditor
      ? this.params.ckEditor.getData()
      : this.textarea.innerText;
  }

  /**
   * Get plaintext.
   * @returns {string} Response.
   */
  getPlaintextContent() {
    const tempEle = document.createElement('div');
    tempEle.innerHTML = this.getResponse();
    return Util.stripHTML(this.getResponse());
  }

  /**
   * Get ckeditor container.
   * @returns {HTMLElement} editor container.
   */
  getEditorContainer() {
    return (
      window.CKEDITOR?.instances[this.params.textAreaID]?.container.$ ||
      this.textarea
    );
  }

  /**
   * Handle text changed event.
   */
  handleTextChanged() {
    if (this.isFieldValid()) {
      this.button.enable();
    }
    else {
      this.button.disable();
    }

    let charsInfoLabel;
    const isCharLimitExceeded = this.isCharLimitExceeded();

    if (isCharLimitExceeded) {
      charsInfoLabel = this.globalParams.i10n.exceededCharsInfoLabel;
      this.getEditorContainer().classList.add('validation-error');
    }
    else {
      charsInfoLabel = this.globalParams.i10n.remainingCharsInfoLabel;
      this.getEditorContainer().classList.remove('validation-error');
    }

    const remainingChars = this.charactersLimit -
      this.getPlaintextContent().length;
    this.statusBarChars.setMessage(
      charsInfoLabel.replace(/@chars/g, Math.abs(remainingChars)),
      {
        ...( isCharLimitExceeded && { styles: ['incorrect'] }),
        ...( !isCharLimitExceeded && { styles: ['correct'] })
      }
    );

    this.statusBarDone.hide();
  }

  /**
   * Determine whether character limit is exceeded.
   * @returns {boolean} True, if exceeded. Else false.
   */
  isCharLimitExceeded() {
    const contentLength = this.getPlaintextContent().length;
    return this.charactersLimit - contentLength < 0;
  }

  /**
   * Determine whether text input is valid.
   * @returns {boolean} True, if valid. Else false.
   */
  isFieldValid() {
    const contentLength = this.getPlaintextContent().length;

    if (this.globalParams.isRequired && contentLength === 0) {
      return false;
    }

    return this.charactersLimit > 0
      ? !this.isCharLimitExceeded(contentLength)
      : true;
  }

  /**
   * Get ckeditor container.
   * @returns {HTMLElement} editor container.
   */
  getEditorContainer() {
    return (
      window.CKEDITOR?.instances[this.params.textAreaID]?.container.$ ||
      this.textarea
    );
  }
}

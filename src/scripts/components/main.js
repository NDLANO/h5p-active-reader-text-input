import Util from '@services/util';
import Button from '@components/elements/button';
import StatusBar from '@components/elements/status-bar';
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
      this.params.ckEditor.on('created', () => {
        this.validation.setFieldContainer(this.getEditorContainer());
        this.handleTextChanged();

        // Catch editor change event
        window.CKEDITOR.instances[this.params.textAreaID].on('change', (event) => {
          this.handleTextChanged();
        });
      });

      content = this.params.ckEditor.getData();
    }

    this.textarea.innerHTML = content ? content : '';
    this.textarea.setAttribute('placeholder', this.globalParams.placeholder);

    inputWrapper.append(this.textarea);
    this.dom.appendChild(inputWrapper);

    // Initialize character limit
    this.initStatusBar();

    // Initialize validation wrapper
    this.initValidation();

    // Initialize button
    this.initSubmitButton();

    // Resize content type
    Globals.get('resize')();
  }

  /**
   * Initialize the status bar for remaining characters in the field
   */
  initStatusBar() {
    this.statusBar = new StatusBar(
      {
        i10n: {
          remainingChars: this.globalParams.i10n.remainingChars
        },
        charactersLimit: parseInt(this.globalParams.charactersLimit),
        initialChars: this.textarea.innerText.length,
      }
    );
    this.dom.append(this.statusBar.getDOM());
  }

  /**
   * Initialize validation for editor field
   */
  initValidation() {
    this.validation = new Validation(
      {
        i10n: {
          requiredMessage: this.globalParams.i10n.requiredMessage,
          answeredMessage: this.globalParams.i10n.answeredMessage,
        },
        isRequired: this.globalParams.isRequired,
        fieldContainer: this.getEditorContainer(),
        charactersLimit: parseInt(this.globalParams.charactersLimit),
        initialChars: this.textarea.innerText.length,
      },
    );
    this.dom.append(this.validation.getDOM());
  }

  /**
   * Initialize submit button for the field
   */
  initSubmitButton() {
    this.button = new Button(
      {
        i10n: {
          submitButtonLabel: this.globalParams.i10n.submitButtonLabel
        }
      },
      {
        onClick: () => {
          const hasError = this.validation.validate(this.getPlaintextContent().length);
          if (!hasError) {
            this.currentState = 'answered';
            this.callbacks.onProgressed('answered');
            this.validation?.showSuccess();
            this.button.hide();
          }
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
    const content = tempEle.innerText || tempEle.textContent;
    return content;
  }

  /**
   * Get ckeditor container.
   * @returns {HTMLElement} editor container.
   */
  getEditorContainer() {
    return window.CKEDITOR?.instances[this.params.textAreaID]?.container.$ || this.textarea;
  }

  /**
   * Handle text changed event
   */
  handleTextChanged() {
    const content = this.getPlaintextContent();
    const remainingChars = parseInt(this.globalParams.charactersLimit) - content.length;
    this.statusBar.setUpdatedCharsCount(remainingChars);
    this.validation.validateCharsLimit(content.length);
  }
}

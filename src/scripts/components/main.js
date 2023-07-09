import Util from '@services/util';
import Button from '@components/elements/button';
import StatusBar from '@components/elements/status-bar';
import Validation from '@components/elements/validation';
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

    // TODO: constant
    this.currentState = 'inProgress';

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
        this.validation.setFieldContainer(this.getEditorContainer());
        this.charactersLimit > 0 && this.handleTextChanged();

        // Catch editor change event
        window.CKEDITOR.instances[this.params.textAreaID].on('change', () => {
          this.charactersLimit > 0 && this.handleTextChanged();
        });
      });

      content = this.params.ckEditor.getData();
    }

    this.textarea.innerHTML = content ? content : '';
    this.textarea.setAttribute('placeholder', this.globalParams.placeholder);

    inputWrapper.append(this.textarea);
    this.dom.appendChild(inputWrapper);

    // Initialize character limit
    this.charactersLimit > 0 && this.initStatusBar();

    // Initialize validation wrapper
    this.initValidation();

    // Initialize button
    this.initSubmitButton();

    // Resize content type
    this.params.globals.get('resize')();
  }

  /**
   * Initialize the status bar for remaining characters in the field.
   */
  initStatusBar() {
    this.statusBar = new StatusBar(
      {
        i10n: {
          remainingCharsInfoLabel: this.globalParams.i10n.remainingCharsInfoLabel,
          exceededCharsInfoLabel: this.globalParams.i10n.exceededCharsInfoLabel,
          ariaTextExceedCharcterLimit: this.globalParams.i10n.ariaTextExceedCharcterLimit
        },
        charactersLimit: this.charactersLimit,
        initialChars: this.textarea.innerText.length
      }
    );
    this.dom.append(this.statusBar.getDOM());
  }

  /**
   * Initialize validation for editor field.
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
        charactersLimit: this.charactersLimit,
        initialChars: this.textarea.innerText.length,
      }
    );
    this.dom.append(this.validation.getDOM());
  }

  /**
   * Initialize submit button for the field.
   */
  initSubmitButton() {
    this.button = new Button(
      {
        i10n: {
          submitButtonLabel: this.globalParams.i10n.submitButtonLabel
        },
        charactersLimit: this.charactersLimit
      },
      {
        onClick: () => {
          const isValid = this.validation.isFieldValid(
            this.getPlaintextContent().length
          );

          if (isValid) {
            this.currentState = 'answered';
            this.callbacks.onXAPI('answered');
            this.validation?.showSuccess();
            this.button.hide();
          }

          window.requestAnimationFrame(() => {
            this.params.globals.get('resize')();
          });
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
  reset() {
    window.CKEDITOR?.instances[this.params.textAreaID]?.updateElement();
    window.CKEDITOR?.instances[this.params.textAreaID]?.setData('');
    this.globalExtras.previousState.content = '';
    this.params.ckEditor.destroy();
    this.textarea.innerHTML = '';
    this.validation?.reset();
    this.statusBar?.reset();
    this.button.show();
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
    const content = this.getPlaintextContent();
    this.statusBar.setUpdatedCharsCount(this.charactersLimit - content.length);
    this.validation.isCharLimitExceeded(content.length);
  }
}

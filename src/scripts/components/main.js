import Util from '@services/util';
import Button from '@components/elements/button';
import StatusBar from '@components/elements/status-bar';
import TextInput from '@components/elements/text-input';
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
    this.dom.classList.add('h5p-reader-question-main-wrapper');

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

    this.initTextInput();
    if (this.charactersLimit > 0) {
      this.initStatusBarChars();
    }
    this.initDoneMessage();
    this.initSubmitButton();

    this.handleTextChanged();

    // Resize content type
    this.params.globals.get('resize')();
  }

  /**
   * Initialize text input field.
   */
  initTextInput() {
    this.textInput = new TextInput(
      {
        id: `h5p-reader-question-text-input-area-${H5P.createUUID()}`,
        isEditing: this.params.isEditing,
        language: this.params.language,
        charactersLimit: this.charactersLimit,
        isRequired: this.params.isRequired,
        placeholder: this.params.placeholder,
        text: this.globalExtras.previousState.content
      },
      {
        onChanged: () => {
          if (!this.wasInteractedWith) {
            this.wasInteractedWith = true;
            this.callbacks.onXAPI('interacted');
          }

          this.handleTextChanged();
        },
        onResized: () => {
          this.params.globals.get('resize')();
        }
      }
    );
    this.dom.append(this.textInput.getDOM());
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
   * Get user response.
   * @returns {string} HTML response of user.
   */
  getResponse() {
    return this.textInput.getHTML();
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return {
      content: this.textInput.getHTML()
    };
  }

  /**
   * Determine whether the task was answered already.
   * @returns {boolean} True if answer was given by user, else false.
   */
  getAnswerGiven() {
    return this.isAnswerGiven;
  }

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  reset() {
    this.globalExtras.previousState.content = '';
    this.isAnswerGiven = false;
    this.wasInteractedWith = false;

    this.textInput.reset();

    this.statusBarChars?.reset();
    this.handleTextChanged();
    this.statusBarChars?.show();

    this.statusBarDone?.reset();

    this.button.show();
  }

  /**
   * Handle clicked on done button.
   */
  handleDone() {
    if (this.textInput.validate()) {
      this.textInput.toggleError(false);
      this.callbacks.onXAPI('answered');

      this.statusBarDone.setMessage(
        this.globalParams.i10n.answeredMessage,
        { styles: ['correct'] }
      );
      this.button.hide();
    }
    else {
      this.textInput.toggleError(true);
      const contentLength = this.textInput.getText().length;

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
   * Handle text changed event.
   */
  handleTextChanged() {
    if (this.textInput.getText().length > 0) {
      this.isAnswerGiven = true;
    }

    if (this.textInput.validate()) {
      this.button.enable();
    }
    else {
      this.button.disable();
    }

    let charsInfoLabel;
    const isCharLimitExceeded = this.textInput.isCharLimitExceeded();

    if (isCharLimitExceeded) {
      charsInfoLabel = this.globalParams.i10n.exceededCharsInfoLabel;
      this.textInput.toggleError(true);
    }
    else {
      charsInfoLabel = this.globalParams.i10n.remainingCharsInfoLabel;
      this.textInput.toggleError(false);
    }

    const remainingChars = this.charactersLimit -
      this.textInput.getText().length;
    this.statusBarChars.setMessage(
      charsInfoLabel.replace(/@chars/g, Math.abs(remainingChars)),
      {
        ...( isCharLimitExceeded && { styles: ['incorrect'] }),
        ...( !isCharLimitExceeded && { styles: ['correct'] })
      }
    );

    this.statusBarDone.hide();
  }
}

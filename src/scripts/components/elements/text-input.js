import Util from '@services/util';
import './text-input.scss';

export default class TextInput {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
      placeholder: '',
      language: 'en',
    }, params);

    this.callbacks = Util.extend({
      onChanged: () => {},
      onResized: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-reader-question-text-input-wrapper');

    this.textarea = document.createElement('div');
    this.textarea.classList.add('h5p-reader-question-text-input-textarea');
    this.textarea.setAttribute('tabindex', 0);
    this.textarea.setAttribute('placeholder', this.params.placeholder);
    if (this.params.text) {
      this.textarea.innerHTML = this.params.text;
    }

    if (!this.params.isEditing) {
      this.textarea.addEventListener('focus', (event) => {
        this.initCKEditor();
      });

      this.textarea.addEventListener('click', (event) => {
        this.initCKEditor();
      });
    }

    this.textarea.id = this.params.id;

    this.dom.append(this.textarea);
  }

  getDOM() {
    return this.dom;
  }

  /**
   * Initialize CKEditor.
   */
  initCKEditor() {
    if (this.ckeditor) {
      return;
    }

    this.ckeditor = this.buildCKEditor();
    this.ckeditor.create();
    this.textarea.innerHTML = this.getText();
  }

  /**
   * Build H5P.CKEditor instance (!== CKEditor instance).
   * @returns {H5P.CKEditor} H5P.CKEditor instance.
   */
  buildCKEditor() {
    const ckeditor = new H5P.CKEditor(
      this.params.id,
      this.params.language,
      undefined,
      this.params.text ?? ''
    );

    ckeditor.on('created', () => {
      this.callbacks.onResized();

      // Catch editor change event
      Util.getCKEditorInstance(this.params.id)?.on('change', () => {
        this.callbacks.onChanged();
      });
    });

    return ckeditor;
  }

  /**
   * Get HTML.
   * @returns {string} HTML.
   */
  getHTML() {
    return this.ckeditor?.getData() ?? this.textarea.innerHTML ?? '';
  }

  /**
   * Get plain text.
   * @returns {string} Plain text.
   */
  getText() {
    return Util.stripHTML(this.getHTML()) ?? this.textarea.innerText ?? '';
  }

  /**
   * Reset.
   */
  reset() {
    this.params.text = '';
    this.ckeditor?.destroy();
    delete this.ckeditor;

    this.textarea.innerHTML = '';
  }

  /**
   * Toggle error state.
   * @param {boolean} [state] Optional forced state.
   */
  toggleError(state) {
    this.isErrorState = (typeof state === 'boolean') ?
      state :
      !this.isErrorState;

    this.dom.classList.toggle('error', this.isErrorState);
  }

  /**
   * Determine whether character limit is exceeded.
   * @returns {boolean} True, if exceeded. Else false.
   */
  isCharLimitExceeded() {
    if (this.params.charactersLimit === 0) {
      return false;
    }

    const contentLength = this.getText().length;
    return this.params.charactersLimit - contentLength < 0;
  }

  /**
   * Determine whether text input is valid.
   * @returns {boolean} True, if valid. Else false.
   */
  validate() {
    const contentLength = this.getText().length;

    if (this.params.isRequired && contentLength === 0) {
      return false;
    }

    return this.params.charactersLimit > 0
      ? !this.isCharLimitExceeded(contentLength)
      : true;
  }
}

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
      H5P.jQuery(this.dom),
      this.params.text ?? '',
      Util.extend(TextInput.DEFAULT_CKE_CONFIG, {
        title: this.params.a11y.textInputTitle
      })
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

/** @constant {object} DEFAULT_CKE_CONFIG Copy from unexposed in H5P.CKEditor. */
TextInput.DEFAULT_CKE_CONFIG = {
  customConfig: '',
  toolbarGroups: [
    { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
    { name: 'styles', groups: [ 'styles' ] },
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    { name: 'editing', groups: [ 'find', 'selection', 'editing' ] },
    { name: 'forms', groups: [ 'forms' ] },
    { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
    { name: 'colors', groups: [ 'colors' ] },
    { name: 'links', groups: [ 'links' ] },
    { name: 'insert', groups: [ 'insert' ] },
    { name: 'tools', groups: [ 'tools' ] },
    { name: 'others', groups: [ 'others' ] },
    { name: 'about', groups: [ 'about' ] }
  ],
  startupFocus: true,
  width: '100%',
  resize_enabled: false,
  linkShowAdvancedTab: false,
  linkShowTargetTab: false,
  forcePasteAsPlainText: true,
  removeButtons: 'Blockquote,Source,HorizontalRule,RemoveFormat,SpecialChar,Maximize,Image,Cut,Copy,Paste,Undo,Redo,Anchor,Subscript,Superscript,Font,BulletedList,NumberedList,Outdent,Indent,About'
};

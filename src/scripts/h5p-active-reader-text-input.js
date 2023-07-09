import Util from '@services/util';
import Globals from '@services/globals';
import Main from '@components/main';
import XAPI from '@mixins/xapi';
import QuestionTypeContract from '@mixins/question-type-contract';
import { decode } from 'he';

const CKEditor = H5P.CKEditor;
let counter = 0;

export default class ActiveReaderTextInput extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();

    Util.addMixins(
      ActiveReaderTextInput, [XAPI, QuestionTypeContract]
    );

    const textAreaID = 'h5p-text-area-' + counter;
    const isEditing = (window.H5PEditor !== undefined);

    counter++;

    this.score = 0;

    // Sanitize parameters
    this.params = Util.extend({
      question: 'Question or description',
      placeholder: 'Enter your response here',
      maxScore: 1,
      isRequired: false,
      behaviour: {
        enableSolutionsButton: false,
        enableRetry: false
      },
      i10n: {
        requiredText: 'required',
        requiredMessage: 'This question requires an answer',
        answeredMessage: 'This question has been answered',
        submitButtonLabel: 'Submit',
        remainingCharsInfoLabel: 'Remaining characters: @chars',
        exceededCharsInfoLabel: '@chars character(s) over limit',
        ariaTextExceedCharcterLimit: 'You have exceeded the character limit for this field. Please remove or shorten your input by @chars characters.',
      },
      a11y: {}
    }, params);

    // Will be used as plain text, so HTML encoding needs to be removed.
    this.params.placeholder = decode(this.params.placeholder);

    this.extras = Util.extend({
      previousState: {
        content: ''
      }
    }, extras);

    const defaultLanguage = extras?.metadata?.defaultLanguage || 'en';
    this.languageTag = Util.formatLanguageCode(defaultLanguage);

    // Set globals
    this.globals = new Globals();
    this.globals.set('params', this.params);
    this.globals.set('extras', this.extras);
    this.globals.set('resize', () => {
      this.trigger('resize');
    });

    this.dom = this.buildDOM();

    const ckeditor = new CKEditor(
      textAreaID,
      params.i10n.language,
      this.extras.parent.$container,
      this.extras.previousState.content
    );

    // Initialize main component
    this.main = new Main(
      {
        globals: this.globals,
        ckEditor: ckeditor,
        textAreaID: textAreaID,
        isEditing: isEditing
      },
      {
        onXAPI: (verb) => {
          this.triggerXAPIEvent(verb);
        }
      }
    );
    this.dom.appendChild(this.main.getDOM());

    ckeditor.on('created', () => {
      this.trigger('resize');
    });
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-reader-question');
    $wrapper.get(0).appendChild(this.dom);
  }

  /**
   * Build main DOM.
   * @returns {HTMLElement} Main DOM.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-reader-question-wrapper');

    return dom;
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return this.main.getCurrentState();
  }

  /**
   * Get response.
   * @returns {string} Response.
   */
  getResponse() {
    return this.main.getResponse();
  }
}

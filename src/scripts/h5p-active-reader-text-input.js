import Util from '@services/util';
import Globals from '@services/globals';
import Main from '@components/main';
import '@styles/h5p-active-reader-text-input.scss';
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

    const textAreaID = 'h5p-text-area-' + counter;
    const isEditing = (window.H5PEditor !== undefined);

    counter++;

    // Sanitize parameters
    this.params = Util.extend({
      question: 'Question or description',
      placeholder: 'Enter your response here',
      maxScore: 1,
      score: 0,
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
        onProgressed: (verb) => {
          this.handleProgressed(verb);
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
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
    // H5P Core function: createTitle
    return H5P.createTitle(
      this.extras?.metadata?.title || ActiveReaderTextInput.DEFAULT_DESCRIPTION
    );
  }

  /**
   * Get description.
   * @returns {string} Description.
   */
  getDescription() {
    return ActiveReaderTextInput.DEFAULT_DESCRIPTION;
  }

  /**
   * Handle progressed.
   * @param {string} verb Verb id.
   */
  handleProgressed(verb) {
    // TODO: Check it verb is necessary
    this.triggerXAPIEvent(verb);
  }

  /**
   * Trigger xAPI event.
   * @param {string} verb Short id of the verb we want to trigger.
   */
  triggerXAPIEvent(verb) {
    const xAPIEvent = this.createXAPIEvent(verb);
    this.trigger(xAPIEvent);
  }

  /**
   * Create an xAPI event.
   * @param {string} verb Short id of the verb we want to trigger.
   * @returns {H5P.XAPIEvent} Event template.
   */
  createXAPIEvent(verb) {
    const xAPIEvent = this.createXAPIEventTemplate(verb);
    Util.extend(
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
      this.getXAPIDefinition(this.params.question)
    );

    if (verb === 'answered') {
      // TODO: Clean this up, cmp. Keyword Selector

      this.params.score = this.params.maxScore;
      xAPIEvent.setScoredResult(
        this.params.maxScore, this.params.maxScore, this
      );
      xAPIEvent.data.statement.result.score.raw = this.params.maxScore;

      // Add the response to the xAPI statement
      // Return a stored user response if it exists
      xAPIEvent.data.statement.result.response = this.getResponse();
    }

    return xAPIEvent;
  }

  /**
   * Create a definition template
   * @param {string} question Question text
   * @returns {object} XAPI definition template
   */
  getXAPIDefinition(question) {
    let definition = {};

    // TODO: Add language tag

    definition.interactionType = 'fill-in';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': question // We don't know the language at runtime
    };
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.ActiveReaderTextInput'
    };

    return definition;
  };

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

  // TODO: Use xAPI mixin

  /**
   * Get xAPI data.
   * @returns {object} XAPI statement.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  getXAPIData() {
    const xAPIEvent = this.createXAPIEvent('completed');
    return {
      statement: xAPIEvent.data.statement
    };
  }

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  resetTask() {
    this.main.resetTask();
  }

  /**
   * Get current score.
   * @returns {number} Current score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  getScore() {
    return this.params.score;
  }

  /**
   * Get maximum possible score.
   * @returns {number} Score necessary for mastering.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  getMaxScore() {
    return this.params.maxScore;
  }
}

/** @constant {string} Default description */
ActiveReaderTextInput.DEFAULT_DESCRIPTION = 'Active Reader Text Input';

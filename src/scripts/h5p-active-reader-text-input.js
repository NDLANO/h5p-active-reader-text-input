import Util from '@services/util';
import Main from '@components/main';
import XAPI from '@mixins/xapi';
import QuestionTypeContract from '@mixins/question-type-contract';
import { decode } from 'he';
import '@styles/h5p-active-reader-text-input.scss';

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
      l10n: {
        requiredText: 'required',
        requiredMessage: 'This question requires an answer',
        answeredMessage: 'This question has been answered',
        doneButtonLabel: 'Done',
        remainingCharsInfoLabel: 'Remaining characters: @chars',
        exceededCharsInfoLabel: '@chars character(s) over limit'
      },
      a11y: {
        // eslint-disable-next-line @stylistic/js/max-len
        textExceedCharcterLimit:'You have exceeded the character limit for this field. Please remove or shorten your input by @chars characters.',
        textInputTitle: 'Text input field',
      }
    }, params);

    this.extras = Util.extend({ previousState: { content: '' } }, extras);

    const defaultLanguage = extras?.metadata?.defaultLanguage || 'en';
    this.languageTag = Util.formatLanguageCode(defaultLanguage);

    // Initialize main component
    this.main = new Main(
      {
        isEditing: window.H5PEditor !== undefined,
        isRequired: this.params.isRequired,
        question: this.params.question,
        language: this.params.l10n.language ?? defaultLanguage,
        charactersLimit: parseInt(this.params.charactersLimit) || 0,
        placeholder: Util.stripHTML(decode(this.params.placeholder)),
        l10n: this.params.l10n,
        a11y: this.params.a11y,
        previousState: this.extras.previousState
      },
      {
        onXAPI: (verb) => {
          if (verb === 'answered') {
            this.score = this.params.maxScore;
          }

          this.triggerXAPIEvent(verb);
        },
        onResized: () => {
          this.trigger('resize');
        }
      }
    );
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-reader-question');
    $wrapper.get(0).appendChild(this.main.getDOM());
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object|undefined} Current state.
   */
  getCurrentState() {
    if (!this.getAnswerGiven()) {
      return; // User has not entered text
    }

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

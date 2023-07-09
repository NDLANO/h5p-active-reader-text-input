import Util from '@services/util';

/**
 * Mixin containing methods for xapi stuff.
 */
export default class XAPI {
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

    definition.name = {};
    definition.name[this.languageTag] = this.getTitle();
    // Fallback for h5p-php-reporting, expects en-US
    definition.name['en-US'] = definition.name[this.languageTag];

    definition.description = {};
    definition.description[this.languageTag] =  question;
    // Fallback for h5p-php-reporting, expects en-US
    definition.description['en-US'] = definition.description[this.languageTag];

    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'fill-in';

    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.XAPI'
    };

    return definition;
  };

  /**
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
    // H5P Core function: createTitle
    return H5P.createTitle(
      this.extras?.metadata?.title || XAPI.DEFAULT_DESCRIPTION
    );
  }

  /**
   * Get description.
   * @returns {string} Description.
   */
  getDescription() {
    return XAPI.DEFAULT_DESCRIPTION;
  }
}

/** @constant {string} Default description */
XAPI.DEFAULT_DESCRIPTION = 'Active Reader Text Input';

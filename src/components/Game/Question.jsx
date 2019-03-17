import React, { Component } from 'react';
import {first, kanas, last} from '../../data/hangeul';
import { quizSettings } from '../../data/quizSettings';
import {
  findRomajisAtKanaKey,
  cartesianProduct,
  getRandomInt,
  getRomanization,
  shuffle
} from '../../data/helperFuncs';
import './Question.scss';

/**
 * Self-explanatory. Also displays itself.
 */
export default class Question extends Component {
  state = {
    previousQuestion: [],
    previousAnswer: '',
    currentAnswer: '',
    currentQuestion: [],
    answerOptions: [],
    stageProgress: 0
  };

  /**
   * Selects and returns an array of  number of random syllables, identified (as usual) by their
   * hexadecimal Unicode value.
   *
   * @param amount
   *    Number of random syllables to return in total, after taking into account `include` and `exclude`.
   *
   * @param include
   *    An optional array that includes syllables that should be included in the returned array,
   *    identified (as usual) by their hexadecimal Unicode values.
   *
   * @param exclude
   *    An optional array that includes syllables that should be excluded from the returned array,
   *    identified (as usual) by their hexadecimal Unicode values.
   */
  getRandomSyllables(amount, include, exclude) {
    console.log('amount: ' + amount);
    console.log('include: ' + include);
    console.log('exclude: ' + exclude);
    let randomSyllables = [];
    let romanizations = []; // Temp array, used for checking romanization clashes
    let desiredRandomSyllableAmount = amount;
    if (include)
      desiredRandomSyllableAmount -= include.length;

    while (randomSyllables.length < desiredRandomSyllableAmount) {
      // Pick a random syllable from `first` to `last`
      let randomSyllable = getRandomInt(parseInt(first, 16), parseInt(last, 16)).toString(16);

      // TODO: Don't include any syllables outside the chosen groups

      // Don't include the specified syllables in `exclude`
      if (exclude && exclude.includes(randomSyllable))
        continue;

      // Don't include any already-chosen syllables
      if (randomSyllables.includes(randomSyllable))
        continue;

      // Don't include any syllables that clash in romanization with already chosen syllables
      let romanization = getRomanization(randomSyllable);
      if (romanizations.includes(romanization))
        continue;

      // Good to go!
      randomSyllables.push(randomSyllable);
      romanizations.push(romanization);
    }

    // Add the `include` syllables
    if (include) {
      for (var i = 0; i < include.length; i++)
        randomSyllables.push(include[i]);
    }

    shuffle(randomSyllables);
    console.log(randomSyllables);
    return randomSyllables;
  }

  /**
   * Selects a syllable and some answer options, and set up the state to show them as the current question.
   */
  setNewQuestion() {
    // Pick a new question and syllables, based on the stage
    if (this.props.stage !== 4)
      this.currentQuestion = this.getRandomSyllables(1, false, this.previousQuestion);
    else
      this.currentQuestion = this.getRandomSyllables(3, false, this.previousQuestion);

    // Pick some syllables as options for answers
    // TODO: Support stage 4?
    this.answerOptions = this.getRandomSyllables(3, this.currentQuestion, false);

    this.setState({
      currentQuestion: this.currentQuestion,
      answerOptions: this.answerOptions
    });

    // Determine which of the answer options are acceptable answers
    this.allowedAnswers = [];
    if (this.props.stage === 1 || this.props.stage === 3) // Answers for stages 1 and 3 are romanizations
      this.allowedAnswers = this.currentQuestion.map(s => getRomanization(s));
    else if (this.props.stage === 2) // Answers for stage 2 are the Hangeul syllables
      this.allowedAnswers = this.currentQuestion;
    else if (this.props.stage === 4) { // Answers for stage 4 are ... TODO
      let tempAllowedAnswers = [];
      this.currentQuestion.forEach(key => tempAllowedAnswers.push(findRomajisAtKanaKey(key, kanas)));
      cartesianProduct(tempAllowedAnswers).forEach(answer => this.allowedAnswers.push(answer.join('')));
    }
  }

  getAnswerType() {
    if (this.props.stage === 2) return 'hangeul';
    else return 'romanization';
  }

  getShowableQuestion() {
    if (this.getAnswerType() === 'hangeul')
      return this.state.currentQuestion.map(s => getRomanization((s))).join(' ');
    else return this.state.currentQuestion.map(s => String.fromCharCode(parseInt(s, 16))).join();
  }

  getPreviousResult() {
    let resultString = '';
    if (this.previousQuestion === '')
      resultString = <div className="previous-result none">Let's go! Which character is this?</div>;
    else {
      let rightAnswer = (
        this.props.stage === 2 ?
          findRomajisAtKanaKey(this.previousQuestion, kanas)[0]
          : this.previousQuestion.join('')
        )+' = '+ this.previousAllowedAnswers[0];

      if (this.previousAllowedAnswers.includes(this.previousAnswer))
        resultString = (
          <div className="previous-result correct" title="Correct answer!">
            <span className="pull-left glyphicon glyphicon-none"/>{rightAnswer}<span className="pull-right glyphicon glyphicon-ok"/>
          </div>
        );
      else
        resultString = (
          <div className="previous-result wrong" title="Wrong answer!">
            <span className="pull-left glyphicon glyphicon-none"/>{rightAnswer}<span className="pull-right glyphicon glyphicon-remove"/>
          </div>
        );
    }
    return resultString;
  }

  handleAnswer = answer => {
    if (this.props.stage <= 2)
      document.activeElement.blur(); // reset answer button's :active
    this.previousQuestion = this.currentQuestion;
    this.previousAnswer = answer;
    this.previousAllowedAnswers = this.allowedAnswers;

    // Determine if the correct answer was chosen and adjust the stage progress
    if (this.previousAllowedAnswers.includes(this.previousAnswer))
      this.stageProgress = this.stageProgress + 1;
    else
      this.stageProgress = this.stageProgress > 0 ? this.stageProgress - 1 : 0;

    this.setState({
      previousAnswer: this.previousAnswer,
      previousQuestion: this.previousQuestion,
      stageProgress: this.stageProgress
    });

    if (this.stageProgress >= quizSettings.stageLength[this.props.stage] && !this.props.isLocked)
      setTimeout(() => { this.props.handleStageUp() }, 300);
    else
      this.setNewQuestion();
  };

  handleAnswerChange = e => {
    this.setState({currentAnswer: e.target.value.replace(/\s+/g, '')});
  };

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.currentAnswer !== '') {
      this.handleAnswer(this.state.currentAnswer.toLowerCase());
      this.setState({currentAnswer: ''});
    }
  };

  componentWillMount() {
    this.previousQuestion = '';
    this.previousAnswer = '';
    this.stageProgress = 0;

    // TODO: Don't include any syllables outside the chosen groups
    // (See getRandomSyllables and the TODO there)
    //if(arrayContains(groupName, this.props.decidedGroups)) {
    //}
  }

  componentDidMount() {
    this.setNewQuestion();
  }

  render() {
    let btnClass = "btn btn-default answer-button";
    if ('ontouchstart' in window)
      btnClass += " no-hover"; // disables hover effect on touch screens
    let stageProgressPercentage = Math.round((this.state.stageProgress/quizSettings.stageLength[this.props.stage])*100)+'%';
    let stageProgressPercentageStyle = { width: stageProgressPercentage };
    return (
      <div className="text-center question col-xs-12">
        {this.getPreviousResult()}
        <div className="big-character">{this.getShowableQuestion()}</div>
        <div className="answer-container">
          {
            this.props.stage < 3 ?
              this.state.answerOptions.map((answer, idx) => {
                return <AnswerButton answer={answer}
                  className={btnClass}
                  key={idx}
                  answertype={this.getAnswerType()}
                  handleAnswer={this.handleAnswer} />
              })
            : <div className="answer-form-container">
                <form onSubmit={this.handleSubmit}>
                  <input autoFocus className="answer-input" type="text" value={this.state.currentAnswer} onChange={this.handleAnswerChange} />
                </form>
              </div>
          }
        </div>
        <div className="progress">
          <div className="progress-bar progress-bar-info"
            role="progressbar"
            aria-valuenow={this.state.stageProgress}
            aria-valuemin="0"
            aria-valuemax={quizSettings.stageLength[this.props.stage]}
            style={stageProgressPercentageStyle}
          >
            <span>Stage {this.props.stage} {this.props.isLocked?' (Locked)':''}</span>
          </div>
        </div>
      </div>
    );
  }
}

class AnswerButton extends Component {
  getShowableAnswer() {
    if (this.props.answertype === 'romanization')
      return getRomanization(this.props.answer);
    else return String.fromCharCode(parseInt(this.props.answer, 16));
  }

  render() {
    return (
      <button className={this.props.className} onClick={() => this.props.handleAnswer(this.getShowableAnswer())}>
        {this.getShowableAnswer()}
      </button>
    );
  }
}

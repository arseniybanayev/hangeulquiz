import React, { Component } from 'react';
import {first, kanas, last} from '../../data/hangeul';
import { quizSettings } from '../../data/quizSettings';
import {
  findRomajisAtKanaKey,
  arrayContains,
  cartesianProduct,
  getRandomInt, getRomanization
} from '../../data/helperFuncs';
import './Question.scss';

class Question extends Component {
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

    return randomSyllables;
  }

  setNewQuestion() {
    if (this.props.stage !== 4)
      this.currentQuestionSyllables = this.getRandomSyllables(1, false, this.previousQuestion);
    else
      this.currentQuestionSyllables = this.getRandomSyllables(3, false, this.previousQuestion);
    this.setState({currentQuestion: this.currentQuestionSyllables});
    this.setAnswerOptions();
    this.setAllowedAnswers();
    // console.log(this.currentQuestionSyllables);
  }

  setAnswerOptions() {
    this.answerOptions = this.getRandomSyllables(3, this.currentQuestionSyllables[0], false);
    this.setState({answerOptions: this.answerOptions});
    // console.log(this.answerOptions);
  }

  setAllowedAnswers() {
    // console.log(this.currentQuestionSyllables);
    this.allowedAnswers = [];
    if(this.props.stage==1 || this.props.stage==3)
      this.allowedAnswers = findRomajisAtKanaKey(this.currentQuestionSyllables, kanas);
    else if(this.props.stage==2)
      this.allowedAnswers = this.currentQuestionSyllables;
    else if(this.props.stage==4) {
      let tempAllowedAnswers = [];

      this.currentQuestionSyllables.forEach(key => {
        tempAllowedAnswers.push(findRomajisAtKanaKey(key, kanas));
      });

      cartesianProduct(tempAllowedAnswers).forEach(answer => {
        this.allowedAnswers.push(answer.join(''));
      });
    }
    // console.log(this.allowedAnswers);
  }

  handleAnswer = answer => {
    if(this.props.stage<=2) document.activeElement.blur(); // reset answer button's :active
    this.previousQuestion = this.currentQuestionSyllables;
    this.setState({previousQuestion: this.previousQuestion});
    this.previousAnswer = answer;
    this.setState({previousAnswer: this.previousAnswer});
    this.previousAllowedAnswers = this.allowedAnswers;
    if(this.isInAllowedAnswers(this.previousAnswer))
      this.stageProgress = this.stageProgress+1;
    else
      this.stageProgress = this.stageProgress > 0 ? this.stageProgress - 1 : 0;
    this.setState({stageProgress: this.stageProgress});
    if(this.stageProgress >= quizSettings.stageLength[this.props.stage] && !this.props.isLocked) {
      setTimeout(() => { this.props.handlehStageUp() }, 300);
    }
    else
      this.setNewQuestion();
  };

  initializeCharacters() {
    this.previousQuestion = '';
    this.previousAnswer = '';
    this.stageProgress = 0;
        // do we want to include this group?
        //if(arrayContains(groupName, this.props.decidedGroups)) {
        //}
  }

  getAnswerType() {
    if(this.props.stage==2) return 'kana';
    else return 'romaji';
  }

  getShowableQuestion() {
    if(this.getAnswerType()=='kana')
      return findRomajisAtKanaKey(this.state.currentQuestion, kanas)[0];
    else return this.state.currentQuestion;
  }

  getPreviousResult() {
    let resultString='';
    // console.log(this.previousAnswer);
    if(this.previousQuestion=='')
      resultString = <div className="previous-result none">Let's go! Which character is this?</div>
    else {
      let rightAnswer = (
        this.props.stage==2 ?
          findRomajisAtKanaKey(this.previousQuestion, kanas)[0]
          : this.previousQuestion.join('')
        )+' = '+ this.previousAllowedAnswers[0];

      if(this.isInAllowedAnswers(this.previousAnswer))
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

  isInAllowedAnswers(previousAnswer) {
    // console.log(previousAnswer);
    // console.log(this.allowedAnswers);
    if(arrayContains(previousAnswer, this.previousAllowedAnswers))
      return true;
    else return false;
  }

  handleAnswerChange = e => {
    this.setState({currentAnswer: e.target.value.replace(/\s+/g, '')});
  }

  handleSubmit = e => {
    e.preventDefault();
    if(this.state.currentAnswer!='') {
      this.handleAnswer(this.state.currentAnswer.toLowerCase());
      this.setState({currentAnswer: ''});
    }
  }

  componentWillMount() {
    this.initializeCharacters();
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
            this.props.stage<3 ?
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
    if(this.props.answertype=='romaji')
      return findRomajisAtKanaKey(this.props.answer, kanas)[0];
    else return this.props.answer;
  }

  render() {
    return (
      <button className={this.props.className} onClick={()=>this.props.handleAnswer(this.getShowableAnswer())}>{this.getShowableAnswer()}</button>
    );
  }
}
export default Question;

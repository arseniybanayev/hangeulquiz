import React, { Component } from 'react';
import ShowStage from './ShowStage';
import Question from './Question';

/**
 * Handles display of either the stage # screen or the question screen.
 */
export default class Game extends Component {
  state = { showScreen: '' };

  componentWillMount() {
    this.setState({showScreen: 'stage'});
  }

  stageUp = () => {
    this.props.stageUp();
    this.setState({showScreen: 'stage'});
  };

  lockStage = stage => {
    this.setState({showScreen: 'question'});
    this.props.lockStage(stage);
  };

  handleAnswer = isCorrectAnswer => {
    // Tell the game container to update the stage
    let delta = isCorrectAnswer
      ? 1
      : (this.stageProgress > 0 ? - 1 : 0);
    this.props.handleUpdateStageProgress(delta);
  };

  startShowingQuestions = () => {
    this.setState({showScreen: 'question'});
    this.refs.question.initializeAsNewQuestion();
  };

  showNewQuestion = () => {

  };

  render() {
    return (
      <div>
        {
          this.state.showScreen === 'stage' &&
            <ShowStage lockStage={this.lockStage}
                       handleStartShowingQuestions={this.startShowingQuestions}
                       handleEndGame={this.props.handleEndGame}
                       stage={this.props.stage} />
        }
        {
          this.state.showScreen === 'question' &&
            <Question ref="question"
                      isLocked={this.props.isLocked}
                      handleAnswer={this.handleAnswer}
                      stage={this.props.stage}
                      allowedSyllables={this.props.allowedSyllables} />
        }
      </div>
    );
  }
}

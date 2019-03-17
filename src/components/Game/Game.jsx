import React, { Component } from 'react';
import ShowStage from './ShowStage';
import Question from './Question';

/**
 * Keeps track of current game stage and handles display of either the
 * stage # screen or the question screen. (The stage # screen will call
 * a callback on this class to show the question screen.)
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

  showQuestion = () => {
    this.setState({showScreen: 'question'})
  };

  render() {
    return (
      <div>
        {
          this.state.showScreen === 'stage' &&
            <ShowStage lockStage={this.lockStage}
                       handleShowQuestion={this.showQuestion}
                       handleEndGame={this.props.handleEndGame}
                       stage={this.props.stage} />
        }
        {
          this.state.showScreen === 'question' &&
            <Question isLocked={this.props.isLocked}
                      handleStageUp={this.stageUp}
                      stage={this.props.stage}
                      allowedSyllables={this.props.allowedSyllables} />
        }
      </div>
    );
  }
}

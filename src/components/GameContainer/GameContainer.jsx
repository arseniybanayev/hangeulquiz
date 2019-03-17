import React, { Component } from 'react';
import SetupGame from '../ChooseCharacters/SetupGame';
import Game from '../Game/Game';

/**
 * Manages and displays either the game screen (Game) or the settings screen (SetupGame).
 */
export default class GameContainer extends Component {
  state = {
    stage: 1,
    isLocked: false,
    selectedRuleNames: JSON.parse(localStorage.getItem('selectedRuleNames') || null) || []
  };

  componentWillReceiveProps() {
    if (!this.state.isLocked)
      this.setState({stage: 1});
  }

  startGame = selectedRuleNames => {
    if (parseInt(this.state.stage) < 1 || isNaN(parseInt(this.state.stage)))
      this.setState({stage: 1});
    else if (parseInt(this.state.stage) > 4)
      this.setState({stage: 4});

    this.setState({selectedRuleNames: selectedRuleNames});
    localStorage.setItem('selectedRuleNames', JSON.stringify(selectedRuleNames));
    this.props.handleStartGame();
  };

  stageUp = () => {
    this.setState({stage: this.state.stage+1});
  };

  lockStage = (stage, forceLock) => {
    if (forceLock)
      this.setState({stage: stage, isLocked: true});
    else
      this.setState({stage: stage, isLocked: !this.state.isLocked});
  };

  render() {
    return (
      <div>
        { this.props.gameState === 'chooseCharacters' &&
            <SetupGame selectedRuleNames={this.state.selectedRuleNames}
                       handleStartGame={this.startGame}
                       stage={this.state.stage}
                       isLocked={this.state.isLocked}
                       lockStage={this.lockStage}
            />
          }
          { this.props.gameState === 'game' &&
              <Game selectedRuleNames={this.state.selectedRuleNames}
                handleEndGame={this.props.handleEndGame}
                stageUp={this.stageUp}
                stage={this.state.stage}
                isLocked={this.state.isLocked}
                lockStage={this.lockStage}
              />
          }
        </div>
    )
  }
}

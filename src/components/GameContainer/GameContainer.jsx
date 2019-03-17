import React, { Component } from 'react';
import ChooseSyllables from '../ChooseCharacters/ChooseSyllables';
import Game from '../Game/Game';

/**
 * Manages and displays either the game screen (Game) or the settings screen (ChooseSyllables).
 */
export default class GameContainer extends Component {
  state = {
    stage: 1,
    isLocked: false,
    selectedGroupNames: JSON.parse(localStorage.getItem('selectedGroupNames') || null) || []
  };

  componentWillReceiveProps() {
    if (!this.state.isLocked)
      this.setState({stage: 1});
  }

  startGame = selectedGroupNames => {
    if (parseInt(this.state.stage) < 1 || isNaN(parseInt(this.state.stage)))
      this.setState({stage: 1});
    else if (parseInt(this.state.stage) > 4)
      this.setState({stage: 4});

    this.setState({selectedGroupNames: selectedGroupNames});
    localStorage.setItem('selectedGroupNames', JSON.stringify(selectedGroupNames));
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
            <ChooseSyllables selectedGroupNames={this.state.selectedGroupNames}
                             handleStartGame={this.startGame}
                             stage={this.state.stage}
                             isLocked={this.state.isLocked}
                             lockStage={this.lockStage}
            />
          }
          { this.props.gameState === 'game' &&
              <Game selectedGroupNames={this.state.selectedGroupNames}
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

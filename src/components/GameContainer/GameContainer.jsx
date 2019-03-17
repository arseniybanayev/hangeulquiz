import React, { Component } from 'react';
import SetupGame from '../ChooseCharacters/SetupGame';
import Game from '../Game/Game';
import {getAllowedSyllables, lookupRulesByName} from "../../util";

/**
 * Manages and displays either the game screen (Game) or the settings screen (SetupGame).
 */
export default class GameContainer extends Component {
  state = {
    stage: 1,
    isLocked: false,
    // Read the previously selected rules name from local storage
    selectedRuleNames: JSON.parse(localStorage.getItem('selectedRuleNames') || null) || []
  };

  componentWillReceiveProps() {
    if (!this.state.isLocked)
      this.setState({stage: 1});
  }

  startGame = selectedRuleNames => {
    // Keep the selected stage within a range
    if (parseInt(this.state.stage) < 1 || isNaN(parseInt(this.state.stage)))
      this.setState({stage: 1});
    else if (parseInt(this.state.stage) > 3)
      this.setState({stage: 3});

    // Save the selected rule names to local storage
    localStorage.setItem('selectedRuleNames', JSON.stringify(selectedRuleNames));

    // Determine the allowed syllable set before the game starts
    let allowedSyllables = getAllowedSyllables(lookupRulesByName(selectedRuleNames));
    this.setState({
      selectedRuleNames: selectedRuleNames,
      allowedSyllables: allowedSyllables
    });

    // Actually start the game
    this.props.handleStartGame();
  };

  stageUp = () => {
    this.setState({stage: this.state.stage + 1});
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
              <Game allowedSyllables={this.state.allowedSyllables}
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

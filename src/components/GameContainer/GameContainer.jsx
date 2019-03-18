import React, { Component } from 'react';
import SetupGame from '../ChooseCharacters/SetupGame';
import Game from '../Game/Game';
import {getAllowedSyllables, lookupLetterSetsByName, lookupSyllableSetsByName} from "../../util";

/**
 * Manages and displays either the game screen (Game) or the settings screen (SetupGame).
 */
export default class GameContainer extends Component {
  state = {
    stage: 1,
    isLocked: false,
    // Read the previously selected syllable/letter sets from local storage
    selectedLetterSetNames: JSON.parse(localStorage.getItem('selectedLetterSetNames') || null) || [],
    selectedSyllableSetNames: JSON.parse(localStorage.getItem('selectedSyllableSetNames') || null) || []
  };

  componentWillReceiveProps() {
    if (!this.state.isLocked)
      this.setState({stage: 1});
  }

  startGame = (selectedLetterSetNames, selectedSyllableSetNames) => {
    // Keep the selected stage within a range
    if (parseInt(this.state.stage) < 1 || isNaN(parseInt(this.state.stage)))
      this.setState({stage: 1});
    else if (parseInt(this.state.stage) > 3)
      this.setState({stage: 3});

    // Save the selected rule names to local storage
    localStorage.setItem('selectedLetterSetNames', JSON.stringify(selectedLetterSetNames));
    localStorage.setItem('selectedSyllableSetNames', JSON.stringify(selectedSyllableSetNames));

    // Determine the allowed syllable set before the game starts
    let letterSets = lookupLetterSetsByName(selectedLetterSetNames);
    let syllableSets = lookupSyllableSetsByName(selectedSyllableSetNames);
    let allowedSyllables = getAllowedSyllables(letterSets, syllableSets);
    this.setState({
      selectedLetterSetNames: selectedLetterSetNames,
      selectedSyllableSetNames: selectedSyllableSetNames,
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
            <SetupGame selectedLetterSetNames={this.state.selectedLetterSetNames}
                       selectedSyllableSetNames={this.state.selectedSyllableSetNames}
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

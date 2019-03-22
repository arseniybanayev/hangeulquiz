import React, { Component } from 'react';
import GameSetup from '../GameSetup/GameSetup';
import Game from '../Game/Game';
import {getAllowedSyllables, lookupLetterSetsByName, lookupSyllableSetsByName} from "../../util";
import {gameSettings} from "../../gameSettings";
import './GameContainer.scss';

/**
 * Manages and displays either the game screen (Game) or the settings screen (GameSetup).
 */
export default class GameContainer extends Component {
  state = {
    gameState: 'gameSetup',
    stage: 1,
    stageProgress: 0,
    isLocked: false,
    // Read the previously selected syllable/letter sets from local storage
    selectedLetterSetNames: JSON.parse(localStorage.getItem('selectedLetterSetNames') || null) || [],
    selectedSyllableSetNames: JSON.parse(localStorage.getItem('selectedSyllableSetNames') || null) || [],
    recentProgress: JSON.parse(localStorage.getItem('recentProgress') || null) || []
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
    this.setState({ gameState: 'game' });
  };

  lockStage = (stage, forceLock) => {
    if (forceLock)
      this.setState({stage: stage, isLocked: true});
    else
      this.setState({stage: stage, isLocked: !this.state.isLocked});
  };

  updateStageProgress = (delta) => {
    this.state.stageProgress += delta;

    // Check the progress against the goal
    if (this.stageProgress >= gameSettings.stageLength[this.state.stage] && !this.state.isLocked)
      setTimeout(() => {
        this.setState({stage: this.state.stage + 1});
      }, 300);
    else // Tell the game to show another question
      this.refs.question.initializeAsNewQuestion();
  };

  render() {
    let stageProgressPercentage = Math.round((this.state.stageProgress / gameSettings.stageLength[this.state.stage]) * 100) + '%';
    let stageProgressPercentageStyle = { width: stageProgressPercentage };

    return (
      <div>
        <div className="row">
        { this.state.gameState === 'gameSetup' &&
            <GameSetup selectedLetterSetNames={this.state.selectedLetterSetNames}
                       selectedSyllableSetNames={this.state.selectedSyllableSetNames}
                       handleStartGame={this.startGame}
                       stage={this.state.stage}
                       isLocked={this.state.isLocked}
                       lockStage={this.lockStage}
            />
          }
          { this.state.gameState === 'game' &&
              <Game allowedSyllables={this.state.allowedSyllables}
                    handleUpdateStageProgress={this.updateStageProgress}
                    handleEndGame={this.endGame}
                    stageUp={this.stageUp}
                    stage={this.state.stage}
                    isLocked={this.state.isLocked}
                    lockStage={this.lockStage}
              />
          }
        </div>
        <div className="row">
          <div className="col-xs-12 text-center">
            <div className="progress">
              <div className="progress-bar progress-bar-info"
                   role="progressbar"
                   aria-valuenow={this.state.stageProgress}
                   aria-valuemin="0"
                   aria-valuemax={gameSettings.stageLength[this.state.stage]}
                   style={stageProgressPercentageStyle}
              >
                <span>Stage {this.state.stage} {this.state.isLocked?' (Locked)':''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

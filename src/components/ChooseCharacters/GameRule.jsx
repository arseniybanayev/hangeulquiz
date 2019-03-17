import React, { Component } from 'react';
import {WritingType} from "../Game/Question";
import {romanizations} from "../../hangeul";
import {shuffle} from "../../util";

/**
 * A set of inclusions/exclusions on allowed questions. Intended to control what
 * syllables appear in the game by difficulty or frequency/commonness.
 */
export default class GameRule extends Component {
  state = { displayString: '' };

  changeDisplayString(newString) {
    this.setState({displayString: newString})
  }

  getDisplayString(writingType) {
    if (this.props.allowedLetters) {
      return this.props.allowedLetters
        .map(c => writingType === WritingType.HANGEUL ? c : romanizations[c][0])
        .join(' · ');
    } else if (this.props.allowedSyllables) {
      let allowedSyllables = this.props.allowedSyllables;
      shuffle(allowedSyllables);
      return allowedSyllables
        .splice(0, 7)
        .map(hex => String.fromCharCode(parseInt(hex, 16)))
        .concat(['...'])
        .join(' · ');
    } else {
      return '';
    }
  }

  componentWillMount() {
    this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL));
  }

  render() {
    return (
      <div
        className={'choose-row'}
        onClick={() => this.props.handleToggleSelect(this.props.ruleName)}
        onMouseDown={() => this.changeDisplayString(this.getDisplayString(WritingType.ROMANIZATION))}
        onMouseUp={() => this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL))}
        onTouchStart={() => this.changeDisplayString(this.getDisplayString(WritingType.ROMANIZATION))}
        onTouchEnd={() => this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL))}
      >
        <span className={this.props.selected ?
          'glyphicon glyphicon-small glyphicon-check' :
          'glyphicon glyphicon-small glyphicon-unchecked'} />
          {/*There are two spaces here, and headers have one space*/}
          &nbsp;&nbsp;{this.props.ruleName}: {this.state.displayString}
      </div>
    );
  }
}

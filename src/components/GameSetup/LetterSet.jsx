import React, { Component } from 'react';
import {WritingType} from "../Game/Question";
import {romanizations} from "../../hangeul";

/**
 * A set of inclusions/exclusions on allowed questions. Intended to control what
 * syllables appear in the game by difficulty or frequency/commonness.
 */
export default class LetterSet extends Component {
  state = { displayString: '' };

  changeDisplayString(newString) {
    this.setState({displayString: newString})
  }

  getDisplayString(writingType) {
    return this.props.allowedLetters
      .map(c => writingType === WritingType.HANGEUL ? c : romanizations[c][0])
      .join(' · ');
  }

  componentWillMount() {
    this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL));
  }

  render() {
    return (
      <div
        className={'choose-row'}
        onClick={() => this.props.handleToggleSelect(this.props.name)}
        onMouseDown={() => this.changeDisplayString(this.getDisplayString(WritingType.ROMANIZATION))}
        onMouseUp={() => this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL))}
        onTouchStart={() => this.changeDisplayString(this.getDisplayString(WritingType.ROMANIZATION))}
        onTouchEnd={() => this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL))}
      >
        <span className={this.props.selected ?
          'glyphicon glyphicon-small glyphicon-check' :
          'glyphicon glyphicon-small glyphicon-unchecked'} />
          {/*There are two spaces here, and categories have one space*/}
          &nbsp;&nbsp;{this.props.name}: {this.state.displayString}
      </div>
    );
  }
}

import React, { Component } from 'react';
import {WritingType} from "../Game/Question";
import {romanizations} from "../../hangeul";

/**
 * A set of inclusions/exclusions on allowed questions. Intended to control what
 * syllables appear in the game by difficulty or frequency/commonness.
 */
export default class LetterSet extends Component {
  getDisplayString(writingType) {
    return this.props.allowedLetters
      .map(c => writingType === WritingType.HANGEUL ? c : romanizations[c][0])
      .join(' · ');
  }

  render() {
    return (
      <div
        className={'choose-row'}
        onClick={() => this.props.handleToggleSelect(this.props.name)}
      >
        <span className={this.props.selected ?
          'glyphicon glyphicon-small glyphicon-check' :
          'glyphicon glyphicon-small glyphicon-unchecked'} />
          {/*There are two spaces here, and categories have one space*/}
          &nbsp;&nbsp;{this.props.name}: {this.getDisplayString(WritingType.HANGEUL)}
          &nbsp;&nbsp;<span className='romanization'>{this.getDisplayString(WritingType.ROMANIZATION)}</span>
      </div>
    );
  }
}

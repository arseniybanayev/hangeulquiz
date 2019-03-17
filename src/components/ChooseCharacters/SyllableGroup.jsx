import React, { Component } from 'react';
import {WritingType} from "../Game/Question";
import {romanizations} from "../../hangeul";

/**
 * A set of restrictions on allowed questions. Intended to control what syllables appear
 * in the game by difficulty or frequency/commonness.
 */
export default class SyllableGroup extends Component {
  state = { charactersToDisplay: '' };

  changeDisplayString(newString) {
    this.setState({charactersToDisplay: newString})
  }

  getDisplayString(writingType) {
    if (this.props.characterSet) {
      return this.props.characterSet
        .map(c => writingType === WritingType.HANGEUL ? c : romanizations[c][0])
        .join(' · ');
    } else {
      return 'On/Off';
    }
  }

  componentWillMount() {
    this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL));
  }

  render() {
    return (
      <div
        className={'choose-row'}
        onClick={() => this.props.handleToggleSelect(this.props.groupName)}
        onMouseDown={() => this.changeDisplayString(this.getDisplayString(WritingType.ROMANIZATION))}
        onMouseUp={() => this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL))}
        onTouchStart={() => this.changeDisplayString(this.getDisplayString(WritingType.ROMANIZATION))}
        onTouchEnd={() => this.changeDisplayString(this.getDisplayString(WritingType.HANGEUL))}
      >
        <span className={this.props.selected ?
          'glyphicon glyphicon-small glyphicon-check' :
          'glyphicon glyphicon-small glyphicon-unchecked'} />
          {/*There are two spaces here, and headers have one space*/}
          &nbsp;&nbsp;{this.props.groupName}: {this.state.charactersToDisplay}
      </div>
    );
  }
}

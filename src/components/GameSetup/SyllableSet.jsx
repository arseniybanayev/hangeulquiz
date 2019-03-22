import React, { Component } from 'react';
import {WritingType} from "../Game/Question";
import {shuffle} from "../../util";

/**
 * A set of inclusions/exclusions on allowed questions. Intended to control what
 * syllables appear in the game by difficulty or frequency/commonness.
 */
export default class SyllableSet extends Component {
  state = { displayString: '' };

  changeDisplayString(newString) {
    this.setState({displayString: newString})
  }

  getDisplayString() {
    let allowedSyllables = this.props.allowedSyllables;
    shuffle(allowedSyllables);
    return allowedSyllables
      .splice(0, 5)
      .map(hex => String.fromCharCode(parseInt(hex, 16)))
      .concat(['...'])
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
      >
        <span className={this.props.selected ?
          'glyphicon glyphicon-small glyphicon-check' :
          'glyphicon glyphicon-small glyphicon-unchecked'} />
          {/*There are two spaces here, and headers have one space*/}
          &nbsp;&nbsp;{this.props.name}: {this.state.displayString}
      </div>
    );
  }
}

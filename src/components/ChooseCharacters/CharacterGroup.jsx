import React, { Component } from 'react';

/**
 * A set of restrictions on allowed questions. Intended to control what syllables appear
 * in the game by difficulty or frequency/commonness.
 */
export default class CharacterGroup extends Component {
  state = { shownChars: '' };

  changeShownChars(newString) {
    this.setState({shownChars: newString})
  }

  getShowableCharacters(whichKana) {
    let strRomajiCharacters = '';
    let strKanaCharacters = '';
    Object.keys(this.props.characters).map(character => {
      strRomajiCharacters+=this.props.characters[character][0]+' · ';
      strKanaCharacters+=character+' · ';
    });
    strRomajiCharacters = strRomajiCharacters.slice(0, -2);
    strKanaCharacters = strKanaCharacters.slice(0, -2);
    if (whichKana === 'romaji') return strRomajiCharacters;
    else return strKanaCharacters;
  }

  componentWillMount() {
    this.changeShownChars(this.getShowableCharacters('romaji'));
  }

  render() {
    return (
      <div
        className={
          'choose-row'
            + (['h_group16_a','k_group18_a','k_group29_a'].includes(this.props.groupName) ? ' divider-row' : '')
        }
        onClick={() => {
          this.props.handleToggleSelect(this.props.groupName);
          this.changeShownChars(this.getShowableCharacters('romaji'));
        }}
        onMouseDown={()=>this.changeShownChars(this.getShowableCharacters('kana'))}
        onMouseOut={()=>this.changeShownChars(this.getShowableCharacters('romaji'))}
        onTouchStart={()=>this.changeShownChars(this.getShowableCharacters('kana'))}
        onTouchEnd={()=>this.changeShownChars(this.getShowableCharacters('romaji'))}
      >
        <span className={this.props.selected ?
          'glyphicon glyphicon-small glyphicon-check' :
          'glyphicon glyphicon-small glyphicon-unchecked'} />
          &nbsp;<b>{this.props.groupName}</b>: {this.state.shownChars}
      </div>
    );
  }
}

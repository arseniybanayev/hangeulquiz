import React, { Component } from 'react';
import Switch from 'react-toggle-switch';
import {availableLetterSets, availableSyllableSets} from '../../hangeul';
import './GameSetup.scss';
import LetterSet from './LetterSet';
import {getAllowedSyllables, lookupLetterSetsByName, lookupSyllableSetsByName} from "../../util";
import SyllableSet from "./SyllableSet";

/**
 * View and controller of game settings.
 */
export default class GameSetup extends Component {
  state = {
    errMsg : '',
    selectedLetterSetNames: this.props.selectedLetterSetNames,
    selectedSyllableSetNames: this.props.selectedSyllableSetNames,
    startIsVisible: true
  };

  componentDidMount() {
    this.checkIfStartButtonIsVisible();
    window.addEventListener('resize', this.checkIfStartButtonIsVisible);
    window.addEventListener('scroll', this.checkIfStartButtonIsVisible);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkIfStartButtonIsVisible);
    window.removeEventListener('scroll', this.checkIfStartButtonIsVisible);
  }

  componentDidUpdate(prevProps, prevState) {
    this.checkIfStartButtonIsVisible();
  }

  checkIfStartButtonIsVisible = () => {
    const button = document.getElementById("startButton");
    if (button != null) {
      const rect = button.getBoundingClientRect();
      if (rect.y > window.innerHeight && this.state.startIsVisible)
        this.setState({startIsVisible: false});
      else if (rect.y <= window.innerHeight && !this.state.startIsVisible)
        this.setState({startIsVisible: true});
    }
  };

  scrollToStart() {
    const button = document.getElementById("startButton");
    if (button != null) {
      const rect = button.getBoundingClientRect();
      const absTop = rect.top + window.pageYOffset;
      const scrollPos = absTop - window.innerHeight + 50;
      window.scrollTo(0, scrollPos > 0 ? scrollPos : 0);
    }
  }

  getLetterSetCategoryRow(letterSetCategory, letterSetNames) {
    let checkBtn = "glyphicon glyphicon-small glyphicon-";
    let status;
    if (letterSetNames.every(name => this.isLetterSetSelected(name)))
      status = 'check';
    else if (letterSetNames.some(name => this.isLetterSetSelected(name)))
      status = 'check half';
    else
      status = 'unchecked';
    checkBtn += status;

    return <div
      key={'letter_set_category_' + letterSetCategory}
      onClick={() => {
        if (status === 'check')
          this.deselectAllLetterSets(letterSetCategory);
        else if (status === 'check half' || status === 'unchecked')
          this.selectAllLetterSets(letterSetCategory);
        //e.stopPropagation(); // TODO: Move this click-handler to the toggle-caret span below
      }}
      className="choose-row"
    >
      { <span className={checkBtn} /> }      {/*{ <span className="toggle-caret">&#9650;</span> }*/}
      {/*There is one space here, and categories have two spaces*/}
      { <b>&nbsp;{letterSetCategory}</b> }
    </div>
  }

  getSyllableSets() {
    return Object.keys(availableSyllableSets).map((name, idx) =>
        <SyllableSet
            key={idx}
            name={name}
            allowedSyllables={availableSyllableSets[name]}
            selected={this.isSyllableSetSelected(name)}
            handleToggleSelect={this.toggleSelectSyllableSet}
        />);
  }

  getLetterSetsAndCategories() {
    let rows = [];
    let idx = 0;

    // Group the letter sets into categories (e.g., VOWELS)
    let letterSetCategories = Object.keys(availableLetterSets)
      .map(name => availableLetterSets[name].category)
      .filter((v, i, a) => a.indexOf(v) === i); // This .filter(..) is just a .distinct()
    letterSetCategories.forEach(letterSetCategory => {
      let letterSetNames = Object.keys(availableLetterSets)
        .filter(name => availableLetterSets[name].category === letterSetCategory);
      // Add a row for the category, so we can select all/none within the category
      rows.push(this.getLetterSetCategoryRow(letterSetCategory, letterSetNames));

      // Add a row for each letter set in the category
      letterSetNames.forEach(name => {
        let letterSet = availableLetterSets[name];
        rows.push(<LetterSet
          key={idx}
          name={name}
          allowedLetters={letterSet.allowedLetters}
          selected={this.isLetterSetSelected(name)}
          handleToggleSelect={this.toggleSelectLetterSet}
        />);
        idx++;
      });
    });

    return rows;
  }

  getIndexOfLetterSet(name) {
    return this.state.selectedLetterSetNames.indexOf(name);
  }

  isLetterSetSelected(name) {
    return this.getIndexOfLetterSet(name) > -1;
  }

  deselectLetterSet(name) {
    if (this.getIndexOfLetterSet(name) < 0)
      return;
    let newSelectedLetterSetNames = this.state.selectedLetterSetNames.slice();
    newSelectedLetterSetNames.splice(this.getIndexOfLetterSet(name), 1);
    this.setState({selectedLetterSetNames: newSelectedLetterSetNames});
  }

  selectLetterSet(name) {
    this.setState({
      errMsg: '',
      selectedLetterSetNames: this.state.selectedLetterSetNames.concat(name)
    });
  }

  toggleSelectLetterSet = name => {
    if (this.getIndexOfLetterSet(name) > -1)
      this.deselectLetterSet(name);
    else
      this.selectLetterSet(name);
  };

  selectAllLetterSets(letterSetCategory) {
    let newSelectedLetterSetNames;
    if (letterSetCategory) {
      // Add letter sets in the category
      newSelectedLetterSetNames = this.state.selectedLetterSetNames
          .concat(Object.keys(availableLetterSets).filter(name => availableLetterSets[name].category === letterSetCategory))
          .filter((v, i, a) => a.indexOf(v) === i); // This .filter(..) is just a .distinct()
    } else {
      // Select all letter sets
      newSelectedLetterSetNames = Object.keys(availableLetterSets);
    }

    this.setState({errMsg: '', selectedLetterSetNames: newSelectedLetterSetNames});
  }

  deselectAllLetterSets(letterSetCategory) {
    let newSelectedLetterSetNames = this.state.selectedLetterSetNames.filter(
        function(name) {
          // If a category is specified, then keep this letter set if
          // it doesn't belong to the specified category
          if (letterSetCategory)
            return availableLetterSets[name].category !== letterSetCategory;
          // Otherwise, definitely don't keep this letter set
          return false;
        });

    this.setState({selectedLetterSetNames: newSelectedLetterSetNames});
  }

  getIndexOfSyllableSet(name) {
    return this.state.selectedSyllableSetNames.indexOf(name);
  }

  isSyllableSetSelected(name) {
    return this.getIndexOfSyllableSet(name) > -1;
  }

  deselectSyllableSet(name) {
    if (this.getIndexOfSyllableSet(name) < 0)
      return;
    let newSelectedSyllableSetNames = this.state.selectedSyllableSetNames.slice();
    newSelectedSyllableSetNames.splice(this.getIndexOfSyllableSet(name), 1);
    this.setState({selectedSyllableSetNames: newSelectedSyllableSetNames});
  }

  selectSyllableSet(name) {
    this.setState({
      errMsg: '',
      selectedSyllableSetNames: this.state.selectedSyllableSetNames.concat(name)
    });
  }

  toggleSelectSyllableSet = name => {
    if (this.getIndexOfSyllableSet(name) > -1)
      this.deselectSyllableSet(name);
    else
      this.selectSyllableSet(name);
  };

  handleStartGameButtonClicked() {
    // Determine the allowed syllable set before the game starts
    let letterSets = lookupLetterSetsByName(this.state.selectedLetterSetNames);
    let syllableSets = lookupSyllableSetsByName(this.state.selectedSyllableSetNames);
    let allowedSyllables = getAllowedSyllables(letterSets, syllableSets);
    if (allowedSyllables.length < 10) {
      this.setState({errMsg: 'Not enough syllables included!'});
      return;
    }

    // Tell the GameContainer to start the game
    this.props.handleStartGame(this.state.selectedLetterSetNames, this.state.selectedSyllableSetNames);
  }

  render() {
    return (
      <div className="choose-characters">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-body welcome">
                <h4>Welcome to Hangeul.soy!</h4>
                <p>
                  This tool will train you to recognize entire syllables quickly, so
                  that you do not need to slowly read letter by letter.
                </p>
                <p>
                  Directions:
                </p>
                <ul>
                  <li>Pick a <b>Hangeul Syllable Set</b> for the quickest start.</li>
                  <li>Pick some <b>Individual Letters</b> to limit what you are shown.</li>
                  <li>Combine <b>Hangeul Syllable Sets</b> and <b>Individual Letters</b> for even more control.</li>

                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                Hangeul Syllable Sets
              </div>
              <div className="panel-body selection-areas">
                {this.getSyllableSets()}
              </div>
            </div>
            <div className="panel panel-default">
              <div className="panel-heading">
                Individual Letters&nbsp;&middot;&nbsp;
                <a href="javascript:" onClick={()=>this.selectAllLetterSets()}>All</a>
                &nbsp;&middot;&nbsp;
                <a href="javascript:" onClick={()=>this.deselectAllLetterSets()}>None</a>
              </div>
              <div className="panel-body selection-areas">
                {this.getLetterSetsAndCategories()}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3 col-xs-12 pull-right">
            <span className="pull-right lock">Lock to stage &nbsp;
              {
                this.props.isLocked &&
                  <input className="stage-choice" type="number" min="1" max="3" maxLength="1" size="1"
                    onChange={(e)=>this.props.lockStage(parseInt(e.target.value), true)}
                    value={this.props.stage}
                  />
              }
              <Switch onClick={()=>this.props.lockStage(1)} on={this.props.isLocked} /></span>
          </div>
          <div className="col-sm-offset-3 col-sm-6 col-xs-12 text-center">
            {
              this.state.errMsg !== '' &&
                <div className="error-message">{this.state.errMsg}</div>
            }
            <button id="startButton" className="btn btn-danger startgame-button" onClick={() => this.handleStartGameButtonClicked()}>
              Start the Quiz!
            </button>
          </div>
          <div className="down-arrow"
            style={{display: this.state.startIsVisible ? 'none' : 'block'}}
            onClick={(e) => this.scrollToStart(e)}
          >
            Start
          </div>
        </div>
      </div>
    );
  }
}

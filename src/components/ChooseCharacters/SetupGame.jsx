import React, { Component } from 'react';
import Switch from 'react-toggle-switch';
import {availableRules, ruleGroupColumnDefinitions} from '../../hangeul';
import './SetupGame.scss';
import GameRule from './GameRule';
import {getAllowedSyllables, lookupRulesByName} from "../../util";

/**
 * View and controller of rules that can be selected for the game.
 */
export default class SetupGame extends Component {
  state = {
    errMsg : '',
    selectedRuleNames: this.props.selectedRuleNames,
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

  getIndex(ruleName) {
    return this.state.selectedRuleNames.indexOf(ruleName);
  }

  isSelected(ruleName) {
    return this.getIndex(ruleName) > -1;
  }

  deselectRule(ruleName) {
    if (this.getIndex(ruleName) < 0)
      return;
    let newSelectedRuleNames = this.state.selectedRuleNames.slice();
    newSelectedRuleNames.splice(this.getIndex(ruleName), 1);
    this.setState({selectedRuleNames: newSelectedRuleNames});
  }

  selectRule(ruleName) {
    this.setState({
      errMsg: '',
      selectedRuleNames: this.state.selectedRuleNames.concat(ruleName)
    });
  }

  toggleSelect = ruleName => {
    if (this.getIndex(ruleName) > -1)
      this.deselectRule(ruleName);
    else
      this.selectRule(ruleName);
  };

  /**
   * Selects all rules. If `ruleGroupName` is specified, only
   * selects all rules belonging to the specified rule group.
   */
  selectAll(ruleGroupName) {
    let newSelectedRuleNames;
    if (ruleGroupName) {
      // Add rules in the group
      newSelectedRuleNames = this.state.selectedRuleNames
        .concat(Object.keys(availableRules[ruleGroupName]))
        // This .filter(..) is just a .distinct()
        .filter((v, i, a) => a.indexOf(v) === i);
    } else {
      // Select all rules
      newSelectedRuleNames = Object.keys(availableRules)
        .map(ruleName => Object.keys(availableRules[ruleName]))
        .reduce((a, b) => a.concat(b), []);
    }

    this.setState({errMsg: '', selectedRuleNames: newSelectedRuleNames});
  }

  /**
   * Deselects all rules. If `ruleGroupName` is specified, only
   * deselects all rules belonging to the specified rule group.
   */
  selectNone(ruleGroupName) {
    let newSelectedRuleNames = this.state.selectedRuleNames.filter(
      function(ruleName) {
        // If a rule group is specified, then keep this rule if
        // it doesn't belong to the specified rule group
        if (ruleGroupName)
          return !Object.keys(availableRules[ruleGroupName]).includes(ruleName);
        // Otherwise, definitely don't keep this rule
        return false;
      });

    this.setState({selectedRuleNames: newSelectedRuleNames});
  }

  getRuleGroupRow(ruleGroupName, ruleNames) {
    let checkBtn = "glyphicon glyphicon-small glyphicon-";
    let status;
    if (ruleNames.every(ruleName => this.isSelected(ruleName)))
      status = 'check';
    else if (ruleNames.some(ruleName => this.isSelected(ruleName)))
      status = 'check half';
    else
      status = 'unchecked';
    checkBtn += status;

    return <div
      key={'rule_group_' + ruleGroupName}
      onClick={() => {
        if (status === 'check')
          this.selectNone(ruleGroupName);
        else if (status === 'check half' || status === 'unchecked')
          this.selectAll(ruleGroupName);
        //e.stopPropagation(); // TODO: Move this click-handler to the toggle-caret span below
      }}
      className="choose-row"
    >
      { <span className={checkBtn} /> }
      {/*{ <span className="toggle-caret">&#9650;</span> }*/}
      {/*There is one space here, and groups have two spaces*/}
      { <b>&nbsp;{ruleGroupName}</b> }
    </div>
  }

  /**
   * Returns visible rows for every rule group and rule.
   */
  getRows(columnIdx) {
    let rows = [];
    let idx = 0;

    Object.keys(availableRules).forEach((ruleGroupName) => {
      if (!ruleGroupColumnDefinitions[columnIdx].includes(ruleGroupName))
        return;
      let rules = availableRules[ruleGroupName];
      let ruleNames = Object.keys(rules);

      // Add a row for the rule group, so we can select all/none
      rows.push(this.getRuleGroupRow(ruleGroupName, ruleNames));

      // Add a row for each rule in the rule group
      ruleNames.forEach((ruleName) => {
        let rule = rules[ruleName];
        rows.push(<GameRule
          key={idx}
          ruleName={ruleName}
          ruleType={rule.type}
          allowedLetters={rule.allowedLetters}
          allowedSyllables={rule.allowedSyllables}
          selected={this.isSelected(ruleName)}
          handleToggleSelect={this.toggleSelect}
        />);
        idx++;
      });
    });

    return rows;
  }

  startGame() {
    // Determine the allowed syllable set before the game starts
    let allowedSyllables = getAllowedSyllables(lookupRulesByName(this.state.selectedRuleNames));
    if (allowedSyllables.length < 10) {
      this.setState({errMsg: 'Not enough syllables included!'});
      return;
    }

    this.props.handleStartGame(this.state.selectedRuleNames);
  }

  render() {
    return (
      <div className="choose-characters">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-body welcome">
                <h4>Welcome to Hangeul.soy!</h4>
                <p>This tool will train you to recognize entire syllables quickly, so
                  that you do not need to slowly read letter by letter.</p>
                <p>Please choose the groups of syllables that you'd like to study.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="panel-heading text-center">
              <a href="javascript:" onClick={()=>this.selectAll()}>All</a>
              &nbsp;&middot;&nbsp;
              <a href="javascript:" onClick={()=>this.selectNone()}>None</a>
            </div>
            <div className="panel panel-default">
              <div className="panel-heading">Hangeul · 한글</div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="panel-body selection-areas">
                    {this.getRows(0)}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="panel-body selection-areas">
                    {this.getRows(1)}
                  </div>
                </div>
              </div>
            </div>
            <div className="panel-footer text-center">
              <a href="javascript:" onClick={()=>this.selectAll()}>All</a>
              &nbsp;&middot;&nbsp;
              <a href="javascript:" onClick={()=>this.selectNone()}>None</a>
            </div>
          </div>
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
            <button id="startButton" className="btn btn-danger startgame-button" onClick={() => this.startGame()}>Start the Quiz!</button>
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

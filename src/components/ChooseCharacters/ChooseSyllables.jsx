import React, { Component } from 'react';
import Switch from 'react-toggle-switch';
import { groupDefinitionsByHeader } from '../../hangeul';
import './ChooseSyllables.scss';
import SyllableGroup from './SyllableGroup';

/**
 * View and controller of character groups that can be selected for the game.
 */
export default class ChooseSyllables extends Component {
  state = {
    errMsg : '',
    selectedGroupNames: this.props.selectedGroupNames,
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

  getIndex(groupName) {
    return this.state.selectedGroupNames.indexOf(groupName);
  }

  isSelected(groupName) {
    return this.getIndex(groupName) > -1;
  }

  removeGroupNameFromSelected(groupName) {
    if (this.getIndex(groupName) < 0)
      return;
    let newSelectedGroupNames = this.state.selectedGroupNames.slice();
    newSelectedGroupNames.splice(this.getIndex(groupName), 1);
    this.setState({selectedGroupNames: newSelectedGroupNames});
  }

  addGroupNameToSelected(groupName) {
    this.setState({
      errMsg: '',
      selectedGroupNames: this.state.selectedGroupNames.concat(groupName)
    });
  }

  toggleSelect = groupName => {
    if (this.getIndex(groupName) > -1)
      this.removeGroupNameFromSelected(groupName);
    else
      this.addGroupNameToSelected(groupName);
  };

  /**
   * Selects all groups. If `groupHeaderName` is specified, only
   * selects all groups belonging to the specified header.
   */
  selectAll(groupHeaderName) {
    let newSelectedGroupNames;
    if (groupHeaderName) {
      // Add groups in the header
      newSelectedGroupNames = this.state.selectedGroupNames
        .concat(Object.keys(groupDefinitionsByHeader[groupHeaderName]))
        // This .filter(..) is just a .distinct()
        .filter((v, i, a) => a.indexOf(v) === i);
    } else {
      // Select all groups
      newSelectedGroupNames = Object.keys(groupDefinitionsByHeader)
        .map(headerName => Object.keys(groupDefinitionsByHeader[headerName]))
        .reduce((a, b) => a.concat(b));
    }

    this.setState({errMsg: '', selectedGroupNames: newSelectedGroupNames});
  }

  /**
   * Deselects all groups. If `groupHeaderName` is specified, only
   * deselects all groups belonging to the specified header.
   */
  selectNone(groupHeaderName) {
    let newSelectedGroupNames = this.state.selectedGroupNames.filter(
      function(groupName) {
        // If a group header is specified, then keep this group if
        // it doesn't belong to the specified group header
        if (groupHeaderName)
          return !Object.keys(groupDefinitionsByHeader[groupHeaderName]).includes(groupName);
        // Otherwise, definitely don't keep this group
        return false;
      });

    this.setState({selectedGroupNames: newSelectedGroupNames});
  }

  getGroupHeader(groupHeaderName, groupNames) {
    let checkBtn = "glyphicon glyphicon-small glyphicon-";
    let status;
    if (groupNames.every(groupName => this.isSelected(groupName)))
      status = 'check';
    else if (groupNames.some(groupName => this.isSelected(groupName)))
      status = 'check half';
    else
      status = 'unchecked';
    checkBtn += status;

    return <div
      key={'group_header_' + groupHeaderName}
      onClick={() => {
        if (status === 'check')
          this.selectNone(groupHeaderName);
        else if (status === 'check half' || status === 'unchecked')
          this.selectAll(groupHeaderName);
        //e.stopPropagation(); // TODO: Move this click-handler to the toggle-caret span below
      }}
      className="choose-row"
    >
      { <span className={checkBtn} /> }
      {/*{ <span className="toggle-caret">&#9650;</span> }*/}
      {/*There is one space here, and groups have two spaces*/}
      { <b>&nbsp;{groupHeaderName}</b> }
    </div>
  }

  /**
   * Returns visible rows for every header and group.
   */
  getRowsForSyllableGroups() {
    let groups = [];
    let idx = 0;

    Object.keys(groupDefinitionsByHeader).forEach((groupHeaderName) => {
      let groupDefinitions = groupDefinitionsByHeader[groupHeaderName];
      let groupNames = Object.keys(groupDefinitions);

      // Add a quasi-group for the group header, so we can select all/none
      groups.push(this.getGroupHeader(groupHeaderName, groupNames));

      // Add a group for each group definition
      groupNames.forEach((groupName) => {
        let definition = groupDefinitions[groupName];
        groups.push(<SyllableGroup
          key={idx}
          groupName={groupName}
          groupType={definition.type}
          characterSet={definition.characterSet}
          selected={this.isSelected(groupName)}
          handleToggleSelect={this.toggleSelect}
        />);
        idx++;
      });
    });

    return groups;
  }

  startGame() {
    if (this.state.selectedGroupNames.length < 1) {
      this.setState({ errMsg: 'Choose at least one group!'});
      return;
    }

    this.props.handleStartGame(this.state.selectedGroupNames);
  }

  render() {
    return (
      <div className="choose-characters">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-body welcome">
                <h4>Welcome to Hangeul.soy!</h4>
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
              <div className="panel-body selection-areas">
                {this.getRowsForSyllableGroups(0, 1)}
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
                  <input className="stage-choice" type="number" min="1" max="4" maxLength="1" size="1"
                    onChange={(e)=>this.props.lockStage(e.target.value, true)}
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

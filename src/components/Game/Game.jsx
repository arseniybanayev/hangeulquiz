import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import './Game.scss';
import ShowStage from './ShowStage';
import Question from './Question';

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showScreen: ''
        }
        this.showQuestion = this.showQuestion.bind(this);
        this.stageUp = this.stageUp.bind(this);
        this.lockStage = this.lockStage.bind(this);
    }

    stageUp() {
        this.props.stageUp();
        this.setState({showScreen: 'stage'});
    }

    lockStage(stage) {
        this.setState({showScreen: 'question'});
        this.props.lockStage(stage);
    }

    showQuestion() {
        this.setState({showScreen: 'question'})
    }

    componentWillMount() {
        this.setState({showScreen: 'stage'});
    }

    render() {
        return (
            <div>
                { this.state.showScreen==='stage' ? <ShowStage lockStage={this.lockStage} handleShowQuestion={this.showQuestion} handleEndGame={this.props.handleEndGame} stage={this.props.stage} /> : '' }
                { this.state.showScreen==='question' ? <Question isLocked={this.props.isLocked} handleStageUp={this.stageUp} stage={this.props.stage} decidedGroups={this.props.decidedGroups} /> : '' }
            </div>
        );
    }
}

export default Game;
import React, { Component } from 'react';
import './Navbar.scss';

/**
 * Displays some elements in a navigation bar at the top, shared by all screens.
 */
export default class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div className="container">
          <div id="navbar">
            <ul className="nav navbar-nav">
              {
                this.props.gameState === 'game'
                  ? (
                    <li id="nav-gameSetup">
                      <a href="javascript:" onClick={this.props.handleEndGame}>
                        <span className="glyphicon glyphicon-small glyphicon-arrow-left"/> Back to menu
                      </a>
                    </li>
                  ) : (
                    <li id="nav-hangeulsoy">
                      <p className="nav navbar-text">
                        Hangeul.soy
                      </p>
                    </li>
                  )
              }
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

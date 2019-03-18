import React, { Component } from 'react';

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container text-center">
          <br />
          <p className="text-muted credit">Made by Arseniy Banayev</p>
          <a href="https://github.com/arseniybanayev/hangeul-soy">
            https://github.com/arseniybanayev/hangeul-soy
          </a>
        </div>
      </footer>
    )
  }
}

import React from 'react';
import App from './components/App/App';
import { render } from 'react-dom';

// This is critical - TODO figure out why this is how Bootstrap is included?
import Bootstrap from './assets/stylesheets/bootstrap.min.css';

let elem = document.getElementById('app');
render(<App />, elem);

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import actions from '../actions';

class Index extends Component {
  constructor() {
    super();
  }

  render () {
    return (
      <div className="home">
        <Link to="/">Home</Link>
        <Link to="/tickers">Tickers</Link>
        {this.props.children}
      </div>
    );
  }
}

export default Index;
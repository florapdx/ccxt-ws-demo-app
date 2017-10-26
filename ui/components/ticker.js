import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../actions';

class Ticker extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actions.connectToWS({ channel: this.props.path }));
  }

  render() {
    const { tickers, match: { params } } = this.props;
    const data = tickers[params.symbol.replace('-', '/').toUpperCase()];

    return (
      <div className="ticker">
        <h2>{data.symbol}</h2>
        <div className="ticker-data">
          <div>{`Open: ${data.open}`}</div>
          <div>{`High: ${data.high}`}</div>
          <div>{`Low: ${data.low}`}</div>
          <div>{`Volume: ${data.baseVolume}`}</div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({ tickers: state.tickers }))(Ticker);

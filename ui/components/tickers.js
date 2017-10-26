import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../actions';
import Table from './shared/table';

const SOCKET_CHANNEL = 'all';

class Tickers extends Component {
  constructor() {
    super();
    this.columns = [];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actions.connectToWS({ channel: SOCKET_CHANNEL }));
  }

  componentWillReceiveProps(nextProps) {
    const { tickers } = nextProps;

    // Need to check for column length b/c components with shared
    // root paths don't unmount on route change.
    // This is behavior we want.
    if (
        (!this.columns.length) ||
        (tickers && Object.keys(tickers).length !== Object.keys(this.props.tickers).length)
      ) {
      const columns = Object.keys(tickers).reduce((acc, mem) => {
        let newKeys = Object.keys(tickers[mem]).filter(key => acc.indexOf(key) === -1);
        return acc.concat(newKeys);
      }, []);

      this.columns = columns;
    }
  }

  render() {
    const { tickers } = this.props;
    const { columns } = this;

    return (
      <div className="tickers">
        <Table data={tickers} columns={columns} />
      </div>
    );
  }
}

export default connect((state) => ({ tickers: state.tickers }))(Tickers);

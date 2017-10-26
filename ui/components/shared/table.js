import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function TableRow({ rowData, columns }) {
  delete rowData.info; // this is a complex nested object -- too much to worry about here

  return (
    <tr>
      {
        columns.map(key => {
          let datum = rowData[key];

          if (key.match('date') || key.match('time')) {
            let date = new Date(datum);
            datum = date.toLocaleString();
          }

          return key === 'symbol' ? (
            <td key={key}>
              <Link to={`/tickers/${datum.toLowerCase().replace('/', '-')}`}>{datum}</Link>
            </td>
          ) : <td key={key}>{datum}</td>;
        })
      }
    </tr>
  );
}

function Table({ data, columns }) {
  return (
    <table>
      <thead>
        <tr>
          {
            columns.map(key => key === 'info' ? null : <th key={key}>{key}</th>)
          }
        </tr>
      </thead>
      <tbody>
        {
          data && Object.keys(data).map(symbol => (
            <TableRow
              key={symbol}
              columns={columns}
              rowData={data[symbol]}
            />
          ))
        }
      </tbody>
    </table>
  );
}

TableRow.propTypes = {
  columns: PropTypes.array,
  rowData: PropTypes.shape({})
}

Table.propTypes = {
  data: PropTypes.shape({})
};

export default Table;

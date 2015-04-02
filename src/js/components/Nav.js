/** @flow */

var Colors = require('../utils/Colors');
var Cesium = require('../utils/Cesium');
var React = require('react/addons');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;

var Nav = React.createClass(Cesium.wrap({
  propTypes: {
    onQueryChanged: PropTypes.func.isRequired,
    query: PropTypes.string,
  },

  mixins: [PureRenderMixin],

  render(): any {
    return (
      <nav style={this.props.style}>
        <ul style={styles.list}>
          {[{
            label: 'INBOX',
            query: 'in:inbox',
          }, {
            label: 'IMPORTANT',
            query: 'is:important',
          }, {
            label: 'UNREAD',
            query: 'is:unread',
          }, {
            label: 'STARRED',
            query: 'is:starred',
          }, {
            label: 'SENT',
            query: 'in:sent',
          }, {
            label: 'DRAFTS',
            query: 'is:draft',
          }, {
            label: 'ALL',
            query: '',
          }].map(config =>
            <NavItem
              label={config.label}
              query={config.query}
              key={config.label}
              onQueryChanged={this.props.onQueryChanged}
              isSelected={this.props.query === config.query}
            />
          )}
        </ul>
      </nav>
    );
  }
}));

var NavItem = React.createClass(Cesium.wrap({
  propTypes: {
    onQueryChanged: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    isSelected: PropTypes.bool
  },

  mixins: [PureRenderMixin],

  _onClick(event) {
    this.props.onQueryChanged(this.props.query);
    event.preventDefault();
  },

  render() /*object*/ {
    return (
      <li>
        <a
          onClick={this._onClick}
          style={[
            styles.item.link,
            this.props.isSelected && styles.item.linkSelected
          ]}
          href="#">
          {this.props.label}
        </a>
      </li>
    );
  }
}));

var styles = {
  list: {
    display: 'flex',
  },

  item: {
    link: {
      color: Colors.gray4,
      display: 'block',
      padding: '16px',
      textDecoration: 'none',
      verticalAlign: 'bottom',

      ':hover': {
        color: Colors.black,
      },

      ':active': {
        padding: '18px 14px 14px 18px',
      },
    },

    linkSelected: {
      color: Colors.accent,
      cursor: 'default',
      padding: '16px',

      ':hover': {
        color: Colors.accent,
      },
    },
  }
};

module.exports = Nav;

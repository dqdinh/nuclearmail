/** @flow */

var Cesium = require('../utils/Cesium');
var Colors = require('../utils/Colors');
var LineClamp = require('./LineClamp');
var React = require('react/addons');
var RelativeDate = require('./RelativeDate');
var _ = require('lodash');
var sx = require('../utils/styleSet');

var PureRenderMixin = React.addons.PureRenderMixin;
var PropTypes = React.PropTypes;

var BlockMessageList = React.createClass(Cesium.wrap({
  propTypes: {
    messages: PropTypes.array.isRequired,

    labels: PropTypes.array,
    selectedMessageID: PropTypes.string,
  },

  mixins: [PureRenderMixin],

  _onMessageClick(index: number, message: string) {
    this.props.onMessageSelected(message);
  },

  render(): any {
    return (
      <ul style={sx(styles.list.root, this.style)}>
        {this.props.messages.map((msg, index) => (
          <BlockMessageListItem
            index={index}
            isSelected={msg.id === this.props.selectedMessageID}
            key={index}
            labels={this.props.labels && _.indexBy(this.props.labels, 'id')}
            message={msg}
            onClick={this._onMessageClick}
          />
        ))}
      </ul>
    );
  }
}));

var BlockMessageListItem = React.createClass(Cesium.wrap({
  propTypes: {
    index: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired,
    message: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,

    labels: PropTypes.object,
  },

  mixins: [PureRenderMixin],

  componentDidMount() {
    this._scrollIntoView();
  },

  componentDidUpdate(previousProps: any, previousState: any) {
    this._scrollIntoView();
  },

  _scrollIntoView() {
    if (this.props.isSelected) {
      this.getDOMNode().scrollIntoViewIfNeeded ?
        this.getDOMNode().scrollIntoViewIfNeeded(false) :
        this.getDOMNode().scrollIntoView(false);
    }
  },

  _onClick() {
    this.props.onClick(this.props.index, this.props.message);
  },

  render(): any {
    var msg = this.props.message;
    return (
      <li
        style={styles.item.root}
        key={msg.id}
        onClick={this._onClick}>
        <div style={sx(
          styles.item.inner,
          msg.isUnread && styles.item.innerIsUnread,
          this.props.isSelected && styles.item.innerIsSelected
        )}>
          <div style={styles.item.top}>
            <div style={sx(
              styles.item.sender,
              this.props.isSelected && styles.item.senderIsSelected
            )}>
              {msg.isStarred ? (
                <span style={styles.item.star}>{'\u2605'}</span>
              ) : null}
              {msg.from.name || msg.from.email}
            </div>
            <RelativeDate
              style={styles.item.date}
              date={msg.date}
            />
          </div>
          <LineClamp style={styles.item.text} lines={2}>
            {this.props.labels && msg.labelIDs.filter(labelID =>
              this.props.labels[labelID] &&
                this.props.labels[labelID].type === 'user'
            ).map(labelID =>
              <span style={styles.item.label} key={labelID}>
                {this.props.labels ? this.props.labels[labelID].name : labelID}
              </span>
            )}
            <span>
              {msg.subject}{' '}
            </span>
            <span style={styles.item.snippet}>
              {_.unescape(msg.snippet)}…
            </span>
          </LineClamp>
        </div>
      </li>
    );
  }
}));

var styles = {
  list: {
    root: {
      cursor: 'pointer',
      userSelect: 'none',
    }
  },

  item: {
    root: {
      lineHeight: 1.6,
      margin: '0 8px 8px 8px',
    },

    rootFirst: {
      borderTop: 'none',
    },

    inner: {
      borderRadius: '8px',
      padding: '8px 12px 12px 12px',

      ':hover': {
        background: Colors.accent.lighten(44),
      }
    },

    innerIsUnread: {
      background: Colors.accent.lighten(40),

      ':hover': {
        background: Colors.accent.lighten(40),
      }
    },

    innerIsSelected: {
      background: Colors.accent,
      color: 'white',

      ':hover': {
        background: Colors.accent,
      }
    },

    top: {
      display: 'flex',
    },

    date: {
      fontSize: '14px',
      opacity: 0.5,
      textAlign: 'right',
      whiteSpace: 'nowrap',
    },

    text: {
      fontSize: '14px',
    },

    label: {
      background: Colors.accent,
      borderRadius: '4px',
      color: 'white',
      display: 'inline-block',
      marginRight: '4px',
      padding: '0 4px',
    },

    sender: {
      flex: 1,
      color: Colors.accent,
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    senderIsSelected: {
      color: 'white',
    },

    snippet: {
      opacity: 0.5,
    },

    star: {
      color: 'yellow',
      marginRight: '4px',
      textShadow: `
        -1px -1px 0 #999,
        1px -1px 0 #999,
        -1px 1px 0 #999,
        1px 1px 0 #999,
        -1px 0 0 #999,
        1px 0 0 #999,
        0 1px 0 #999,
        0 -1px 0 #999
      `,
    },
  },
};

module.exports = BlockMessageList;

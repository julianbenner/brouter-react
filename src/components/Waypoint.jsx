import React, {Component, PropTypes} from 'react';

export default class Waypoint extends Component {
    
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
    
  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.props.startRouting();
    }
  }
  
  render() {
    
    const suggestions = this.props.suggestions.map(
      suggestion => (
        <div
          className="suggestion"
          onClick={() => this.props.selectSuggestion(this.props.id, suggestion)}
        >
          {suggestion.place_name}
        </div>
      )
    );
    
    return (
      <div>
        <input
          placeholder="Waypoint"
          className={this.props.selected ? 'selected' : null}
          value={this.props.resolving ? 'Resolving...' : this.props.text}
          onChange={(e) => this.props.changeWaypointText(this.props.id, e.target.value)}
          onKeyDown={this.handleKeyDown}
          onFocus={(e) => this.props.setSelected(this.props.id, true)}
        />
        {suggestions}
      </div>
    );
  }
}

Waypoint.propTypes = {
  id: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  location: PropTypes.array.isRequired,
  changeWaypointText: PropTypes.func.isRequired
}
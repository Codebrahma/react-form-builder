import React, { Component } from 'react';
import HeaderBar from './header-bar';

class CustomElement extends Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    let props = {};
    props.name = this.props.data.field_name;
    props.answerData = this.props.answerData;

    if (this.props.mutable) {
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    const Element = this.props.data.component;

    return (
      <div className={baseClasses}>
        {!this.props.mutable && (
          <HeaderBar
            parent={this.props.parent}
            editModeOn={this.props.editModeOn}
            data={this.props.data}
            onDestroy={this.props._onDestroy}
            onEdit={this.props.onEdit}
            static={this.props.data.static}
            required={this.props.data.required}
          />
        )}
        <label>
          <span dangerouslySetInnerHTML={{ __html: this.props.data.label }} />
        </label>
        <hr />
        <Element data={this.props.data} {...this.props.data.props} {...props} />
      </div>
    );
  }
}

CustomElement.propTypes = {};

export default CustomElement;

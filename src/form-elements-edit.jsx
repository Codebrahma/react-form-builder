import React from 'react';
import DynamicOptionList from './dynamic-option-list';
import TextAreaAutosize from 'react-textarea-autosize';
import Select from 'react-select';

import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';

let toolbar = {
  options: ['inline', 'list', 'textAlign', 'fontSize', 'link', 'history'],
  inline: {
    inDropdown: false,
    className: undefined,
    options: ['bold', 'italic', 'underline', 'superscript', 'subscript'],
  },
};

export default class FormElementsEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: this.props.element,
      data: this.props.data,
      dirty: false,
    };
  }

  toggleRequired() {
    let this_element = this.state.element;
  }

  editElementProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    let this_element = this.state.element;
    this_element[elemProperty] = e.target[targProperty];

    this.setState(
      {
        element: this_element,
        dirty: true,
      },
      () => {
        if (targProperty === 'checked') {
          this.updateElement();
        }
      },
    );
  }

  editSelectProp(elemProperty, values) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    let this_element = this.state.element;
    if (values === undefined || values === null || values === '') {
      this_element[elemProperty] = '';
    } else {
      if (Array.isArray(values)) {
        this_element[elemProperty] = values.map(value =>
          typeof value === 'object' ? value.value : value,
        );
      } else {
        this_element[elemProperty] = values.value;
      }
    }
    this.setState(
      {
        element: this_element,
        dirty: true,
      },
      () => {
        this.updateElement();
      },
    );
  }

  onEditorStateChange(index, property, editorContent) {
    let html = draftToHtml(convertToRaw(editorContent.getCurrentContent()))
      .replace(/<p>/g, '<div>')
      .replace(/<\/p>/g, '</div>');
    let this_element = this.state.element;
    this_element[property] = html;

    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateElement() {
    let this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({ dirty: false });
    }
  }

  convertFromHTML(content) {
    const newContent = convertFromHTML(content);
    if (!newContent.contentBlocks) {
      // to prevent crash when no contents in editor
      return EditorState.createEmpty();
    }
    const contentState = ContentState.createFromBlockArray(newContent);
    return EditorState.createWithContent(contentState);
  }

  handleUploadFile(fileURL) {
    const link = document.getElementById('srcInput');
    link.value = fileURL;

    let this_element = this.state.element;
    this_element.src = fileURL;

    this.setState({ element: this_element, dirty: true });
  }

  render() {
    const { CustomFileUploader } = this.props;

    let this_checked = this.props.element.hasOwnProperty('required')
      ? this.props.element.required
      : false;
    let this_read_only = this.props.element.hasOwnProperty('readOnly')
      ? this.props.element.readOnly
      : false;
    let this_default_today = this.props.element.hasOwnProperty('defaultToday')
      ? this.props.element.defaultToday
      : false;
    let this_checked_inline = this.props.element.hasOwnProperty('inline')
      ? this.props.element.inline
      : false;
    let this_checked_bold = this.props.element.hasOwnProperty('bold')
      ? this.props.element.bold
      : false;
    let this_checked_italic = this.props.element.hasOwnProperty('italic')
      ? this.props.element.italic
      : false;
    let this_checked_center = this.props.element.hasOwnProperty('center')
      ? this.props.element.center
      : false;
    let this_checked_page_break = this.props.element.hasOwnProperty('pageBreakBefore')
      ? this.props.element.pageBreakBefore
      : false;
    let this_checked_alternate_form = this.props.element.hasOwnProperty('alternateForm')
      ? this.props.element.alternateForm
      : false;

    let this_files = this.props.files.length ? this.props.files : [];
    if (this_files.length < 1 || (this_files.length > 0 && this_files[0].id !== '')) {
      this_files.unshift({
        id: '',
        file_name: '',
      });
    }

    let editorState;
    if (this.props.element.hasOwnProperty('content')) {
      editorState = this.convertFromHTML(this.props.element.content);
    }
    if (this.props.element.hasOwnProperty('label')) {
      editorState = this.convertFromHTML(this.props.element.label);
    }

    return (
      <div>
        <div className="clearfix">
          <h4 className="pull-left">{this.props.element.text}</h4>
          <i
            className="pull-right fa fa-times dismiss-edit"
            onClick={this.props.manualEditModeOff}
          />
        </div>
        {this.props.element.hasOwnProperty('content') && (
          <div className="form-group">
            <label className="control-label">
              Text to display:&nbsp;
              <small>
                (Use <b>CTRL/CMD + SHIFT + V</b> to paste unformatted plain text version)
              </small>
            </label>

            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'content')}
            />
          </div>
        )}
        {this.props.element.hasOwnProperty('file_path') && (
          <div className="form-group">
            <label className="control-label" htmlFor="fileSelect">
              Choose file:
            </label>
            <select
              id="fileSelect"
              className="form-control"
              defaultValue={this.props.element.file_path}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'file_path', 'value')}
            >
              {this_files.map(function(file) {
                let this_key = 'file_' + file.id;
                return (
                  <option value={file.id} key={this_key}>
                    {file.file_name}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        {this.props.element.hasOwnProperty('href') && (
          <div className="form-group">
            <TextAreaAutosize
              type="text"
              minRows={8}
              className="form-control"
              defaultValue={this.props.element.href}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'href', 'value')}
            />
          </div>
        )}

        {
          this.props.element.element == 'Image' && (
            <div>
              <div className="form-group">
                <CustomFileUploader onComplete={this.handleUploadFile.bind(this)} />
              </div>

              <p className="text-center">OR</p>
            </div>
          )
        }

        {this.props.element.hasOwnProperty('src') && (
          <div>
            <div className="form-group">
              <label className="control-label" htmlFor="srcInput">
                Link to:
              </label>
              <input
                id="srcInput"
                type="text"
                className="form-control"
                defaultValue={this.props.element.src}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'src', 'value')}
              />
            </div>
            <div className="form-group">
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_checked_center}
                    value={true}
                    onChange={this.editElementProp.bind(this, 'center', 'checked')}
                  />
                  Center?
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementWidth">
                  Width:
                </label>
                <input
                  id="elementWidth"
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element.width}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, 'width', 'value')}
                />
              </div>
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementHeight">
                  Height:
                </label>
                <input
                  id="elementHeight"
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element.height}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, 'height', 'value')}
                />
              </div>
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('label') && (
          <div className="form-group">
            <label>
              Display Label &nbsp;
              <small>
                (Use <b>CTRL/CMD + SHIFT + V</b> to paste unformatted plain text version)
              </small>
            </label>
            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'label')}
            />

            <br />
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked}
                  value={true}
                  onChange={this.editElementProp.bind(this, 'required', 'checked')}
                />
                Required
              </label>
            </div>
            {this.props.element.hasOwnProperty('readOnly') && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_read_only}
                    value={true}
                    onChange={this.editElementProp.bind(this, 'readOnly', 'checked')}
                  />
                  Read only
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty('defaultToday') && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_default_today}
                    value={true}
                    onChange={this.editElementProp.bind(this, 'defaultToday', 'checked')}
                  />
                  Default to Today?
                </label>
              </div>
            )}
            {(this.state.element.element === 'RadioButtons' ||
              this.state.element.element === 'Checkboxes') && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_checked_inline}
                    value={true}
                    onChange={this.editElementProp.bind(this, 'inline', 'checked')}
                  />
                  Display horizonal
                </label>
              </div>
            )}
          </div>
        )}

        {this.state.element.element === 'Signature' && this.props.element.readOnly ? (
          <div className="form-group">
            <label className="control-label" htmlFor="variableKey">
              Variable Key:
            </label>
            <input
              id="variableKey"
              type="text"
              className="form-control"
              defaultValue={this.props.element.variableKey}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'variableKey', 'value')}
            />
            <p className="help-block">
              This will give the element a key that can be used to replace the content with a
              runtime value.
            </p>
          </div>
        ) : (
          <div />
        )}

        {(this.props.element.custom_options || []).map(c_option => {
          if (c_option.type === 'input') {
            return (
              <div className="form-group" key={c_option.name}>
                <label className="control-label" htmlFor={c_option.name}>
                  {c_option.label}
                </label>
                <input
                  id={c_option.name}
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element[c_option.name] || c_option.defaultValue}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, c_option.name, 'value')}
                />
              </div>
            );
          } else if (c_option.type === 'textarea') {
            return (
              <div className="form-group" key={c_option.name}>
                <label className="control-label" htmlFor={c_option.name}>
                  {c_option.label}
                </label>
                <textarea
                  id={c_option.name}
                  className="form-control"
                  rows="8"
                  defaultValue={this.props.element[c_option.name] || c_option.defaultValue}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, c_option.name, 'value')}
                />
              </div>
            );
          } else if (c_option.type === 'select') {
            const values = this.props.element[c_option.name];
            let selectedValues = values;
            if (c_option.isMulti) {
              if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'string') {
                selectedValues = c_option.options.filter(option => values.includes(option.value));
              }
            } else {
              if (typeof values === 'string') {
                selectedValues = c_option.options.find(option => values === option.value);
              }
            }
            return (
              <div className="form-group" key={c_option.name}>
                <label className="control-label">{c_option.label}</label>
                <Select
                  isMulti={c_option.isMulti || false}
                  id={c_option.name}
                  options={c_option.options}
                  defaultValue={selectedValues || c_option.defaultValue}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editSelectProp.bind(this, c_option.name)}
                />
              </div>
            );
          } else if (c_option.type === 'checkbox') {
            return (
              <div className="form-group" key={c_option.name}>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={this.props.element[c_option.name] || c_option.defaultvalue || false}
                      value={true}
                      onChange={this.editElementProp.bind(this, c_option.name, 'checked')}
                    />
                    {c_option.label}
                  </label>
                </div>
              </div>
            );
          }
        })}

        <div className="form-group">
          <label className="control-label">Print Options</label>
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={this_checked_page_break}
                value={true}
                onChange={this.editElementProp.bind(this, 'pageBreakBefore', 'checked')}
              />
              Page Break Before Element?
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="control-label">Alternate/Signature Page</label>
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={this_checked_alternate_form}
                value={true}
                onChange={this.editElementProp.bind(this, 'alternateForm', 'checked')}
              />
              Display on alternate/signature Page?
            </label>
          </div>
        </div>

        {this.props.element.hasOwnProperty('step') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeStep">
                Step
              </label>
              <input
                id="rangeStep"
                type="number"
                className="form-control"
                defaultValue={this.props.element.step}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'step', 'value')}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('min_value') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMin">
                Min
              </label>
              <input
                id="rangeMin"
                type="number"
                className="form-control"
                defaultValue={this.props.element.min_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'min_value', 'value')}
              />
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.min_label}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'min_label', 'value')}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('max_value') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMax">
                Max
              </label>
              <input
                id="rangeMax"
                type="number"
                className="form-control"
                defaultValue={this.props.element.max_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'max_value', 'value')}
              />
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.max_label}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'max_label', 'value')}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('default_value') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="defaultSelected">
                Default Selected
              </label>
              <input
                id="defaultSelected"
                type="number"
                className="form-control"
                defaultValue={this.props.element.default_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'default_value', 'value')}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('static') && this.props.element.static && (
          <div className="form-group">
            <label className="control-label">Text Style</label>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked_bold}
                  value={true}
                  onChange={this.editElementProp.bind(this, 'bold', 'checked')}
                />
                Bold
              </label>
            </div>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked_italic}
                  value={true}
                  onChange={this.editElementProp.bind(this, 'italic', 'checked')}
                />
                Italic
              </label>
            </div>
          </div>
        )}

        {this.props.showCorrectColumn &&
          this.props.element.canHaveAnswer &&
          !this.props.element.hasOwnProperty('options') && (
            <div className="form-group">
              <label className="control-label" htmlFor="correctAnswer">
                Correct Answer
              </label>
              <input
                id="correctAnswer"
                type="text"
                className="form-control"
                defaultValue={this.props.element.correct}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'correct', 'value')}
              />
            </div>
          )}
        {this.props.element.hasOwnProperty('options') && (
          <DynamicOptionList
            showCorrectColumn={this.props.showCorrectColumn}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            key={this.props.element.options.length}
          />
        )}
        <hr></hr>
        <div className="clearfix">
          <button
            className="pull-right btn btn-sm btn-success"
            onClick={this.props.manualEditModeOff}
          >
            Save & Close
          </button>
        </div>
      </div>
    );
  }
}
FormElementsEdit.defaultProps = { className: 'edit-element-fields' };

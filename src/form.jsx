/**
 * <Form />
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { EventEmitter } from 'fbemitter';
import FormValidator from './form-validator';
import * as FormElements from './form-elements';
import { Camera, Checkboxes, Download, Signature } from './form-elements';
import CustomElement from './CustomElement';

export default class ReactForm extends React.Component {
  form;
  inputs = {};

  constructor(props) {
    super(props);
    this.emitter = new EventEmitter();
  }

  _checkboxesDefaultValue(item) {
    let defaultChecked = [];
    if (this.props.answer_data[item.field_name] !== undefined) {
      defaultChecked = this.props.answer_data[item.field_name];
    }
    return defaultChecked;
  }

  _isIncorrect(item) {
    let incorrect = false;
    if (item.canHaveAnswer) {
      const ref = this.inputs[item.field_name];
      if (item.type === 'custom' || item.custom) {
        if (!ref) return;
        if (ref.inputField && ref.inputField.current) {
          // TODO:
          //  Add logic to validate custom components.
          return;
        } else {
          return;
        }
      } else if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
        item.options.forEach(option => {
          let $option = ReactDOM.findDOMNode(ref.options[`child_ref_${option.key}`]);
          if (
            (option.hasOwnProperty('correct') && !$option.checked) ||
            (!option.hasOwnProperty('correct') && $option.checked)
          ) {
            incorrect = true;
          }
        });
      } else {
        let $item = null;
        if (item.element === 'Rating') {
          $item = {};
          $item.value = ref.inputField.current.state.rating;
          if ($item.value.toString() !== item.correct) {
            incorrect = true;
          }
        } else {
          if (item.element === 'Tags') {
            $item = {};
            $item.value = ref.inputField.current.state.value || ref.state.value;
          } else if (item.element === 'DatePicker') {
            $item = {};
            $item.value =
              ref.inputField.current.state.value ||
              ref.inputField.current.input.value ||
              ref.state.value;
          } else {
            $item = ReactDOM.findDOMNode(ref.inputField.current);
            $item.value = $item.value.trim();
          }

          if ($item.value.toLowerCase() !== item.correct.trim().toLowerCase()) {
            incorrect = true;
          }
        }
      }
    }
    return incorrect;
  }

  _isInvalid(item) {
    let invalid = false;
    if (item.required === true) {
      const ref = this.inputs[item.field_name];
      if (item.type === 'custom' || item.custom) {
        if (!ref) return;
        if (ref.inputField && ref.inputField.current) {
          let $item = {};
          $item.value = ref.inputField.current.state.value;
          if ($item.value) {
            if (Array.isArray($item.value) && $item.value.length === 0) {
              invalid = true;
            } else if (Object.keys([]).length === 0 && [].constructor === Object) {
              invalid = true;
            }
          }
        } else {
          return;
        }
      } else if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
        let checked_options = 0;
        item.options.forEach(option => {
          let $option = ReactDOM.findDOMNode(ref.options[`child_ref_${option.key}`]);
          if ($option.checked) {
            checked_options += 1;
          }
        });
        if (checked_options < 1) {
          // errors.push(item.label + ' is required!');
          invalid = true;
        }
      } else {
        let $item = null;
        if (item.element === 'Rating') {
          $item = {};
          $item.value = ref.inputField.current.state.rating;
          if ($item.value === 0) {
            invalid = true;
          }
        } else if (item.element === 'Range') {
          $item = {};
          $item.value = ref.state.value;
          // Needs to check for empty value except zero.
          // Bacause range can start from zero.
          if ($item.value === undefined || $item.value === null || $item.value === '') {
            invalid = true;
          }
        } else {
          if (item.element === 'Tags') {
            $item = {};
            $item.value = ref.inputField.current.state.value || ref.state.value;
          } else if (item.element === 'DatePicker') {
            $item = {};
            $item.value =
              ref.inputField.current.state.value ||
              ref.inputField.current.input.value ||
              ref.state.value;
          } else {
            $item = ReactDOM.findDOMNode(ref.inputField.current);
            $item.value = $item.value.trim();
          }

          if ($item.value === undefined || $item.value.length < 1) {
            invalid = true;
          }
        }
      }
    }
    return invalid;
  }

  _collect(item) {
    const itemData = { name: item.field_name };
    let $item = {};
    const ref = this.inputs[item.field_name];
    if (item.type === 'custom' || item.custom) {
      if (!ref) return;
      if (ref.inputField && ref.inputField.current) {
        itemData.value = ref.inputField.current.state.value;
      } else {
        return;
      }
    } else {
      if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
        let checked_options = [];
        item.options.forEach(option => {
          let $option = ReactDOM.findDOMNode(ref.options[`child_ref_${option.key}`]);
          if ($option.checked) {
            checked_options.push(option.key);
          }
        });
        itemData.value = checked_options;
      } else {
        if (!ref) return;
        if (item.element === 'Rating') {
          itemData.value = ref.inputField.current.state.rating;
        } else if (item.element === 'Range') {
          itemData.value = ref.state.value;
        } else {
          if (item.element === 'Tags') {
            itemData.value = ref.inputField.current.state.value || ref.state.value;
          } else if (item.element === 'DatePicker') {
            itemData.value =
              ref.inputField.current.state.value ||
              ref.inputField.current.input.value ||
              ref.state.value;
          } else {
            $item = ReactDOM.findDOMNode(ref.inputField.current);
            if ($item && $item.value !== undefined && $item.value !== null) {
              itemData.value = $item.value.trim();
            } else {
              itemData.value = '';
            }
          }
        }
      }
    }
    return itemData;
  }

  _collectFormData(data) {
    const formData = [];
    data.forEach(item => {
      const item_data = this._collect(item);
      if (item_data) {
        formData.push(item_data);
      }
    });
    return formData;
  }

  _getSignatureImg(item) {
    const ref = this.inputs[item.field_name];
    let $canvas_sig = ref.canvas.current;
    let base64 = $canvas_sig.toDataURL().replace('data:image/png;base64,', '');
    let isEmpty = $canvas_sig.isEmpty();
    let $input_sig = ReactDOM.findDOMNode(ref.inputField.current);
    if (isEmpty) {
      $input_sig.value = '';
    } else {
      $input_sig.value = base64;
    }
    return true;
  }

  handleSubmit(e) {
    e.preventDefault();

    let errors = this.validateForm();
    // Publish errors, if any.
    this.emitter.emit('formValidation', errors);

    // Only submit if there are no errors.
    if (errors.length < 1) {
      const { onSubmit } = this.props;
      if (onSubmit) {
        const data = this._collectFormData(this.props.data);
        onSubmit(data);
      } else {
        let $form = ReactDOM.findDOMNode(this.form);
        $form.submit();
      }
    }
  }

  validateForm() {
    let errors = [];
    let data_items = this.props.data;

    if (this.props.display_short) {
      data_items = this.props.data.filter(i => i.alternateForm === true);
    }

    data_items.forEach(item => {
      if (item.element === 'Signature') {
        this._getSignatureImg(item);
      }

      if (this._isInvalid(item)) {
        errors.push(`${item.label} is required!`);
      }

      if (this.props.validateForCorrectness && this._isIncorrect(item)) {
        errors.push(`${item.label} was answered incorrectly!`);
      }
    });

    return errors;
  }

  getInputElement(item) {
    const Input = FormElements[item.element];
    return (
      <Input
        handleChange={this.handleChange}
        ref={c => (this.inputs[item.field_name] = c)}
        mutable={true}
        key={`form_${item.id}`}
        data={item}
        read_only={this.props.read_only}
        defaultValue={this.props.answer_data[item.field_name]}
      />
    );
  }

  getSimpleElement(item) {
    const Element = FormElements[item.element];
    // Do not return anything for invalid items / element
    if (!item.element || typeof Element === 'undefined') return null;
    return <Element mutable={true} key={`form_${item.id}`} data={item} />;
  }

  getCustomElement(item, answerData = {}) {
    return (
      <CustomElement
        ref={c => (this.inputs[item.field_name] = c)}
        mutable={true}
        key={`form_${item.id}`}
        data={item}
        answerData={answerData}
      />
    );
  }

  componentWillUnmount() {
    try {
      if (this.customErrorSubscription) {
        this.customErrorSubscription.remove();
      }
    } catch (e) {}
  }

  render() {
    let data_items = this.props.data;

    if (this.props.display_short) {
      data_items = this.props.data.filter(i => i.alternateForm === true);
    }

    data_items.forEach(item => {
      if (item.readOnly && item.variableKey && this.props.variables[item.variableKey]) {
        this.props.answer_data[item.field_name] = this.props.variables[item.variableKey];
      }
    });

    let items = data_items.map(item => {
      switch (item.element) {
        case 'TextInput':
        case 'NumberInput':
        case 'TextArea':
        case 'Dropdown':
        case 'DatePicker':
        case 'RadioButtons':
        case 'Rating':
        case 'Tags':
        case 'Range':
          return this.getInputElement(item);
        case 'Signature':
          return (
            <Signature
              ref={c => (this.inputs[item.field_name] = c)}
              read_only={this.props.read_only || item.readOnly}
              mutable={true}
              key={`form_${item.id}`}
              data={item}
              defaultValue={this.props.answer_data[item.field_name]}
            />
          );
        case 'Checkboxes':
          return (
            <Checkboxes
              ref={c => (this.inputs[item.field_name] = c)}
              read_only={this.props.read_only}
              handleChange={this.handleChange}
              mutable={true}
              key={`form_${item.id}`}
              data={item}
              defaultValue={this._checkboxesDefaultValue(item)}
            />
          );
        case 'Camera':
          return (
            <Camera
              ref={c => (this.inputs[item.field_name] = c)}
              read_only={this.props.read_only}
              handleChange={this.handleChange}
              mutable={true}
              key={`form_${item.id}`}
              data={item}
              defaultValue={this.props.answer_data[item.field_name]}
            />
          );
        case 'Download':
          return (
            <Download
              download_path={this.props.download_path}
              mutable={true}
              key={`form_${item.id}`}
              data={item}
            />
          );
        default:
          if (item.custom && item.element !== 'CustomSubmitButtonOptions') {
            return this.getCustomElement(item, this.props.answer_data);
          } else {
            return !!item.id ? this.getSimpleElement(item) : null;
          }
      }
    });

    let formTokenStyle = {
      display: 'none',
    };

    let actionName = this.props.action_name ? this.props.action_name : 'Submit';
    let backName = this.props.back_name ? this.props.back_name : 'Cancel';

    if (this.props.onErrors && typeof this.props.onErrors === 'function') {
      this.customErrorSubscription = this.emitter.addListener(
        'formValidation',
        this.props.onErrors,
      );
    }

    const customSubmitButtonData = data_items.find(
      item => item.element === 'CustomSubmitButtonOptions',
    );
    let customSubmitButtonOptions = {
      text: actionName,
      color: 'success',
      alignment: 'start',
    };
    let actionButtonParentStyles = {};

    if (
      !!customSubmitButtonData &&
      !!customSubmitButtonData.props &&
      !!customSubmitButtonData.props.submitButtonOptions
    ) {
      const options = customSubmitButtonData.props.submitButtonOptions;
      customSubmitButtonOptions = {
        text: !!options.text ? options.text : actionName,
        color: !!options.color ? options.color : 'success',
        alignment: !!options.alignment ? options.alignment : 'start',
      };
      const getAlignment = () => {
        switch (options.alignment) {
          case 'end':
            return 'flex-end';
          case 'center':
            return 'center';
          case 'start':
          default:
            return 'flex-start';
        }
      };
      actionButtonParentStyles = {
        display: 'flex',
        justifyContent: getAlignment(),
        alignItems: 'center',
      };
    }

    return (
      <div>
        {!this.props.onErrors && <FormValidator emitter={this.emitter} />}
        <div className="react-form-builder-form">
          <form
            encType="multipart/form-data"
            ref={c => (this.form = c)}
            action={this.props.form_action}
            onSubmit={this.handleSubmit.bind(this)}
            method={this.props.form_method}
          >
            {this.props.authenticity_token && (
              <div style={formTokenStyle}>
                <input name="utf8" type="hidden" value="&#x2713;" />
                <input
                  name="authenticity_token"
                  type="hidden"
                  value={this.props.authenticity_token}
                />
                <input name="task_id" type="hidden" value={this.props.task_id} />
              </div>
            )}
            {items}
            <div className="btn-toolbar" style={{ ...actionButtonParentStyles }}>
              {!this.props.hide_actions && (
                <input
                  type="submit"
                  className={`btn btn-school btn-big btn-${customSubmitButtonOptions.color}`}
                  value={customSubmitButtonOptions.text}
                />
              )}
              {!this.props.hide_actions && this.props.back_action && (
                <a href={this.props.back_action} className="btn btn-default btn-cancel btn-big">
                  {backName}
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

ReactForm.defaultProps = { validateForCorrectness: false };

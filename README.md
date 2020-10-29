# CAUTION

This package is highly customized for internal usage, **DO NOT** use in new projects

# React Form Builder Advance

A complete react form builder that interfaces with a json endpoint to load and save generated forms.

- Upgraded to React 16.4.1
- Use react-dnd for Drag & Drop
- Save form data with dummy api server.

![](screenshot.png)

### Editing Items
![](screenshot2.png)

# Basic Usage

```javascript
var React = require('react');
var FormBuilder = require('cb-react-form-builder');

React.render(
  <FormBuilder.ReactFormBuilder />,
  document.body
)
```
# ReactFormBuilder Props

- `toolbarItems: ?array`
- `saveUrl: ?string`
- `url: ?string`
- `onLoad: ?function<Promise>`
- `onPost: ?function` - single argument to function which is an array of objects containing name and value of each form field
- `variables: ?object`


## ReactFormBuilder Props Item Props

- By default all the form builder items are deletable, to hide the delete icon for a particular item pass in the `allowDelete: false` property.

- To disable the edit option for a field pass in the `allowEdit: false` property. By default edit will be enabled for all fields

```json
[
      {
        "id": "XXXXXXX",
        "element": "Camera",
        "text": "Camera",
        "required": false,
        "fieldName": "camera_XXXXXXX",
        "label": "Placeholder Label",
        "allowDelete": false,
        "allowEdit": false,
      },
      {
        "id": "YYYYYYYY",
        "element": "Camera",
        "text": "Camera",
        "required": false,
        "fieldName": "camera_YYYYYYYY",
        "label": "Placeholder Label"
      },
    ]

```

# Props

```javascript
var items = [{
  key: 'Header',
  name: 'Header Text',
  icon: 'fa fa-header',
  static: true,
  content: 'Placeholder Text...'
},
{
  key: 'Paragraph',
  name: 'Paragraph',
  static: true,
  icon: 'fa fa-paragraph',
  content: 'Placeholder Text...'
}];

<FormBuilder.ReactFormBuilder
  url='path/to/GET/initial.json'
  toolbarItems={items}
  saveUrl='path/to/POST/built/form.json' />
```

# React Form Generator
Now that a form is built and saved, let's generate it from the saved json.

```javascript
var React = require('react');
var FormBuilder = require('cb-react-form-builder');

React.render(
  <FormBuilder.ReactFormGenerator
    form_action="/path/to/form/submit"
    form_method="POST"
    task_id={12} // Used to submit a hidden variable with the id to the form from the database.
    answer_data={JSON_ANSWERS} // Answer data, only used if loading a pre-existing form with values.
    authenticity_token={AUTH_TOKEN} // If using Rails and need an auth token to submit form.
    data={JSON_QUESTION_DATA} // Question data
  />,
  document.body
)
```

### Form Params

Name | Type | Required? | Description
--- | --- | --- | ---
form_action | string | Required | URL path to submit the form
form_method | string | Required | Verb used in the form submission.
action_name | string | Optional | Defines form submit button text.  Defaults to "Submit"
data | array | Required | Question data retrieved from the database
back_action | string | Optional | URL path to go back if needed.
back_name | string | Optional | Button text for back action.  Defaults to "Cancel".
task_id | integer | Optional | User to submit a hidden variable with id to the form on the backend database.
answer_data | array | Optional | Answer data, only used if loading a pre-existing form with values.
authenticity_token | string | Optional | If using Rails and need an auth token to submit form.
hide_actions | boolean | Optional | If you would like to hide the submit / cancel buttons set to true.
display_short | boolean | Optional | Display an optional "shorter page/form" which is common for legal documents or situations where the user will just have to sign or fill out a shorter form with only the critical elements.
read_only | boolean | Optional | Shows a read only version which has fields disabled and removes "required" labels.
variables | object | Optional | Key/value object that can be used for Signature variable replacement.

### Read only Signatures

Read only signatures allow you to use a saved/canned signature to be placed into the form. The signature will be passed in through the `variables` property to `ReactFormGenerator` and `ReactFormBuilder`.

To use a read only signature, choose the "Read only" option and enter the key value of the variable that will be used to pass in the signature.

![](screenshot3.png)

The signature data should be in base 64 format.

There is a `variables.js` file that contains a sample base 64 signature. This variable is passed into the demo builder and generator for testing. Use the variable key "JOHN" to test the variable replacement.

# Vendor Dependencies
In order to make the form builder look pretty, there are a few dependencies other than React.  See the example code in index.html for more details.

- Bootstrap
- FontAwesome


# SASS
All relevant styles are located in css/application.css.scss.

# DEMO
```bash
$ npm install
$ npm start
$ npm serve:api
```
Then navigate to http://localhost:8080/ in your browser and you should be able to see the form builder in action.

# Tests
```bash
$ npm test
```
Test is not working at this moment.

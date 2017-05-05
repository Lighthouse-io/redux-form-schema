redux-form-schema
=================

redux-form-schema is helper module for [redux-form](https://github.com/erikras/redux-form), allowing you to define your form options in a schema format for specifying labels, validations, initialValues etc. It uses [validator.js](https://github.com/chriso/validator.js) as a validations library.

Although redux-form is currently a dependency, the idea is to make the schema configuration agnostic to your data layer (redux, flux etc).

## Getting Started

```
npm install --save redux-form-schema
```

```javascript
// schema.js

import buildValidationFn from 'redux-form-schema'

export const schema = {
  name: {
    label: 'Name',
    required: true,
    error: 'The name field is required' // optional custom error message
  },
  'street-address': {
    label: 'Street Address'
  },
  city: {
    label: 'City',
    // conditional required validation
    required: (formValues) => formValues['street-address'],
    validate: {
      // custom validation
      validCity: (formValues, fieldValue) => {
        return _.contains(['Melbourne', 'New York', 'London'], fieldValue)
      }
    }
  },
  'date-of-birth': {
    label: 'Date of Birth',
    type: 'date',
    validate: {
      // built-in validation using [validator.js](https://github.com/chriso/validator.js)
      before: (new Date()).toString()
    }
  }
}

export const validateFn = buildValidationFn(schema)
```

```javascript
// component.js (using redux-form)

import { component } from 'react'
import { Field, reduxForm } from 'redux-form'
import { schema, validateFn } from './schema'

const renderInput = field =>
  <div>
  <label htmlFor={field.input.name}>field.label</label>
    <input {...field.input} type={field.type}/>
    {field.meta.touched &&
     field.meta.error &&
     <span className="error">{field.meta.error}</span>}
  </div>

@reduxForm({
  form: 'myForm',
  validate: validateFn
}
export default class FormComponent extends Component {

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
  }

  render() {
    const { handleSubmit, error } = this.props

    return (
      <form onSubmit={handleSubmit()} noValidate>
        <Field {...schema.name} component={renderInput} />
        <Field {...schema['street-address']} component={renderInput} />
        <Field {...schema.city} component={renderInput} />
        <Field {...schema['date-of-birth']} component={renderInput} />
      </form>
    )
  }
}
```

## Schema

The Schema is where you build the data structure out for your forms. Currently only validation and error messages are the real features, but the future goal is to make the schema the base of your configuration for any React Form.

Schema's are simple JavaScript objects, with the keys being your field identifiers and the value the configuration for that field with the following properties:

### `label : String`

Human readable version of you field Id and what will be used in default error messages for validation

`label: 'name'`

### `required : Boolean/Function`

If `true` the field will be validated as required in the `redux-form` `validate` method. Can also be a function which, on `validate` will be passed the form values as an arguments and should return `true`/`false` indication if the field is required. Useful for conditional required validation based other form values

`required: true`
`required: (formValues) => formValues['this-field-must-exist']`

### `type : String`

Specifies the type of data the field values should be (e.g. date, number, email, boolean or any of the simple validators available with [validator.js](https://github.com/chriso/validator.js)). A simple validator is one that accepts no options or can be run with optional options, i.e. It just accepts the value.

`type: 'date'`

### `error : String`

Custom error message if the field invalidates. By default, there are built in error messages that will be added to the `redux-form` error object if the value invalidates against the schema config. This value will override the built-in error message

`error: 'You  must enter something for this field!`

### `validate : Object`

Options for complex validations (i.e. they accepts options). Any of the validators available in [validator.js](https://github.com/chriso/validator.js) are available to use, and are specified **without** the 'is' prefix.

```javascript
validate: {
  // validate value is an integer that is a minimum of 0 and a maximum of 100
  int: {
    min: 0,
    max: 100
  }
}
```

## Error Messages

There is built in support for error messages on some of the validators, but not all (yet). Any that aren't yet included will return a generic error message and can be overrided by your fields `error` property.

E.g by default, the `int` validator used in the example will use your fields label property and the validation options to return an error message such as, 'Age should be between 0 and 100'.

## Gotchas

The only difference when specifying schema validation in relation to the [validator.js](https://github.com/chriso/validator.js) API is the `length` validator. In `redux-form-schema` you specify min and max length as an object, just like with the `int` validator, e.g:

```javascript
{
  name: {
    validate: {
      length: {
        min: 0,
        max: 20
      }
    }
  }
}
```

## Credits

* [redux-form]()
* [validator.js](https://github.com/chriso/validator.js)
* [@nicgordon](https://github.com/nicgordon) for the idea to use a schema as a way to manage forms

## TODO

* initialValues
* Integration testing
* Async validation
* Error message support for all [validator.js](https://github.com/chriso/validator.js) validators

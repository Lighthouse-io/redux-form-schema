'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _each = require('lodash/collection/each');

var _each2 = _interopRequireDefault(_each);

var _startCase = require('lodash/string/startCase');

var _startCase2 = _interopRequireDefault(_startCase);

var _isFunction = require('lodash/lang/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isUndefined = require('lodash/lang/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _errorMessages = require('./error-messages');

var _errorMessages2 = _interopRequireDefault(_errorMessages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (schema) {
  var fields = Object.keys(schema);
  var validate = buildValidationFn(schema);
  return {
    fields: fields,
    validate: validate
  };
};

function buildValidationFn(schema) {
  return function (formValues) {
    var errors = {};

    if (!formValues) {
      return errors;
    }

    // TODO this could possibly be done with lodash transform
    (0, _each2.default)(schema, function (definition, fieldRef) {
      var label = definition.label;
      var required = definition.required;
      var type = definition.type;
      var validate = definition.validate;
      var error = definition.error;

      var fieldValue = formValues[fieldRef];
      var fieldValueExists = !(0, _isUndefined2.default)(formValues[fieldRef]);

      // required is active if it is `true` or a function that returns
      // true when passed the form values as an argument. This allows
      // you to perform conditional requires based on other values in
      // the form
      var isRequired = required && required === true || (0, _isFunction2.default)(required) && !(0, _isUndefined2.default)(required(formValues));

      // validate required
      if (isRequired && !fieldValueExists) {
        addErrorToField(errors, fieldRef, error || (0, _errorMessages2.default)('required', label));
      }

      // validate simple type validators
      if (fieldValueExists && type && !validates(type, fieldValue)) {
        // use custom error message or fallback to default
        var message = error || (0, _errorMessages2.default)(type, label);
        addErrorToField(errors, fieldRef, message);
      }

      // validate complex validations
      if (validate) {

        // only validate if rule doesnt exist, or rule exists and the
        // function returns true when passed formValues

        (0, _each2.default)(validate, function (opts, id) {
          // TODO support array of validate's which will allow multiple
          // rule based validations

          // skip validation if we have no field value
          if (!fieldValueExists) {
            return;
          }

          var isValid = undefined;
          var customValidator = (0, _isFunction2.default)(opts) && opts;

          if (customValidator) {
            isValid = customValidator(formValues, fieldValue);
          } else {
            isValid = validates(id, fieldValue, opts);
          }

          if (!isValid) {
            // use custom error message or fallback to default
            var message = error || (0, _errorMessages2.default)(id, label, opts);
            addErrorToField(errors, fieldRef, message);
          }
        });
      }
    });

    return errors;
  };
}

function addErrorToField(errors, fieldRef, errorMessage) {
  errors[fieldRef] = errors[fieldRef] || [];
  errors[fieldRef].push(errorMessage);
}

// Get validator by string (the part after 'is' in validator methods)
// validatorId = 'email' => validator.isEmail
// validatorId = 'date' => validator.isDate
// validatorId = 'creditCard' => validator.isCreditCard
function getValidator(validatorId) {
  var validatorIdInStartCase = (0, _startCase2.default)(validatorId);
  var validatorFn = _validator2.default['is' + validatorIdInStartCase];
  return validatorFn;
}

/**
 * run a validator with value and options
 * @param {String} validatorId the id of `validator` method
 * @param {String} value to run against validator
 * @param {Mixed} ...opts if applicable
 */
function validates(validatorId, value, opts) {
  var validatorFn = getValidator(validatorId);
  if (!validatorFn) {
    return console.warn('Missing validator for \'' + validatorId + '\'');
  }

  switch (validatorId) {
    case 'length':
      // isLength is a case where we don't follow the API of
      // validator.js which accepts two arguments for length that
      // doesn't play nice with a single object definition (like in
      // our schemas). This also is consistent with how min/max is
      // defined in the isInt validator
      return validatorFn(value, opts.min, opts.max);
    default:
      return validatorFn(value, opts);
  }
}
'use strict';

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _omit = require('lodash/object/omit');

var _omit2 = _interopRequireDefault(_omit);

var _contains = require('lodash/collection/contains');

var _contains2 = _interopRequireDefault(_contains);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exampleSchema = {
  'name': {
    label: 'Name',
    required: true,
    validate: {
      length: {
        min: 0,
        max: 20
      }
    }
  },
  'email': {
    label: 'Email',
    error: 'You must enter an email address for your account',
    type: 'email'
  },
  'street-address': {
    label: 'Street Address'
  },
  'city': {
    label: 'City',
    error: 'A valid City is required if you enter a Street Address',
    // required if street address exists
    required: function required(formValues) {
      return formValues['street-address'];
    },
    validate: {
      validCity: function validCity(formValues, fieldValue) {
        return (0, _contains2.default)(['Melbourne', 'New York', 'London'], fieldValue);
      }
    }
  },
  'date-of-birth': {
    label: 'Date of Birth',
    type: 'date',
    validate: {
      before: new Date().toString()
    }
  },
  'score': {
    label: 'Score',
    type: 'numeric',
    validate: {
      int: {
        min: 0,
        max: 100
      }
    }
  },
  'category': {
    label: 'Category',
    validate: {
      in: ['red', 'green', 'blue']
    }
  },
  'latitude': {
    label: 'Latitude',
    required: function required(formValues) {
      return !!formValues.longitude;
    },
    validate: {
      float: {
        min: -90,
        max: 90
      }
    }
  },
  'longitude': {
    label: 'Longitude',
    required: function required(formValues) {
      return !!formValues.latitude;
    },
    validate: {
      float: {
        min: -180,
        max: 180
      }
    }
  }
};

// use this as a base and extend with invalid values in test
var exampleValidValues = {
  'name': 'Will McClellan',
  'email': 'you@example.com',
  'street-address': '17 Budd St',
  'city': 'Melbourne',
  'date-of-birth': new Date('1987/04/24').toString(),
  'score': '78',
  'category': 'red',
  'latitude': '0',
  'longitude': '0'
};

describe('buildValidationFn', function () {
  var formSchema = (0, _2.default)(exampleSchema);
  var fields = formSchema.fields;
  var validate = formSchema.validate;

  it('should build a redux form validation fn based on a schema', function () {
    _should2.default.exist(formSchema);
    formSchema.should.have.keys('fields', 'validate');
    fields.should.be.an.Array();
    fields.should.eql(Object.keys(exampleSchema));
    validate.should.be.a.Function();
  });

  it('should validate valid values', function () {
    // assert valid values pass validation
    validate(Object.assign({}, exampleValidValues)).should.be.an.Object().and.be.empty();

    // should validate with non-string values
    var exampleValidValuesWithNonString = Object.assign({}, exampleValidValues, {
      latitude: 0,
      longitude: '90'
    });
    validate(exampleValidValuesWithNonString).should.be.an.Object().and.be.empty();
  });

  it('should validate required fields', function () {
    // Required assertions
    var exampleValuesWithMissingName = (0, _omit2.default)(exampleValidValues, 'name');
    validate(exampleValuesWithMissingName).should.be.an.Object().and.have.property('name', ['Name is Required']);

    // empty required string should invalidate
    var exampleValuesWithEmptyName = Object.assign({}, exampleValidValues, {
      name: ''
    });
    validate(exampleValuesWithEmptyName).should.be.an.Object().and.have.property('name', ['Name is Required']);

    // DoB is not required and should pass validation if missing
    var exampleValuesWithNoDob = (0, _omit2.default)(exampleValidValues, 'date-of-birth');
    validate(exampleValuesWithNoDob).should.be.an.Object().and.be.empty();

    // conditional required
    var exampleValuesWithMissingConditionalRequired = (0, _omit2.default)(Object.assign({}, exampleValidValues), 'city');
    validate(exampleValuesWithMissingConditionalRequired).should.be.an.Object().and.have.property('city', ['A valid City is required if you enter a Street Address']);
    exampleValuesWithMissingConditionalRequired = (0, _omit2.default)(exampleValuesWithMissingConditionalRequired, 'street-address');
    validate(exampleValuesWithMissingConditionalRequired).should.be.an.Object().and.be.empty();
  });

  it('should validate types', function () {
    // Valid Type Assertions
    var exampleValuesWithInvalidEmail = Object.assign({}, exampleValidValues, {
      email: 'example.com' // invalid email
    });
    validate(exampleValuesWithInvalidEmail).should.be.an.Object()
    // also checking for custom error message here
    .and.have.property('email', ['You must enter an email address for your account']);
  });

  it('should validate complex validations', function () {
    // Validate 'In' Assertions
    var exampleValuesWithInvalidCategory = Object.assign({}, exampleValidValues, {
      category: 'pink' // invalid enum
    });
    validate(exampleValuesWithInvalidCategory).should.be.an.Object()
    // built in error message
    .and.have.property('category', ['Category should be one of red, green, blue']);

    // Validate 'Int' Assertions
    var exampleValuesWithInvalidScore = Object.assign({}, exampleValidValues, {
      score: '101' // invalid int
    });
    validate(exampleValuesWithInvalidScore).should.be.an.Object()
    // built in error message
    .and.have.property('score', ['Score should be between 0 and 100']);
  });

  it('should validate complex validations conditionally', function () {

    var exampleValuesWithoutGeo = (0, _omit2.default)(exampleValidValues, ['latitude', 'longitude']);
    validate(exampleValuesWithoutGeo).should.be.an.Object().and.be.empty();

    var exampleValuesWithoutLatitude = (0, _omit2.default)(exampleValidValues, 'latitude');
    validate(exampleValuesWithoutLatitude).should.be.an.Object().and.have.property('latitude', ['Latitude is Required']);
  });

  it('should validate custom validation function', function () {
    var exampleValuesWithValidCustomData = Object.assign({}, exampleValidValues, {
      city: 'Melbourne' // Melbourne is valid
    });
    validate(exampleValuesWithValidCustomData).should.be.an.Object().and.be.empty();

    var exampleValuesWithInvalidCustomData = Object.assign({}, exampleValidValues, {
      city: 'Sydney' // sydney is an invalid city on our custom validator
    });
    validate(exampleValuesWithInvalidCustomData).should.be.an.Object().and.have.property('city', ['A valid City is required if you enter a Street Address']);
  });

  // testing this as it's the only difference between the validator
  // api and our schema definition
  it('should validate length validator', function () {
    var exampleValuesWithInvalidLength = Object.assign({}, exampleValidValues, {
      name: 'Thisnameistoolongandshoulderror'
    });
    validate(exampleValuesWithInvalidLength).should.be.an.Object().and.have.property('name', ['Name should be a minimum of 0 and a maximum of 20 characters']);
  });
});
import build from '../';
import should from 'should';
import omit from 'lodash/object/omit';
import contains from 'lodash/collection/contains';

const exampleSchema = {
  'name': {
    label: 'Name',
    error: 'The name field is required',
    required: true
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
    required: formValues => formValues['street-address'],
    validate: {
      validCity: (formValues, fieldValue) => {
        return contains(['Melbourne', 'New York', 'London'], fieldValue);
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
    required: formValues => formValues.longitude,
    validate: {
      float: {
        min: -90,
        max: 90
      }
    }
  },
  'longitude': {
    label: 'Longitude',
    required: formValues => formValues.latitude,
    validate: {
      float: {
        min: -180,
        max: 180
      }
    }
  }
};

// use this as a base and extend with invalid values in test
const exampleValidValues = {
  'name': 'Will McClellan',
  'email': 'you@example.com',
  'street-address': '17 Budd St',
  'city': 'Melbourne',
  'date-of-birth': new Date('1987/04/24').toString(),
  'score': '78',
  'category': 'red',
  'latitude': 0,
  'longitude': 0
};

describe('buildValidationFn', () => {
  const formSchema = build(exampleSchema);
  const { fields, validate } = formSchema;

  it('should build a redux form validation fn based on a schema', () => {
    should.exist(formSchema);
    formSchema.should.have.keys('fields', 'validate');
    fields.should.be.an.Array();
    fields.should.eql(Object.keys(exampleSchema));
    validate.should.be.a.Function();
  });

  it('should validate valid values', () => {
    // assert valid values pass validation
    validate(exampleValidValues).should.be.an.Object().and.be.empty();
  });

  it('should validate required fields', () => {
    // Required assertions
    const exampleValuesWithMissingName = omit(exampleValidValues, 'name');
    validate(exampleValuesWithMissingName).should.be.an.Object()
    // also checking for custom error message here
    .and.have.property('name', ['The name field is required']);

    // DoB is not required and should pass validation if missing
    const exampleValuesWithNoDob = omit(exampleValidValues, 'date-of-birth');
    validate(exampleValuesWithNoDob).should.be.an.Object().and.be.empty();

    // conditional required
    let exampleValuesWithMissingConditionalRequired = omit(Object.assign({}, exampleValidValues), 'city');
    validate(exampleValuesWithMissingConditionalRequired).should.be.an.Object().and.have.property('city', ['A valid City is required if you enter a Street Address']);
    exampleValuesWithMissingConditionalRequired = omit(exampleValuesWithMissingConditionalRequired, 'street-address');
    validate(exampleValuesWithMissingConditionalRequired).should.be.an.Object().and.be.empty();
  });

  it('should validate types', () => {
    // Valid Type Assertions
    const exampleValuesWithInvalidEmail = Object.assign({}, exampleValidValues, {
      email: 'example.com' // invalid email
    });
    validate(exampleValuesWithInvalidEmail).should.be.an.Object()
    // also checking for custom error message here
    .and.have.property('email', ['You must enter an email address for your account']);
  });

  it('should validate complex validations', () => {
    // Validate 'In' Assertions
    const exampleValuesWithInvalidCategory = Object.assign({}, exampleValidValues, {
      category: 'pink' // invalid enum
    });
    validate(exampleValuesWithInvalidCategory).should.be.an.Object()
    // built in error message
    .and.have.property('category', ['Category should be one of red, green, blue']);

    // Validate 'Int' Assertions
    const exampleValuesWithInvalidScore = Object.assign({}, exampleValidValues, {
      score: '101' // invalid int
    });
    validate(exampleValuesWithInvalidScore).should.be.an.Object()
    // built in error message
    .and.have.property('score', ['Score should be between 0 and 100']);
  });

  it('should validate complex validations conditionally', () => {

    const exampleValuesWithoutGeo = omit(exampleValidValues, ['latitude', 'longitude']);
    validate(exampleValuesWithoutGeo).should.be.an.Object().and.be.empty();

    const exampleValuesWithoutLatitude = omit(exampleValidValues, 'latitude');
    validate(exampleValuesWithoutLatitude).should.be.an.Object().and.have.property('latitude', ['Latitude is Required']);
  });

  it('should validate custom validation function', () => {
    const exampleValuesWithValidCustomData = Object.assign({}, exampleValidValues, {
      city: 'Melbourne' // Melbourne is valid
    });
    validate(exampleValuesWithValidCustomData).should.be.an.Object().and.be.empty();

    const exampleValuesWithInvalidCustomData = Object.assign({}, exampleValidValues, {
      city: 'Sydney' // sydney is an invalid city on our custom validator
    });
    validate(exampleValuesWithInvalidCustomData).should.be.an.Object().and.have.property('city', ['A valid City is required if you enter a Street Address']);
  });
});
import build from '../../src/'
import omit from 'lodash/omit'
import includes from 'lodash/includes'

const exampleSchema = {
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
    required: (formValues) => formValues['street-address'],
    validate: {
      validCity: (formValues, fieldValue) => {
        return includes(['Melbourne', 'New York', 'London'], fieldValue)
      }
    }
  },
  'date-of-birth': {
    label: 'Date of Birth',
    type: 'date',
    validate: {
      before: (new Date()).toString()
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
    required: (formValues) => !!formValues.longitude,
    validate: {
      float: {
        min: -90,
        max: 90
      }
    }
  },
  'longitude': {
    label: 'Longitude',
    required: (formValues) => !!formValues.latitude,
    validate: {
      float: {
        min: -180,
        max: 180
      }
    }
  }
}

// use this as a base and extend with invalid values in test
const exampleValidValues = {
  'name': 'Will McClellan',
  'email': 'you@example.com',
  'street-address': '17 Budd St',
  'city': 'Melbourne',
  'date-of-birth': (new Date('1987/04/24')).toString(),
  'score': '78',
  'category': 'red',
  'latitude': '0',
  'longitude': '0'
}

describe('buildValidateFn', () => {
  const validateFn = build(exampleSchema)

  it('should build a redux form validate fn based on a schema', () => {
    validateFn.should.be.a.Function()
  })

  it('should validate valid values', () => {
    // assert valid values pass validation
    validateFn(Object.assign({}, exampleValidValues)).should
      .be.an.Object()
      .and.be.empty()

    // should validate with non-string values
    const exampleValidValuesWithNonString = Object.assign({}, exampleValidValues, {
      latitude: 0,
      longitude: '90'
    })
    validateFn(exampleValidValuesWithNonString).should
      .be.an.Object()
      .and.be.empty()
  })

  it('should validate required fields', () => {
    // Required assertions
    const exampleValuesWithMissingName = omit(exampleValidValues, 'name')
    validateFn(exampleValuesWithMissingName).should
      .be.an.Object()
      .and.have.property('name', ['Name is Required'])

    // empty required string should invalidate
    const exampleValuesWithEmptyName = Object.assign({}, exampleValidValues, {
      name: ''
    })
    validateFn(exampleValuesWithEmptyName).should
      .be.an.Object()
      .and.have.property('name', ['Name is Required'])

    // DoB is not required and should pass validation if missing
    const exampleValuesWithNoDob = omit(exampleValidValues, 'date-of-birth')
    validateFn(exampleValuesWithNoDob).should
      .be.an.Object()
      .and.be.empty()

    // conditional required
    let exampleValuesWithMissingConditionalRequired = omit(Object.assign({}, exampleValidValues), 'city')
    validateFn(exampleValuesWithMissingConditionalRequired).should
      .be.an.Object()
      .and.have.property('city', ['A valid City is required if you enter a Street Address'])
    exampleValuesWithMissingConditionalRequired = omit(exampleValuesWithMissingConditionalRequired, 'street-address')
    validateFn(exampleValuesWithMissingConditionalRequired).should
      .be.an.Object()
      .and.be.empty()
  })

  it('should validate types', () => {
    // Valid Type Assertions
    const exampleValuesWithInvalidEmail = Object.assign({}, exampleValidValues, {
      email: 'example.com' // invalid email
    })
    validateFn(exampleValuesWithInvalidEmail).should
      .be.an.Object()
      // also checking for custom error message here
      .and.have.property('email', ['You must enter an email address for your account'])
  })

  it('should validate complex validations', () => {
    // Validate 'In' Assertions
    const exampleValuesWithInvalidCategory = Object.assign({}, exampleValidValues, {
      category: 'pink' // invalid enum
    })
    validateFn(exampleValuesWithInvalidCategory).should
      .be.an.Object()
      // built in error message
      .and.have.property('category', ['Category should be one of red, green, blue'])

    // Validate 'Int' Assertions
    const exampleValuesWithInvalidScore = Object.assign({}, exampleValidValues, {
      score: '101' // invalid int
    })
    validateFn(exampleValuesWithInvalidScore).should
      .be.an.Object()
      // built in error message
      .and.have.property('score', ['Score should be between 0 and 100'])
  })

  it('should validate complex validations conditionally', () => {

    const exampleValuesWithoutGeo = omit(exampleValidValues, ['latitude', 'longitude'])
    validateFn(exampleValuesWithoutGeo).should
      .be.an.Object()
      .and.be.empty()

    const exampleValuesWithoutLatitude = omit(exampleValidValues, 'latitude')
    validateFn(exampleValuesWithoutLatitude).should
      .be.an.Object()
      .and.have.property('latitude', ['Latitude is Required'])
  })

  it('should validate custom validation function', () => {
    const exampleValuesWithValidCustomData = Object.assign({}, exampleValidValues, {
      city: 'Melbourne' // Melbourne is valid
    })
    validateFn(exampleValuesWithValidCustomData).should
      .be.an.Object()
      .and.be.empty()

    const exampleValuesWithInvalidCustomData = Object.assign({}, exampleValidValues, {
      city: 'Sydney' // sydney is an invalid city on our custom validator
    })
    validateFn(exampleValuesWithInvalidCustomData).should
      .be.an.Object()
      .and.have.property('city', ['A valid City is required if you enter a Street Address'])
  })

  // testing this as it's the only difference between the validator
  // api and our schema definition
  it('should validate length validator', () => {
    const exampleValuesWithInvalidLength = Object.assign({}, exampleValidValues, {
      name: 'Thisnameistoolongandshoulderror',
    })
    validateFn(exampleValuesWithInvalidLength).should
      .be.an.Object()
      .and.have.property('name', ['Name should be a minimum of 0 and a maximum of 20 characters'])
  })

})

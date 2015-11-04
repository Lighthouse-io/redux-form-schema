import errorMessages from '../error-messages'
import should from 'should'

describe('error-messages', () => {
  it('should return default message', () => {
    errorMessages('unknown-validator', 'Name').should.eql('Name is Invalid')
  })
  it('should return message for required', () => {
    errorMessages('required', 'Name').should.eql('Name is Required')
  })
  it('should return message for email address', () => {
    errorMessages('email', 'Email Address').should.eql('Email Address should be a valid Email Address')
  })
  it('should return message for in', () => {
    errorMessages('in', 'Color', ['red', 'green', 'blue']).should.eql('Color should be one of red, green, blue')
  })
  it('should return message for integer', () => {
    errorMessages('int', 'Age').should.eql('Age should be an Number')
    errorMessages('int', 'Age', { min: 18 }).should.eql('Age should be at least 18')
    errorMessages('int', 'Age', { max: 65 }).should.eql('Age should be at most 65')
    errorMessages('int', 'Age', { min: 18, max: 65 }).should.eql('Age should be between 18 and 65')
  })
  it('should return message for dates', () => {
    errorMessages('date', 'DOB').should.eql('DOB should be a Date')
    errorMessages('after', 'DOB').should.eql('DOB should be after Current Time')
    const dateInPast = new Date('2000/01/01')
    errorMessages('after', 'DOB', dateInPast).should.eql(`DOB should be after ${dateInPast.toString()}`)
    errorMessages('before', 'Anniversary').should.eql('Anniversary should be before Current Time')
    const dateInFuture = new Date('2020/01/01')
    errorMessages('before', 'Anniversary', dateInFuture).should.eql(`Anniversary should be before ${dateInFuture.toString()}`)
  })
  it('should return message for length', () => {
    errorMessages('length', 'Password', 8).should.eql('Password should be a minimum of 8 characters')
    errorMessages('length', 'Password', 8, 12).should.eql('Password should be a minimum of 8 and a maximum of 12 characters')
    errorMessages('length', 'Password').should.eql('Password is an Invalid length')
  })
  it('should return message for numeric', () => {
    errorMessages('numeric', 'Country').should.eql('Country should only contain numbers')
  })
  it('should return message for URL', () => {
    errorMessages('URL', 'Website').should.eql('Website should be a valid URL')
  })
})

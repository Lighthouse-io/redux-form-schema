'use strict';

var _errorMessages = require('../error-messages');

var _errorMessages2 = _interopRequireDefault(_errorMessages);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('error-messages', function () {
  it('should return default message', function () {
    (0, _errorMessages2.default)('unknown-validator', 'Name').should.eql('Name is Invalid');
  });
  it('should return message for required', function () {
    (0, _errorMessages2.default)('required', 'Name').should.eql('Name is Required');
  });
  it('should return message for email address', function () {
    (0, _errorMessages2.default)('email', 'Email Address').should.eql('Email Address should be a valid Email Address');
  });
  it('should return message for in', function () {
    (0, _errorMessages2.default)('in', 'Color', ['red', 'green', 'blue']).should.eql('Color should be one of red, green, blue');
  });
  it('should return message for integer', function () {
    (0, _errorMessages2.default)('int', 'Age').should.eql('Age should be an Number');
    (0, _errorMessages2.default)('int', 'Age', { min: 18 }).should.eql('Age should be at least 18');
    (0, _errorMessages2.default)('int', 'Age', { max: 65 }).should.eql('Age should be at most 65');
    (0, _errorMessages2.default)('int', 'Age', { min: 18, max: 65 }).should.eql('Age should be between 18 and 65');
  });
  it('should return message for dates', function () {
    (0, _errorMessages2.default)('date', 'DOB').should.eql('DOB should be a Date');
    (0, _errorMessages2.default)('after', 'DOB').should.eql('DOB should be after Current Time');
    var dateInPast = new Date('2000/01/01');
    (0, _errorMessages2.default)('after', 'DOB', dateInPast).should.eql('DOB should be after ' + dateInPast.toString());
    (0, _errorMessages2.default)('before', 'Anniversary').should.eql('Anniversary should be before Current Time');
    var dateInFuture = new Date('2020/01/01');
    (0, _errorMessages2.default)('before', 'Anniversary', dateInFuture).should.eql('Anniversary should be before ' + dateInFuture.toString());
  });
  it('should return message for length', function () {
    (0, _errorMessages2.default)('length', 'Password', { min: 8 }).should.eql('Password should be a minimum of 8 characters');
    (0, _errorMessages2.default)('length', 'Password', { min: 8, max: 12 }).should.eql('Password should be a minimum of 8 and a maximum of 12 characters');
    (0, _errorMessages2.default)('length', 'Password').should.eql('Password is an Invalid length');
  });
  it('should return message for numeric', function () {
    (0, _errorMessages2.default)('numeric', 'Country').should.eql('Country should only contain numbers');
  });
  it('should return message for URL', function () {
    (0, _errorMessages2.default)('URL', 'Website').should.eql('Website should be a valid URL');
  });
});
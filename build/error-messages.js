import { isInt } from 'validator';

export default function errorMessageGenerator(validatorId, label, opts) {

  switch (validatorId) {

    case 'required':
      return `${ label } is Required`;

    case 'email':
      return `${ label } should be a valid Email Address`;

    case 'in':
      return `${ label } should be one of ${ opts.join(', ') }`;

    case 'numeric':
      return `${ label } should only contain numbers`;

    case 'int':

      opts = opts || {};

      if (isInt(opts.min) && isInt(opts.max)) {
        return `${ label } should be between ${ opts.min } and ${ opts.max }`;
      }

      if (isInt(opts.min)) {
        return `${ label } should be at least ${ opts.min }`;
      }

      if (isInt(opts.max)) {
        return `${ label } should be at most ${ opts.max }`;
      }

      // otherwise message should just require integer value
      return `${ label } should be an Number`;

    case 'date':
      return `${ label } should be a Date`;

    case 'before':
    case 'after':

      if (opts) {
        return `${ label } should be ${ validatorId } ${ opts.toString() }`;
      }

      return `${ label } should be ${ validatorId } Current Time`;

    case 'length':

      opts = opts || {};

      if (isInt(opts.min) && isInt(opts.max)) {
        return `${ label } should be a minimum of ${ opts.min } and a maximum of ${ opts.max } characters`;
      }

      if (isInt(opts.min)) {
        return `${ label } should be a minimum of ${ opts.min } characters`;
      }

      if (isInt(opts.max)) {
        return `${ label } should be a maximum of ${ opts.max } characters`;
      }

      return `${ label } is an Invalid length`;

    case 'URL':
      return `${ label } should be a valid URL`;

    default:
      return `${ label } is Invalid`;
  }
}
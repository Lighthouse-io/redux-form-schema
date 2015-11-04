import { isInt } from 'validator';

export default function errorMessageGenerator(validatorId, label, ...opts) {

  opts = opts || [];
  const [primaryOption, secondaryOption] = opts;

  switch (validatorId) {

    case 'required':
      return `${ label } is Required`;

    case 'email':
      return `${ label } should be a valid Email Address`;

    case 'in':
      return `${ label } should be one of ${ primaryOption.join(', ') }`;

    case 'numeric':
      return `${ label } should only contain numbers`;

    case 'int':

      // NOTE we're using isInt here to make sure that
      // the primaryOption value is not 0

      if (primaryOption && isInt(primaryOption.min) && isInt(primaryOption.max)) {
        return `${ label } should be between ${ primaryOption.min } and ${ primaryOption.max }`;
      }

      if (primaryOption && isInt(primaryOption.min)) {
        return `${ label } should be at least ${ primaryOption.min }`;
      }

      if (primaryOption && isInt(primaryOption.max)) {
        return `${ label } should be at most ${ primaryOption.max }`;
      }

      // otherwise message should just require integer value
      return `${ label } should be an Number`;

    case 'date':
      return `${ label } should be a Date`;

    case 'before':
    case 'after':

      if (primaryOption) {
        return `${ label } should be ${ validatorId } ${ primaryOption.toString() }`;
      }

      return `${ label } should be ${ validatorId } Current Time`;

    case 'length':

      // primary = min, secondary = max
      if (primaryOption && secondaryOption) {
        return `${ label } should be a minimum of ${ primaryOption } and a maximum of ${ secondaryOption } characters`;
      }

      if (primaryOption) {
        return `${ label } should be a minimum of ${ primaryOption } characters`;
      }

      return `${ label } is an Invalid length`;

    case 'URL':
      return `${ label } should be a valid URL`;

    default:
      return `${ label } is Invalid`;
  }
}
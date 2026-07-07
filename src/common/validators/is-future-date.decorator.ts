import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return value instanceof Date && value.getTime() > Date.now();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date in the future`;
        },
      },
    });
  };
}

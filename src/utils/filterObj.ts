export const filterObj = <T extends object>(
  obj: T,
  ...allowedFields: string[]
): Partial<T> => {
  const newObj: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key as keyof T] = obj[key as keyof T];
    }
  });

  return newObj;
};

import * as React from 'react';

export const useToggle = (defaultValue: boolean): [boolean, () => void] => {
  const [value, setValue] = React.useState<boolean>(defaultValue);

  const toggleValue = (): void => {
    setValue((oldState: boolean): boolean => !oldState);
  };
  const result: [boolean, () => void] = [value, toggleValue];

  return result;
};

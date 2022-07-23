import * as React from 'react';

export const useToggle = (defaultValue: boolean) => {
  const [value, setValue] = React.useState<boolean>(defaultValue);

  const toggleValue = () => {
    setValue((oldState) => !oldState);
  };
  const result: [boolean, () => void] = [value, toggleValue];

  return result;
};

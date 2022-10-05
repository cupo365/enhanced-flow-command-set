import * as React from 'react';

/**
* Customized React.useState hook for toggling a boolean value
*
* @param defaultValue The default value of the toggle
*/
export const useToggle = (defaultValue: boolean | (() => boolean)): [boolean, () => void] => {
  const [value, setValue] = React.useState<boolean>(defaultValue);

  const toggleValue = (): void => {
    setValue((oldState: boolean): boolean => !oldState);
  };
  const result: [boolean, () => void] = [value, toggleValue];

  return result;
};

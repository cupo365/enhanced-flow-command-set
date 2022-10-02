import { IDropdownOption } from "@fluentui/react";
import { stringIsNullOrEmpty } from "../library";

export interface IRequestedUserInput {
  name: string;
  label: string;
  placeholder: string | undefined;
  type: string;
  required: boolean;
  minDate: string | undefined;
  maxDate: string | undefined;
  options: IDropdownOption[] | undefined;
}

export enum SupportedInputTypes {
  SingleLineText = "Single line text",
  MultiLineText = "Multi line text",
  Number = "Number",
  Email = "Email",
  Choice = "Choice",
  Date = "Date",
  PeoplePicker = "People picker"
}

export const isRequestedUserInputValid = (requestedUserInput: IRequestedUserInput, triggerConfigTitle: string): boolean => {
  try {
    if (requestedUserInput && !stringIsNullOrEmpty(requestedUserInput?.name) && !stringIsNullOrEmpty(requestedUserInput?.label)
      && !stringIsNullOrEmpty(requestedUserInput?.type) && Object.values(SupportedInputTypes).includes(requestedUserInput?.type as SupportedInputTypes)) {
      let isValid: boolean = false;

      switch (requestedUserInput?.type) {
        case SupportedInputTypes.Date:
          try {
            if (requestedUserInput.minDate && requestedUserInput.maxDate) {
              const minDate: Date = new Date(requestedUserInput.minDate);
              const maxDate: Date = new Date(requestedUserInput.maxDate);

              if (minDate && maxDate && minDate < maxDate) {
                isValid = true;
              }
              break;
            } else {
              isValid = true;
              break;
            }
          } catch (err) {
            break;
          }
        case SupportedInputTypes.Choice:
          isValid = requestedUserInput?.options && requestedUserInput?.options.length > 0;
          break;
        default:
          isValid = true;
          break;
      }

      if (!isValid) throw new Error(`EnhancedPowerAutomateTrigger -> Requested user input for trigger configuration '${triggerConfigTitle}' is invalid.`);
      return isValid;
    } else {
      throw new Error(`EnhancedPowerAutomateTrigger -> Requested user input for trigger configuration '${triggerConfigTitle}' is invalid.`);
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

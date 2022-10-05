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
  selectionLimit: number | undefined;
  groupName: string | undefined;
  options: IDropdownOption[] | undefined;
  lookupListName: string | undefined;
  lookupDisplayColumn: string | undefined;
  multiSelect: boolean;
}

export enum SupportedInputTypes {
  SingleLineText = "Single line text",
  MultiLineText = "Multi line text",
  Number = "Number",
  Email = "Email",
  Dropdown = "Dropdown",
  Date = "Date",
  PeoplePicker = "People picker",
  ComboBox = "Combo box",
  Lookup = "Lookup",
  MultiLookup = "Multi lookup"
}

/**
* Validates a requested user input object.
* @param requestedUserInput The requested user input object to validate.
* @param triggerConfigTitle The configured title of the trigger.
*/
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
        case SupportedInputTypes.Dropdown:
          isValid = requestedUserInput?.options && requestedUserInput?.options.length > 0;
          break;
        case SupportedInputTypes.ComboBox:
          isValid = requestedUserInput?.options && requestedUserInput?.options.length > 0;
          break;
        case SupportedInputTypes.PeoplePicker:
          isValid = !isNaN(requestedUserInput?.selectionLimit) && requestedUserInput?.selectionLimit > 0;
          break;
        case SupportedInputTypes.Lookup:
          isValid = !stringIsNullOrEmpty(requestedUserInput?.lookupListName) && !stringIsNullOrEmpty(requestedUserInput?.lookupDisplayColumn);
          break;
        case SupportedInputTypes.MultiLookup:
          isValid = !stringIsNullOrEmpty(requestedUserInput?.lookupListName) && !stringIsNullOrEmpty(requestedUserInput?.lookupDisplayColumn) && requestedUserInput.multiSelect === true;
          break;
        default:
          isValid = true;
          break;
      }

      if (!isValid) throw new Error(`EnhancedFlowTrigger -> Requested user input for trigger configuration '${triggerConfigTitle}' is invalid.`);
      return isValid;
    } else {
      throw new Error(`EnhancedFlowTrigger -> Requested user input for trigger configuration '${triggerConfigTitle}' is invalid.`);
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

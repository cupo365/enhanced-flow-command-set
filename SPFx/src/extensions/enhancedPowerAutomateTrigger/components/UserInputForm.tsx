/* eslint-disable @microsoft/spfx/no-async-await */
import { DatePicker, DayOfWeek, defaultDatePickerStrings, Dropdown, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { Logger } from "@pnp/logging";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import * as React from "react";
import { stringIsNullOrEmpty, useToggle } from "../../../library";
import { IRequestedUserInput, ITriggerConfig, SupportedInputTypes } from "../../../models";
import styles from "../styles/UserInputForm.module.scss";

export interface IUserInputFormProps {
  selectedFlowTrigger: ITriggerConfig;
  onTriggerInvoke(flowConfig: ITriggerConfig, userInput: object): Promise<void>;
}
export const UserInputForm: React.FC<IUserInputFormProps> = (
  props
) => {

  const { selectedFlowTrigger, onTriggerInvoke } = props;
  const [formInput, setFormInput] = React.useState<Map<string, string>>(() => {
    const map: Map<string, string> = new Map<string, string>();
    selectedFlowTrigger.requestedUserInput.forEach((input: IRequestedUserInput) => {
      map.set(input.name, undefined);
    });
    return map;
  });
  const [formErrorMessages, setFormErrorMessages] = React.useState<Map<string, string>>(() => {
    const map: Map<string, string> = new Map<string, string>();
    selectedFlowTrigger.requestedUserInput.forEach((input: IRequestedUserInput) => {
      map.set(input.name, undefined);
    });
    return map;
  });
  const [formIsValid, toggleFormIsValid] = useToggle(false);
  const [formHasErrors, toggleFormHasErrors] = useToggle(false);

  const numberRegex: RegExp = new RegExp(/^\d+$/);;
  const emailRegex: RegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);


  const handleOnChangeInputFieldValue = (inputFieldName: string, event, newValue, newValueIsEmpty: boolean): void => {
    try {
      // Set input field error message
      if (!newValue && newValueIsEmpty && selectedFlowTrigger.requestedUserInput.find((input: IRequestedUserInput) => input.name === inputFieldName).required) {
        const newFormErrorMessages: Map<string, string> = formErrorMessages;
        newFormErrorMessages.set(inputFieldName, strings.UserInputErrorMessage);
        setFormErrorMessages(newFormErrorMessages);
      } else if (!newValue && !newValueIsEmpty) {
        const newFormErrorMessages: Map<string, string> = formErrorMessages;
        newFormErrorMessages.set(inputFieldName, strings.UserInputErrorMessage);
        setFormErrorMessages(newFormErrorMessages);
      } else {
        const newFormErrorMessages: Map<string, string> = formErrorMessages;
        newFormErrorMessages.set(inputFieldName, undefined);
        setFormErrorMessages(newFormErrorMessages);
      }

      // Set input field value
      const newUserInput: Map<string, string> = formInput;
      newUserInput.set(inputFieldName, newValue);
      setFormInput(newUserInput);

      // Set input fields validity
      const formInputIsValid: boolean = Array.from(formInput.keys()).every((key: string): boolean => {
        if (selectedFlowTrigger.requestedUserInput.filter(x => x.name === key)[0].required) {
          return formInput.get(key) !== undefined;
        }
        return true;
      });
      const formHasNoErrorMessages: boolean = Array.from(formErrorMessages.keys()).every((key: string): boolean => {
        return formErrorMessages.get(key) === undefined;
      });

      if (!formHasErrors && !formHasNoErrorMessages) toggleFormHasErrors();
      else if (formHasErrors && formHasNoErrorMessages) toggleFormHasErrors();

      if (formInputIsValid && formHasNoErrorMessages && !formIsValid) toggleFormIsValid();
      else if (!formInputIsValid && formIsValid) toggleFormIsValid();
      else if (!formHasNoErrorMessages && formIsValid) toggleFormIsValid();
    } catch (err) {
      Logger.error(err);
    }
  }

  const renderFormInputField = (formInputField: IRequestedUserInput): JSX.Element => {
    try {
      switch (formInputField.type) {
        case SupportedInputTypes.SingleLineText:
          return (
            <TextField
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              onChange={(event, newValue) => {
                const newInputValue: string = stringIsNullOrEmpty(newValue) ? undefined : newValue;
                handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(newValue));
              }}
              errorMessage={formErrorMessages.get(formInputField.name)}
              required={formInputField.required}
            />
          );
        case SupportedInputTypes.MultiLineText:
          return (
            <TextField
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              onChange={(event, newValue) => {
                const newInputValue: string | undefined = stringIsNullOrEmpty(newValue) ? undefined : newValue;
                handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(newValue));
              }}
              errorMessage={formErrorMessages.get(formInputField.name)}
              required={formInputField.required}
              multiline
              rows={3}
              autoAdjustHeight
            />
          );
        case SupportedInputTypes.Number:
          return (
            <TextField
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              onChange={(event, newValue) => {
                const newInputValue: number | undefined = stringIsNullOrEmpty(newValue) ? undefined
                  : !numberRegex.test(newValue) ? undefined : parseInt(newValue);
                handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(newValue));
              }}
              errorMessage={formErrorMessages.get(formInputField.name)}
              required={formInputField.required}
            />
          );
        case SupportedInputTypes.Email:
          return (
            <TextField
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              onChange={(event, newValue) => {
                const newInputValue: string | undefined = stringIsNullOrEmpty(newValue) ? undefined
                  : !emailRegex.test(newValue) ? undefined : newValue;
                handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(newValue));
              }}
              errorMessage={formErrorMessages.get(formInputField.name)}
              required={formInputField.required}
            />
          );
        case SupportedInputTypes.Choice:
          return (
            <Dropdown
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              options={formInputField.options}
              errorMessage={formErrorMessages.get(formInputField.name)}
              required={formInputField.required}
              onChange={(event, option, index) => {
                const newInputValue: string | undefined = stringIsNullOrEmpty(option.key.toString()) ? undefined : option.key.toString();
                handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(option.key.toString()));
              }}
            />
          );
        case SupportedInputTypes.Date:
          return (
            <DatePicker
              firstDayOfWeek={DayOfWeek.Monday}
              showWeekNumbers
              firstWeekOfYear={1}
              showMonthPickerAsOverlay
              placeholder={formInputField.placeholder}
              ariaLabel={formInputField.placeholder}
              label={formInputField.label}
              isRequired={formInputField.required}
              minDate={formInputField.minDate ? new Date(formInputField.minDate) : undefined}
              maxDate={formInputField.maxDate ? new Date(formInputField.maxDate) : undefined}
              // DatePicker uses English strings by default. For localized apps, you must override this prop.
              strings={defaultDatePickerStrings}
              onSelectDate={(date: Date | null | undefined) => {
                const newInputValue: string | undefined = date ? date.toLocaleDateString() : undefined;
                handleOnChangeInputFieldValue(formInputField.name, null, newInputValue, date === null || date === undefined);
              }}
            />
          );
        case SupportedInputTypes.PeoplePicker:
          return (<></>); // TODO: Add people picker
        default:
          return (<></>);
      }
    } catch (err) {
      Logger.error(err);
      return (<></>);
    }
  }

  const parseFormInput = (): object => {
    try {
      const formInputObject: object = {};
      formInput?.forEach((value, key) => {
        formInputObject[key] = value ? value : "";
      });

      return formInputObject;
    } catch (err) {
      Logger.error(err);
      return undefined;
    }
  }

  return (
    <Stack>
      <Stack tokens={{ childrenGap: 5 }}>
        {
          selectedFlowTrigger.requestedUserInput.map((formInputField: IRequestedUserInput) => {
            return renderFormInputField(formInputField);
          })
        }
      </Stack>
      <Stack>
        <PrimaryButton
          text={selectedFlowTrigger.title}
          className={styles.submitButton}
          disabled={!formIsValid}
          onClick={async (): Promise<void> => {
            await onTriggerInvoke(selectedFlowTrigger, parseFormInput());
          }}
        />
      </Stack>
    </Stack>
  );
};

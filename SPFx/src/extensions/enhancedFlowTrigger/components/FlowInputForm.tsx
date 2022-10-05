/* eslint-disable @microsoft/spfx/no-async-await */
import { ComboBox, DatePicker, DayOfWeek, defaultDatePickerStrings, Dropdown, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { Logger } from "@pnp/logging";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import * as strings from "EnhancedFlowTriggerCommandSetStrings";
import * as React from "react";
import { stringIsNullOrEmpty, useToggle } from "../../../library";
import { IFlowResponse, IRequestedUserInput, ITriggerConfig, SupportedInputTypes } from "../../../models";
import { IFlowService } from "../../../services";
import styles from "../styles/FormInputForm.module.scss";

export interface IFlowInputFormProps {
  selectedFlowTrigger: ITriggerConfig;
  flowService: IFlowService;
  selectedItems: readonly RowAccessor[];
  setFlowResponse(flowResponse: IFlowResponse): void;
  toggleIsWaitingForResponse(): void;
  context: ListViewCommandSetContext;
  reValidateInputForm: boolean;
  toggleReValidateInputForm(): void;
}
export const FlowInputForm: React.FC<IFlowInputFormProps> = (
  props
) => {

  const { selectedFlowTrigger, flowService, selectedItems,
    setFlowResponse, toggleIsWaitingForResponse, context,
    reValidateInputForm, toggleReValidateInputForm } = props;

  /**
   * Initializes a dynamic mapping object of all requested user input fields
   */
  const initializeFormInput = (): Map<string, string> | undefined => {
    try {
      const map: Map<string, string> = new Map<string, string>();
      selectedFlowTrigger?.requestedUserInput?.forEach((input: IRequestedUserInput) => {
        map.set(input.name, undefined);
      });
      return map;
    } catch (err) {
      Logger.error(err);
      return undefined;
    }
  }

  const [formHasErrors, toggleFormHasErrors] = useToggle(false);
  const [formInput, setFormInput] = React.useState<Map<string, string>>(initializeFormInput());
  const [inputErrorMessages, setInputErrorMessages] = React.useState<Map<string, string>>(initializeFormInput());

  /**
   * Validates the flow input form field values
   */
  const validateForm = (): boolean => {
    try {
      if (!formInput) return false;
      if (formInput.size === 0) return true;

      const formInputIsValid: boolean = Array.from(formInput.keys()).every((key: string): boolean => {
        if (selectedFlowTrigger.requestedUserInput.filter(x => x.name === key)[0].required) {
          return formInput.get(key) !== undefined;
        }
        return true;
      });
      const formHasNoErrorMessages: boolean = Array.from(inputErrorMessages.keys()).every((key: string): boolean => {
        return inputErrorMessages.get(key) === undefined;
      });

      if (!formHasErrors && !formHasNoErrorMessages) toggleFormHasErrors();
      else if (formHasErrors && formHasNoErrorMessages) toggleFormHasErrors();

      if (formInputIsValid && formHasNoErrorMessages) return true;
      else return false;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  const [formIsValid, toggleFormIsValid] = useToggle(false);

  /**
   * Resets the component upon selected flow trigger change
   */
  React.useEffect(() => {
    setFormInput(initializeFormInput());
    setInputErrorMessages(initializeFormInput());
    if (formHasErrors) toggleFormHasErrors();
    if (formIsValid) toggleFormIsValid();
    toggleReValidateInputForm();
  }, [selectedFlowTrigger]);

  /**
   * Revalidates the entire form upon revalidation request
   */
  React.useEffect(() => {
    const formValidationResult: boolean = validateForm();
    if (formIsValid && !formValidationResult) toggleFormIsValid();
    else if (!formIsValid && formValidationResult) toggleFormIsValid();
  },
    // Changes within an array or map won't trigger a re-render.
    // Therefore, we need to use a separate state variable to trigger a re-render.
    [reValidateInputForm]);

  const numberRegex: RegExp = new RegExp(/^\d+$/);;
  const emailRegex: RegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  /**
  * Generic function that handles the value change of a form input field and revalidates the form input validity.
  * @param inputFieldName The name of the input field with a changed value.
  * @param event The input field change event.
  * @param newValue The new value of the input field after the change.
  * @param newValueIsEmpty Whether the new value of the input field is empty.
  */
  const handleOnChangeInputFieldValue = (inputFieldName: string, event, newValue, newValueIsEmpty: boolean): void => {
    try {
      // Set input field error message
      if (!newValue && newValueIsEmpty && selectedFlowTrigger.requestedUserInput.find((input: IRequestedUserInput) => input.name === inputFieldName).required) {
        const newinputErrorMessages: Map<string, string> = inputErrorMessages;
        newinputErrorMessages.set(inputFieldName, strings.FormInputErrorMessage);
        setInputErrorMessages(newinputErrorMessages);
      } else if (!newValue && !newValueIsEmpty) {
        const newinputErrorMessages: Map<string, string> = inputErrorMessages;
        newinputErrorMessages.set(inputFieldName, strings.FormInputErrorMessage);
        setInputErrorMessages(newinputErrorMessages);
      } else {
        const newinputErrorMessages: Map<string, string> = inputErrorMessages;
        newinputErrorMessages.set(inputFieldName, undefined);
        setInputErrorMessages(newinputErrorMessages);
      }

      // Set input field value
      const newUserInput: Map<string, string> = formInput;
      newUserInput.set(inputFieldName, newValue);
      setFormInput(newUserInput);
      // Trigger re-render
      toggleReValidateInputForm();
    } catch (err) {
      Logger.error(err);
    }
  }

  /**
  * Invokes the flow of the selected trigger button and handles its response
  *
  * @param formInput Object with key-value mapping of the flow form input
  */
  const onFlowInvoke = async (formInput: object): Promise<void> => {
    try {
      toggleIsWaitingForResponse();

      await flowService.invokeFlow(context, selectedFlowTrigger, selectedItems, formInput)
        .then((response: IFlowResponse): void => {
          setFlowResponse(response);
          toggleIsWaitingForResponse();
        });
    } catch (err) {
      Logger.error(err);
      setFlowResponse({ statusCode: 500, message: strings.InternalServerErrorMessage });
      toggleIsWaitingForResponse();
    }
  };

  /**
  * Renders a form input field.
  * @param formInputField The requested user input object to generate a form input field for.
  */
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
              errorMessage={inputErrorMessages.get(formInputField.name)}
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
              errorMessage={inputErrorMessages.get(formInputField.name)}
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
              errorMessage={inputErrorMessages.get(formInputField.name)}
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
              errorMessage={inputErrorMessages.get(formInputField.name)}
              required={formInputField.required}
            />
          );
        case SupportedInputTypes.Dropdown:
        case SupportedInputTypes.Lookup:
        case SupportedInputTypes.MultiLookup:
          return (
            <Dropdown
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              options={formInputField.options}
              multiSelect={formInputField.multiSelect}
              errorMessage={inputErrorMessages.get(formInputField.name)}
              required={formInputField.required}
              onChange={(event, option, index) => {
                let newInputValue: string | undefined = stringIsNullOrEmpty(option?.key.toString()) ? undefined : option.key.toString();

                if (formInputField.multiSelect) {

                  if (newInputValue && option.selected) {
                    const currentInputValue: string | undefined = formInput.get(formInputField.name);
                    if (currentInputValue) {
                      newInputValue = `${currentInputValue},${newInputValue}`;
                    }
                  } else if (newInputValue && !option.selected) {
                    const currentInputValue: string | undefined = formInput.get(formInputField.name);
                    if (currentInputValue) {
                      newInputValue = currentInputValue.replace(`,${newInputValue}`, "").replace(newInputValue, "");
                    }
                  }
                  handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(option?.key.toString()));
                } else handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(option.key.toString()));
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
          // Known issue with PnP PeoplePicker 3.10.0: https://github.com/pnp/sp-dev-fx-controls-react/issues/1292
          return (
            <PeoplePicker
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              context={context as any}
              titleText={formInputField.label}
              personSelectionLimit={formInputField.selectionLimit}
              groupName={formInputField.groupName ? formInputField.groupName : ""} // Leave this blank in case you want to filter from all users
              showtooltip={false}
              allowUnvalidated={true}
              required={formInputField.required}
              disabled={false}
              errorMessage={inputErrorMessages.get(formInputField.name)}
              onChange={(selectedPersons: unknown[]) => {
                const newInputValue: unknown[] | undefined = selectedPersons && selectedPersons.length > 0 ? selectedPersons : undefined;
                handleOnChangeInputFieldValue(formInputField.name, null, newInputValue, selectedPersons && selectedPersons.length > 0);
              }}
              showHiddenInUI={false}
              placeholder={formInputField.placeholder}
              principalTypes={[PrincipalType.User]}
              resolveDelay={1000} />
          );
        case SupportedInputTypes.ComboBox:
          return (
            <ComboBox
              label={formInputField.label}
              placeholder={formInputField.placeholder}
              options={formInputField.options}
              multiSelect={formInputField.multiSelect}
              errorMessage={inputErrorMessages.get(formInputField.name)}
              required={formInputField.required}
              onChange={(event, option?, index?, value?): void => {
                let newInputValue: string | undefined = stringIsNullOrEmpty(option?.key.toString()) ? undefined : option.key.toString();

                if (formInputField.multiSelect) {

                  if (newInputValue && option.selected) {
                    const currentInputValue: string | undefined = formInput.get(formInputField.name);
                    if (currentInputValue) {
                      newInputValue = `${currentInputValue},${newInputValue}`;
                    }
                  } else if (newInputValue && !option.selected) {
                    const currentInputValue: string | undefined = formInput.get(formInputField.name);
                    if (currentInputValue) {
                      newInputValue = currentInputValue.replace(`,${newInputValue}`, "").replace(newInputValue, "");
                    }
                  }
                  handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(option?.key.toString()));
                } else handleOnChangeInputFieldValue(formInputField.name, event, newInputValue, stringIsNullOrEmpty(option.key.toString()));
              }}
            />
          );
        default:
          return (<></>);
      }
    } catch (err) {
      Logger.error(err);
      return (<></>);
    }
  }

  /**
 * Parses the form input object state from a Map to a JSON object.
 */
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
    <div>
      {
        selectedFlowTrigger?.requestedUserInput && selectedFlowTrigger?.requestedUserInput?.length > 0 && (
          <hr />
        )
      }
      <Stack tokens={{ childrenGap: 5 }}>
        {
          selectedFlowTrigger?.requestedUserInput?.map((formInputField: IRequestedUserInput) => {
            return renderFormInputField(formInputField);
          })
        }
      </Stack>
      <Stack>
        <PrimaryButton
          text={strings.StartFlowButtonText}
          className={styles.submitButton}
          disabled={!formIsValid}
          onClick={async (): Promise<void> => await onFlowInvoke(parseFormInput())}
        />
      </Stack>
    </div>
  );
};

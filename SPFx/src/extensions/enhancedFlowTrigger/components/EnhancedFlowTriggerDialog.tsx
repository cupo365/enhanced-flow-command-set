/* eslint-disable @microsoft/spfx/no-async-await */
import { Dialog, DialogFooter, DialogType, Dropdown, IDialogContentProps, IDropdownOption, IModalProps, PrimaryButton, Spinner, SpinnerSize, Stack } from "@fluentui/react";
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import * as strings from "EnhancedFlowTriggerCommandSetStrings";
import * as React from "react";
import { FlowInputForm } from ".";
import { stringIsNullOrEmpty, useToggle, validateVisibility } from "../../../library";
import { IFlowResponse, ITriggerConfig } from "../../../models";
import { IFlowService } from "../../../services";
import styles from "../styles/EnhancedFlowTriggerDialog.module.scss";

export interface IEnhancedFlowTriggerDialogProps {
  flowService: IFlowService;
  selectedItems: readonly RowAccessor[];
  triggerConfigs: ITriggerConfig[];
  currentListId: string | undefined;
  context: ListViewCommandSetContext;
}

export const EnhancedFlowTriggerDialog: React.FC<IEnhancedFlowTriggerDialogProps> = (
  props
) => {
  const { flowService, selectedItems, triggerConfigs, currentListId, context } = props;
  const [isClosedState, toggleIsClosedState] = useToggle(false);
  const [flowResponse, setFlowResponse] = React.useState<IFlowResponse>(undefined);
  const [isWaitingForResponse, toggleIsWaitingForResponse] = useToggle(false);
  const [showFlowInputForm, toggleShowFlowInputForm] = useToggle(false);
  const [selectedFlowTrigger, setSelectedFlowTrigger] = React.useState<ITriggerConfig>(undefined);
  const [reValidateInputForm, toggleReValidateInputForm] = useToggle(false);

  const dialogContentProps: IDialogContentProps = {
    type: DialogType.normal,
    showCloseButton: !isWaitingForResponse,
    title: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogHeader
      : flowResponse === undefined
        ? strings.DefaultDialogHeader
        : flowResponse && flowResponse?.statusCode?.toString().indexOf("20") > -1
          ? strings.SuccessDialogHeader
          : strings.FailedDialogHeader,
    subText: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogSubText
      : !flowResponse
        ? strings.DefaultDialogSubtext
        : flowResponse && flowResponse?.statusCode === 202
          ? strings.InvokedDialogSubText + " " + strings.CloseDialogUserInstruction
          : flowResponse && flowResponse?.statusCode?.toString().indexOf("20") > -1
            ? !stringIsNullOrEmpty(flowResponse?.message)
              ? strings.SuccessDialogSubTextWithMessage.replace(
                "$message",
                flowResponse?.message
              ) +
              " " +
              strings.CloseDialogUserInstruction
              : strings.SuccessDialogSubTextWithoutMessage +
              " " +
              strings.CloseDialogUserInstruction
            : !stringIsNullOrEmpty(flowResponse?.message)
              ? strings.FailedDialogSubTextWithMessage.replace(
                "$message",
                flowResponse?.message
              ) +
              " " +
              strings.CloseDialogUserInstruction
              : strings.FailedDialogSubTextWithoutMessage +
              " " +
              strings.CloseDialogUserInstruction,
  };

  const modalProps: IModalProps = {
    isBlocking: true,
    styles: styles,
    dragOptions: null,
  };

  /**
   * Closes the dialog and resets the state
   */
  const onCloseDialog = (): void => {
    toggleIsClosedState();
    setTimeout((): void => {
      // Prevent showing the user the state change while still in dialog closing transition
      setFlowResponse(undefined);
      setSelectedFlowTrigger(undefined);
      if (showFlowInputForm) toggleShowFlowInputForm();
      if (isWaitingForResponse) toggleIsWaitingForResponse();
    }, 500);
  };

  /**
   * Renders the children of the dialog footer
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderDialogFooterChildren = () => {
    return (
      <PrimaryButton
        onClick={() => onCloseDialog()}
        text={strings.CloseDialogButtonText}
      />
    );
  };

  /**
   * Creates dropdown options from the trigger configurations
   */
  const createDropdownWorkflowOptions = (): IDropdownOption[] => {
    return triggerConfigs.map((triggerConfig: ITriggerConfig): IDropdownOption => {
      if (validateVisibility(triggerConfig.fileExtensionBlacklist, triggerConfig.contentTypeBlacklist, triggerConfig.listWhitelist,
        triggerConfig.folderWhitelist, triggerConfig.selectionLimit, selectedItems, currentListId)) {
        return {
          key: triggerConfig.title,
          text: triggerConfig.title,
        };
      }
    }).filter(option => option !== undefined);
  }

  /**
   * Renders the children of the dialog
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderDialogChildren = () => {
    return (
      <Stack>
        {
          flowResponse === undefined && !isWaitingForResponse && (
            <Stack tokens={{ childrenGap: 5 }}>
              <Dropdown
                label={strings.SelectFlowDropdownLabel}
                placeholder={strings.SelectFlowDropdownPlaceholder}
                options={createDropdownWorkflowOptions()}
                required={true}
                onChange={(event, option, index) => {
                  const selectedFlowTriggerOption: ITriggerConfig = triggerConfigs.find((triggerConfig: ITriggerConfig) => triggerConfig.title === option.key.toString());
                  setSelectedFlowTrigger(selectedFlowTriggerOption);

                  if (selectedFlowTriggerOption && !showFlowInputForm) {
                    toggleShowFlowInputForm();
                  } else if (!selectedFlowTriggerOption && showFlowInputForm) {
                    toggleShowFlowInputForm();
                  }
                }}
              />
              {
                selectedFlowTrigger &&
                <FlowInputForm
                  selectedFlowTrigger={selectedFlowTrigger}
                  flowService={flowService}
                  selectedItems={selectedItems}
                  setFlowResponse={setFlowResponse}
                  toggleIsWaitingForResponse={toggleIsWaitingForResponse}
                  context={context}
                  reValidateInputForm={reValidateInputForm}
                  toggleReValidateInputForm={toggleReValidateInputForm}
                />
              }
            </Stack>
          )
        }

        {
          isWaitingForResponse &&
          <Spinner
            label={strings.WaitingForFlowResponseSpinnerText}
            size={SpinnerSize.large}
          />
        }

        {
          flowResponse !== undefined && !isWaitingForResponse &&
          <DialogFooter children={renderDialogFooterChildren()} />
        }
      </Stack>
    );
  };

  return (
    <Dialog
      hidden={isClosedState}
      onDismiss={() => onCloseDialog()}
      maxWidth={800}
      minWidth={360}
      dialogContentProps={dialogContentProps}
      modalProps={modalProps}
      children={renderDialogChildren()}
    />
  );
};

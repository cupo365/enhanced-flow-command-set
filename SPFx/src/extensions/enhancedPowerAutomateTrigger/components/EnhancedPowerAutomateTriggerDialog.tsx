/* eslint-disable @microsoft/spfx/no-async-await */
import { Dialog, DialogFooter, DialogType, IDialogContentProps, IModalProps, PrimaryButton, Spinner, SpinnerSize, Stack } from "@fluentui/react";
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import * as React from "react";
import { FlowButton, UserInputForm } from ".";
import { stringIsNullOrEmpty, useToggle, validateVisibility } from "../../../library";
import { IFlowResponse, ITriggerConfig } from "../../../models";
import { IFlowService } from "../../../services";
import styles from "../styles/EnhancedPowerAutomateTriggerDialog.module.scss";

export interface IEnhancedPowerAutomateTriggerDialogProps {
  flowService: IFlowService;
  selectedItems: readonly RowAccessor[];
  triggerConfigs: ITriggerConfig[];
  currentListId: string | undefined;
  context: ListViewCommandSetContext;
}

export const EnhancedPowerAutomateTriggerDialog: React.FC<IEnhancedPowerAutomateTriggerDialogProps> = (
  props
) => {
  const { flowService, selectedItems, triggerConfigs, currentListId, context } = props;
  const [isClosedState, toggleIsClosedState] = useToggle(false);
  const [flowResponse, setFlowResponse] = React.useState<IFlowResponse>(undefined);
  const [isWaitingForResponse, toggleIsWaitingForResponse] = useToggle(false);
  const [showUserInput, toggleShowUserInput] = useToggle(false);
  const [selectedFlowTrigger, setSelectedFlowTrigger] = React.useState<ITriggerConfig>(undefined);

  const dialogContentProps: IDialogContentProps = {
    type: DialogType.normal,
    showCloseButton: !isWaitingForResponse,
    title: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogHeader
      : showUserInput
        ? strings.UserInputDialogHeader
        : flowResponse === undefined
          ? strings.SelectFlowDialogHeader
          : flowResponse && flowResponse?.statusCode?.toString().indexOf("20") > -1
            ? strings.SuccessDialogHeader
            : strings.FailedDialogHeader,
    subText: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogSubText
      : showUserInput
        ? strings.UserInputDialogSubText
        : !flowResponse
          ? strings.SelectFlowDialogSubText
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
  * Invokes the flow of the selected trigger button and handles its response
  *
  * @param flowConfig The selected flow to invoke
  */
  const onTriggerInvoke = async (flowConfig: ITriggerConfig): Promise<void> => {
    if (showUserInput) toggleShowUserInput();
    toggleIsWaitingForResponse();
    await flowService.invokeFlow(context, flowConfig, selectedItems)
      .then((response: IFlowResponse): void => {
        setFlowResponse(response);
        toggleIsWaitingForResponse();
      });
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
      if (showUserInput) toggleShowUserInput();
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
   * Renders the children of the dialog
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderDialogChildren = () => {
    return (
      <Stack>
        <Stack tokens={{ childrenGap: 15 }}>
          {
            flowResponse === undefined && !showUserInput && !isWaitingForResponse &&
            triggerConfigs.map((triggerConfig: ITriggerConfig) => {
              if (validateVisibility(triggerConfig.fileExtensionBlacklist, triggerConfig.contentTypeBlacklist, triggerConfig.listWhitelist,
                triggerConfig.folderWhitelist, triggerConfig.selectionLimit, selectedItems, currentListId)) {
                return (
                  <FlowButton
                    triggerConfig={triggerConfig}
                    onTriggerInvoke={onTriggerInvoke}
                    toggleShowUserInput={toggleShowUserInput}
                    setSelectedFlowTrigger={setSelectedFlowTrigger}
                  />
                )
              }
            })
          }

          {
            isWaitingForResponse &&
            <Spinner
              label={strings.WaitingForFlowResponseSpinnerText}
              size={SpinnerSize.large}
            />
          }

          {
            showUserInput &&
            <UserInputForm
              selectedFlowTrigger={selectedFlowTrigger}
              onTriggerInvoke={onTriggerInvoke}
            />
          }

        </Stack>

        {
          flowResponse !== undefined && !showUserInput && !isWaitingForResponse &&
          <Stack className="ms-Grid-row">
            <DialogFooter children={renderDialogFooterChildren()} />
          </Stack>
        }
      </Stack>
    );
  };

  return (
    <Dialog
      hidden={isClosedState}
      onDismiss={() => onCloseDialog()}
      maxWidth={800}
      minWidth={300}
      dialogContentProps={dialogContentProps}
      modalProps={modalProps}
      children={renderDialogChildren()}
    />
  );
};

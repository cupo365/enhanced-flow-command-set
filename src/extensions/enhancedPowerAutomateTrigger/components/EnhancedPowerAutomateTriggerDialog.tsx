import { Dialog, DialogFooter, DialogType, PrimaryButton, Spinner, SpinnerSize } from "@fluentui/react";
import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { stringIsNullOrEmpty } from "@pnp/pnpjs";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import * as React from "react";
import { FlowButton, useToggle } from ".";
import { IFlowConfig, IFlowResponse } from "../../../models";
import { IFlowService } from "../../../services";
import styles from "../styles/EnhancedPowerAutomateTriggerDialog.module.scss";

export interface IEnhancedPowerAutomateTriggerDialogProps {
  flowService: IFlowService;
  selectedItems: readonly RowAccessor[];
  flowConfigs: IFlowConfig[];
  context: ListViewCommandSetContext;
}

export const EnhancedPowerAutomateTriggerDialog: React.FC<IEnhancedPowerAutomateTriggerDialogProps> = (
  props
) => {
  const { flowService, selectedItems, flowConfigs, context } = props;
  const [isClosedState, toggleIsClosedState] = useToggle(false);
  const [flowResponse, setFlowResponse] = React.useState<IFlowResponse>(undefined);
  const [isWaitingForResponse, toggleIsWaitingForResponse] = useToggle(false);

  const dialogContentProps = {
    type: DialogType.normal,
    showCloseButton: !isWaitingForResponse,
    title: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogHeader
      : flowResponse === undefined
        ? strings.SelectFlowDialogHeader
        : flowResponse && flowResponse?.statusCode?.toString().indexOf("20") > -1
          ? strings.SuccessDialogHeader
          : strings.FailedDialogHeader,
    subText: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogSubText
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

  const modalProps = {
    isBlocking: true,
    styles: styles,
    dragOptions: null,
  };

  const onFlowInvoke = async (flowConfig: IFlowConfig): Promise<void> => {
    toggleIsWaitingForResponse();
    await flowService.invokeFlow(context, flowConfig, selectedItems)
      .then((response: IFlowResponse): void => {
        setFlowResponse(response);
        toggleIsWaitingForResponse();
      });
  };

  const onCloseDialog = () => {
    toggleIsClosedState();
    setTimeout(() =>
      // Prevent showing the user the state change while still in dialog closing transition
      setFlowResponse(undefined)
      , 500);
  };

  const renderDialogFooterChildren = () => {
    return (
      <PrimaryButton
        onClick={() => onCloseDialog()}
        text={strings.CloseDialogButtonText}
      />
    );
  };

  const renderDialogChildren = () => {
    return (
      <div className="ms-Grid" dir="ltr">
        {
          flowResponse === undefined && !isWaitingForResponse &&
          <div className="ms-Grid-row">
            {
              flowConfigs.map((flowConfig: IFlowConfig) => (
                <FlowButton
                  flowConfig={flowConfig}
                  onFlowInvoke={onFlowInvoke}
                />
              ))
            }
          </div>
        }

        {
          flowResponse !== undefined && !isWaitingForResponse &&
          <div className="ms-Grid-row">
            <DialogFooter children={renderDialogFooterChildren()} />
          </div>
        }

        {
          isWaitingForResponse &&
          <div className="ms-Grid-row">
            <Spinner
              label={strings.WaitingForFlowResponseSpinnerText}
              size={SpinnerSize.large}
            />
          </div>
        }
      </div>
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

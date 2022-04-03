import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton } from "office-ui-fabric-react";
import styles from "./BlockingDialog.module.scss";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import { stringIsNullOrEmpty } from "@pnp/pnpjs";
import { IFlowConfig, IFlowResponse } from "../../../../models";
import {
  ListViewCommandSetContext,
  RowAccessor,
} from "@microsoft/sp-listview-extensibility";
import { IFlowService } from "../../../../services/FlowService";
import { Spinner, SpinnerSize } from "@fluentui/react";

export interface IBlockingDialogProps {
  refreshPage(): void;
  flowService: IFlowService;
  selectedItems: readonly RowAccessor[];
  flowConfigs: IFlowConfig[];
  context: ListViewCommandSetContext;
}

export const BlockingDialog: React.FunctionComponent<IBlockingDialogProps> = (
  props
) => {
  const [showResultDialog, setShowResultDialog] =
    React.useState<boolean>(false);
  const [flowResponse, setFlowResponse] =
    React.useState<IFlowResponse>(undefined);
  const [isWaitingForResponse, setIsWaitingForResponse] =
    React.useState<boolean>(false);

  const dialogContentProps = {
    type: DialogType.normal,
    title: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogHeader
      : !showResultDialog
      ? strings.SelectFlowDialogHeader
      : flowResponse && flowResponse?.statusCode?.toString().indexOf("20") > -1
      ? strings.SuccessDialogHeader
      : strings.FailedDialogHeader,
    subText: isWaitingForResponse
      ? strings.WaitingForFlowResponseDialogSubText
      : !showResultDialog
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
    setIsWaitingForResponse(true);
    await props.flowService
      .invokeFlow(props.context, flowConfig, props.selectedItems)
      .then((response: IFlowResponse) => {
        setFlowResponse(response);
        setShowResultDialog(true);
        setIsWaitingForResponse(false);
      });
  };

  return (
    <Dialog
      hidden={false}
      onDismiss={props.refreshPage}
      dialogContentProps={dialogContentProps}
      modalProps={modalProps}
    >
      {isWaitingForResponse ? (
        <Spinner
          label={strings.WaitingForFlowResponseSpinnerText}
          size={SpinnerSize.large}
        />
      ) : showResultDialog ? (
        <DialogFooter>
          <PrimaryButton
            onClick={props.refreshPage}
            text={strings.CloseDialogButtonText}
          />
        </DialogFooter>
      ) : (
        <>
          {props.flowConfigs.map((flowConfig: IFlowConfig) => (
            <PrimaryButton
              text={flowConfig.actionName}
              className={styles.flowButton}
              onClick={async () => {
                await onFlowInvoke(flowConfig);
              }}
            />
          ))}
        </>
      )}
    </Dialog>
  );
};

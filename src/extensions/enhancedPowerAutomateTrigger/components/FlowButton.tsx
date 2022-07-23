import { PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { IFlowConfig } from "../../../models";
import styles from "../styles/FlowButton.module.scss";

export interface IFlowButtonProps {
  flowConfig: IFlowConfig;
  onFlowInvoke(flowConfig: IFlowConfig): Promise<void>;
}
export const FlowButton: React.FC<IFlowButtonProps> = (
  props
) => {

  const { flowConfig, onFlowInvoke } = props;

  return (
    <div className="ms-Grid-row">
      <PrimaryButton
        text={flowConfig.actionName}
        className={styles.flowButton}
        onClick={async (): Promise<void> => {
          await onFlowInvoke(flowConfig);
        }}
      />
    </div>
  );
};

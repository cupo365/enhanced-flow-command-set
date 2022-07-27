/* eslint-disable @microsoft/spfx/no-async-await */
import { PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { ITriggerConfig } from "../../../models";
import styles from "../styles/FlowButton.module.scss";

export interface IFlowButtonProps {
  triggerConfig: ITriggerConfig;
  onTriggerInvoke(flowConfig: ITriggerConfig): Promise<void>;
}
export const FlowButton: React.FC<IFlowButtonProps> = (
  props
) => {

  const { triggerConfig, onTriggerInvoke } = props;

  return (
    <div className="ms-Grid-row">
      <PrimaryButton
        text={triggerConfig.title}
        className={styles.flowButton}
        onClick={async (): Promise<void> => {
          await onTriggerInvoke(triggerConfig);
        }}
      />
    </div>
  );
};

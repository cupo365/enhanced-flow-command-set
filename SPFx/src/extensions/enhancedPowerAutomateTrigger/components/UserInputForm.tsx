/* eslint-disable @microsoft/spfx/no-async-await */
import { PrimaryButton, Stack, TextField } from "@fluentui/react";
import * as React from "react";
import { useToggle } from "../../../library";
import { ITriggerConfig } from "../../../models";
import styles from "../styles/FlowButton.module.scss";

export interface IUserInputFormProps {
  selectedFlowTrigger: ITriggerConfig;
  onTriggerInvoke(flowConfig: ITriggerConfig): Promise<void>;
}
export const UserInputForm: React.FC<IUserInputFormProps> = (
  props
) => {

  const { selectedFlowTrigger, onTriggerInvoke } = props;
  const [userInputText, setUserInputText] = React.useState<string>(undefined);
  const [userInputIsValid, toggleUserInputIsValid] = useToggle(false);

  return (
    <Stack tokens={{ childrenGap: 30 }}>
      <Stack>
        {/* Insert your input fields here */}
        <TextField
          label="Input"
          placeholder="Enter your input"
          onChange={(event, newValue) => {
            setUserInputText(newValue);
            if (userInputText && !userInputIsValid) toggleUserInputIsValid();
          }}
        />
      </Stack>
      <Stack>
        <PrimaryButton
          text={selectedFlowTrigger.title}
          className={styles.flowButton}
          disabled={!userInputIsValid}
          onClick={async (): Promise<void> => {
            await onTriggerInvoke(selectedFlowTrigger);
          }}
        />
      </Stack>
    </Stack>
  );
};

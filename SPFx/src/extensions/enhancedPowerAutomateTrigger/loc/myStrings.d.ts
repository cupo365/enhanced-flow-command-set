declare interface IEnhancedPowerAutomateTriggerCommandSetStrings {
  TriggerFlowCommandText: string;
  SuccessDialogHeader: string;
  FailedDialogHeader: string;
  SuccessDialogSubTextWithMessage: string;
  SuccessDialogSubTextWithoutMessage: string;
  FailedDialogSubTextWithMessage: string;
  FailedDialogSubTextWithoutMessage: string;
  CloseDialogButtonText: string;
  SelectFlowDialogHeader: string;
  SelectFlowDialogSubText: string;
  InvokedDialogSubText: string;
  CloseDialogUserInstruction: string;
  WaitingForFlowResponseSpinnerText: string;
  WaitingForFlowResponseDialogSubText: string;
  WaitingForFlowResponseDialogHeader: string;
  UserInputDialogHeader: string;
  UserInputDialogSubText: string;
}

declare module 'EnhancedPowerAutomateTriggerCommandSetStrings' {
  const strings: IEnhancedPowerAutomateTriggerCommandSetStrings;
  export = strings;
}

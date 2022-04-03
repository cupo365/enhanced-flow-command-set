declare interface IEnhancedPowerAutomateTriggerCommandSetStrings {
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
}

declare module 'EnhancedPowerAutomateTriggerCommandSetStrings' {
  const strings: IEnhancedPowerAutomateTriggerCommandSetStrings;
  export = strings;
}

declare interface IEnhancedFlowTriggerCommandSetStrings {
  TriggerFlowCommandText: string;
  SuccessDialogHeader: string;
  FailedDialogHeader: string;
  SuccessDialogSubTextWithMessage: string;
  SuccessDialogSubTextWithoutMessage: string;
  FailedDialogSubTextWithMessage: string;
  FailedDialogSubTextWithoutMessage: string;
  CloseDialogButtonText: string;
  SelectFlowDropdownLabel: string;
  SelectFlowDropdownPlaceholder: string;
  DefaultDialogHeader: string;
  DefaultDialogSubtext: string;
  InvokedDialogSubText: string;
  CloseDialogUserInstruction: string;
  WaitingForFlowResponseSpinnerText: string;
  WaitingForFlowResponseDialogSubText: string;
  WaitingForFlowResponseDialogHeader: string;
  FormInputErrorMessage: string;
  StartFlowButtonText: string;
  InternalServerErrorMessage: string;
}

declare module 'EnhancedFlowTriggerCommandSetStrings' {
  const strings: IEnhancedFlowTriggerCommandSetStrings;
  export = strings;
}

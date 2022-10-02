define([], function () {
  return {
    TriggerFlowCommandText: "Trigger flow",
    SuccessDialogHeader: "Success!",
    FailedDialogHeader: "Oops...",
    SuccessDialogSubTextWithMessage:
      "The workflow was successfully started and returned the following message: '$message'.",
    SuccessDialogSubTextWithoutMessage:
      "The workflow was successfully started.",
    FailedDialogSubTextWithMessage:
      "The workflow was started, but then failed and returned the following message: '$message'. Please try again.",
    FailedDialogSubTextWithoutMessage:
      "The workflow was started, but then failed. Please try again.",
    CloseDialogButtonText: "Close",
    SelectFlowDialogHeader: "Select a workflow",
    SelectFlowDialogSubText:
      "Please select which workflow you would like to start for your selected item(s):",
    InvokedDialogSubText:
      "The selected workflow has been successfully started. It will run in the background.",
    CloseDialogUserInstruction: "You may close this dialog now.",
    WaitingForFlowResponseSpinnerText: "Awaiting workflow response...",
    WaitingForFlowResponseDialogSubText:
      "The workflow is being started, this could take a coulpe of seconds. Please be patient and do not navigate away.",
    WaitingForFlowResponseDialogHeader: "Starting the workflow",
    UserInputDialogHeader: "More information required",
    UserInputDialogSubText:
      "The selected workflow requires more information before it can be started.",
    UserInputErrorMessage: "Input is invalid",
  };
});

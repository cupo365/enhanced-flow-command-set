import { override } from "@microsoft/decorators";
import {
  BaseListViewCommandSet,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
  Command,
} from "@microsoft/sp-listview-extensibility";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { sp } from "@pnp/sp";
import Dependencies, { inject } from "../../di/DependenciesManager";
import SPOService, { ISPOService } from "../../services/SPOService";

import { IFlowConfig } from "../../models";
import FlowService, { FlowServiceKey, IFlowService } from "../../services/FlowService";
import { BlockingDialog } from "./components/BlockingDialog/BlockingDialog";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IEnhancedPowerAutomateTriggerCommandSetProps {
  configListTitle: string;
}

export default class EnhancedPowerAutomateTriggerCommandSet extends BaseListViewCommandSet<IEnhancedPowerAutomateTriggerCommandSetProps> {
  private _flowConfigs: IFlowConfig[];
  private _dialogPlaceHolder: HTMLDivElement = null;
  private _spoService: ISPOService;

  @inject(FlowServiceKey) private _flowService: IFlowService;

  @override
  public onInit(): Promise<void> {
    try {
      console.log("EnhancedPowerAutomateTriggerCommandSet -> Initializing...");

      super.onInit();
      sp.setup({
        sp: {
          headers: {
            Accept: "application/json;odata=nometadata",
          },
        },
        spfxContext: this.context,
      });

      this._spoService = new SPOService();

      this._spoService.getFlowConfig(this.context.pageContext.legacyPageContext?.portalUrl, this.properties.configListTitle)
        .then((flowConfigs: IFlowConfig[]) => {
          this._flowConfigs = flowConfigs;

          const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
          if (triggerFlowCommand) {
            triggerFlowCommand.visible = false;
          }

          if (!flowConfigs) {
            throw new Error("Flow configuration is invalid.");
          }

          // Create the container for our React component
          let dialogDiv = document.createElement("div");
          dialogDiv.setAttribute('id', 'flowResultDialogContainer');
          this._dialogPlaceHolder = document.body.appendChild(dialogDiv);

          Dependencies.configure(
            this.context.serviceScope,
            (rootServiceScope_2) => {
              return new Promise((resolve, reject) => {
                let usedScope = rootServiceScope_2;
                let childScope = rootServiceScope_2.startNewChild();
                childScope.createAndProvide(FlowServiceKey, FlowService);
                childScope.finish();
                usedScope = childScope;
                usedScope.whenFinished(() => {
                  resolve(usedScope);
                });
              });
            }
          );

          console.log(`EnhancedPowerAutomateTriggerCommandSet -> Initialized! Listening to config list: ${this.properties.configListTitle}`);
        });

      return Promise.resolve();
    } catch (ex) {
      console.log("EnhancedPowerAutomateTriggerCommandSet -> Error while initializing");
      return Promise.resolve();
    }
  }

  @override
  public async onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): Promise<void> {
    try {
      let showButton: boolean = this._flowConfigs && event?.selectedRows?.length >= 1;

      const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
      if (triggerFlowCommand) {
        triggerFlowCommand.visible = showButton;
      }
    } catch (ex) {
      console.log("EnhancedPowerAutomateTriggerCommandSet -> Error on listview update.");
    }
  }

  @override
  public async onExecute(
    event: IListViewCommandSetExecuteEventParameters
  ): Promise<void> {
    try {
      if (this._flowConfigs && event.selectedRows.length > 0) {
        let blockingDialog = React.createElement(BlockingDialog, {
          refreshPage: this.refreshPage,
          flowService: this._flowService,
          selectedItems: event.selectedRows,
          flowConfigs: this._flowConfigs,
          context: this.context
        });
        ReactDOM.render(blockingDialog, this._dialogPlaceHolder);
      }
    } catch (ex) {
      console.log("EnhancedPowerAutomateTriggerCommandSet -> Error on execute.");
    }
  }

  private refreshPage(): void {
    // The dialog is being rendered on its own, despite clearly stating in the ReactDOM.render
    // it should be rendered in the dialog placeholder container.
    // To allow the user to still close the dialog and reuse the extension while not having left the page,
    // the page is refreshed.
    window.location.reload();
  }
}

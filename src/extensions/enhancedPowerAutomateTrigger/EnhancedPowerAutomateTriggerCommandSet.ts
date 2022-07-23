import { override } from "@microsoft/decorators";
import { Log, ServiceScope } from "@microsoft/sp-core-library";
import { BaseListViewCommandSet, Command, IListViewCommandSetExecuteEventParameters, IListViewCommandSetListViewUpdatedParameters } from "@microsoft/sp-listview-extensibility";
import { sp } from "@pnp/sp";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { v4 } from "uuid";
import Dependencies, { inject } from "../../di/DependenciesManager";
import { IFlowConfig } from "../../models";
import { FlowService, FlowServiceKey, IFlowService, ISPOService, SPOService } from "../../services";
import { EnhancedPowerAutomateTriggerDialog } from "./components";

export interface IEnhancedPowerAutomateTriggerCommandSetProps {
  configListTitle: string;
}

const LOG_SOURCE: string = 'EnhancedPowerAutomateTriggerCommandSet';
const CONTENT_TYPE_BLACKLIST: string[] = ["0x0120"];

export default class EnhancedPowerAutomateTriggerCommandSet extends BaseListViewCommandSet<IEnhancedPowerAutomateTriggerCommandSetProps> {
  private _flowConfigs: IFlowConfig[];
  private _dialogPlaceHolder: HTMLDivElement = null;
  private _spoService: ISPOService;
  @inject(FlowServiceKey) private _flowService: IFlowService;

  @override
  public onInit(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Initializing...");

      // Localize command text, since localization via the manifest doesn't appear to work
      const triggerFlowCommand: Command = this.tryGetCommand('TRIGGER_FLOW');
      triggerFlowCommand.title = strings.TriggerFlowCommandText;

      // Create the container for our React component
      let dialogDiv = document.createElement("div");
      dialogDiv.setAttribute('id', `${LOG_SOURCE}Container`);
      this._dialogPlaceHolder = document.body.appendChild(dialogDiv);

      sp.setup({
        sp: {
          headers: {
            Accept: "application/json;odata=nometadata",
          },
        },
        spfxContext: this.context,
      });

      this._spoService = new SPOService();

      this._spoService.getFlowConfig(this.context.pageContext.web?.absoluteUrl, this.properties.configListTitle)
        .then((flowConfigs: IFlowConfig[]): void => {
          if (!flowConfigs) {
            throw new Error("Flow configuration is invalid.");
          }

          this._flowConfigs = flowConfigs;

          Dependencies.configure(
            this.context.serviceScope,
            (rootServiceScope_2: ServiceScope): Promise<ServiceScope> => {
              return new Promise((resolve, reject): void => {
                let usedScope = rootServiceScope_2;
                let childScope = rootServiceScope_2.startNewChild();
                childScope.createAndProvide(FlowServiceKey, FlowService);
                childScope.finish();
                usedScope = childScope;
                usedScope.whenFinished((): void => {
                  resolve(usedScope);
                });
              });
            }
          );

          Log.info(LOG_SOURCE, "Initialized!");
          Log.verbose(LOG_SOURCE, `Listening to config list: ${this.properties.configListTitle}`);
        });

      return Promise.resolve();
    } catch (ex) {
      Log.error(LOG_SOURCE, ex);
      return Promise.reject(ex);
    }
  }

  @override
  public onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): void {
    try {
      let showButton: boolean = false;
      let selectedContainsBlacklistedItems: boolean[] = [];

      if (event.selectedRows.length > 0) {
        selectedContainsBlacklistedItems = event.selectedRows.map((selectedItem) => {
          return CONTENT_TYPE_BLACKLIST.map((blackListedContentType) => selectedItem.getValueByName("ContentTypeId").toLowerCase().startsWith(blackListedContentType.toLowerCase())).includes(true);
        });
      }

      showButton = this._flowConfigs && event.selectedRows.length >= 1 && !selectedContainsBlacklistedItems.includes(true);

      const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
      if (triggerFlowCommand) {
        triggerFlowCommand.visible = showButton;
      }
    } catch (ex) {
      Log.error(LOG_SOURCE, ex);
    }
  }

  @override
  public onExecute(
    event: IListViewCommandSetExecuteEventParameters
  ): void {
    try {
      switch (event.itemId) {
        case 'TRIGGER_FLOW':
          this.renderTriggerDialog(event);
          break;
        default:
          throw new Error('Unknown command');
      }
    } catch (ex) {
      Log.error(LOG_SOURCE, ex);
    }
  }

  private renderTriggerDialog(
    event: IListViewCommandSetExecuteEventParameters
  ): void {
    try {
      // Use a new id to create a new element every time it opens: otherwise state is maintained from previous dialog
      // This is probably not the correct way: state should be maintained, but every time the dialog opens the closed state should be reset.
      const newKey = v4();
      const dialog = React.createElement(EnhancedPowerAutomateTriggerDialog, {
        key: newKey,
        flowService: this._flowService,
        selectedItems: event.selectedRows,
        flowConfigs: this._flowConfigs,
        context: this.context
      });
      ReactDOM.render(dialog, this._dialogPlaceHolder);

    } catch (ex) {
      Log.error(LOG_SOURCE, ex);
    }
  }
}

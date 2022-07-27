import { Log, ServiceScope } from "@microsoft/sp-core-library";
import { BaseListViewCommandSet, Command, IListViewCommandSetExecuteEventParameters, ListViewStateChangedEventArgs } from "@microsoft/sp-listview-extensibility";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { v4 } from "uuid";
import Dependencies, { inject } from "../../di/DependenciesManager";
import { ITriggerConfig } from "../../models";
import { FlowService, FlowServiceKey, getSP, IFlowService, ISPOService, SPOService } from "../../services";
import { validateVisibility } from "../../util";
import { EnhancedPowerAutomateTriggerDialog, IEnhancedPowerAutomateTriggerDialogProps } from "./components";
import { LOG_SOURCE } from "./util";

export interface IEnhancedPowerAutomateTriggerCommandSetProps {
  configListTitle: string;
}

export default class EnhancedPowerAutomateTriggerCommandSet
  extends BaseListViewCommandSet<IEnhancedPowerAutomateTriggerCommandSetProps> {
  private _triggerConfigs: ITriggerConfig[];
  /*
  Class variables for command visibility by trigger configs extremes
  private _listWhitelist: string[] | undefined;
  private _folderWhitelist: string[] | undefined;
  private _contentTypeBlacklist: string[] | undefined;
  private _maxSelectionLimit: number;
  */
  private _dialogPlaceHolder: HTMLDivElement = null;
  private _currentListId: string | undefined;
  private _spoService: ISPOService;
  @inject(FlowServiceKey) private _flowService: IFlowService;

  public onInit(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Initializing...");

      // Localize command text, since localization via the manifest doesn't appear to work
      const triggerFlowCommand: Command = this.tryGetCommand('TRIGGER_FLOW');
      triggerFlowCommand.title = strings.TriggerFlowCommandText;
      triggerFlowCommand.visible = false; // hide command on init by default

      // Create the container for our React component
      const dialogDiv: HTMLDivElement = document.createElement("div");
      dialogDiv.setAttribute('id', `${LOG_SOURCE}Container`);
      this._dialogPlaceHolder = document.body.appendChild(dialogDiv);

      // Initialize sp context
      // See also: https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts
      getSP(this.context);

      this._spoService = new SPOService();
      this._spoService.getTriggerConfig(this.properties.configListTitle)
        .then((triggerConfigs: ITriggerConfig[]): void => {
          if (!triggerConfigs) {
            throw new Error("Trigger configuration is invalid.");
          }

          // Initialize class variables
          this._triggerConfigs = triggerConfigs;
          this._currentListId = this.context.pageContext.list.id.toString();
          /*
          Initialize class variables for command visibility by trigger configs extremes
          this._listWhitelist = triggerConfigs.some((a) => a.listWhitelist === null) ? undefined
            : [].concat.apply([], triggerConfigs.map((triggerConfig) => triggerConfig.listWhitelist).filter((a) => a !== null));
          this._folderWhitelist = triggerConfigs.some((a) => a.folderWhitelist === null) ? undefined
            : [].concat.apply([], triggerConfigs.map((triggerConfig) => triggerConfig.folderWhitelist).filter((a) => a !== null));
          this._contentTypeBlacklist = triggerConfigs.some((a) => a.contentTypeBlacklist === null) ? undefined
            : [].concat.apply([], triggerConfigs.map((triggerConfig) => triggerConfig.contentTypeBlacklist).filter((a) => a !== null));
          this._maxSelectionLimit = triggerConfigs.sort((a, b) =>
            a.selectionLimit > b.selectionLimit ? 1 : -1)[triggerConfigs.length - 1].selectionLimit;
          */

          // Provision dependency injection
          Dependencies.configure(
            this.context.serviceScope,
            (rootServiceScope2: ServiceScope): Promise<ServiceScope> => {
              return new Promise((resolve, reject): void => {
                let usedScope: ServiceScope = rootServiceScope2;
                const childScope: ServiceScope = rootServiceScope2.startNewChild();
                childScope.createAndProvide(FlowServiceKey, FlowService);
                childScope.finish();
                usedScope = childScope;
                usedScope.whenFinished((): void => {
                  resolve(usedScope);
                });
              });
            }
          ).catch((err) => {
            throw new Error(err);
          });

          // Add state change listener
          this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

          Log.info(LOG_SOURCE, "Initialized!");
          Log.verbose(LOG_SOURCE, `Listening to config list: ${this.properties.configListTitle}`);
        }).catch((err) => {
          throw new Error(err);
        });

      return Promise.resolve();
    } catch (err) {
      Log.error(LOG_SOURCE, err);
      return Promise.reject(err);
    }
  }

  public onExecute(
    event: IListViewCommandSetExecuteEventParameters
  ): void {
    try {
      switch (event.itemId) {
        case 'TRIGGER_FLOW':
          this._renderEnhancedPowerAutomateTriggerDialog(event);
          break;
        default:
          throw new Error('Unknown command');
      }
    } catch (err) {
      Log.error(LOG_SOURCE, err);
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    try {
      /*
       Validate command visibility by trigger configs extremes
       const showButton: boolean = validateVisibility(this._contentTypeBlacklist, this._listWhitelist,
        this._folderWhitelist, this._maxSelectionLimit, this.context.listView.selectedRows, this._currentListId);
      */

      // Validate the visibility of each trigger config. If one should be visible, show the command
      const showButton: boolean = this._triggerConfigs.map((triggerConfig: ITriggerConfig): boolean => {
        return validateVisibility(triggerConfig.fileExtensionBlacklist, triggerConfig.contentTypeBlacklist, triggerConfig.listWhitelist,
          triggerConfig.folderWhitelist, triggerConfig.selectionLimit, this.context.listView.selectedRows, this._currentListId);
      }).includes(true);

      const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
      if (triggerFlowCommand) {
        triggerFlowCommand.visible = showButton;
        this.raiseOnChange();
      }
    } catch (err) {
      Log.error(LOG_SOURCE, err);
    }
  }

  private _renderEnhancedPowerAutomateTriggerDialog(
    event: IListViewCommandSetExecuteEventParameters
  ): void {
    try {
      // Use a new id to create a new element every time it opens: otherwise state is maintained from previous dialog
      // This is probably not the correct way: state should be maintained, but every time the dialog opens the closed state should be reset.
      const newKey: string = v4();
      const dialog: React.FunctionComponentElement<IEnhancedPowerAutomateTriggerDialogProps> =
        React.createElement(EnhancedPowerAutomateTriggerDialog, {
          key: newKey,
          flowService: this._flowService,
          selectedItems: event.selectedRows,
          triggerConfigs: this._triggerConfigs,
          currentListId: this._currentListId,
          context: this.context
        });
      // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
      ReactDOM.render(dialog, this._dialogPlaceHolder);

    } catch (err) {
      Log.error(LOG_SOURCE, err);
    }
  }
}

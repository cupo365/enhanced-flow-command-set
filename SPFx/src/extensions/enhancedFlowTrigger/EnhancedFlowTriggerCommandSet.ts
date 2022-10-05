import { ServiceScope } from "@microsoft/sp-core-library";
import { BaseListViewCommandSet, Command, IListViewCommandSetExecuteEventParameters, ListViewStateChangedEventArgs } from "@microsoft/sp-listview-extensibility";
import { ConsoleListener, ILogListener, Logger, LogLevel } from "@pnp/logging";
import * as strings from "EnhancedFlowTriggerCommandSetStrings";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { v4 } from "uuid";
import Dependencies, { inject } from "../../di/DependenciesManager";
import { validateVisibility } from "../../library";
import { getLogSource, getSP, isServedFromLocalHost } from "../../middleware";
import { ITriggerConfig } from "../../models";
import { FlowService, FlowServiceKey, IFlowService, ISPOService, SPOService, SPOServiceKey } from "../../services";
import { EnhancedFlowTriggerDialog, IEnhancedFlowTriggerDialogProps } from "./components";

export interface IEnhancedFlowTriggerCommandSetProps {

}

export default class EnhancedFlowTriggerCommandSet
  extends BaseListViewCommandSet<IEnhancedFlowTriggerCommandSetProps> {
  private _triggerConfigs: ITriggerConfig[];
  private _dialogPlaceHolder: HTMLDivElement = null;
  private _currentListId: string | undefined;
  @inject(SPOServiceKey) private _spoService: ISPOService;
  @inject(FlowServiceKey) private _flowService: IFlowService;

  /**
  * Determines what happens upon command set initialization
  */
  public onInit(): Promise<void> {
    try {
      // Initialize webpart runtime context so that it can be used easily across the application
      getLogSource(this.manifest.alias);
      isServedFromLocalHost(this.context.isServedFromLocalhost);

      // Use .env variables in SPFx
      // See also: https://digitalworkplace365.wordpress.com/2020/03/05/using-env-files-in-sharepoint-framework-development/
      //process.env.SPFX_DOC_PACKAGE_ID

      // Initialize and configure logging with PnP v3
      // See also: https://pnp.github.io/pnpjs/logging/
      // Only subscribe to console logging if solution is being debugged
      if (isServedFromLocalHost()) {
        const consoleListener: ILogListener = ConsoleListener(getLogSource());
        Logger.subscribe(consoleListener);
      }
      Logger.write("Initializing...");

      // Localize command text, since localization via the manifest doesn't appear to be working
      const triggerFlowCommand: Command = this.tryGetCommand('TRIGGER_FLOW');
      triggerFlowCommand.title = strings.TriggerFlowCommandText;
      triggerFlowCommand.visible = false; // hide command on init by default

      // Create the container for our React component
      const dialogDiv: HTMLDivElement = document.createElement("div");
      dialogDiv.setAttribute('id', `${getLogSource()}Container`);
      this._dialogPlaceHolder = document.body.appendChild(dialogDiv);

      // Initialize sp context with PnPjs v3
      // See also: https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts
      getSP(this.context);

      // Inject dependencies
      Dependencies.configure(
        this.context.serviceScope,
        (rootServiceScope2: ServiceScope): Promise<ServiceScope> => {
          return new Promise((resolve, reject): void => {
            let usedScope: ServiceScope = rootServiceScope2;
            const childScope: ServiceScope = rootServiceScope2.startNewChild();
            childScope.createAndProvide(SPOServiceKey, SPOService);
            childScope.createAndProvide(FlowServiceKey, FlowService);
            childScope.finish();
            usedScope = childScope;
            usedScope.whenFinished((): void => {
              resolve(usedScope);
            });
          });
        }
      ).then((): void => {
        // Fetch trigger configuration
        this._spoService.getTriggerConfig()
          .then((triggerConfigs: ITriggerConfig[]): void => {
            if (!triggerConfigs) {
              throw new Error("Trigger configuration is invalid.");
            }
            // Initialize class variables
            this._triggerConfigs = triggerConfigs;
            this._currentListId = this.context.pageContext.list.id.toString();

            // Add state change listener once all dependencies have been initialized/set
            this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

            Logger.write("Initialized!");
            Logger.write(`Listening to config list: ${this._spoService.getConfigListTitle()}`, LogLevel.Verbose);
          }).catch((err) => {
            throw new Error(err);
          });
      }).catch((err) => {
        throw new Error(err);
      });

      return Promise.resolve();

    } catch (err) {
      Logger.error(err);
      return Promise.reject(err);
    }
  }

  /**
  * Determines what happens when the command button has been clicked
  *
  * @param event Click event context
  */
  public onExecute(
    event: IListViewCommandSetExecuteEventParameters
  ): void {
    try {
      switch (event.itemId) {
        case 'TRIGGER_FLOW':
          this._renderEnhancedFlowTriggerDialog(event);
          break;
        default:
          throw new Error('Unknown command');
      }
    } catch (err) {
      Logger.error(err);
    }
  }

  /**
  * Determines what happens when the state of the subscribed list view changes
  *
  * @param args Context about the list view state change
  */
  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    try {
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
      Logger.error(err);
    }
  }

  /**
  * Renders a React component to display the dialog
  *
  * @param event Click event context
  */
  private _renderEnhancedFlowTriggerDialog(
    event: IListViewCommandSetExecuteEventParameters
  ): void {
    try {
      // Use a new id to create a new element every time it opens: otherwise state is maintained from previous dialog
      // This is probably not the correct way: state should be maintained, but every time the dialog opens the closed state should be reset.
      const newKey: string = v4();
      const dialog: React.FunctionComponentElement<IEnhancedFlowTriggerDialogProps> =
        React.createElement(EnhancedFlowTriggerDialog, {
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
      Logger.error(err);
    }
  }
}

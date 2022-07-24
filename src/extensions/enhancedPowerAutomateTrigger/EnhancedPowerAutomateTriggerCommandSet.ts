import { Log, ServiceScope } from "@microsoft/sp-core-library";
import { BaseListViewCommandSet, Command, IListViewCommandSetExecuteEventParameters, ListViewStateChangedEventArgs } from "@microsoft/sp-listview-extensibility";
import * as strings from "EnhancedPowerAutomateTriggerCommandSetStrings";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { v4 } from "uuid";
import Dependencies, { inject } from "../../di/DependenciesManager";
import { IFlowConfig } from "../../models";
import { FlowService, FlowServiceKey, getSP, IFlowService, ISPOService, SPOService } from "../../services";
import { checkIfStringStartsWith, getIndexOfNthCharacterInString, getUrlParameterByName } from "../../util";
import { EnhancedPowerAutomateTriggerDialog, IEnhancedPowerAutomateTriggerDialogProps } from "./components";

export interface IEnhancedPowerAutomateTriggerCommandSetProps {
  configListTitle: string;
}

const LOG_SOURCE: string = 'EnhancedPowerAutomateTriggerCommandSet';
const CONTENT_TYPE_BLACKLIST: string[] = ["0x0120"];
// Empty string indicates everything is whitelisted
const LIST_WHITELIST: string[] = [""];
const RELATIVE_DOCLIB_PATH_WHITELIST: string[] = [""];
const SELECTION_LIMIT: number = 100;

export default class EnhancedPowerAutomateTriggerCommandSet
  extends BaseListViewCommandSet<IEnhancedPowerAutomateTriggerCommandSetProps> {
  private _flowConfigs: IFlowConfig[];
  private _dialogPlaceHolder: HTMLDivElement = null;
  private _spoService: ISPOService;
  @inject(FlowServiceKey) private _flowService: IFlowService;

  public onInit(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Initializing...");

      // Localize command text, since localization via the manifest doesn't appear to work
      const triggerFlowCommand: Command = this.tryGetCommand('TRIGGER_FLOW');
      triggerFlowCommand.title = strings.TriggerFlowCommandText;
      triggerFlowCommand.visible = false; // hide command on init by default

      // Add state change listener
      this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

      // Create the container for our React component
      const dialogDiv: HTMLDivElement = document.createElement("div");
      dialogDiv.setAttribute('id', `${LOG_SOURCE}Container`);
      this._dialogPlaceHolder = document.body.appendChild(dialogDiv);

      // Initialize sp context
      // See also: https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts
      getSP(this.context);

      this._spoService = new SPOService();
      this._spoService.getFlowConfig(this.properties.configListTitle)
        .then((flowConfigs: IFlowConfig[]): void => {
          if (!flowConfigs) {
            throw new Error("Flow configuration is invalid.");
          }

          this._flowConfigs = flowConfigs;

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
      const showButton: boolean = this._validateSelection();

      const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
      if (triggerFlowCommand) {
        triggerFlowCommand.visible = showButton;
        this.raiseOnChange();
      }
    } catch (err) {
      Log.error(LOG_SOURCE, err);
    }
  }

  private _validateSelection = (): boolean => {
    try {
      const containsBlacklistedItems: boolean = this.context.listView.selectedRows.map((selectedItem) => {
        return CONTENT_TYPE_BLACKLIST.map((blackListedContentType) =>
          selectedItem.getValueByName("ContentTypeId").toLowerCase()
            .startsWith(blackListedContentType.toLowerCase())).includes(true);
      }).includes(true);
      const currentList: string = window.location.href.substring(
        getIndexOfNthCharacterInString(window.location.href, '/', 5) + 1, getIndexOfNthCharacterInString(window.location.href, '/', 6));
      const isWhitelistedList: boolean = currentList ?
        checkIfStringStartsWith(currentList, LIST_WHITELIST) :
        (LIST_WHITELIST.length === 1 && LIST_WHITELIST[0].length === 0);
      const relativePath: string = getUrlParameterByName("id");
      const relativeDocLibPath: string = relativePath ? relativePath.substring(
        getIndexOfNthCharacterInString(relativePath, '/', 4) + 1, relativePath.length) : null;
      const isWhitelistedRelativePath: boolean = relativeDocLibPath ?
        checkIfStringStartsWith(relativeDocLibPath, RELATIVE_DOCLIB_PATH_WHITELIST) :
        (RELATIVE_DOCLIB_PATH_WHITELIST.length === 1 && RELATIVE_DOCLIB_PATH_WHITELIST[0].length === 0);
      const isWithinSelectionLimit: boolean = this.context.listView.selectedRows.length >= 1 && this.context.listView.selectedRows.length <= SELECTION_LIMIT;

      return isWhitelistedList && isWhitelistedRelativePath && !containsBlacklistedItems && isWithinSelectionLimit;
    } catch (err) {
      Log.error(LOG_SOURCE, err);
      return false;
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
          flowConfigs: this._flowConfigs,
          context: this.context
        });
      // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
      ReactDOM.render(dialog, this._dialogPlaceHolder);

    } catch (err) {
      Log.error(LOG_SOURCE, err);
    }
  }
}

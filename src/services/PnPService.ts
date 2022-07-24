import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";

// import pnp, pnp logging system, and any other selective imports needed
import { LogLevel, PnPLogging } from "@pnp/logging";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/batching";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";

let _sp: SPFI = null;

export const getSP = (context?: ListViewCommandSetContext): SPFI => {
  if (_sp === null && context !== null) {
    // You must add the @pnp/logging package to include the PnPLogging behavior it is no longer a peer dependency
    // The LogLevel set's at what level a message will be written to the console
    _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
  }
  return _sp;
}

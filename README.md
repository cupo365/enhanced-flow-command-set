# ![Enhanced SharePoint Power Automate Trigger Command Set icon](resources/extension-icon-small.png "Enhanced SharePoint Power Automate Trigger Command Set icon") Enhanced SharePoint Power Automate Trigger Command Set

## Table of Contents
  - [Summary](#summary)
  - [Compatibility](#compatibility)
  - [Applies to](#applies-to)
  - [Prerequisites](#prerequisites)
  - [Solution](#solution)
  - [Version history](#version-history)
  - [Supported languages](#supported-languages)
  - [How it works](#how-it-works)
  - [Download the web part packages](#download-the-web-part-packages)

## Summary

My colleague [MrAutomate33](https://github.com/mrautomate33) and I have been longing for a solution that supports triggering Power Automate flows while selecting multiple files in a SharePoint document library or multiple list items in a SharePoint custom list. Now, finally it's here! <br />
<br />
This SPFx (SharePoint Framework) command set expands on the existing 'trigger a flow' menu button in SharePoint, and allows you to configure one or more HTTP request triggered flows and serve the user with a choice on which flow to execute when selecting one or more items by injecting a menu lint and context button upon loading the page. A sppkg for both SharePoint document libaries and custom lists are available.

**[<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fpreview%2Froyal-blue%2Fdata-transfer-download-xxl.png&f=1&nofb=1" alt="Download .sppkg file" style="width:15px;margin-right:10px;"/><u>Download the .sppkg file for custom lists here!</u>](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.3.0)**

**[<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fpreview%2Froyal-blue%2Fdata-transfer-download-xxl.png&f=1&nofb=1" alt="Download .sppkg file" style="width:15px;margin-right:10px;"/><u>Download the .sppkg file for document libraries here!</u>](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.3.0)**

## Compatibility

![SPFx 1.15.0](https://img.shields.io/badge/SPFx-1.15.0-green.svg) ![Node.js v14.17.0](https://img.shields.io/badge/Node.js-v14.17.0-green.svg)
![React v16.13.1](https://img.shields.io/badge/React-v16.13.1-green.svg)
![Typescript v4.5](https://img.shields.io/badge/Typescript-v4.5-green.svg) ![PnP v3.5.1](https://img.shields.io/badge/PnP-v3.5.1-green.svg) 
![PnP Logging v3.5.1](https://img.shields.io/badge/PnP%20Logging-v3.5.1-green.svg) ![PnP SPFx Controls v3.9.0](https://img.shields.io/badge/PnP%20SPFx%20Controls-v3.9.0-green.svg) ![dotenv v16.0.1](https://img.shields.io/badge/dotenv-v16.0.1-green.svg)
![Fluent UI v8.83.0](https://img.shields.io/badge/Fluent%20UI-v8.83.0-green.svg)

![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg) ![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg) ![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg)

![Compatible with SharePoint document libraries](https://img.shields.io/badge/Document%20libraries-Compatible-green.svg) ![Compatible with SharePoint custom lists](https://img.shields.io/badge/Custom%20lists-Compatible-green.svg)

![Compatible with Microsoft Edge](https://img.shields.io/badge/MS%20Edge-Compatible-green.svg) ![Compatible with Google Chrome](https://img.shields.io/badge/Google%20Chrome-Compatible-green.svg) ![Compatible with Mozilla Firefox](https://img.shields.io/badge/Mozilla%20Firefox-Compatible-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Power Automate](https://powerautomate.microsoft.com/en-us/)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Elegant DI in SPFx](https://ypcode.wordpress.com/2018/07/30/elegant-di-in-spfx/)
- [Using .env files in SharePoint Framework development](https://digitalworkplace365.wordpress.com/2020/03/05/using-env-files-in-sharepoint-framework-development/)
- [AppSettings in your SPFx solutions](https://www.portiva.nl/portiblog/blogs-cat/appsettings-in-your-spfx-solutions)
- [Use @pnp/sp (PnPJS) v3 library with SharePoint Framework web parts](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts)
- [Logging with PnPJS v3 in SPFx solutions](https://pnp.github.io/pnpjs/logging/)
- [Create a custom gulp task](https://gist.github.com/estruyf/fb444cfd0de7b3aabe4cb4711ad2118b)
- [Debug SPFx applications via VSCode launch.json](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/debug-in-vscode#prerequisites)
- [VSCode launch tasks](https://code.visualstudio.com/Docs/editor/tasks)
- [Provision SharePoint assets from your client-side web part](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/provision-sp-assets-from-package)

## Prerequisites

> - Node.js v12/14/16
> - A Power Automate per user or per flow plan that allows you to use the Request (HTTP) connector (see [Power Automate pricing](https://powerautomate.microsoft.com/en-us/pricing/))
> - (optional) An M365 account. Get your own free Microsoft 365 tenant from [M365 developer program](https://developer.microsoft.com/en-us/microsoft-365/dev-program)

## Solution

| Solution                                                       | Author(s)                                     |
| -------------------------------------------------------------- | --------------------------------------------- |
| Document Libraries Enhanced Power Automate Trigger Command Set | cup o'365 ([contact](mailto:info@cupo365.gg)) |
| Custom Lists Enhanced Power Automate Trigger Command Set       | cup o'365 ([contact](mailto:info@cupo365.gg)) |

## Version history

| Version                                                                                     | Date            | Comments                                                                                   |
| ------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| [0.9.0](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v0.9.0) | April 3, 2022   | Pre-release                                                                                |
| [1.0.0](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.0.0) | July 1, 2022    | Initial release, doc lib and lists compatibility                                           |
| [1.1.0](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.1.0) | July 24, 2022   | Migration to SPFx 1.15.0 and lots of optimalizations                                       |
| [1.2.0](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.2.1) | August 1, 2022  | Customizable list and folder whitelisting and content type and file extension blacklisting |
| [1.3.0](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.3.0) | October 2, 2022 | Dynamic user input form                                                                    |

## Supported languages
- English
- Dutch

---

## How it works

Unlike SPFx web parts, command sets do not support configuration via a property panel. To ensure customization to this solution is still possible, a workaround has been implemented. 

Upon installing the web part on a SharePoint site, a Power Automate trigger configuration custom list will be automatically provisioned with the name ````Enhanced Power Automate Trigger Configuration````.

Upon initialization, the web part will fetch all items in this provisioned list and use the information stored in it to create flow configuration, which is then presented to the user as a choice which flow to trigger. If the web part succeeds in fetching and composing the configuration, a console message will be logged with the name of the provisioned list. This message looks like ````EnhancedPowerAutomateTriggerCommandSet -> Initialized! Listening to config list: Enhanced Power Automate Trigger Configuration````.
If it fails, a console message will be logged. This message looks like ````EnhancedPowerAutomateTriggerCommandSet -> Error while initializing````.

The web part will call the flow by using the information in the composed flow configuration selected by the user.
The provisioned configuration list contains the following  fields. Each item in this list represents a flow the user may call from the list/document library:

| Name                     | Type                 | Description                                                                                                                                                                                                                            | Example                                                                                       |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Title                    | single line of text  | The title of the button displayed to the user for this trigger.                                                                                                                                                                        | Start an approval                                                                             |
| Trigger URL              | multi line text      | The HTTP URL with which the flow can be triggered with.                                                                                                                                                                                | https://prod-178.westeurope.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke... |
| HTTP Type                | choice               | The HTTP method to use for this trigger.                                                                                                                                                                                               |
| Origin secret            | text                 | Secret which is passed to the flow and can be used to validate the origin of the request. Leave empty to not provide an origin secret.                                                                                                 | 0f30da5d2e4c4565bd227cedd969cddb                                                              |
| List whitelist           | fill-in multi choice | The GUIDs of the lists to whitelist for this trigger. Leave empty to whitelist all.                                                                                                                                                    | 7bc18c02-015f-49bd-a120-bb7a1dfc568f                                                          |
| Folder whitelist         | fill-in multi choice | The list relative folder path to whitelist for this trigger. Leave empty to whitelist all.                                                                                                                                             | Deliverables/Finals                                                                           |
| Content type blacklist   | fill-in multi choice | The (start of a) content type ID to blacklist for this trigger. See https://docs.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ms452896(v=office.14) for all content type IDs. Leave empty to blacklist none. | 0x0120 (blacklist all folders)                                                                |
| File extension blacklist | fill-in multi choice | The file extensions to blacklist for this trigger. Leave empty to blacklist none.                                                                                                                                                      | docx                                                                                          |
| Selection limit          | number               | The selected items limit for this trigger.                                                                                                                                                                                             | 30                                                                                            |
| Requested user input     | multi line text      | Array with objects of input fields to request and pass to the flow. Leave empty to not request any user input. set.                                                                                                                    | An example can be found [here](resources/request-user-input-example.jsonc)                    |

If the command set is installed on the site and the user opens a document library or custom list (depending on the installed package) and one or more items are selected, a menu button with the text 'Trigger flow' will become visible in the menu lint or context (see example below). 
![Trigger flow button example](resources/trigger-flow-button.png "Trigger flow button example")

Upon pressing the menu button, a dialog will appear, displaying choices for every configured flow in the provisioned configuration list. The user will be able to choose which flow they want to trigger (see example below).
![Select flow dialog example](resources/select-flow-dialog.png "Select flow dialog example")
> Note that the web part and its components is SharePoint theme-aware.

If the configured flow uses a POST method, the command set will pass a request body JSON-object to the flow with the following properties:
| Name             | Type    | Description                                                                                                                           | Example                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| originSecret     | string  | Secret which is passed to the flow and can be used to validate the origin of the request. Leave empty to not provide an origin secret | "0f30da5d2e4c4565bd227cedd969cddb"                               |
| site             | string  | The site on which the command set resides                                                                                             | "https://cupo365.sharepoint.com/sites/mkvj"                      |
| tenantUrl        | string  | The SharePoint tenant URL                                                                                                             | "https://cupo365.sharepoint.com/"                                |
| listId           | string  | The guid of the SharePoint list from which the web part was invoked                                                                   | "e74d4d74-e145-42ea-9f74-26aa22565dfa"                           |
| culture          | string  | The configured language by the user of the web part (culture variant UI name)                                                         | "en-US"                                                          |
| selectedItems    | array   | An array of selected item objects                                                                                                     | -                                                                |
| id               | integer | The ID of the selected item                                                                                                           | 3                                                                |
| fileRef          | string  | the server relative URL                                                                                                               | "/sites/mkvj/Shared Documents/Lorem ipsum dolor sit amet 1.docx" |
| fileLeafRef      | string  | The name of the file, including the file extension                                                                                    | "Lorem ipsum dolor sit amet 1.docx"                              |
| fileType         | string  | The file type                                                                                                                         | "docx"                                                           |
| uniqueIdentifier | string  | The unique guid of the selected item                                                                                                  | "{7e88549e-6d26-4f7f-bdd3-17919a7526e9}"                         |
| user             | object  | An object of user data                                                                                                                | -                                                                |
| loginName        | string  | The login name of the user                                                                                                            | "info@cupo365.gg"                                                |
| displayName      | string  | The display name of the user                                                                                                          | "cup o'365"                                                      |
| email            | string  | The email of the user                                                                                                                 | "info@cupo365.gg"                                                |
| input            | object  | Dynamic object based on the configuration of the 'Requested user input' field                                                         | { "name": "value" }                                              |

An example of the request body is outlined below:
````
{
  "originSecret": "0f30da5d2e4c4565bd227cedd969cddb",
  "site": "https://cupo365.sharepoint.com/sites/mkvj",
  "tenantUrl": "https://cupo365.sharepoint.com/",
  "listId": "e74d4d74-e145-42ea-9f74-26aa22565dfa",
  "culture": "en-US",
  "selectedItems": [
      {
          "id": 3,
          "fileRef": "/sites/mkvj/Shared Documents/Lorem ipsum dolor sit amet 1.docx",
          "fileLeafRef": "Lorem ipsum dolor sit amet 1.docx",
          "fileType": "docx",
          "uniqueIdentifier": "{7e88549e-6d26-4f7f-bdd3-17919a7526e9}"
      },
      {
          "id": 2,
          "fileRef": "/sites/mkvj/Shared Documents/Lorem ipsum dolor sit amet 2.docx",
          "fileLeafRef": "Lorem ipsum dolor sit amet 2.docx",
          "fileType": "docx",
          "uniqueIdentifier": "{47bd54ff-6a37-4873-934b-47fd3da89161}"
      }
  ],
  "user": {
        "loginName": "info@cupo365.gg",
        "displayName": "cup o'365",
        "email": "info@cupo365.gg",
        "input": {
            "name": "value",
        }
    }
}
````

This request body translates to the following Power Automate body schema:
````
{
    "type": "object",
    "properties": {
        "originSecret": {
            "type": "string"
        },
        "site": {
            "type": "string"
        },
        "tenantUrl": {
            "type": "string"
        },
        "listId": {
            "type": "string"
        },
        "culture": {
            "type": "string"
        },
        "selectedItems": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer"
                    },
                    "fileRef": {
                        "type": "string"
                    },
                    "fileLeafRef": {
                        "type": "string"
                    },
                    "fileType": {
                        "type": "string"
                    },
                    "uniqueIdentifier": {
                        "type": "string"
                    }
                },
                "required": [
                    "id",
                    "fileRef",
                    "fileLeafRef",
                    "fileType",
                    "uniqueIdentifier"
                ]
            }
        },
        "user": {
            "type": "object",
            "properties": {
                "loginName": {
                    "type": "string"
                },
                "displayName": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "input": {
                    "type": "object",
                    "properties": {}
                }
            }
        }
    }
}
````
> Note that flows configured with a GET method <u>will not</u> receive a request body, since that is not supported within the Power Automate response (HTTP) trigger.

<br />
The command set supports both waiting for a flow response and simple invocations without waiting for a response.
<br />
<br />
If the flow does not contain a custom response, it will show the following message to the user:

![Invoke success dialog example](resources/invoke-success-dialog.png "Invoke success dialog example")

If the flow does contain a custom response, the command set will wait and show the user a message, based on the response. 

![Awaiting flow response example](resources/awaiting-flow-response.png "Awaiting flow response example")

The command set also supports showing the user a custom message via the flow response body (optional). The command set supports the following response body:
````
{
  "message": "Any message here"
} 
````

This translates to the following Power Automate body schema:
````
{
    "type": "object",
    "properties": {
        "message": {
            "type": "string"
        }
    }
}
````

If a message is present, it will be displayed in the dialog that is shown to the user (see example below).
![Success dialog with message example](resources/success-with-message-dialog.png "Success dialog with message example")

## Download the web part packages

**[<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fpreview%2Froyal-blue%2Fdata-transfer-download-xxl.png&f=1&nofb=1" alt="Download .sppkg file" style="width:15px;margin-right:10px;"/><u>Download the .sppkg file for custom lists here!</u>](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.3.0)**

**[<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fpreview%2Froyal-blue%2Fdata-transfer-download-xxl.png&f=1&nofb=1" alt="Download .sppkg file" style="width:15px;margin-right:10px;"/><u>Download the .sppkg file for document libraries here!</u>](https://github.com/cupo365/enhanced-power-automate-command-set/releases/tag/v1.3.0)**

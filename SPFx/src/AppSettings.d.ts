declare interface IAppSettings {
  ConfigListTitle: string;
  FlowButtonDisplayLimit: number;
}

declare module 'AppSettings' {
  const AppSettings: IAppSettings;
  export = AppSettings;
}

// import AppSettings by adding the following import: import * from "AppSettings";

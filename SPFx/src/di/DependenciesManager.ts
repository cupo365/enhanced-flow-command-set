import { ServiceKey, ServiceScope } from '@microsoft/sp-core-library';

interface IDepReference {
  obj: unknown;
  property: string;
  serviceKey: ServiceKey<unknown>;
}

export class DependenciesManager {
  private _serviceScope: ServiceScope;
  private _references: IDepReference[] = [];

  public configure(
    rootServiceScope: ServiceScope,
    serviceScopeConfiguration: (rootServiceScope: ServiceScope) => Promise<ServiceScope>
  ): Promise<unknown> {
    return new Promise<void>((resolve, reject) => {
      serviceScopeConfiguration(rootServiceScope)
        .then((usedScope) => {
          this._serviceScope = usedScope;
          this._serviceScope.whenFinished(() => {
            // Inject all the already known dependency references
            this._references.forEach(r => {
              r.obj[r.property] = this._serviceScope.consume(r.serviceKey);
            });
            this._references = [];
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public inject<TService>(target: unknown, property: string, serviceKey: ServiceKey<TService>): void {
    if (this._serviceScope) {
      target[property] = this._serviceScope.consume(serviceKey);
    } else {
      this._references.push({
        obj: target,
        property: property,
        serviceKey: serviceKey
      });
    }
  }

  public injectFromFunction<TService>(serviceKey: ServiceKey<TService>): TService { if (this._serviceScope) { return this._serviceScope.consume(serviceKey); } else { return null; } }
}

const Dependencies: DependenciesManager = new DependenciesManager();
export default Dependencies;

export const inject = (service: ServiceKey<unknown>): (target: unknown, propertyKey: string) => void => {
  return (target: unknown, propertyKey: string): void => {
    Dependencies.inject(target, propertyKey, service);
  };
};

export const ServiceScopeServiceKey: ServiceKey<ServiceScope> = ServiceKey.createCustom<ServiceScope>('DependenciesManager:ServiceScope', (serviceScope) => {
  return serviceScope;
});

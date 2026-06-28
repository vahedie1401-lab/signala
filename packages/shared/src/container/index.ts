class Container {
  private services = new Map<string, unknown>();

  register<T>(name: string, service: T) {
    this.services.set(name, service);
  }

  resolve<T>(name: string): T {
    return this.services.get(name) as T;
  }
}

export const container = new Container();

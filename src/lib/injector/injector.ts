export namespace Injector {
  export type ContainerOptions = {
    debugInstanceCreation?: boolean
  }

  export function container<T extends Record<string, any>>(params: ContainerDefinition<T>): T {
    type QueueEntry = {
      /** Object from which we will read the injector definitions */
      source: Record<string, any>
      /** Object on which we will define the properties with getters */
      target: Record<string, unknown>
    }

    const container = {} as T

    const queue: QueueEntry[] = [
      {
        source: params,
        target: container,
      },
    ]

    for (const { source, target } of queue) {
      for (const [propKey, sourcePropValue] of Object.entries(source)) {
        if (sourcePropValue instanceof PropInjector) {
          Object.defineProperty(target, propKey, {
            get: () => sourcePropValue.getInstance(container),
          })
        } else if (typeof sourcePropValue === 'object' && sourcePropValue !== null) {
          const newTarget = {}
          target[propKey] = newTarget
          const queueEntry: QueueEntry = {
            source: sourcePropValue,
            target: newTarget,
          }
          queue.push(queueEntry)
        } else {
          Object.defineProperty(target, propKey, {
            writable: false,
            value: sourcePropValue,
          })
        }
      }
    }

    return container as T
  }

  export function factory<TContext, TProp>(
    factory: (context: TContext) => TProp,
  ): FactoryInjector<TContext, TProp> {
    return new FactoryInjector(factory)
  }

  export function fromClass<TContext, TProperty>(
    Class: new (ctx: TContext) => TProperty,
  ): ClassInjector<TContext, TProperty> {
    return new ClassInjector(Class)
  }

  export function instance<T>(instance: T): InstanceInjector<unknown, T> {
    return new InstanceInjector(instance)
  }

  type Factory<TContext, TProperty> = (context: TContext) => TProperty

  type InjectorMap<TRoot, TCurrent> = {
    [TPropKey in keyof TCurrent]:
      | InjectorMap<TRoot, TCurrent[TPropKey]>
      | PropInjector<TRoot, TCurrent[TPropKey]>
  }

  type ContainerDefinition<TContext> = InjectorMap<TContext, TContext>

  abstract class PropInjector<TContext, TProperty> {
    abstract getInstance(ctx: TContext, options?: ContainerOptions): TProperty
  }

  class FactoryInjector<TContext, TProperty> extends PropInjector<TContext, TProperty> {
    private _instance: TProperty | null = null

    constructor(private readonly factory: Factory<TContext, TProperty>) {
      super()
    }

    getInstance(ctx: TContext): TProperty {
      if (this._instance === null) {
        this._instance = this.factory(ctx)
      }
      return this._instance
    }
  }

  class InstanceInjector<TContext, TProperty> extends PropInjector<TContext, TProperty> {
    constructor(private readonly instance: TProperty) {
      super()
    }

    getInstance(): TProperty {
      return this.instance
    }
  }

  class ClassInjector<TContext, TProperty> extends PropInjector<TContext, TProperty> {
    private _instance: TProperty | null = null

    constructor(private readonly Class: new (ctx: TContext) => TProperty) {
      super()
    }

    getInstance(ctx: TContext): TProperty {
      if (this._instance === null) {
        this._instance = new this.Class(ctx)
      }
      return this._instance
    }
  }
}

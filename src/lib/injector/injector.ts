export namespace Injector {
  class FactoryInjector<TContext, TProperty> {
    constructor(readonly factory: (context: TContext) => TProperty) {}
  }

  type PropertyInjectorDef<TContext, TProperty> = {
    durable: false
    factory: (context: TContext) => TProperty
  }

  export type InjectorParams<TContext> = {
    [TProp in keyof TContext]: PropertyInjectorDef<TContext, TContext[TProp]>
  }

  type InjectorEntry<TCtx, TKey extends keyof TCtx> = [TKey, PropertyInjectorDef<TCtx, TCtx[TKey]>]

  export function root<TContext extends object>(
    params: InjectorParams<TContext>,
  ): Readonly<TContext> {
    const result = {} as TContext
    for (const entry of Object.entries(params)) {
      const [prop, propInjector] = entry as InjectorEntry<TContext, keyof TContext>
      let ctxPropValue: TContext[typeof prop] | null = null

      Object.defineProperty(result, prop, {
        get: () => {
          if (ctxPropValue === null) {
            console.log(`Injecting property "${String(prop)}"...`)
            ctxPropValue = propInjector.factory(result as TContext)
          }
          return ctxPropValue
        },
      })
    }
    return result as Readonly<TContext>
  }

  export function nested<TContext, TNested>(params: InjectorParams<TNested>) {}

  export function factory<TContext, T>(
    factory: (context: TContext) => T,
  ): PropertyInjectorDef<TContext, T> {
    return {
      durable: false,
      factory,
    }
  }

  export function fromClass<T>(Class: new () => T): PropertyInjectorDef<unknown, T> {
    return factory(() => new Class())
  }

  export function instance<T>(instance: T): PropertyInjectorDef<unknown, T> {
    return factory(() => instance)
  }
}

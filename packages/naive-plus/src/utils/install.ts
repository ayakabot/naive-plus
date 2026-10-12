import type { App, Component } from 'vue'

// const camelizeRE = /-(\w)/g
// const camelize = (str: string) =>
//   str.replace(camelizeRE, (_, c) => c.toUpperCase())

type EventShim = {
  new (...args: any[]): {
    $props: {
      onClick?: (...args: any[]) => void
    }
  }
}
export type WithInstall<T> = T & {
  install(app: App): void
} & EventShim

export const withInstall = <T extends Component>(
  options: T
): WithInstall<T> => {
  // <script setup> SFC 不会设置 options.name，回退使用编译器注入的 __name
  const name = options.name || (options as { __name?: string }).__name
  if (name && !options.name) {
    // 回写 name，保证 ComponentNames 及外部读取时一致（类型上 name 为只读，故用 Object.assign）
    Object.assign(options, { name })
  }
  // @ts-ignore
  options.install = (app: App) => {
    if (name) {
      app.component(name, options)
      // app.component(camelize(`-${name}`), options)
    }
  }
  return options as WithInstall<T>
}

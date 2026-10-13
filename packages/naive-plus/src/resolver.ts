import type {
  ComponentResolver,
  SideEffectsInfo,
} from 'unplugin-vue-components/types'
import { kebabCase } from 'unplugin-vue-components'

const isSSR = Boolean(
  process.env.SSR ||
    process.env.SSG ||
    process.env.VITE_SSR ||
    process.env.VITE_SSG
)

const moduleType = isSSR ? 'lib' : 'es'

export interface NaivePlusResolverOptions {
  /**
   * import style css or scss along with components
   *
   * @default true
   */
  importStyle?: boolean | 'css' | 'scss'
}

/**
 * 组件样式依赖关系，被依赖组件的样式需要随组件一并导入
 */
const styleDeps: Record<string, string[]> = {
  'np-cell-group': ['np-cell'],
  'np-filter': ['np-cell', 'np-cell-group'],
  'np-form': ['np-button', 'np-checkbox', 'np-radio', 'np-upload'],
  'np-table': ['np-cell-group', 'np-filter', 'np-form'],
}

/**
 * 收集组件自身及其全部依赖组件的样式目录，依赖排在前面，保证基础样式先输出
 */
function collectStyleDirs(
  dirName: string,
  visited = new Set<string>()
): string[] {
  if (visited.has(dirName)) return []
  visited.add(dirName)

  const deps = styleDeps[dirName] ?? []
  return [...deps.flatMap(dep => collectStyleDirs(dep, visited)), dirName]
}

function getStylePath(
  dirName: string,
  importStyle: boolean | 'css' | 'scss'
): string {
  const ext = importStyle === 'scss' ? 'scss' : 'css'
  return `naive-plus/${moduleType}/${dirName}/style/index.${ext}`
}

function getSideEffects(
  dirName: string,
  options: NaivePlusResolverOptions
): SideEffectsInfo | undefined {
  const { importStyle = true } = options

  if (!importStyle || isSSR) return

  const paths = collectStyleDirs(dirName).map(dir =>
    getStylePath(dir, importStyle)
  )

  return paths.length === 1 ? paths[0] : paths
}

/**
 * Resolver
 *
 */
export function NaivePlusResolver(
  options: NaivePlusResolverOptions = {}
): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      const kebabcase = kebabCase(name)
      if (kebabcase.startsWith('np-')) {
        return {
          name,
          from: `naive-plus/${moduleType}`,
          sideEffects: getSideEffects(kebabcase, options),
        }
      }
    },
  }
}

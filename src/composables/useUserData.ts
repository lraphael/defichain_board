import { LocalStorage } from 'quasar'

export type config = {
  [key: string]: any
} | 'null'

const resolvePath = (object: any, path: any, defaultValue: any) => path
  .split('.')
  .reduce((o: { [x: string]: any }, p: string | number) => o ? o[p] : defaultValue, object)

export const getConfigByKey = (key: string | null) => {
  const config = LocalStorage.getItem('config') as config
  if (key === null) {
    return config
  }
  return resolvePath(config, key, null)
}

export const setConfigByKey = (key: string, data: any) => {
  let config = LocalStorage.getItem('config') as config
  if (!config || config === 'null') {
    config = {}
  }
  if (key.includes('.')) {
    const keys = key.split('.')
    const firstKey = keys.shift() as string
    const lastKey = keys.pop() as string
    if (!Object.keys(config).includes(firstKey)) {
      config[firstKey] = {}
    }
    config[firstKey][lastKey] = data
  } else {
    config[key] = data
  }
  LocalStorage.set('config', config)
}

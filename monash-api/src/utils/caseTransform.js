import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snake-keys'

export const toCamelCase = (data) => {
  if (!data) return data

  return camelcaseKeys(data, {
    deep: true,
    exclude: [/^_/] // Exclude keys starting with underscore if needed
  })
}

export const toSnakeCase = (data) => {
  if (!data) return data

  return snakecaseKeys(data, {
    deep: true,
    exclude: [/^_/] // Exclude keys starting with underscore if needed
  })
}
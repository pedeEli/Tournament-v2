import {v4} from 'uuid'

export const capitalizeWords = (str: string) => {
  return str.toLowerCase().split(' ').map(word => {
    if (word === '')
      return word
    return word[0].toUpperCase() + word.substring(1)
  }).join(' ')
}

export const createId = (ids: Set<string>): string => {
  const id = v4()
  if (ids.has(id))
      return createId(ids)
  return id
}
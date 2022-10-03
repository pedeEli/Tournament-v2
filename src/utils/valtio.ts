import {subscribe} from 'valtio'

export const smartSubscribe = <
  Obj,
  Id extends string | number,
  Index extends string | number | symbol
>(
  objs: Record<Index, Obj>,
  getId: (obj: Obj) => Id,
  subscribe: (callback: (objs: Record<Index, Obj>) => void) => () => void,
  callback: (obj: Obj) => () => void,
  cleanUp?: () => void
) => {
  const unsubs = new Map<Id, () => void>()

  Object.keys(objs).forEach(index => {
    const obj = objs[index as Index]
    const id = getId(obj)
    const unsub = callback(obj)
    unsubs.set(id, unsub)
  })

  const unsub = subscribe(_objs => {
    const ids = new Set<Id>()
    Object.keys(_objs).forEach(index => {
      const obj = _objs[index as Index]
      const id = getId(obj)
      ids.add(id)
      if (unsubs.has(id))
        return
      const unsub = callback(obj)
      unsubs.set(id, unsub)
    })
    unsubs.forEach((unsub, id) => {
      if (ids.has(id))
        return
      unsub()
      unsubs.delete(id)
    })
  })

  return () => {
    unsub()
    unsubs.forEach(unsub => unsub())
    cleanUp && cleanUp()
  }
}


export const commonSmartSubscribe = <
  Obj extends {id: App.Id},
  Objs extends Record<App.Id, Obj> = Record<App.Id, Obj>
>(
  objs: Objs,
  callback: (obj: Obj) => () => void,
  cleanUp?: () => void
) => {
  return smartSubscribe(objs, ({id}) => id, fn => {
    return subscribe(objs, () => fn(objs))
  }, callback, cleanUp)
}

import {useState, useEffect} from 'react'
import {subscribeKey} from 'valtio/utils'

export const useSnapshotKey = <Obj extends object, Key extends keyof Obj = keyof Obj>(obj: Obj, key: Key) => {
  const [value, setValue] = useState(obj[key])

  useEffect(() => {
    const unsub = subscribeKey(obj, key, setValue)
    return unsub
  }, [])
  
  return value
}
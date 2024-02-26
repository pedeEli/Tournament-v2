import tournament, {settings, brackets, contestants, groups, matches, state, createEmptyTournament} from '@/state/tournament'
import {ipcRenderer} from 'electron'
import fs from 'fs/promises'
import path from 'path'
import popupQueue from '@/state/popup'

export const DEFAULT_PATH_KEY = 'default-path'
export const FILE_NAME_KEY = 'file-name'
export const IS_SAVED_KEY = 'is-saved'

export const save = async () => {
  const filename = localStorage.getItem(FILE_NAME_KEY)
  if (!filename)
    return await saveUnder()
  
  const filepath = path.join(localStorage.getItem(DEFAULT_PATH_KEY)!, filename)
  const file = JSON.stringify(tournament, null, 2)
  await fs.writeFile(filepath, file, 'utf-8')
  popupQueue.push({message: 'Erfolgreich gespeichert'})
  localStorage.setItem(IS_SAVED_KEY, 'true')
  return true
}

let resolveSaveUnder: ((success: boolean) => void) | undefined
export const saveUnder = async () => {
  return new Promise<boolean>(resolve => {
    ipcRenderer.send('save', settings.name, localStorage.getItem(DEFAULT_PATH_KEY))
    resolveSaveUnder = success => {
      resolve(success)
      resolveSaveUnder = undefined
    }
  })
}

export const load = () => {
  const defaultPath = localStorage.getItem(DEFAULT_PATH_KEY)
  ipcRenderer.send('load', defaultPath)
}

export const handleSaveFile = async (event: Electron.IpcRendererEvent, filepath: string) => {
  resolveSaveUnder?.(filepath !== '')
  if (!filepath)
    return
  
  const file = JSON.stringify(tournament, null, 2)
  await fs.writeFile(filepath, file, 'utf-8')
  popupQueue.push({message: 'Erfolgreich gespeichert'})
  localStorage.setItem(DEFAULT_PATH_KEY, path.dirname(filepath))
  localStorage.setItem(FILE_NAME_KEY, path.basename(filepath))
  localStorage.setItem(IS_SAVED_KEY, 'true')
}

export const handleLoadFile = (callback: () => void) => async (event: any, filepath: string) => {
  if (!filepath)
    return

  const file = await fs.readFile(filepath, 'utf-8')
  const tnm = JSON.parse(file) as App.Tournament
  
  clearTournament()
  if (tournament.version !== tnm.version) {
    updateOldTournament(tnm, tournament.version)
  }

  const tnmMatches = new Set<App.Id>()
  Object.values(tnm.contestants).forEach(contestant => contestants[contestant.id] = contestant)
  Object.values(tnm.groups).forEach(group => {
    group.matches.forEach(id => {
      tnmMatches.add(id)
      matches[id] = tnm.matches[id]
    })
    groups[group.id] = group
  })
  Object.values(tnm.brackets).forEach(bracket => {
    tnmMatches.add(bracket.match)
    matches[bracket.match] = tnm.matches[bracket.match]
    brackets[bracket.id] = bracket
  })
  Object.values(tnm.matches).forEach(match => {
    if (!tnmMatches.has(match.id))
      matches[match.id] = match
  })

  settings.defaultTime = tnm.settings.defaultTime
  settings.luckyLoser = tnm.settings.luckyLoser
  settings.name = tnm.settings.name
  settings.winnerPerGroup = tnm.settings.winnerPerGroup
  settings.groups = tnm.settings.groups

  state.phase = tnm.state.phase
  state.luckyLoser = tnm.state.luckyLoser
  state.page = tnm.state.page
  state.addingContestant.addingType = tnm.state.addingContestant.addingType
  state.addingContestant.members = tnm.state.addingContestant.members
  state.addingContestant.personName = tnm.state.addingContestant.personName
  state.addingContestant.teamName = tnm.state.addingContestant.teamName
  
  localStorage.setItem(DEFAULT_PATH_KEY, path.dirname(filepath))
  localStorage.setItem(FILE_NAME_KEY, path.basename(filepath))
  localStorage.setItem(IS_SAVED_KEY, 'true')
  popupQueue.push({message: 'Erfolgreich geladen'})

  callback()
}


export const clearTournament = () => {

  const finale = Object.values(brackets).find(bracket => !bracket.parent)
  if (finale) {
    const toDelete = collectBrackets(finale, brackets)
    toDelete.forEach(bracket => {
      delete brackets[bracket.id]
      delete matches[bracket.match]
    })
  }

  Object.values(groups).forEach(group => {
    group.matches.forEach(id => delete matches[id])
    delete groups[group.id]
  })

  Object.keys(matches).forEach(id => delete matches[id])
  Object.keys(contestants).forEach(id => delete contestants[id])

  const tnm = createEmptyTournament()
  tournament.version = tnm.version
  settings.defaultTime = tnm.settings.defaultTime
  settings.luckyLoser = tnm.settings.luckyLoser
  settings.name = tnm.settings.name
  settings.winnerPerGroup = tnm.settings.winnerPerGroup
  settings.groups = tnm.settings.groups
  settings.pointsPerWin = tnm.settings.pointsPerWin
  settings.pointsPerDraw = tnm.settings.pointsPerDraw

  state.phase = tnm.state.phase
  state.luckyLoser = tnm.state.luckyLoser
  state.page = tnm.state.page
  state.addingContestant.addingType = tnm.state.addingContestant.addingType
  state.addingContestant.members = tnm.state.addingContestant.members
  state.addingContestant.personName = tnm.state.addingContestant.personName
  state.addingContestant.teamName = tnm.state.addingContestant.teamName
  
  localStorage.removeItem(FILE_NAME_KEY)
  localStorage.removeItem(IS_SAVED_KEY)
}


const collectBrackets = (root: App.Bracket, brackets: App.Brackets): App.Bracket[] => {
  const result: App.Bracket[] = [root]
  const {left, right} = root
  if (left)
    result.unshift(...collectBrackets(brackets[left], brackets))
  if (right)
    result.unshift(...collectBrackets(brackets[right], brackets))
  return result
}


const parseVersion = (version: string): [major: number, minor: number, patch: number] => {
  const [major, minor, patch] = version.split('.')
  return [parseInt(major), parseInt(minor), parseInt(patch)]
}


const updateOldTournament = (tnm: App.Tournament, currentVersion: string) => {
  const [major, minor] = parseVersion(tnm.version)
  if (major === 1 && minor === 0) {
    tnm.settings.pointsPerWin = 1
    tnm.settings.pointsPerDraw = 0
  }
  tnm.version = currentVersion
}
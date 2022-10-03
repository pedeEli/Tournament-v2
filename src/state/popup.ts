import {proxy} from 'valtio'

const popupQueue = proxy<Popup.Queue>([])

export default popupQueue
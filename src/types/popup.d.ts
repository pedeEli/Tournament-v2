declare namespace Popup {

  type Queue = Array<Message>

  type Message = {
    message: string,
    error?: boolean
  }

}
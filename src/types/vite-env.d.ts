/// <reference types="vite/client" />


declare namespace NodeJS {
  interface ProcessEnv {
    OPENED_FILE: string,
    PUBLIC: string
  }
}
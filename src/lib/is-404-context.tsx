import { createContext, useContext } from 'react'

const Is404Context = createContext<boolean>(false)

export function Is404Provider({ children }: { children: React.ReactNode }) {
  const is404 = typeof window !== 'undefined' && document.body.dataset.is404 === 'true'

  return <Is404Context.Provider value={is404}>{children}</Is404Context.Provider>
}

export function useIs404() {
  return useContext(Is404Context)
}

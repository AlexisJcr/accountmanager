// use-toast.ts

import * as React from "react"

let count = 0

function genId() {
  count++
  return count.toString()
}

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: string
  open: boolean
  onOpenChange?: (open: boolean) => void
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
  }, 1000) // Après 1 seconde, on supprime le toast

  toastTimeouts.set(toastId, timeout)
}

type State = {
  toasts: ToasterToast[]
}

type ToastAction =
  | {
      type: "ADD_TOAST"
      toast: ToasterToast
    }
  | {
      type: "DISMISS_TOAST"
      toastId: string
    }
  | {
      type: "REMOVE_TOAST"
      toastId: string
    }

const toastReducer = (state: State, action: ToastAction): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts],
      }
    case "DISMISS_TOAST": {
      const { toastId } = action
      addToRemoveQueue(toastId)
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: ToastAction) {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  const toast = React.useCallback(({
    ...props
  }: Omit<ToasterToast, "id">) => {
    const id = genId()
    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
      },
    })

    return {
      id,
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    }
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  }
}

export { useToast }

"use client"

import { Component, type ReactNode } from "react"

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ListingsGridErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("Listings grid render error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mb-16 rounded-2xl border border-border-brand bg-white px-8 py-12 text-center">
          <p className="text-lg text-text-mid">
            Something went wrong loading listings. Please refresh the page.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="btn-primary mt-6 cursor-pointer px-8 py-3"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

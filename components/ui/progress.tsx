import * as React from "react"

export function Progress({ value = 0 }: { value?: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

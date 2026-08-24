interface Props {
  message: string
}

export default function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-50 flex justify-center px-6">
      <div
        role="status"
        aria-live="polite"
        className="animate-toast-in rounded-full bg-text px-4 py-2.5 text-sm font-semibold text-bg shadow-lg"
      >
        {message}
      </div>
    </div>
  )
}

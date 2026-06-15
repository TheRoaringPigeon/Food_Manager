interface Props {
  password: string
}

const RULES = [
  { label: 'At least 8 characters',       test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter (A–Z)',       test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a–z)',       test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number (0–9)',                 test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$…)',   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function PasswordRequirements({ password }: Props) {
  return (
    <ul className="space-y-1">
      {RULES.map(({ label, test }) => {
        const met = test(password)
        return (
          <li
            key={label}
            className={`flex items-center gap-1.5 text-xs transition-colors duration-150 ${
              met ? 'text-green-600' : 'foreground-subtle'
            }`}
          >
            {met ? (
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" />
              </svg>
            )}
            {label}
          </li>
        )
      })}
    </ul>
  )
}

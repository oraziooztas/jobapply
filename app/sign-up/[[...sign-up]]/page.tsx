import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 dark:bg-gray-950">
      <SignUp />
    </div>
  )
}

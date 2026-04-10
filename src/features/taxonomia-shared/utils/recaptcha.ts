import { recaptchaKey } from '@/config/api'

export interface GrecaptchaWindow {
  grecaptcha?: {
    ready: (callback: () => void) => void
    execute: (siteKey: string, options: { action: string }) => Promise<string>
  }
}

/**
 * Appends reCAPTCHA token when the user is not logged in (legacy behavior).
 */
export async function appendRecaptchaTokenIfNeeded(
  params: Record<string, string | number | undefined>,
  action: string
): Promise<void> {
  const isLogged = Boolean(localStorage.getItem('token'))
  if (isLogged) {
    return
  }

  const w = window as GrecaptchaWindow
  if (!w.grecaptcha?.ready) {
    return
  }

  await new Promise<void>(resolve => {
    w.grecaptcha!.ready(() => resolve())
  })
  const token = await w.grecaptcha.execute(recaptchaKey as string, { action })
  params.recaptchaToken = token
}

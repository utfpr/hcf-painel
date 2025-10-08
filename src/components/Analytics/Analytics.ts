import LogRocket from 'logrocket';

export interface Analytics {
  identify(params: {readonly id: string; readonly name: string; readonly email?: string}): void
}

export class LogRocketAnalytics implements Analytics {

  constructor(appId: string) {
    LogRocket.init(appId)
  }

  identify(params: { readonly id: string; readonly name: string; readonly email?: string; }): void {

    const traits: Record<string, string | number> = {
      name: params.name,
    }
    if (params.email) {
      traits.email = params.email
    }

    LogRocket.identify(params.id, traits)
  }
}

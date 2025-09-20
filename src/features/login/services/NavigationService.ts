// hcf-painel/src/features/login/services/NavigationService.ts

export interface NavigationService {
  navigateToTombos: () => void;
}

export class NavigationServiceImpl implements NavigationService {
  constructor(private history: { push: (path: string) => void }) {}

  public navigateToTombos(): void {
    this.history.push('/tombos');
  }
}
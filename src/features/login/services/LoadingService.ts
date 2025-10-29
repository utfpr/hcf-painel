export interface LoadingService {
  setLoading: (loading: boolean) => void;
}

export class LoadingServiceImpl implements LoadingService {
  constructor(private loadCallback: (loading: boolean) => void) {}

  public setLoading(loading: boolean): void {
    this.loadCallback(loading);
  }
}
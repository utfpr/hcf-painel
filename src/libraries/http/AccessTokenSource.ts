export interface AccessTokenSource {
  getAccessToken(): string | undefined
}

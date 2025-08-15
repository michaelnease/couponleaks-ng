export type UrlPair = { signIn: string; signOut: string };
export type EnvCfg = {
  name: string;
  account: string;
  region: string;
  domainPrefix: string;
  uiUrls: UrlPair;
  adminUrls: UrlPair;
  tags: Record<string, string>;
};

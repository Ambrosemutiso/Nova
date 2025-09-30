export {};

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: "openid profile email https://www.googleapis.com/auth/user.phonenumbers.read";
            callback: (tokenResponse: { access_token: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

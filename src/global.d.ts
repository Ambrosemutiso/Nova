export {};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: { access_token: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}




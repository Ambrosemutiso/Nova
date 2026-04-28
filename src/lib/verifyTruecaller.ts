import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://api4.truecaller.com/v1/key",
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key: any) {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function verifyTruecallerToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(new Error("Invalid or expired Truecaller token"));
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

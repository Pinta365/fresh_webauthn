import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { config } from "base_config";
import { database, IAuthenticator, IUser } from "database";
import { base64 } from "base64";
import { username as username_utils } from "utils/username.ts";
import { Fido2, IAssertionExpectations } from "utils/fido2.ts";

const f2l = new Fido2(
  config.rpId,
  config.rpName,
  undefined,
  config.challengeTimeoutMs,
);

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async POST(req, ctx) {
    const { session } = ctx.state;

    const requstBody = await req.json();

    if (
      !requstBody?.id || !requstBody?.rawId || !requstBody?.response ||
      !requstBody?.type || requstBody?.type !== "public-key"
    ) {
      const resp = {
        "status": "failed",
        "message":
          "Response missing one or more of id/rawId/response/type fields, or type is not public-key!",
      };
      return Response.json(resp);
    }

    // Get user info
    const usernameClean = username_utils.clean(session.get("username"));
    const users = await database.getCollection<IUser>("users");
    const userInfo = await users.findOne({ userName: usernameClean });

    if (requstBody.response.attestationObject) {
      /* This is create cred */
      requstBody.rawId = base64.toArrayBuffer(requstBody.rawId, true);
      requstBody.response.attestationObject = base64.toArrayBuffer(
        requstBody.response.attestationObject,
        true,
      );
      const result = await f2l.attestation(
        requstBody,
        config.origin,
        session.get("challenge"),
      );

      const token: IAuthenticator = {
        credId: base64.fromArrayBuffer(result.authnrData.get("credId"), true),
        publicKey: result.authnrData.get("credentialPublicKeyPem"),
        type: requstBody.type,
        transports: requstBody.transports,
        counter: result.authnrData.get("counter"),
        created: new Date(),
      };

      const newAuthenticators = userInfo.authenticators
        ? [...userInfo.authenticators]
        : [];
      newAuthenticators.push(token);
      users.updateOne({ userName: usernameClean }, {
        authenticators: newAuthenticators,
        registered: true,
      });

      session.set("loggedIn", true);

      const resp = { "status": "ok" };
      return Response.json(resp);
    } else if (requstBody.response.authenticatorData !== undefined) {
      /* This is get assertion */
      //result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database.users[request.session.username].authenticators);
      // add allowCredentials to limit the number of allowed credential for the authentication process. For further details refer to webauthn specs: (https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialrequestoptions-allowcredentials).
      // save the challenge in the session information...
      // send authnOptions to client and pass them in to `navigator.credentials.get()`...
      // get response back from client (clientAssertionResponse)
      requstBody.rawId = base64.toArrayBuffer(requstBody.rawId, true);
      requstBody.response.userHandle = requstBody.rawId;

      let winningAuthenticator;
      for (const authrIdx in userInfo.authenticators) {
        const authr = userInfo.authenticators[parseInt(authrIdx, 10)];
        try {
          const assertionExpectations: IAssertionExpectations = {
            allowCredentials: session.get("allowCredentials"),
            challenge: session.get("challenge"),
            origin: config.origin,
            factor: "either",
            publicKey: authr.publicKey,
            prevCounter: authr.counter,
            userHandle: authr.credId,
          };
          const result = await f2l.assertion(
            requstBody,
            assertionExpectations,
          );

          winningAuthenticator = result;

          // Update authenticators
          userInfo.authenticators[parseInt(authrIdx, 10)].counter = result
            .authnrData.get("counter");
          await users.updateOne({ userName: userInfo.userName }, {
            authenticators: userInfo.authenticators,
          });
          break;
        } catch (_e) {
          console.error(_e);
        }
      }
      // authentication complete!
      if (winningAuthenticator && userInfo.registered) {
        session.set("loggedIn", true);

        const resp = { "status": "ok" };
        return Response.json(resp);

        // Authentication failed
      } else {
        const resp = {
          "status": "failed",
          "message": "Can not authenticate signature!",
        };
        return Response.json(resp);
      }
    } else {
      const resp = {
        "status": "failed",
        "message": "Can not authenticate signature!",
      };
      return Response.json(resp);
    }
  },
};

import { Handlers } from "$fresh/server.ts";
import { json, ReqWithBody } from "parsec";
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
    const body: ReqWithBody = req;
    await json(body);
    const { session } = ctx.state;

    const id: string = body.parsedBody?.id as string;
    const rawId: string = body.parsedBody?.rawId as string;
    const response: string = body.parsedBody?.response as string;
    const type: string = body.parsedBody?.type as string;

    if (!id || !rawId || !response || !type || type !== "public-key") {
      const resp = {
        "status": "failed",
        "message":
          "Response missing one or more of id/rawId/response/type fields, or type is not public-key!",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    // Get user info
    const usernameClean = username_utils.clean(session.get("username"));
    const users = await database.getCollection<IUser>("users");
    const userInfo = await users.findOne({ userName: usernameClean });

    const webauthnResp = body.parsedBody;

    if (webauthnResp.response.attestationObject !== undefined) {
      /* This is create cred */
      webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
      webauthnResp.response.attestationObject = base64.toArrayBuffer(
        webauthnResp.response.attestationObject,
        true,
      );
      const result = await f2l.attestation(
        webauthnResp,
        config.origin,
        session.get("challenge"),
      );

      const token: IAuthenticator = {
        credId: base64.fromArrayBuffer(result.authnrData.get("credId"), true),
        publicKey: result.authnrData.get("credentialPublicKeyPem"),
        type: webauthnResp.type,
        transports: webauthnResp.transports,
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
      return new Response(JSON.stringify(resp), { status: 200 });
    } else if (webauthnResp.response.authenticatorData !== undefined) {
      /* This is get assertion */
      //result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database.users[request.session.username].authenticators);
      // add allowCredentials to limit the number of allowed credential for the authentication process. For further details refer to webauthn specs: (https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialrequestoptions-allowcredentials).
      // save the challenge in the session information...
      // send authnOptions to client and pass them in to `navigator.credentials.get()`...
      // get response back from client (clientAssertionResponse)
      webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
      webauthnResp.response.userHandle = webauthnResp.rawId;

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
            webauthnResp,
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
        return new Response(JSON.stringify(resp), { status: 200 });

        // Authentication failed
      } else {
        const resp = {
          "status": "failed",
          "message": "Can not authenticate signature!",
        };
        return new Response(JSON.stringify(resp), { status: 200 });
      }
    } else {
      const resp = {
        "status": "failed",
        "message": "Can not authenticate signature!",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }
  },
};

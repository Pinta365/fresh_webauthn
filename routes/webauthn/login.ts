import { Handlers } from "$fresh/server.ts";
import { config } from "base_config";
import { database, IUser } from "database";
import { Fido2 } from "utils/fido2.ts";
import { username as username_utils } from "utils/username.ts";
import { WithSession } from "fresh_session";

const f2l = new Fido2(
  config.rpId,
  config.rpName,
  undefined,
  config.challengeTimeoutMs,
);

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async POST(req, ctx) {
    const body = await req.json();
    const { session } = ctx.state;

    const username: string = body.username;

    if (!username) {
      const resp = {
        "status": "failed",
        "message": "Request missing username field!",
      };
      return Response.json(resp);
    }

    // Get user info
    const usernameClean = username_utils.clean(username);
    const users = await database.getCollection<IUser>("users");
    const userInfo = await users.findOne({ userName: usernameClean });

    if (!userInfo || !userInfo.registered || !usernameClean) {
      const resp = {
        "status": "failed",
        "message": `User ${usernameClean} does not exist!`,
      };
      return Response.json(resp);
    }

    if (
      !userInfo || !userInfo.authenticators ||
      userInfo.authenticators.length === 0
    ) {
      const resp = {
        "status": "failed",
        "message": `User ${usernameClean} can not log in!`,
      };
      return Response.json(resp);
    }

    const assertionOptions = await f2l.login();

    // Transfer challenge and username to session
    session.set("challenge", assertionOptions.challenge);
    session.set("username", usernameClean);

    // Pass this, to limit selectable credentials for user... This may be set in response instead, so that
    // all of a users server (public) credentials isn't exposed to anyone
    const allowCredentials = [];
    for (const authr of userInfo.authenticators) {
      allowCredentials.push({
        type: authr.type,
        id: authr.credId,
        transports: authr.transports,
      });
    }

    assertionOptions.allowCredentials = allowCredentials;

    session.set("allowCredentials", allowCredentials);

    return Response.json(assertionOptions);
  },
};

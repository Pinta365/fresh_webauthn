import { Handlers } from "$fresh/server.ts";
import { json, ReqWithBody } from "parsec";
import { config } from "../../config.ts";
import { database, IUser } from "../../db/db.ts";
import { Fido2, } from "../../utils/fido2.ts";
import { username as username_utils } from "../../utils/username.ts";
import { WithSession } from "fresh_session";

const f2l = new Fido2(
  config.rpId,
  config.rpName,
  undefined,
  config.challengeTimeoutMs,
);

export type Data = { session: Record<string, string> };

export const handler: Handlers< Data, WithSession> = {
  async POST(req, ctx) {
    const body: ReqWithBody = req;
    await json(body);
    const { session } = ctx.state;

    const username: string = body.parsedBody?.username as string;

    if (!username) {
      const resp = {
        "status": "failed",
        "message": "Request missing username field!",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
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
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    if (
      !userInfo || !userInfo.authenticators ||
      userInfo.authenticators.length === 0
    ) {
      const resp = {
        "status": "failed",
        "message": `User ${usernameClean} can not log in!`,
      };
      return new Response(JSON.stringify(resp), { status: 200 });
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

    return new Response(JSON.stringify(assertionOptions), { status: 200 });
  }
};

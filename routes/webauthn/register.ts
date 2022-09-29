import { Handlers } from "$fresh/server.ts";
import { json, ReqWithBody } from "parsec";
import { config } from "base_config";
import { database, IUser } from "database";
import { Fido2 } from "fido2_utils";
import { base64 } from "base64";
import { username as username_utils } from "username_utils";
import { WithSession } from "fresh_session";

const userNameMaxLenght = 25;

const f2l = new Fido2(
  config.rpId,
  config.rpName,
  undefined,
  config.challengeTimeoutMs,
);

/**
 * Returns base64url encoded buffer of the given length
 * @param  {Number} len - length of the buffer
 * @return {String}     - base64url random buffer
 */
const randomBase64URLBuffer = (len: number) => {
  len = len || 32;
  const randomBytes = new Uint8Array(len);
  crypto.getRandomValues(randomBytes);
  return base64.fromArrayBuffer(randomBytes, true);
};

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async POST(req, ctx) {
    const body: ReqWithBody = req;
    await json(body);
    const { session } = ctx.state;

    const username: string = body.parsedBody?.username as string;
    const name: string = body.parsedBody?.name as string;

    if (!username || !name) {
      const resp = {
        "status": "failed",
        "message": "Request missing name or username field!",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }
    const usernameClean = username_utils.clean(username);

    if (!usernameClean) {
      const resp = {
        "status": "failed",
        "message": "Request missing name or username field!",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    if (usernameClean.length > userNameMaxLenght) {
      const resp = {
        "status": "failed",
        "message": "Username " + usernameClean +
          " too long. Max username lenght is " + userNameMaxLenght +
          " characters!",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    const users = await database.getCollection<IUser>("users");
    const userInfo = await users.findOne({ userName: usernameClean });

    if (userInfo && userInfo.registered) {
      const resp = {
        "status": "failed",
        "message": `Username ${usernameClean} already exists`,
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    const id = randomBase64URLBuffer(32);

    await users.insertOne({
      userName: usernameClean,
      name: name,
      registered: false,
      id: id,
      authenticators: [],
      oneTimeToken: undefined,
      recoveryEmail: undefined,
    });

    const challengeMakeCred = await f2l.registration(
      usernameClean,
      usernameClean,
      id,
    );

    // Transfer challenge and username to session
    session.set("challenge", challengeMakeCred.challenge);
    session.set("username", usernameClean);

    // Respond with credentials
    return new Response(JSON.stringify(challengeMakeCred), {
      status: 200,
    });
  },
};

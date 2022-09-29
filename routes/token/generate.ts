import { Handlers } from "$fresh/server.ts";
import { json, ReqWithBody } from "parsec";
import { config } from "base_config";
import { database, IUser } from "database";
import { token } from "token_utils";
import { WithSession } from "fresh_session";

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async GET(req, ctx) {
    const body: ReqWithBody = req;
    await json(body);
    const { session } = ctx.state;

    if (!session.get("loggedIn")) {
      const resp = {
        "status": "failed",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    const username = session.get("username"),
      tokenValidator = token.generate(
        username,
        config.loginTokenExpireSeconds * 1000,
      );

    if (!tokenValidator) {
      const resp = {
        "status": "failed",
      };
      return new Response(JSON.stringify(resp), { status: 200 });
    }

    const tokenEncoded = token.encode(tokenValidator.token);

    const users = await database.getCollection<IUser>("users");
    await users.updateOne({ userName: username }, {
      oneTimeToken: tokenValidator,
    });

    const resp = {
      "status": "ok",
      "token": tokenEncoded,
      "validForSeconds": config.loginTokenExpireSeconds,
      "url": config.baseUrl + "/token/login/" + username + "/" +
        tokenEncoded,
    };
    return new Response(JSON.stringify(resp), { status: 200 });
  },
};

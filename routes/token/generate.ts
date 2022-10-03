import { Handlers } from "$fresh/server.ts";
import { config } from "base_config";
import { database, IUser } from "database";
import { token } from "utils/token.ts";
import { WithSession } from "fresh_session";

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async GET(req, ctx) {
    const body = req.json();
    
    const { session } = ctx.state;

    if (!session.get("loggedIn")) {
      const resp = {
        "status": "failed",
      };
      return Response.json(resp);
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
      return Response.json(resp);
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
    return Response.json(resp);
  },
};

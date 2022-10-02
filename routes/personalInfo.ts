import { Handlers } from "$fresh/server.ts";
import { json, ReqWithBody } from "parsec";
import { token } from "utils/token.ts";
import { database, IUser } from "database";
import { WithSession } from "fresh_session";

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async GET(req, ctx) {
    const body: ReqWithBody = req;
    await json(body);
    const { session } = ctx.state;

    const loggedIn = await session.get("loggedIn");

    if (!loggedIn) {
      const resp = {
        "status": "failed",
        "message": "Access denied",
      };
      return Response.json(resp);
    } else {
      const username = await session.get("username");
      const users = await database.getCollection<IUser>("users");
      let tokenInfo = undefined;
      const userInfo = await users.findOne({ userName: username });
      if (userInfo.oneTimeToken) {
        if (userInfo.oneTimeToken.expires > new Date().getTime()) {
          tokenInfo = {
            token: token.encode(userInfo.oneTimeToken.token),
            expires: userInfo.oneTimeToken.expires,
          };
        } else {
          tokenInfo = undefined;
          userInfo.oneTimeToken = undefined;
        }
      }
      const resp = {
        "status": "ok",
        "authenticators": userInfo.authenticators,
        "name": userInfo.name,
        "oneTimeToken": tokenInfo,
        "recoveryEmail": userInfo.recoveryEmail,
      };
      return Response.json(resp);
    }
  },
};

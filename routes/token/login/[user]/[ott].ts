import { Handlers } from "$fresh/server.ts";
import { username as username_utils } from "utils/username.ts";
import { database, IUser } from "database";
import { token } from "utils/token.ts";
import { WithSession } from "fresh_session";

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state;

    const oneTimeToken = ctx.params?.ott;
    const userName = ctx.params?.user;

    // Check that token exists
    if (!oneTimeToken) {
      const resp = {
        "status": "failed",
        "message": "Invalid token",
      };
      return Response.json(resp);
    }

    // Check username
    const usernameClean = username_utils.clean(userName);
    if (!usernameClean) {
      const resp = {
        "status": "failed",
        "message": "Invalid user",
      };
      return Response.json(resp);
    }

    // Check that user exists
    const users = await database.getCollection<IUser>("users");
    const userInfo = await users.findOne({ userName: usernameClean });
    if (!userInfo || !userInfo.registered) {
      const resp = {
        "status": "failed",
        "message": `User ${usernameClean} does not exist!`,
      };
      return Response.json(resp);
    }

    // Check that token validator exists
    if (!userInfo.oneTimeToken) {
      const resp = {
        "status": "failed",
        "message": "Invalid token",
      };
      return Response.json(resp);
    }

    // Validate token
    if (token.validate(usernameClean, oneTimeToken, userInfo.oneTimeToken)) {
      // Log in user
      session.set("username", usernameClean);
      session.set("loggedIn", true);

      // Remove token
      await users.updateOne({ userName: usernameClean }, {
        oneTimeToken: undefined,
      });

      // Success
      //return Response.redirect(config.baseUrl); //
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    } else {
      const resp = {
        "status": "failed",
        "message": "Invalid token",
      };
      return Response.json(resp);
    }
  },
};

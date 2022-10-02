import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  GET(_req, ctx) {
    const { session } = ctx.state;

    session.set("loggedIn", false);
    session.set("username", undefined);

    const resp = {
      "status": "ok",
    };
    return Response.json(resp);
  },
};

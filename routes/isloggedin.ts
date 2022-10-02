import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";

export type Data = { session: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
    async GET(_req, ctx) {
        const { session } = ctx.state;

        const loggedIn = await session.get("loggedIn");

        if (!loggedIn) {
            const resp = {
                "status": "failed"
            };
            return Response.json(resp);
        } else {
            const resp = {
                "status": "ok"
            };
            return Response.json(resp);
        }
    },
};
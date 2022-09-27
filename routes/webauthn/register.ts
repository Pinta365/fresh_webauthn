import { HandlerContext } from "$fresh/server.ts";

export async function handler(_req: Request, _ctx: HandlerContext) {

    try {
        const todo = await {test: 'testing'};

        // return todo 
        return Response.json(JSON.stringify(todo));

    } catch (error) {

        return new Response(error);
    }

}
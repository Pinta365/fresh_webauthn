import { Head } from '$fresh/runtime.ts'
import { Handlers, PageProps } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { RegisterContainer } from "../components/RegisterContainer.tsx";

export type Data = { session: Record<string, string|boolean> };

export const handler: Handlers<Data, WithSession> = {
    GET(_req, ctx) {
        const { session } = ctx.state;
        session.set("loggedIn", false);
        //session.get("loggedIn");

        return ctx.render({
            session: session.data
        });
    },
};

export default function Home({ data }: PageProps<Data>) {

    return (
        <div>
            <Head>
                <title></title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
                <link rel="stylesheet" href="css/demo.css" />
            </Head>

            <div id="header">
                <h1>Web Authentication API demo</h1>
            </div>
            <div>loggedIn {data.session.loggedIn}</div>

            {data.session.loggedIn
                ? <div>Auth ok..</div> // Component for logged in
                : <RegisterContainer /> // Component for not logged in
            }

            {/*<!-- External dependencies -->*/}
            <script src="https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/@hexagon/base64@1/dist/base64.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.min.js"></script>

            {/*<!-- Internals-->*/}
            <script src="js/utils.js"></script>
            <script src="js/view.js"></script>
            <script src="js/webauthn.auth.js"></script>

        </div>
    );
}

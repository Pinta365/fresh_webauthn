/** @jsxImportSource preact */
import { Header } from "@/components/Header.tsx";
import { MainContainer } from "@/components/MainContainer.tsx";
import { RegisterContainer } from "@/components/RegisterContainer.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { WithSession } from "fresh_session";

export type Data = { isLoggedIn: Record<string, string> };

export const handler: Handlers<Data, WithSession> = {
  async GET(_, ctx) {
    const { session } = ctx.state;
    return ctx.render({ isLoggedIn: await session.get("loggedIn") });
  },
};

export default function Home({ data }: PageProps) {
  const { isLoggedIn } = data;
  return (
    <div>
      <Header />

      {
        /* När vi är inloggad och renderar MainContainer måste vi göra
          allt som sker i renderMainContainer()->view.js också antar jag...*/
      }
      {isLoggedIn ? <MainContainer /> : <RegisterContainer />}

      {/*<!-- External dependencies -->*/}
      <script src="https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js">
      </script>
      <script src="https://cdn.jsdelivr.net/npm/@hexagon/base64@1/dist/base64.min.js">
      </script>
      <script src="https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.min.js">
      </script>

      {/*<!-- Internals-->*/}
      <script src="js/utils.js"></script>
      <script src="js/view.js"></script>
      <script src="js/webauthn.auth.js"></script>
    </div>
  );
}

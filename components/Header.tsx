/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";

export function Header() {
  return (
    <div>
      <Head>
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
        />
        <link rel="stylesheet" href="css/demo.css" />
      </Head>

      <div id="header">
        <h1>Web Authentication API demo</h1>
      </div>
    </div>
  );
}

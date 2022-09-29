import { Head } from "$fresh/runtime.ts";

export default function Home() {
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

      <div id="mainContainer">
        <h3>
          Hey <span id="name"></span>!
        </h3>
        <div id="login-token">
          <blockquote>
            <h4>Login token active</h4>
            <p>
              To log in on another device, send the link below, or scan the QR
              code. This will enable you to add local credentials from that
              device.
            </p>
            <p>
              Token will expire at <span id="login-token-expires"></span>
            </p>
            <p>
              Link: <span id="login-token-link"></span>
            </p>
            <p id="login-token-qr"></p>
          </blockquote>
        </div>
        <h4>Your credentials</h4>
        <table id="credential-table">
          <thead>
            <th width="10%">Counter</th>
            <th>Public Key</th>
            <th width="25%">Created</th>
          </thead>
          <tbody>
          </tbody>
        </table>
        <button id="button-add-credential">Add credential</button>
        <button id="button-generate-token">Generate login token</button>
        <button id="button-logout">Logout</button>
      </div>

      <div id="registerContainer">
        <div class="left-column fl pr-40">
          <h3>What is Web Authentication API?</h3>
          <blockquote>
            The Web Authentication API (also known as WebAuthn) is a
            specification written by the W3C and FIDO, with the participation of
            Google, Mozilla, Microsoft, Yubico, and others. The API allows
            servers to register and authenticate users using public key
            cryptography instead of a password.
            <p class="">
              <a href="https://webauthn.guide/">https://webauthn.guide</a>
            </p>
          </blockquote>
          <h3>How do i try it?</h3>
          <p>
            Register here by entering a username and clicking{" "}
            <i>Register</i>, the browser will then ask you for your public key
            credentials.
          </p>
          <p>The following providers is currently working</p>
          <ul>
            <li>Windows Hello</li>
            <li>Android Screen Lock</li>
            <li>A security key (for example a Yubikey with FIDO2 support).</li>
          </ul>
          <p>
            It is possible to add more providers to the same account after
            logging in.
          </p>
          <p>
            The backend store users/credentials in-file, and will be restored at
            next restart.
          </p>
          <h3>Where can I see the internals?</h3>
          <p>
            Source code available at{" "}
            <a href="https://github.com/Hexagon/webauthn-skeleton/tree/server/deno">
              github.com/hexagon/webauthn-skeleton/tree/server/deno
            </a>
          </p>
          <p>
            Powered by <a href="https://deno.land">Deno</a>,{" "}
            <a href="https://fresh.deno.dev/">Fresh</a> and{" "}
            <a href="https://github.com/webauthn-open-source/fido2-lib">
              fido2-lib
            </a>
          </p>
        </div>
        <div class="right-column fl">
          <h2>
            <i class="fas fa-user-ninja"></i>&nbsp;Enter username
          </h2>
          <input type="text" class="full" id="username" maxLength={25} />
          <button class="button-primary fl half" id="button-register">
            Register
          </button>
          <button class="button-primary fl half" id="button-login">
            Login
          </button>
        </div>
      </div>

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

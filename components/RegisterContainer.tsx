/** @jsxImportSource preact */

export function RegisterContainer() {
  return (
    <div id="registerContainer">
      <div class="left-column fl pr-40">
        <h3>What is Web Authentication API?</h3>
        <blockquote>
          The Web Authentication API (also known as WebAuthn) is a specification
          written by the W3C and FIDO, with the participation of Google,
          Mozilla, Microsoft, Yubico, and others. The API allows servers to
          register and authenticate users using public key cryptography instead
          of a password.
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
          It is possible to add more providers to the same account after logging
          in.
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
  );
}

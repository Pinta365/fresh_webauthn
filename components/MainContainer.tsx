/** @jsxImportSource preact */

export function MainContainer() {
  return (
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
  );
}

// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/_middleware.ts";
import * as $1 from "./routes/index.tsx";
import * as $2 from "./routes/isloggedin.ts";
import * as $3 from "./routes/logout.ts";
import * as $4 from "./routes/personalInfo.ts";
import * as $5 from "./routes/token/generate.ts";
import * as $6 from "./routes/token/login/[user]/[ott].ts";
import * as $7 from "./routes/webauthn/add.ts";
import * as $8 from "./routes/webauthn/login.ts";
import * as $9 from "./routes/webauthn/register.ts";
import * as $10 from "./routes/webauthn/response.ts";

const manifest = {
  routes: {
    "./routes/_middleware.ts": $0,
    "./routes/index.tsx": $1,
    "./routes/isloggedin.ts": $2,
    "./routes/logout.ts": $3,
    "./routes/personalInfo.ts": $4,
    "./routes/token/generate.ts": $5,
    "./routes/token/login/[user]/[ott].ts": $6,
    "./routes/webauthn/add.ts": $7,
    "./routes/webauthn/login.ts": $8,
    "./routes/webauthn/register.ts": $9,
    "./routes/webauthn/response.ts": $10,
  },
  islands: {},
  baseUrl: import.meta.url,
  config,
};

export default manifest;

# MERN Authentication Project

A complete authentication system built with MongoDB, Express, React and Node.
The JWT lives in an HTTP-only cookie, and every email step (signup verification,
password reset, email change) uses a 6-digit one-time code sent through Brevo.

---

## 1. Features

- Sign up with full name, email and password, validated on both sides
- 6-digit OTP emailed to confirm the address, with a 10-minute expiry
- Log in with a JWT issued as an HTTP-only cookie, never handed to JavaScript
- Session survives a page refresh, restored from the cookie on startup
- Forgot password in three steps: request a code, verify it, set a new password
- Change email with a code sent to the *new* address before anything is updated
- Profile page to view and edit your name, and to verify or change your email
- Protected routes that wait for the session check instead of flashing the login page
- Responsive layout with a desktop navbar and a mobile sidebar
- Loading states on every request, with buttons disabled while they run

---

## 2. Technology stack

**Frontend** — React 18, Vite, JavaScript, React Router DOM, Context API, Axios, plain CSS

**Backend** — Node.js, Express, MongoDB, Mongoose, JSON Web Token, bcryptjs,
Nodemailer with Brevo SMTP, dotenv, cookie-parser, CORS. ES modules throughout.

---

## 3. Folder structure

```
PROJECT/
├── README.md
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx                     mounts React, Router and AuthProvider
│       ├── App.jsx                      all routes and their guards
│       ├── index.css                    the app's only stylesheet
│       ├── services/
│       │   └── api.js                   Axios instance, withCredentials: true
│       ├── context/
│       │   └── AuthContext.jsx          user state + every auth API call
│       ├── components/
│       │   ├── Navbar.jsx               desktop links and mobile sidebar
│       │   ├── OtpForm.jsx              the 6-digit form, reused three times
│       │   ├── ProtectedRoute.jsx       requires a session
│       │   ├── PublicRoute.jsx          keeps logged-in users off /login
│       │   ├── Alert.jsx                error and success messages
│       │   └── Spinner.jsx
│       ├── pages/
│       │   ├── Signup.jsx
│       │   ├── Login.jsx
│       │   ├── VerifyEmail.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── VerifyForgotPasswordOTP.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── Home.jsx
│       │   ├── Profile.jsx
│       │   └── ChangeEmail.jsx
│       └── assets/
│
└── server/
    ├── server.js                        entry point
    ├── package.json
    ├── .env.example
    ├── config/
    │   ├── db.js                        Mongoose connection
    │   └── mail.js                      Nodemailer + Brevo, OTP email senders
    ├── controllers/
    │   └── authController.js            all the business logic
    ├── middleware/
    │   ├── authMiddleware.js            reads and verifies the cookie
    │   └── errorMiddleware.js           404 handler + central error handler
    ├── models/
    │   └── userModel.js                 the User schema
    ├── routes/
    │   └── authRoutes.js                maps URLs to controller functions
    └── utils/
        ├── generateOTP.js               secure OTP and reset-token generation
        ├── token.js                     JWT signing and cookie options
        ├── validators.js                shared validation rules
        └── asyncHandler.js              forwards async errors to Express
```

---

## 4. Install dependencies

You need Node.js 18 or newer.

```bash
cd server
npm install

cd ../client
npm install
```

---

## 5. Set up MongoDB

Pick one of the two.

**Local MongoDB** — install MongoDB Community Server, make sure it is running,
and use:

```
MONGO_URI=mongodb://127.0.0.1:27017/mern_auth
```

**MongoDB Atlas (free, no local install)**

1. Create an account at mongodb.com and make a free M0 cluster.
2. Database Access → add a database user, and note the username and password.
3. Network Access → add your IP address, or `0.0.0.0/0` while developing.
4. Cluster → Connect → Drivers → copy the connection string, then put your real
   password in it and add the database name:

```
MONGO_URI=mongodb+srv://user:password@cluster0.abcde.mongodb.net/mern_auth
```

The server connects first and only starts listening once that succeeds, so a bad
URI shows up straight away in the terminal rather than as a broken request later.

---

## 6. Set up Brevo (for the emails)

1. Sign up at brevo.com — the free tier covers plenty of test emails.
2. Senders, Domains & Dedicated IPs → add a sender address and confirm it. Emails
   must come *from* that verified address, or Brevo rejects them.
3. SMTP & API → SMTP tab. You will see a login (usually your account email) and a
   master password / SMTP key. Copy both.
4. Fill in `server/.env`:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-login
BREVO_SMTP_PASSWORD=your-brevo-smtp-key
MAIL_FROM="MERN Auth <your-verified-sender@example.com>"
```

These stay on the server. React never sees them — the browser only ever asks the
API to send an email, it never talks to Brevo.

---

## 7. Configure `.env`

Copy each example file and fill in the blanks:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
COOKIE_SAME_SITE=lax

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=
BREVO_SMTP_PASSWORD=
MAIL_FROM="MERN Auth <you@yourdomain.com>"
```

Generate a real `JWT_SECRET` rather than typing something short:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**client/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

Vite only exposes variables that start with `VITE_`, which is why the API URL has
that prefix and why no secret ever belongs in this file. Both `.env` files are
git-ignored; the `.env.example` files hold placeholders only and are safe to commit.

---

## 8. Run the backend

```bash
cd server
npm run dev     # nodemon, restarts on save
# or: npm start
```

It listens on `http://localhost:5000`, and the API lives under
`http://localhost:5000/api`. `GET /api/health` is a quick way to check it is up.

---

## 9. Run the frontend

In a second terminal:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`. Keep both terminals running.

---

## 10. API endpoints

All under `/api/auth`. Every response has the shape
`{ success, message, ...data }`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/signup` | — | Create the account, email an OTP |
| POST | `/login` | — | Check credentials, set the cookie |
| POST | `/logout` | — | Clear the cookie |
| POST | `/verify-email` | — | Confirm the address with an OTP |
| POST | `/resend-verification-otp` | — | Send a fresh verification OTP |
| POST | `/forgot-password` | — | Email a password-reset OTP |
| POST | `/verify-forgot-password-otp` | — | Check that OTP, return a reset token |
| POST | `/reset-password` | — | Set the new password using that token |
| GET | `/me` | cookie | Who is logged in (used to restore the session) |
| GET | `/profile` | cookie | The current user's details |
| PUT | `/profile` | cookie | Update the full name |
| POST | `/request-change-email` | cookie | Email an OTP to the new address |
| POST | `/verify-change-email` | cookie | Confirm it and switch the email over |

Errors use ordinary status codes: `400` invalid input, `401` not authenticated,
`403` email not verified, `409` email already taken, `500` server problem.

---

## 11. Authentication flow

```
Signup
  ↓  account created, password hashed, OTP emailed
Verify email
  ↓  isVerified = true, OTP destroyed
Login
  ↓  JWT signed and put in the accessToken HTTP-only cookie
Home / Profile
```

Logging in before verifying returns `403` with `requiresVerification: true`, and
the React app sends you to the verification screen instead of showing an error.

### JWT in an HTTP-only cookie

On a successful login the server signs a JWT containing only the user's id and
attaches it with `res.cookie("accessToken", token, options)`. The options are:

| Option | Value | Why |
| --- | --- | --- |
| `httpOnly` | `true` | JavaScript cannot read the cookie, so an XSS bug cannot steal the session |
| `secure` | `true` in production | The cookie is only sent over HTTPS |
| `sameSite` | `lax` locally, `none` cross-site | Controls whether the browser attaches it to requests from other sites |
| `maxAge` | 7 days | How long the session lasts |
| `path` | `/` | Sent to every route on the API |

The token is never part of a JSON response body and is never put in
`localStorage` or `sessionStorage`. `localStorage` is readable by any script on
the page, so a single injected script could copy the token and impersonate the
user for as long as it stays valid. An HTTP-only cookie removes that whole class
of attack. The trade-off is that cookies are sent automatically, which is what
CSRF exploits — see section 15.

**In production, `secure: true` means the cookie only travels over HTTPS.** Serve
both the API and the frontend over HTTPS or the browser will silently drop it and
nobody will be able to log in. If the two are on different sites you also need
`COOKIE_SAME_SITE=none`, which itself requires `secure: true`.

### CORS and `withCredentials`

Cookies across origins need both sides to agree, and it is easy to set up one
half and wonder why login "works" but every later request is a `401`.

On the server:

```js
app.use(cors({ origin: CLIENT_URL, credentials: true }));
```

`credentials: true` lets the browser keep the `Set-Cookie` that comes back. The
origin must be the exact frontend URL — a browser rejects `*` when credentials
are involved, so `CLIENT_URL` has no trailing slash and must match what Vite serves.

On the client, once, in `services/api.js`:

```js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
```

`withCredentials: true` is what makes Axios send the cookie. Because it is set on
the shared instance, every call in `AuthContext` inherits it. There is no
`Authorization: Bearer` header anywhere in this project.

### Session restoration with `/api/auth/me`

React state disappears on refresh, so it cannot be the source of truth for
"am I logged in". The cookie can, because the browser keeps it.

```
Open the app
  ↓  AuthContext runs checkAuth() in a useEffect
GET /api/auth/me
  ↓  the browser attaches the cookie automatically
authMiddleware reads and verifies the JWT
  ↓
the user is returned, context stores it, loading becomes false
```

`AuthContext` starts with `loading: true`. `ProtectedRoute` renders a spinner
while that is true and only then decides whether to redirect — otherwise a
logged-in user refreshing `/profile` would be bounced to `/login` for a moment
before being sent back. A `401` here is normal: it just means nobody is logged in.

### Logout

Only the server can delete an HTTP-only cookie, so logging out is a round trip:

1. `POST /api/auth/logout`
2. the server calls `res.clearCookie("accessToken", options)` with the **same**
   `httpOnly`, `secure`, `sameSite` and `path` it used when setting it — if any
   of those differ the browser treats it as a different cookie and keeps the old one
3. context clears `user`, so `isAuthenticated` becomes false
4. React Router redirects to `/login`

The logout button appears in both the desktop navbar and the mobile sidebar.

---

## 12. How Context API shares the user with Profile

`main.jsx` wraps the app in `<AuthProvider>`, so anything below it can call
`useAuth()`. The provider holds `user` and `loading`, and owns every auth API
call — `login`, `signup`, `logout`, `checkAuth`, `fetchProfile`,
`updateProfile`, `verifyEmail`, `requestChangeEmail`, `verifyChangeEmail` and the
password-reset functions.

Nothing is passed down through props. `Profile` reads `const { user } = useAuth()`
directly, and so do `Home` and `Navbar`. When `updateProfile` succeeds it calls
`setUser(data.user)`, and all three re-render with the new name at once — no
manual refresh, no prop threading through intermediate components.

Every context function returns `{ success, message, ... }` rather than throwing,
so pages handle the outcome with a plain `if` instead of `try`/`catch`.

---

## 13. How one OTP system serves three flows

`utils/generateOTP.js` generates the code with `crypto.randomInt`, a
cryptographically secure generator. `Math.random()` is predictable enough to
guess and must not be used here. `config/mail.js` has one `sendOtpEmail` helper
and three thin wrappers over it, so all three emails share the same layout.
On the frontend, `components/OtpForm.jsx` is the single 6-digit form, reused by
all three screens with different labels and a different submit handler.

The three flows differ in where the code is stored and what verifying it does:

| Flow | Fields used | On success |
| --- | --- | --- |
| Signup verification | `otp`, `otpExpiresAt`, `otpPurpose: "verify-email"` | `isVerified = true`, OTP cleared |
| Forgot password | `otp`, `otpExpiresAt`, `otpPurpose: "forgot-password"` | OTP cleared, a `resetToken` is issued |
| Change email | `pendingEmail`, `pendingEmailOtp`, `pendingEmailOtpExpiresAt` | `email` replaced, pending fields cleared |

`otpPurpose` matters: without it, a code emailed to verify an address could be
replayed against the password-reset endpoint. Each endpoint checks the purpose
as well as the code and the expiry.

Every code is single use — it is deleted the moment it works — and expires after
10 minutes.

### Forgot-password flow

```
Login → Forgot password → enter email → receive OTP → verify OTP
  → enter new password → confirm → password changed → log in
```

Verifying the OTP consumes it and returns a separate single-use `resetToken`
(random 32 bytes, stored as a SHA-256 hash, valid 15 minutes). The final step
needs that token, so the code itself is not sent over the wire twice, and only
the hash is in the database — a leaked database row cannot be replayed as a token.
The React app carries the token in router state, never in `localStorage`.

`POST /forgot-password` answers the same way whether or not the email exists, so
the endpoint cannot be used to work out who has an account.

### Change-email flow

```
Profile → Change email → enter new email → OTP sent to the NEW address
  → verify OTP → email updated → status updated
```

The new address is parked in `pendingEmail` and the account's real `email` is
untouched until the code sent to that new address is verified. That ordering is
the point: starting the flow proves nothing, so nothing changes. Requesting
another code overwrites the pending fields, which invalidates the previous one.
The server refuses an address that is already yours or already registered to
someone else, and re-checks that at the final step in case it was claimed in
between. Since the code was delivered to the new address, verifying it proves
ownership, so `isVerified` is set to `true`.

---

## 14. Common errors and fixes

**`MONGO_URI is missing. Add it to server/.env`** — you created `.env.example`
but not `.env`, or you left the value blank.

**`MongooseServerSelectionError` / connection timeout** — Atlas has not
whitelisted your IP (Network Access), your local `mongod` is not running, or the
password in the connection string is wrong. If your password contains `@`, `:`
or `/`, URL-encode it.

**Login seems to work but every later request is `401`** — this is almost always
the cookie. Check all four: `withCredentials: true` on the Axios instance,
`credentials: true` in the CORS options, `CLIENT_URL` exactly matching the
frontend origin, and — in production — HTTPS on both sides with
`COOKIE_SAME_SITE=none`. In your browser's Application → Cookies panel you should
see `accessToken` after logging in.

**CORS error in the console** — `CLIENT_URL` does not match. Vite sometimes moves
to port 5174 if 5173 is taken; the origin has to match whatever it actually printed.

**`Email is not configured on the server. Missing: ...`** — one of the five Brevo
variables is empty. The message names which, and never prints values.

**No email arrives** — check spam first. Then confirm `MAIL_FROM` uses an address
you verified in Brevo; an unverified sender is the usual cause. The Brevo
dashboard has a transactional email log showing what was accepted or rejected.
The server logs the failure and returns a `502`, so nothing appears to succeed
silently.

**"That code is not valid" for a code you just received** — it may have expired
(10 minutes), already been used, or been superseded by a newer one. Request another.

**`/api/auth/me` returns 401 on first load** — expected when nobody is logged in.
`AuthContext` treats it as "no session" rather than an error.

**`JWT_SECRET is missing`** — add it to `.env` and restart. Changing it later
invalidates every existing cookie, so everyone has to log in again.

**Login page flashes on refresh** — `ProtectedRoute` must return early while
`loading` is true, before checking `isAuthenticated`.

---

## 15. Security notes

What this project does:

- passwords hashed with bcrypt in a Mongoose `pre("save")` hook, so a plain-text
  password cannot reach the database from any code path
- password, OTP and token fields marked `select: false`, plus a `toJSON`
  transform that strips them — they cannot leak by accident
- every rule enforced on the server, not just in the forms
- identical replies for wrong password and unknown email, and for
  forgot-password whether or not the account exists
- OTPs and reset tokens generated with `crypto`, expiring and single use
- reset tokens stored only as hashes
- no secrets in the repo; `.env` is git-ignored and `.env.example` has placeholders
- stack traces logged on the server, never sent in production responses

### CSRF, and what is left to add

Cookies are attached to requests automatically, which is exactly what makes them
convenient and exactly what CSRF abuses: another site can cause your browser to
POST to this API with your cookie along for the ride.

`sameSite` is the defence in use here. With `lax`, the browser will not attach
the cookie to a cross-site POST at all, which covers the state-changing routes.
This is why `lax` is the local default and why it is worth keeping in production
whenever the client and API are on the same site.

If you deploy them to different sites you need `sameSite: none`, and that
protection is gone. At that point add a proper synchroniser-token or
double-submit-cookie scheme covering every non-GET route, and keep it consistent
with the `sameSite` value you chose. A partial CSRF layer is worse than none,
because it looks like protection. That has deliberately been left out rather than
half-built.

Also worth adding before real use: rate limiting on login, signup, and the OTP
endpoints (`express-rate-limit`) so codes and passwords cannot be brute-forced;
a cap on OTP attempts per code; and `helmet` for security headers.

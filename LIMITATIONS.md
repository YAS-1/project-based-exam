# System Limitations

This document records known product and security limitations identified during development and testing.

## 1) Password Input Usability (No "show password" toggle)

- **Observed issue:** Users cannot temporarily reveal the password while typing.
- **Why it is a limitation:** It increases the chance of typing mistakes, especially on small screens or when using complex passwords.
- **Impact:** Failed logins and repeated retries can frustrate users and reduce trust in the login flow.

## 2) No "Forgot Password" / Recovery Flow

- **Observed issue:** There is no password reset option for users who forget their password.
- **Why it is a limitation:** Users can become permanently locked out unless an administrator manually intervenes.
- **Impact:** Poor account recovery experience and increased support overhead.

## 3) No Two-Factor Authentication (2FA)

- **Observed issue:** Authentication currently relies on username/email + password only.
- **Why it is a limitation:** A single compromised password can lead to full account compromise.
- **Impact:** Higher security risk, especially for reused or weak passwords.

## 4) Email Address Not Verified on Registration

- **Observed issue:** Accounts can be created without verifying ownership of the email address.
- **Why it is a limitation:** Invalid or fake email addresses can be registered, and account ownership is less trustworthy.
- **Impact:** Reduced account integrity and difficulty enforcing secure account recovery later.

## 5) Session Tokens Stored in Browser Session Storage

- **Observed issue:** Authentication tokens are stored in `sessionStorage`.
- **Why it is a limitation:** While common in SPA setups, this approach can increase exposure if malicious scripts run in the browser context.
- **Impact:** Security posture is weaker than hardened cookie-based approaches (`HttpOnly`, `Secure`, `SameSite`).

## 6) Limited Authentication Error Messaging

- **Observed issue:** API error handling is mostly generic (for example, `API error: <status>`).
- **Why it is a limitation:** Users receive less actionable feedback (e.g., whether credentials are wrong, account is inactive, or session expired).
- **Impact:** Harder troubleshooting for users and slower issue resolution.

## 7) No Explicit Rate Limiting / Login Brute-Force Protection Documented

- **Observed issue:** There is no clearly implemented or documented anti-brute-force policy in the current flow.
- **Why it is a limitation:** Repeated automated login attempts may be harder to detect and block.
- **Impact:** Increased risk of credential stuffing and unauthorized access attempts.

## 8) No "Remember Me" or Persistent Session Option

- **Observed issue:** Session handling appears to be short-lived and tied to browser session storage.
- **Why it is a limitation:** Users may need to log in repeatedly across browser restarts.
- **Impact:** Lower convenience and weaker user experience for returning users.

---

These limitations are not blockers for core functionality, but they define important improvements for security, reliability, and user experience in future iterations.

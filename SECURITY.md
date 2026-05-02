# Security Policy - EMPIRION

## Reporting a Vulnerability
If you discover a security vulnerability, please report it privately to the maintainers at `security@empirion.com`.

## Security Measures
- **RLS:** Row Level Security is mandatory for all tables.
- **Secrets:** Never commit `.env` files or API keys.
- **Auditing:** All sensitive actions are logged in the `audit_log` (future).

# PostgreSQL Setup Guide (Local Linux Server)

This document explains how to install PostgreSQL, secure it for *local-only* access, create your database + user, and verify it’s running.
No networking exposure. No remote connections. No Docker. Just a local system service.

---

## 1. Install PostgreSQL

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Verify version:

```bash
psql --version
```

---

## 2. Start/Enable the Service

Start now:

```bash
sudo systemctl start postgresql
```

Enable on boot:

```bash
sudo systemctl enable postgresql
```

Check status:

```bash
sudo systemctl status postgresql
```

You want to see it “active (running)”.

---

## 3. Connect as the PostgreSQL superuser

Postgres creates a local user called `postgres` that can admin everything.

Switch to it:

```bash
sudo -i -u postgres
```

Enter the shell:

```bash
psql
```

---

## 4. Create Your App User + Database

You want one user, one database, used only by your TS service.

Inside `psql`:

```sql
-- Create user with password
CREATE USER myapp_user WITH PASSWORD 'CHOOSE_A_STRONG_PASSWORD';

-- Create database
CREATE DATABASE myapp_db OWNER myapp_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE myapp_db TO myapp_user;
```

Exit:

```sql
\q
```

---

## 5. Lock PostgreSQL to Local-Only Access

PostgreSQL defaults to listening on localhost, but verify it so it never exposes itself to LAN/WAN.

Open `postgresql.conf`:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Find:

```
#listen_addresses = 'localhost'
```

Ensure it’s:

```
listen_addresses = 'localhost'
```

> This guarantees: **only code running on this machine can talk to the DB**.

Now edit client auth rules:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Ensure only this exists for IPv4/IPv6 local connections:

```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

---

## 6. Test Local Connection

Still as your normal user:

```bash
psql "postgresql://myapp_user:YOUR_PASSWORD@localhost:5432/myapp_db"
```

If you see a `myapp_db=>` prompt, you're in.

---

## 7. Environment Variables for Your Node/TS Service

In your backend `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_db
DB_USER=myapp_user
DB_PASS=YOUR_PASSWORD
```

Your DB service loads these to establish the connection.

---

## 8. Creating Tables (Migration Strategy)

You said you want a “general table creator” — simplest safe method without full migration tooling:

### Option A — SQL Files (recommended for starters)

You create SQL files like:

```
migrations/
  001_create_users.sql
  002_create_riot_tables.sql
  ...
```

Example:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Your core DB service runs them on startup if needed.

### Option B — Use a migration tool later

(e.g., Prisma Migrate, Drizzle, Knex) — optional, not required for now.

---

## 9. Useful Commands (You Will Need These)

### Check existing DBs

```bash
sudo -u postgres psql -c "\l"
```

### Check users

```bash
sudo -u postgres psql -c "\du"
```

### Connect directly as app user

```bash
psql -U myapp_user -d myapp_db -h localhost
```

### Restart PostgreSQL

```bash
sudo systemctl restart postgresql
```

### View logs

```bash
sudo journalctl -u postgresql -f
```

---

## 10. Security Notes (Your Situation)

✔ Local-only access
✔ Only your TS backend + occasional manual admin should reach the DB
✔ No remote connections allowed
✔ No one else has credentials
✔ Your home server’s local Linux permissions handle the rest


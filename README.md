# Backend Test API

## Setup
npm install

## Run
npm start

## API
## Module Membership
POST /api/registration   -> register
POST /api/login          -> login, ambil token
GET  /api/profile        -> pakai Bearer token
PUT  /api/profile/update -> pakai Bearer token
PUT  /api/profile/image  -> pakai Bearer token 
## Module Informasi 
GET  /api/banner         -> public
GET  /api/services       -> pakai Bearer token

## Module Transaction
GET  /api/balance        -> pakai Bearer token
POST /api/topup          -> pakai Bearer token
POST /api/transaction    -> pakai Bearer token
POST /api/transaction/history -> pakai Bearer token 


## Notes
- Menggunakan raw query + prepared statement
- Database: PostgreSQL(Neon).
- Database design / DDL tersedia di `database/schema.sql`.

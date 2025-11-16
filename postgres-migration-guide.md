# Migrasi Database ke PostgreSQL

## Prasyarat

1. **PostgreSQL** terinstall dan berjalan di port 5432
2. Database `aicodereview` sudah dibuat
3. User `postgres` dengan password `postgres` (atau sesuaikan dengan konfigurasi Anda)

## Langkah-langkah Migrasi

### 1. Setup PostgreSQL

#### Instalasi PostgreSQL (jika belum)

**Windows:**
- Download dan install [PostgreSQL](https://www.postgresql.org/download/windows/)
- Pilih port default 5432
- Set password untuk user postgres
- Biarkan semua komponen terinstall

**Atau dengan Docker:**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=aicodereview -p 5432:5432 -d postgres:15
```

#### Buat Database

Jika belum membuat database:

```sql
CREATE DATABASE aicodereview;
```

### 2. Jalankan Script SQL

1. Buka PostgreSQL client (pgAdmin, psql, DBeaver, dll)
2. Connect ke database `aicodereview`
3. Jalankan script SQL dari file `postgres-setup.sql`

### 3. Update Konfigurasi Backend

1. Stop backend yang sedang berjalan
2. Restart dengan profile PostgreSQL:

```bash
java -jar backend/target/ai-code-review-backend-1.0.0.jar --spring.profiles.active=prod
```

### 4. Verifikasi Migrasi

1. Login ke aplikasi dengan:
   - Username: `admin`
   - Password: `password`
2. Cek apakah repository yang sudah didaftarkan muncul di dashboard
3. Coba tambahkan repository baru untuk memastikan koneksi ke database berfungsi

## Troubleshooting

### Koneksi Gagal

Jika backend tidak bisa connect ke PostgreSQL:

1. Pastikan PostgreSQL berjalan di port 5432
2. Cek firewall tidak memblokir koneksi
3. Verifikasi username dan password PostgreSQL
4. Pastikan database `aicodereview` sudah dibuat

### Error Schema

Jika ada error terkait schema:

1. Pastikan script SQL sudah dijalankan dengan benar
2. Cek log backend untuk detail error
3. Jika perlu, set `spring.jpa.hibernate.ddl-auto=create` untuk membuat schema otomatis

## Konfigurasi Tambahan

Jika perlu menyesuaikan konfigurasi PostgreSQL, edit file `application.yml` dan ubah:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aicodereview
    username: postgres
    password: postgres
```

Sesuaikan dengan konfigurasi PostgreSQL Anda.

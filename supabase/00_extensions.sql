-- 先运行本文件，再运行 schema.sql。
-- pgcrypto 用于 UUID；vector 为后续语义关联预留。
create extension if not exists "pgcrypto";
create extension if not exists "vector";

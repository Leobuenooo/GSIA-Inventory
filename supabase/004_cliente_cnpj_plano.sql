-- ============================================================
-- GSIA Inventário — troca telefone/e-mail por CNPJ/Plano
--
-- A ficha do cliente deixou de ter telefone e e-mail e passou a ter
-- CNPJ e Plano (Híbrido / Autoatendimento / Remoto).
--
-- Os dados originais da planilha nunca tiveram telefone/e-mail
-- preenchidos, então não há perda de informação ao rodar isso. Se por
-- algum motivo você já preencheu telefone/e-mail de algum cliente pelo
-- app antes dessa mudança, essa informação será perdida ao rodar este
-- script — confira antes se isso importa pro seu caso.
-- ============================================================

alter table clientes drop column if exists telefone;
alter table clientes drop column if exists email;

alter table clientes add column if not exists cnpj text;
alter table clientes add column if not exists plano text;

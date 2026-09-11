-- ============================================================
-- GSIA Inventário — exige login para acessar os dados
--
-- Isso substitui as políticas abertas de 001_schema.sql (que
-- liberavam leitura/escrita para qualquer pessoa com a URL + chave
-- anon) por políticas que só permitem acesso a quem estiver
-- autenticado (logado) via Supabase Auth.
--
-- IMPORTANTE — depois de rodar este arquivo:
-- Vá em Authentication → Users → Add user no painel do Supabase e
-- crie manualmente uma conta para cada pessoa que pode acessar o
-- sistema (você, seu chefe, etc.). Marque "Auto Confirm User" para
-- a conta já poder logar na hora, sem precisar confirmar e-mail.
-- Não existe cadastro público nessa tela de login — só quem tiver
-- uma conta criada aqui consegue entrar.
-- ============================================================

drop policy if exists "acesso total clientes" on clientes;
drop policy if exists "acesso total locais" on locais;
drop policy if exists "acesso total equipamentos" on equipamentos;
drop policy if exists "acesso total cameras" on cameras;

drop policy if exists "somente logados - clientes" on clientes;
create policy "somente logados - clientes" on clientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "somente logados - locais" on locais;
create policy "somente logados - locais" on locais
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "somente logados - equipamentos" on equipamentos;
create policy "somente logados - equipamentos" on equipamentos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "somente logados - cameras" on cameras;
create policy "somente logados - cameras" on cameras
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

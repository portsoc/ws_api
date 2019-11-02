create table if not exists picture (
  id serial primary key,
  title varchar(100),
  filename varchar(60)
);

delete from picture where id in (1,2,3,4);

insert into picture values
  (1, 'I caught a little fish...', '1.png');
insert into picture values
  (2, 'The fish I caught was this big.', '2.png');
insert into picture values
  (3, 'The fish I caught was quite big.', '3.png');
insert into picture values
  (4, 'I caught the biggest fish you''ve ever seen.', '4.png');

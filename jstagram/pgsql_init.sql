create table if not exists Picture (
  id serial primary key,
  title varchar(100) collate "en-x-icu",
  filename varchar(60)
);

delete from Picture where id in (1,2,3,4);

insert into Picture values
  (1, 'I caught a little fish...', '1.png');
insert into Picture values
  (2, 'The fish I caught was this big.', '2.png');
insert into Picture values
  (3, 'The fish I caught was quite big.', '3.png');
insert into Picture values
  (4, 'I caught the biggest fish you''ve ever seen.', '4.png');

-- set the ID sequence so it matches the data
SELECT setval('picture_id_seq',
              (SELECT GREATEST( MAX(id) + 1,
                                nextval('picture_id_seq')
                               ) - 1
               FROM Picture)
             );

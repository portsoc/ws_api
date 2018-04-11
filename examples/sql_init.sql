create database if not exists pictures;

drop table if exists pictures.picture;
create table if not exists pictures.picture (
  id int primary key auto_increment,
  title varchar(100),
  filename varchar(60),
  author varchar(50)
) charset 'utf8mb4';

insert ignore into pictures.picture values (1, 'I caught a little fish...', '1.png', 'Rich Boakes');
insert ignore into pictures.picture values (2, 'The fish I caught was this big.', '2.png', 'Rich Boakes');
insert ignore into pictures.picture values (3, 'The fish I caught was quite big.', '3.png', 'Rich Boakes');
insert ignore into pictures.picture values (4, "I caught the biggest fish you've ever seen.", '4.png', 'Rich Boakes');

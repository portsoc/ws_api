create database if not exists pictures;

create table if not exists pictures.picture (
  id int primary key auto_increment,
  title varchar(100),
  filename varchar(60)
);

insert ignore into pictures.picture values (1, 'Starry night in the Inn valley', '1.jpg');
insert ignore into pictures.picture values (2, 'Halloween at AIT', '2.jpg');

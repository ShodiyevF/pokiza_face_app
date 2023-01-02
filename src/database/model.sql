create database pokizaid

drop table if exists workers cascade;
create table workers(
    worker_id serial primary key,
    worker_fish text not null,
    worker_imgpath text not null,
    worker_getdate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

drop table if exists settime cascade;
create table settime(
    time_id serial primary key,
    time_get text not null,
    time_end text,
    time_check text,
    time_date text,
    time_result varchar(6),
    worker_id int not null references workers(worker_id)
);

insert into settime(time_get, time_check, time_date, worker_id) values ('8:15', 200, '2023-01-02T8:15:00.000+05:00', 63);

drop table if exists branch cascade;
create table branch(
    branch_id serial primary key,
    branch_name varchar(32) not null
);

drop table if exists branch cascade;
create table branch(
    branch_id serial primary key,
    branch_name varchar(32) not null
);


drop table if exists descriptor cascade;
create table descriptor(
    descriptor_id serial primary key,
    descriptor_main text not null,
    worker_id int references workers(worker_id)
);
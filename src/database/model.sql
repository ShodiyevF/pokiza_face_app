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
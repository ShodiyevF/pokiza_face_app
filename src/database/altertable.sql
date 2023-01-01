alter table workers
add column branch_id int references branch(branch_id);

-- ADD BRANCH_ID TO WORKERS

alter table workers
add column worker_delete smallint DEFAULT 0;

-- ADD worker_delete TO WORKERS
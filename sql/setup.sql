CREATE DATABASE IF NOT EXISTS imageapp;
SET DATABASE = imageapp;
CREATE TABLE accounts(
    id UUID not null unique default,
    email text,
    primary KEY(id),
    smallid text
);
create table images(
	id UUID not null unique default gen_random_uuid(),
	user_id UUID,
	imageURL text,
	primary KEY(id)
)

CREATE USER IF NOT EXISTS maxroach;
GRANT ALL ON DATABASE imageapp TO maxroach;

alter table images add column info text;

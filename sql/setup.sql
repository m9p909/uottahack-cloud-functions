CREATE DATABASE IF NOT EXISTS imageapp;
SET DATABASE = imageapp;
CREATE TABLE accounts (
    id UUID not null unique default gen_random_uuid(),
    email text,
    primary KEY(id)
);
create table images (
	id UUID not null unique default gen_random_uuid(),
	user_id UUID,
	imageURL text,
	image text,
	primary KEY(id)
)

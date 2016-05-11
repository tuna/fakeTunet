drop table if exists users;
create table users (
	id integer primary key autoincrement,
	ip char(40) not null,
	username char(16),
	login_time char(16),
	logged_in boolean
);
create unique index ip_idx on users (ip);

insert into images(user_id,imageurl,info)
values($1,$2, $3)
returning imageurl

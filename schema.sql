ALTER TABLE user 
modify id VARCHAR(100); 

ALTER TABLE user 
modify username VARCHAR(100) unique;

ALTER TABLE user 
modify email VARCHAR(100) not null unique;

ALTER TABLE user 
modify password VARCHAR(100) not null;
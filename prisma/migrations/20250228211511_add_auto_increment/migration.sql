-- AlterTable
CREATE SEQUENCE categories_id_seq;
ALTER TABLE "Categories" ALTER COLUMN "id" SET DEFAULT nextval('categories_id_seq');
ALTER SEQUENCE categories_id_seq OWNED BY "Categories"."id";

import { Migration } from '@mikro-orm/migrations';

export class Migration20230910031335 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "tag_model" ("id" serial primary key, "name" varchar(255) not null, "description" varchar(255) not null);',
    );

    this.addSql(
      'create table "user_model" ("id" serial primary key, "email" varchar(255) not null, "username" varchar(255) not null, "password" varchar(255) not null, "type" text check ("type" in (\'basic\', \'admin\', \'mod\', \'master\')) not null);',
    );

    this.addSql(
      'create table "item_model" ("id" serial primary key, "name" varchar(255) not null, "stock" int not null, "price" int not null, "description" varchar(255) null, "color_theme" varchar(10) null, "image_url" varchar(255) null, "assets_folder" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_id" int not null);',
    );

    this.addSql(
      'create table "item_model_tags" ("item_model_id" int not null, "tag_model_id" int not null, constraint "item_model_tags_pkey" primary key ("item_model_id", "tag_model_id"));',
    );

    this.addSql(
      'create table "historic_model" ("id" serial primary key, "change" varchar(255) not null, "previous_value" varchar(255) null, "created_at" timestamptz(0) not null, "item_id" int not null);',
    );

    this.addSql(
      'alter table "item_model" add constraint "item_model_user_id_foreign" foreign key ("user_id") references "user_model" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "item_model_tags" add constraint "item_model_tags_item_model_id_foreign" foreign key ("item_model_id") references "item_model" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "item_model_tags" add constraint "item_model_tags_tag_model_id_foreign" foreign key ("tag_model_id") references "tag_model" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "historic_model" add constraint "historic_model_item_id_foreign" foreign key ("item_id") references "item_model" ("id") on update cascade;',
    );
  }

  async down(): Promise<void> {}
}

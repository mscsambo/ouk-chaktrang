import {sqliteTable,text,integer,index,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const rooms=sqliteTable('rooms',{
 id:text('id').primaryKey(),
 stateJson:text('state_json').notNull(),
 whiteSeat:text('white_seat'),
 blackSeat:text('black_seat'),
 revision:integer('revision').notNull().default(0),
 createdAt:integer('created_at').notNull(),
 updatedAt:integer('updated_at').notNull(),
},table=>[index('idx_rooms_white_seat').on(table.whiteSeat),index('idx_rooms_black_seat').on(table.blackSeat)]);
export const comments=sqliteTable('room_comments',{
 id:integer('id').primaryKey({autoIncrement:true}),
 roomId:text('room_id').notNull().references(()=>rooms.id,{onDelete:'cascade'}),
 authorHash:text('author_hash').notNull(),
 clientId:text('client_id').notNull(),
 role:text('role').notNull(),
 visitorTag:text('visitor_tag').notNull(),
 authorName:text('author_name'),
 message:text('message').notNull(),
 createdAt:integer('created_at').notNull(),
},table=>[
 index('idx_comments_room_id').on(table.roomId,table.id),
 uniqueIndex('idx_comments_retry').on(table.roomId,table.authorHash,table.clientId),
]);

export const profiles=sqliteTable('profiles',{
 guestHash:text('guest_hash').primaryKey(),
 displayName:text('display_name').notNull(),
 createdAt:integer('created_at').notNull(),
 updatedAt:integer('updated_at').notNull(),
});

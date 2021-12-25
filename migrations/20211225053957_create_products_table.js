
exports.up = function(knex) {
  return knex.schema.createTable('products', function(t) {
    t.increments('id').unsigned().primary();
    t.string('sku').unique();
    t.string('name').notNull().index();
    t.decimal('price').defaultTo('0.00').index();
    t.text('description').nullable();
    t.text('image').nullable();
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};

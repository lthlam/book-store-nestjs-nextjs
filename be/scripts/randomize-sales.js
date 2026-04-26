const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'book-store',
    password: 'postgres',
    port: 5432,
  });

  await client.connect();
  await client.query(
    'UPDATE product SET "soldCount" = floor(random() * 500) WHERE "soldCount" = 0 OR "soldCount" IS NULL',
  );
  console.log('soldCount updated!');
  await client.end();
}
main();

const ava = require('ava');
const Parser = require('../../lib');

const expect0 = require('./expect/parser/0.json');

const tests = {

  'Should test quoting.': {
    queries: [
      `
      create table \`\`\`te\`\`st\` (
        test BOOL DEFAULT "",
        test BOOL DEFAULT "a test",
        test BOOL DEFAULT "a "" test",
        test BOOL DEFAULT "a \\" test",
        test BOOL DEFAULT '',
        test BOOL DEFAULT 'a test',
        test BOOL DEFAULT 'a '' test',
        test BOOL DEFAULT 'a \\' test'
      );
      `,
    ],
    expect: expect0
  }
};

Object.getOwnPropertyNames(tests).forEach(description => {
  const test = tests[description];

  test.queries.forEach(query => {

    const testname = `${description} | ${query}`;

    const parser = new Parser();
    parser.feed(query);

    ava(testname, t => {
      const value = parser.results;
      t.deepEqual(value, test.expect);
    });
  });
});

ava('Should break down statements in parser', t => {
  const parser = new Parser();

  parser.feed(`testing 'an' escape\\'d 'str\\'in"g;' end; now this `); //
  parser.feed(`is a \`"continue;'d\` end;
this\\`);
  parser.feed(`'s escape is broken between "consume'd `); //
  parser.feed(`\`strings\`" end;twice here end;`); //

  t.deepEqual(parser.statements, [
    `testing 'an' escape\\'d 'str\\'in"g;' end;`,
    ` now this is a \`"continue;'d\` end;`,
    `\nthis\\'s escape is broken between "consume'd \`strings\`" end;`,
    `twice here end;`
  ]);

});

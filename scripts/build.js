/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const root = path.resolve(__dirname, '../');

const args = process.argv.slice(2);

function execute(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function createPackageJson() {
  const packageBuffer = await fs.promises.readFile(
    path.resolve(root, './package.json'),
  );
  const packageJson = JSON.parse(packageBuffer.toString());

  const minimalPackage = {
    author: packageJson.author,
    version: packageJson.version,
    description: packageJson.description,
    keywords: packageJson.keywords,
    repository: packageJson.repository,
    license: packageJson.license,
    bugs: packageJson.bugs,
    homepage: packageJson.homepage,
    peerDependencies: packageJson.peerDependencies,
    dependencies: packageJson.dependencies,
    name: packageJson.name,
    main: 'index.js',
    module: 'index.esm.js',
  };

  await fs.promises.writeFile(
    path.resolve(root, './dist/package.json'),
    JSON.stringify(minimalPackage, null, 2),
  );
}

async function build() {
  if (!args.includes('--no-clean')) {
    console.log('(re)Installing…');
    await execute('npm i');
  }

  console.log('Linting…');
  await execute('npm run lint');

  console.log('Running tests…');
  await execute('npx jest');

  console.log('Writing Types (tsc)…');
  await execute('npx tsc');

  console.log('Compiling (rollup)…');
  await execute('npx rollup -c');

  console.log('Writing package.json…');
  await createPackageJson();

  console.log('Copying README.md…');
  const readme = await fs.promises.readFile(path.resolve(root, './README.md'));
  await fs.promises.writeFile(path.resolve(root, './dist/README.md'), readme);

  console.log('Done building!');
}

build()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

# Safe Shopping

This extension analyses the current visited site for its hostname and existence on the list https://www.coi.cz/pro-spotrebitele/rizikove-e-shopy/.

This extension is dedicated to browsers based on the open-source Chromium codebase, e.g. Chrome, Brave, Edge, Opera, and many more.

## Development

1. Clone this repository.
2. Run `npm install` to get dependencies.
3. Run `npm run build:dev` (for development code version) or `npm run build:prod` (for production code version)

Following commands in `package.json` does:

    "build:dev": build the package in Development mode,
    "build:prod": build the package in Production mode,
    "copy:files": copy all other files like images or manifest.json,
    "scripts:dev": building JavaScript code from TypeScript in Development mode,
    "scripts:prod": building JavaScript code from TypeScript in Production mode,
    "scripts:lint": validating TypeScript code for potential issues,
    "lint": validating TypeScript, markdown syntax, Sass, and circular dependencies,
    "markdown:lint": validating markdownlint syntax for README.md,
    "sass:lint": validating Sass,
    "sass:dev": building CSS from Sass code in development mode,
    "sass:prod": building CSS from Sass code in production mode,
    "watch:dev": use this option if you want to develop and trigger automatic Development build locally,
    "watch:prod": use this option if you want to develop and trigger automatic Production build locally,
    "release": automatically push the code to the repository with versioning; this should rather be done through the Pull Request

## The future

If that extension will get more interest then it would probably be good to enhance the list for other countries and process some official lists.

## Contributing

Contributions are welcome, and greatly appreciated! Contributing doesn't just mean submitting pull requests. There are many different ways for you to get involved, including answering questions on the issues, reporting or triaging bugs, and participating in the features evolution process.

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const prettier = require('eslint-config-prettier');

module.exports = [
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/.angular/**'],
	},
	js.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json'],
				tsconfigRootDir: __dirname,
				sourceType: 'module',
			},
			globals: {
				// Browser globals
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				setTimeout: 'readonly',
				// Node globals
				process: 'readonly',
				// Test globals
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
			},
		},
		plugins: {
			'@angular-eslint': angular,
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...angular.configs.recommended.rules,
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			// Disable base rule and use TypeScript version
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		languageOptions: {
			parser: angularTemplateParser,
		},
		plugins: {
			'@angular-eslint/template': angularTemplate,
		},
		rules: {
			...angularTemplate.configs.recommended.rules,
		},
	},
	prettier,
];

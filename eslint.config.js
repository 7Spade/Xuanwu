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
	...tseslint.configs.recommendedTypeChecked,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json'],
				tsconfigRootDir: __dirname,
				sourceType: 'module',
			},
		},
		plugins: {
			'@angular-eslint': angular,
		},
		rules: {
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

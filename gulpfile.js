const { src, dest } = require('gulp');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes'));
}

function buildCredentialsIcons() {
	return src('credentials/*.{png,svg}')
		.pipe(dest('dist/credentials'));
}

exports.default = buildIcons;
exports['build:icons'] = buildIcons;
exports['build:credentials:icons'] = buildCredentialsIcons;

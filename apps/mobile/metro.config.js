const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /apps[/\\]web[/\\].*/,
  /\.next[/\\].*/,
];

module.exports = config;

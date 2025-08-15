// @ts-check

const path = require('path');
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  webpack: (config) => {
    config.resolve.alias['@couponleaks-ng/graphql'] = path.resolve(
      __dirname,
      '../../packages/graphql/src'
    );
    config.resolve.alias['@'] = path.resolve(__dirname, './');
    return config;
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);

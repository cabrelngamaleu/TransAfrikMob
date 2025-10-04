const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components']
      }
    },
    argv
  );
  
  // Configurer correctement le support pour React JSX/TSX
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-proposal-class-properties']
      }
    }
  });

  // Assurer que les extensions sont correctement résolues
  config.resolve.extensions = ['.web.js', '.js', '.jsx', '.ts', '.tsx', '.json'];
  
  return config;
};
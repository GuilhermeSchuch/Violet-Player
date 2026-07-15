const { withGradleProperties } = require('@expo/config-plugins');

function setGradleProperty(properties, key, value) {
  const existing = properties.find((property) => property.type === 'property' && property.key === key);

  if (existing) {
    existing.value = value;
    return properties;
  }

  properties.push({ type: 'property', key, value });
  return properties;
}

module.exports = function withOldArchitecture(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = setGradleProperty(config.modResults, 'newArchEnabled', 'false');
    return config;
  });
};

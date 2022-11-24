export default function getEnv(name) {
  let envValue;
  if (window && window.configs) {
    envValue = window.configs[name];
  } else {
    envValue = process.env[name];
  }
  return envValue;
}

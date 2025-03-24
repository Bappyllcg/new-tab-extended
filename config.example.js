// Example configuration file - rename to config.js and add your API key
const config = {
    WEATHER_API_KEY: '1a16df53148b78e453264342eb03b680',
    GUARDIAN_API_KEY: '8ba90e96-b598-4ed1-a162-f7dba02cf081'
};

export function getApiKey() {
    return config.WEATHER_API_KEY;
}

export function getGuardianApiKey() {
    return config.GUARDIAN_API_KEY;
}
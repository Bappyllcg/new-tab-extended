// Example configuration file - rename to config.js and add your API key
const config = {
    WEATHER_API_KEY: '1a16df53148b78e453264342eb03b680'
};

export function getApiKey() {
    return config.WEATHER_API_KEY;
} 
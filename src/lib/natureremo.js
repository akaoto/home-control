let NatureRemo = {};

NatureRemo.query = (path, method = 'get', payload = null) => {
    console.log('>>> NatureRemo.query()');
    console.log(`path: ${path}, method: ${method}, payload: ${JSON.stringify(payload)}`);

    let property = PropertiesService.getScriptProperties();
    let apiToken = property.getProperty('NATURE_REMO_API_TOKEN');

    let endpoint = `https://api.nature.global${path}`;
    let options = {
        method: method,
        headers: {
            Authorization: `Bearer ${apiToken}`
        }
    };
    if (payload) {
        let urlParams = [];
        for (let key in payload) {
            urlParams.push(`${key}=${payload[key]}`);
        }
        options.payload = urlParams.join('&');
    }

    let response = UrlFetchApp.fetch(endpoint, options);
    let result = JSON.parse(response.getContentText());
    console.log('result: ' + JSON.stringify(result, null, 2));

    console.log('<<< NatureRemo.query()');
    return result;
};

NatureRemo.fetchDevices = () => {
    let response = NatureRemo.query('/1/devices', 'get');
    return response;
};

NatureRemo.fetchAppliances = () => {
    let response = NatureRemo.query('/1/appliances', 'get');
    return response;
}

NatureRemo.sendSignal = (signalId) => {
    let response = NatureRemo.query(`/1/signals/${signalId}/send`, 'post');
    return response;
}

NatureRemo.configAircon = (airconId, config) => {
    let response = NatureRemo.query(`/1/appliances/${airconId}/aircon_settings`, 'post', config);
    return response;
}

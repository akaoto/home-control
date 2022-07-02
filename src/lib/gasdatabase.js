let GasDatabase = {};

GasDatabase.query = (method, urlParam = null, payload = null) => {
    console.log('>>> GasDatabase.query()');
    console.log(`method: ${method}, urlParam: ${urlParam}`);
    console.log(`payload: ${JSON.stringify(payload, null, 2)}`);

    let property = PropertiesService.getScriptProperties();
    let gasDatabaseId = property.getProperty('GAS_DATABSE_ID');
    let gasDatabaseEndpoint = `https://script.google.com/macros/s/${gasDatabaseId}/exec`;
    if (urlParam) {
        gasDatabaseEndpoint += `?${urlParam}`;
    }
    let options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    if (payload) {
        options.payload = JSON.stringify(payload)
    }

    let result = null;
    let response = UrlFetchApp.fetch(gasDatabaseEndpoint, options);
    if (response.getResponseCode() == 200) {
        result = JSON.parse(response.getContentText());
        console.info(JSON.stringify(result, null, 2));
    } else {
        console.error('response code: ' + response.getResponseCode());
    }

    console.log('<<< GasDatabase.query()');
    return result;
}

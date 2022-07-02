let Appliance = {
    HomeStatus: {},
    Aircon: {},
    Fan: {},
    Light: {}
};

Appliance.fetch = () => {
    console.log('>>> Appliance.fetch()')

    let property = PropertiesService.getScriptProperties();
    let airconId = property.getProperty('NATURE_REMO_AIRCON_ID');

    applianceInfo = Appliance._fetchAppliances(airconId);
    if (!applianceInfo) {
        return;
    }
    let airconValues = {
        aircon: applianceInfo.settings.button || applianceInfo.settings.mode
    };
    Appliance.HomeStatus.update(airconValues);

    deviceInfo = Appliance._fetchDevices(airconId, applianceInfo);
    if (!applianceInfo) {
        return;
    }
    let measuredValues = {
        humidity: deviceInfo.newest_events.hu.val,
        illuminance: deviceInfo.newest_events.il.val,
        moved: deviceInfo.newest_events.mo.val,
        temperature: deviceInfo.newest_events.te.val
    };
    Appliance.HomeStatus.update(measuredValues);

    console.log('<<< Appliance.fetch()')
};

Appliance._fetchAppliances = (airconId) => {
    let applianceInfo = null;
    let appliances = NatureRemo.fetchAppliances();
    for (let app of appliances) {
        if (app.id == airconId) {
            applianceInfo = app;
        }
    }
    if (!applianceInfo) {
        console.error('Aircon ID is Not Found.')
        console.info(`airconId: ${airconId}`);
    }
    return applianceInfo;
};

Appliance._fetchDevices = (airconId) => {
    let deviceInfo = null;
    let devices = NatureRemo.fetchDevices();
    for (let dev of devices) {
        if (dev.id == applianceInfo.device.id) {
            deviceInfo = dev;
            break;
        }
    }
    if (!deviceInfo) {
        console.error('Device ID is Not Found.')
        console.info(`deviceId: ${applianceInfo.device.id}`);
    }
    return deviceInfo;
};

Appliance.HomeStatus.fetch = () => {
    let result = GasDatabase.query('get', 'table=home');
    return result.record[0];
};

Appliance.HomeStatus.update = (homeStatus) => {
    let result = GasDatabase.query('post', 'table=home&method=update', homeStatus);
    return result;
};

Appliance.Aircon.turnOn = (config) => {
    if (Appliance.HomeStatus.fetch().aircon != config.operation_mode) {
        let property = PropertiesService.getScriptProperties();
        let aiconId = property.getProperty('NATURE_REMO_AIRCON_ID');
        NatureRemo.configAircon(aiconId, config);
    }
};

Appliance.Aircon.turnOff = () => {
    let config = {
        button: 'power-off'
    };
    if (Appliance.HomeStatus.fetch().aircon != config.button) {
        let property = PropertiesService.getScriptProperties();
        let aiconId = property.getProperty('NATURE_REMO_AIRCON_ID');
        NatureRemo.configAircon(aiconId, config);
    }
};

Appliance.Fan.toggle = () => {
    let property = PropertiesService.getScriptProperties();
    let signalId = property.getProperty('NATURE_REMO_FAN_SIGNAL_ID');
    NatureRemo.sendSignal(signalId);
};

Appliance.Fan.turnOn = () => {
    if (!Appliance.HomeStatus.fetch().fan) {
        Appliance.Fan.toggle();
        Appliance.HomeStatus.update({ fan: 1 });
    }
};

Appliance.Fan.turnOff = () => {
    if (Appliance.HomeStatus.fetch().fan) {
        Appliance.Fan.toggle();
        Appliance.HomeStatus.update({ fan: 0 });
    }
};

Appliance.Light.switch = () => {
    let property = PropertiesService.getScriptProperties();
    let signalId = property.getProperty('NATURE_REMO_LIGHT_SIGNAL_ID');
    NatureRemo.sendSignal(signalId);
};

Appliance.Light.turnOn = () => {
    if (!Appliance.HomeStatus.fetch().light) {
        Appliance.Light.switch();
        Appliance.HomeStatus.update({ light: 1 });
    }
};

Appliance.Light.turnOff = () => {
    if (Appliance.HomeStatus.fetch().light) {
        // 照度が3段階のため3回実行して消灯
        for (let i = 0; i < 3; ++i) {
            Appliance.Light.switch();
        }
        Appliance.HomeStatus.update({ light: 0 });
    }
};

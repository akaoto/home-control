function doGet(e) {
    if (e.postData) {
        payload = JSON.parse(e.postData.contents);
        payload.forEach((key, value) => {
            CacheServer.put(key, value);
        });
    }

    let resp = ContentService.createTextOutput();
    resp.setMimeType(ContentService.MimeType.JSON);
    resp.setContent(JSON.stringify(CacheServer.getAll()));

    return resp;
}

function doPost(e) {
    if (e.postData) {
        payload = JSON.parse(e.postData.contents);
        Object.keys(payload).forEach(key => CacheServer.put(key, payload[key]));
    }
    update();

    let resp = ContentService.createTextOutput();
    resp.setMimeType(ContentService.MimeType.JSON);
    resp.setContent(JSON.stringify({ 'message': 'OK' }));

    return resp;
}

function onTimer() {
    CacheServer.refresh();
    update();
}

function update() {
    const atHome = CacheServer.get('at_home');
    const isSleeping = CacheServer.get('is_sleeping');

    let applianceControler = new ApplianceControler();
    const measuredValues = applianceControler.readMeasuredValues();
    const currentAirconMode = applianceControler.Aircon_readMode();

    let statuses = {};
    statuses['aircon'] = atHome && (!isSleeping || (isSleeping && currentAirconMode == 'cool'));
    statuses['light'] = atHome && !isSleeping;
    statuses['fan'] = atHome;

    let nextAirconMode;
    let targetTemperature;
    if (measuredValues['temperature'] < 18) {
        nextAirconMode = 'warm';
        targetTemperature = 20;
    } else if (measuredValues['temperature'] < 27) {
        nextAirconMode = 'cool';
        targetTemperature = 25;
    }

    statuses['aircon'] ? applianceControler.Aircon_turnOn(nextAirconMode, targetTemperature) : applianceControler.Aircon_turnOff();
    statuses['fan'] ? applianceControler.Fan_turnOn() : applianceControler.Fan_turnOff();
    statuses['light'] ? applianceControler.Light_turnOn() : applianceControler.Light_turnOff();
}

class ApplianceControler {
    constructor() {
        const property = PropertiesService.getScriptProperties();

        const apiToken = property.getProperty('NATURE_REMO_API_TOKEN');
        this._natureRemo = new NatureRemo(apiToken);

        this._airconId = property.getProperty('NATURE_REMO_AIRCON_ID');
        this._fanId = property.getProperty('NATURE_REMO_FAN_SIGNAL_ID');
        this._lightId = property.getProperty('NATURE_REMO_LIGHT_SIGNAL_ID');
    }

    readMeasuredValues() {
        return this._natureRemo.readMeasuredValues(this._airconId);
    }

    Aircon_readMode() {
        return this._natureRemo.Aircon_readMode(this._airconId);
    }

    Aircon_turnOn(mode, temperature) {
        const status = CacheServer.get('aircon_status');
        if (!status) {
            this._natureRemo.Aircon_turnOn(this._airconId, mode, temperature);
            CacheServer.put('aircon_status', true);
        }
    }

    Aircon_turnOff() {
        const status = CacheServer.get('aircon_status');
        if (status) {
            this._natureRemo.Aircon_turnOff(this._airconId);
            CacheServer.put('aircon_status', false);
        }
    }

    Fan_turnOn() {
        const status = CacheServer.get('fan_status');
        if (!status) {
            this._natureRemo.sendSignal(this._fanId);
            CacheServer.put('fan_status', true);
        }
    }

    Fan_turnOff() {
        const status = CacheServer.get('fan_status');
        if (status) {
            this._natureRemo.sendSignal(this._fanId);
            CacheServer.put('fan_status', false);
        }
    }

    Light_turnOn() {
        const status = CacheServer.get('light_status');
        if (!status) {
            [...Array(2)].forEach(() => this._natureRemo.sendSignal(this._lightId));
            CacheServer.put('light_status', true);
        }
    }

    Light_turnOff() {
        const status = CacheServer.get('light_status');
        if (status) {
            [...Array(2)].forEach(() => this._natureRemo.sendSignal(this._lightId));
            CacheServer.put('light_status', false);
        }
    }
}

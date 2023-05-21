let property = PropertiesService.getScriptProperties();
let apiToken = property.getProperty('NATURE_REMO_API_TOKEN');


class NatureRemo {
    constructor(apiToken) {
        this._apiToken = apiToken;
        this._rootUrl = 'https://api.nature.global';
    }

    fetch(path, method = 'get', payload = null) {
        let endpoint = this._rootUrl + path;
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

        return result;
    }

    readMeasuredValues() {
        let deviceInfo = this.fetch('/1/devices', 'get')[0];
        if (!deviceInfo) {
            return;
        }
        let measuredValues = {
            humidity: deviceInfo.newest_events.hu.val,
            illuminance: deviceInfo.newest_events.il.val,
            moved: deviceInfo.newest_events.mo.val,
            temperature: deviceInfo.newest_events.te.val
        };
        return measuredValues;
    }

    sendSignal(signalId) {
        this.fetch(`/1/signals/${signalId}/send`, 'post');
    }

    readAirconSettings(airconId) {
        const applianceInfo = this.fetch('/1/appliances', 'get');
        for (let info of applianceInfo) {
            if (info['id'] == airconId) {
                return info.settings;
            }
        }
    }

    writeAirconSettings(airconId, setting) {
        this.fetch(`/1/appliances/${airconId}/aircon_settings`, 'post', setting);
    }

    Aircon_readMode(airconId) {
        const settings = this.readAirconSettings(airconId);
        if (settings) {
            const mode = settings.button || settings.mode;
            return mode;
        }
    }

    Aircon_turnOn(airconId, mode, temperature) {
        const settings = {
            'mode': mode,
            'temperature': temperature
        };
        this.writeAirconSettings(airconId, settings);
    }

    Aircon_turnOff(airconId) {
        const settings = {
            'button': 'power-off'
        };
        this.writeAirconSettings(airconId, settings);
    }
}

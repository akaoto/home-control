function update() {
    Appliance.fetch();

    let home = Appliance.HomeStatus.fetch();
    console.log(`home: ${JSON.stringify(home, null, 2)}`);

    let airconWarmConfig = {
        operatoin_mode: 'warm',
        temperature: 22
    };
    let airconCoolConfig = {
        operatoin_mode: 'cool',
        temperature: 26
    };

    if (!home.at_home) {
        Appliance.Aircon.turnOff();
        Appliance.Fan.turnOff();
        Appliance.Light.turnOff();
    } else {
        if (home.sleeping) {
            if (home.aircon == 'warm') {
                Appliance.Aircon.turnOff();
            }
            Appliance.Fan.turnOn();
            Appliance.Light.turnOff();
        } else {
            if (home.aircon < 22) {
                if (home.aircon == 'power-off') {
                    Appliance.Aircon.turnOn(airconWarmConfig);
                } else if (home.aircon == 'cool') {
                    Appliance.Aircon.turnOff();
                }
            } else if (26 < home.temperature) {
                if (home.aircon == 'power-off') {
                    Appliance.Aircon.turnOn(airconCoolConfig);
                } else if (home.aircon == 'warm') {
                    Appliance.Aircon.turnOff();
                }
            }
            Appliance.Fan.turnOn();
            if (!home.light && home.illuminance < 20) {
                Appliance.Light.turnOn();
            } else if (home.light && 70 < home.illuminance) {
                Appliance.Light.turnOff();
            }
        }
    }
}

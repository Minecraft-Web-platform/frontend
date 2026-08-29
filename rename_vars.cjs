const fs = require('fs');
const path = require('path');

const traverseDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath, callback);
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.scss')) {
        callback(fullPath);
      }
    }
  });
};

traverseDir(path.join(__dirname, 'src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const replacements = [
    { from: /CityDetailPage/g, to: 'SettlementDetailPage' },
    { from: /CityCard/g, to: 'SettlementCard' },
    { from: /CitiesListPage/g, to: 'SettlementsListPage' },
    { from: /EditCityModal/g, to: 'EditSettlementModal' },
    { from: /cityDesc/g, to: 'settlementDesc' },
    { from: /setCityDesc/g, to: 'setSettlementDesc' },
    { from: /cityName/g, to: 'settlementName' },
    { from: /setCityName/g, to: 'setSettlementName' },
    { from: /showCreateCityModal/g, to: 'showCreateSettlementModal' },
    { from: /setShowCreateCityModal/g, to: 'setShowCreateSettlementModal' },
    { from: /handleCreateCity/g, to: 'handleCreateSettlement' },
    { from: /cityId/g, to: 'settlementId' },
    { from: /city_id/g, to: 'settlement_id' },
    { from: /city\.id/g, to: 'settlement.id' },
    { from: /\bcity\b/g, to: 'settlement' },
    { from: /\bcities\b/g, to: 'settlements' },
    { from: /\bCity\b/g, to: 'Settlement' },
    { from: /\bCities\b/g, to: 'Settlements' },
    { from: /ICity/g, to: 'ISettlement' },
    { from: /createCity/g, to: 'createSettlement' },
    { from: /updateCity/g, to: 'updateSettlement' },
    { from: /deleteCity/g, to: 'deleteSettlement' },
    { from: /city-/g, to: 'settlement-' }, // for class names like city-card
  ];

  for (const { from, to } of replacements) {
    if (content.match(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', filePath);
  }
});

import { electionRegions, officeCityNames, officeDistrictNames } from './electionMenuRules.js';

const councilTypes = new Set(['1', '2', '3']);
const representativeTypes = new Set(['6', '7', '8']);

export function getElectionCityGroups(cities, officeTypeId) {
  const allowedNames = officeCityNames[String(officeTypeId)];
  return electionRegions.map((region) => ({
    label: region.label,
    cities: region.cities.flatMap((name) => {
      const city = cities.find((item) => item.name === name);
      return city && (!allowedNames || allowedNames.includes(name))
        ? [{ id: city.code, label: city.name }] : [];
    })
  })).filter((region) => region.cities.length);
}

// Representative constituency codes repeat in different townships, so their
// select values must include the township code as well as the constituency code.
export function getElectionAreaOptions(city, officeTypeId, areaId = 'all', districtId = 'all') {
  const type = String(officeTypeId);
  const allowedCities = officeCityNames[type];
  const allowedDistricts = officeDistrictNames[type]?.[city?.name];
  const cityAllowed = !allowedCities || allowedCities.includes(city?.name);
  const cityDistricts = cityAllowed ? (city?.districts ?? []).filter(
    (district) => !allowedDistricts || allowedDistricts.includes(district.name)
  ) : [];
  let areas = [];
  if (councilTypes.has(type)) {
    areas = (cityAllowed ? city?.councilConstituencies?.[type] ?? [] : []).map((area) => {
      const districtNames = [...new Set((area.districts ?? []).map((district) => district.name).filter(Boolean))];
      return {
        ...area, id: area.code,
        label: districtNames.length ? `${area.name}（${districtNames.join('、')}）` : area.name
      };
    });
  } else if (representativeTypes.has(type)) {
    areas = cityDistricts.flatMap((district) =>
      (district.representativeConstituencies?.[type] ?? []).map((area) => ({
        ...area,
        id: `${district.code}-${area.code}`,
        label: `${area.name}（${district.name}）`,
        deptCode: district.code
      }))
    );
  }

  areas.sort((a, b) => Number(a.code) - Number(b.code)
    || Number(a.deptCode ?? 0) - Number(b.deptCode ?? 0));

  const selectedArea = areas.find((area) => area.id === areaId);
  let districts = cityDistricts;
  if (councilTypes.has(type)) {
    const coveredCodes = new Set((selectedArea ? [selectedArea] : areas)
      .flatMap((area) => area.districts ?? []).map((district) => district.code));
    districts = districts.filter((district) => coveredCodes.has(district.code));
  } else if (representativeTypes.has(type)) {
    const coveredCodes = new Set((selectedArea ? [selectedArea] : areas).map((area) => area.deptCode));
    districts = districts.filter((district) => coveredCodes.has(district.code));
  }
  districts = districts.map((district) => ({
    ...district, id: `${city.code}-${district.code}`, label: district.name
  }));
  const selectedDistrict = districts.find((district) => district.id === districtId);
  const villages = type === '4' ? (selectedDistrict?.villages ?? []) : [];

  return { areas, selectedArea, districts, selectedDistrict, villages };
}

export function getElectionAreaFilters(city, selection) {
  const options = getElectionAreaOptions(city, selection.officeTypeId, selection.areaId, selection.districtId);
  return {
    areaCode: options.selectedArea?.code,
    // Council constituencies span districts; representatives still require the
    // owning township code, which is carried by their constituency option.
    deptCode: options.selectedArea ? options.selectedArea.deptCode : options.selectedDistrict?.code,
    liCode: options.villages.find((village) => village.code === selection.villageId)?.code
  };
}

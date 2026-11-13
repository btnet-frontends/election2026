const councilTypes = new Set(['1', '2', '3']);
const representativeTypes = new Set(['6', '7', '8']);

// Representative constituency codes repeat in different townships, so their
// select values must include the township code as well as the constituency code.
export function getElectionAreaOptions(city, officeTypeId, areaId = 'all', districtId = 'all') {
  const type = String(officeTypeId);
  const cityDistricts = city?.districts ?? [];
  let areas = [];
  if (councilTypes.has(type)) {
    areas = (city?.councilConstituencies?.[type] ?? []).map((area) => ({
      ...area, id: area.code, label: area.name
    }));
  } else if (representativeTypes.has(type)) {
    areas = cityDistricts.flatMap((district) =>
      (district.representativeConstituencies?.[type] ?? []).map((area) => ({
        ...area,
        id: `${district.code}-${area.code}`,
        label: `${district.name}・${area.name}`,
        deptCode: district.code
      }))
    );
  }

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
    deptCode: options.selectedDistrict?.code ?? options.selectedArea?.deptCode,
    liCode: options.villages.find((village) => village.code === selection.villageId)?.code
  };
}

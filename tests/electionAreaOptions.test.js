import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getElectionCityGroups, getElectionAreaOptions, getElectionAreaFilters } from '../src/utils/electionAreaOptions.js';

const cities = JSON.parse(readFileSync(new URL('../src/json/electionAreas.json', import.meta.url)));
const taipei = cities.find((city) => city.code === '63-000');

test('council constituency restricts districts to the covered administrative areas', () => {
  const options = getElectionAreaOptions(taipei, 1, '01');
  assert.equal(options.areas.length, 6);
  assert.equal(options.selectedArea.label, '第1選舉區（士林區、北投區）');
  assert.deepEqual(options.districts.map((district) => district.name), ['士林區', '北投區']);
  assert.equal(options.villages.length, 0);
  assert.deepEqual(getElectionAreaFilters(taipei, {
    officeTypeId: 1, areaId: '01', districtId: '63-000-110', villageId: '002'
  }), { areaCode: '01', deptCode: undefined, liCode: undefined });
});

test('village chief lists villages only after selecting a district and preserves leading zeroes', () => {
  assert.equal(getElectionAreaOptions(taipei, 4).villages.length, 0);
  const options = getElectionAreaOptions(taipei, 4, 'all', '63-000-010');
  assert.equal(options.areas.length, 0);
  assert.equal(options.villages.find((village) => village.code === '002').name, '莊敬里');
  assert.deepEqual(getElectionAreaFilters(taipei, {
    officeTypeId: 4, areaId: 'all', districtId: '63-000-010', villageId: '002'
  }), { areaCode: undefined, deptCode: '010', liCode: '002' });
});

test('representative constituency IDs distinguish the same constituency code across townships', () => {
  const city = cities.find((item) => item.code === '10-002');
  const options = getElectionAreaOptions(city, 6);
  const firstAreas = options.areas.filter((area) => area.code === '01');
  assert.ok(firstAreas.length > 1);
  assert.equal(new Set(options.areas.map((area) => area.id)).size, options.areas.length);
  const area = firstAreas[0];
  const selected = getElectionAreaOptions(city, 6, area.id);
  assert.deepEqual(selected.districts.map((district) => district.code), [area.deptCode]);
  assert.ok(area.label.includes(selected.districts[0].name));
  assert.equal(area.label, `${area.name}（${selected.districts[0].name}）`);
  assert.deepEqual(getElectionAreaFilters(city, {
    officeTypeId: 6, areaId: area.id, districtId: 'all'
  }), { areaCode: area.code, deptCode: area.deptCode, liCode: undefined });
});

test('stale district and village selections cannot leak into another constituency or city', () => {
  assert.deepEqual(getElectionAreaFilters(taipei, {
    officeTypeId: 1, areaId: '01', districtId: '63-000-010', villageId: '002'
  }), { areaCode: '01', deptCode: undefined, liCode: undefined });
  const otherCity = cities.find((city) => city.code !== taipei.code);
  assert.deepEqual(getElectionAreaFilters(otherCity, {
    officeTypeId: 4, areaId: 'all', districtId: '63-000-010', villageId: '002'
  }), { areaCode: undefined, deptCode: undefined, liCode: undefined });
});

test('all office types keeps city districts and omits constituency and village filters', () => {
  const options = getElectionAreaOptions(taipei, 'all');
  assert.equal(options.areas.length, 0);
  assert.equal(options.districts.length, taipei.districts.length);
  assert.deepEqual(getElectionAreaFilters(taipei, {
    officeTypeId: 'all', areaId: '01', districtId: 'all', villageId: '002'
  }), { areaCode: undefined, deptCode: undefined, liCode: undefined });
});

test('unsupported council and representative types have no selectable districts', () => {
  assert.equal(getElectionAreaOptions(taipei, 6).districts.length, 0);
  assert.deepEqual(getElectionAreaOptions(undefined, 1).areas, []);
});

test('plains indigenous representative areas sort by constituency number before township code', () => {
  const city = cities.find((city) => city.name === '臺東縣');
  const before = JSON.stringify(city);
  const areas = getElectionAreaOptions(city, 7).areas;
  assert.deepEqual(areas.map((area) => Number(area.code)), [2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5]);
  for (let i = 1; i < areas.length; i++) {
    if (areas[i].code === areas[i - 1].code) {
      assert.ok(Number(areas[i - 1].deptCode) <= Number(areas[i].deptCode));
    }
  }
  assert.equal(new Set(areas.map((area) => area.id)).size, areas.length);
  assert.equal(JSON.stringify(city), before);
});

test('city groups follow the workbook regional order, including offshore islands', () => {
  const groups = getElectionCityGroups(cities, 1);
  assert.deepEqual(groups.map((group) => group.label), [
    '北部地區', '中部地區', '南部地區', '東部地區', '離島地區'
  ]);
  assert.deepEqual(groups[0].cities.map((city) => city.label), [
    '臺北市', '新北市', '桃園市', '基隆市', '宜蘭縣', '新竹縣', '新竹市'
  ]);
  assert.deepEqual(groups[4].cities.map((city) => city.label), ['澎湖縣', '金門縣', '連江縣']);
  assert.equal(new Set(groups.flatMap((group) => group.cities.map((city) => city.id))).size, 22);
});

test('office types filter cities using v3 additions and omit empty regional groups', () => {
  const names = (type) => getElectionCityGroups(cities, type).flatMap((group) => group.cities.map((city) => city.label));
  assert.ok(names(2).includes('雲林縣'));
  assert.ok(!names(2).includes('嘉義縣'));
  for (const name of ['基隆市', '新竹市', '彰化縣', '雲林縣']) assert.ok(names(3).includes(name));
  assert.ok(!names(3).includes('嘉義市'));
  assert.deepEqual(names(7), ['苗栗縣', '屏東縣', '花蓮縣', '臺東縣']);
  assert.deepEqual(names('8'), ['新北市', '桃園市', '臺中市', '高雄市']);
  assert.deepEqual(getElectionCityGroups(cities, 7).map((group) => group.label), ['中部地區', '南部地區', '東部地區']);
  assert.equal(names(4).length, 22);
  assert.equal(names(5).length, 17);
  assert.equal(names(6).length, 13);
});

test('township chiefs restrict special municipalities to their indigenous districts', () => {
  for (const [name, expected] of [
    ['新北市', ['烏來區']], ['桃園市', ['復興區']], ['臺中市', ['和平區']],
    ['高雄市', ['茂林區', '桃源區', '那瑪夏區']]
  ]) {
    const city = cities.find((city) => city.name === name);
    assert.deepEqual(getElectionAreaOptions(city, 5).districts.map((district) => district.name), expected);
  }
  const yilan = cities.find((city) => city.name === '宜蘭縣');
  assert.equal(getElectionAreaOptions(yilan, 5).districts.length, yilan.districts.length);
  assert.equal(getElectionAreaOptions(taipei, 5).districts.length, 0);
});

test('filtered districts cannot produce stale query filters', () => {
  const city = cities.find((city) => city.name === '新北市');
  const excluded = city.districts.find((district) => district.name === '板橋區');
  assert.deepEqual(getElectionAreaFilters(city, {
    officeTypeId: 5, areaId: 'all', districtId: `${city.code}-${excluded.code}`, villageId: 'all'
  }), { areaCode: undefined, deptCode: undefined, liCode: undefined });
  const hualien = cities.find((city) => city.name === '花蓮縣');
  assert.ok(!getElectionAreaOptions(hualien, 7).districts.some((district) => district.name === '萬榮鄉'));
  assert.ok(getElectionAreaOptions(hualien, 7).districts.some((district) => district.name === '秀林鄉'));
});

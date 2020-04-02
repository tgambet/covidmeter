
export function getDataSet(
  cases: number,
  deaths: number,
  critical: number,
  recovered: number
): {value: number; color: string}[] {
  return [
    {value: deaths, color: 'black'},
    {value: critical, color: '#ff5722'},
    {value: recovered, color: '#4caf50'},
    {value: cases - deaths - critical - recovered, color: '#9e9e9e'},
  ];
}

export const timelineToData = t => {
  let datas = [];
  for (const key in t.cases) {
    if (t.cases.hasOwnProperty(key)) {
      datas = [
        ...datas,
        {
          date: new Date(key),
          values: [t.deaths[key], t.recovered[key], t.cases[key] - t.deaths[key] - t.recovered[key]]
        }
      ];
    }
  }
  return datas.filter(data => data.values.reduce((total, d) => total + d, 0) > 0);
};

export const reduceTimeline = array => array.reduce((result, r) => {
  for (const date in r.timeline.cases) {
    if (r.timeline.cases.hasOwnProperty(date)) {
      result.cases[date] = r.timeline.cases[date] + (result.cases[date] || 0);
      result.deaths[date] = r.timeline.deaths[date] + (result.deaths[date] || 0);
      result.recovered[date] = r.timeline.recovered[date] + (result.recovered[date] || 0);
    }
  }
  return result;
}, {
  cases: {},
  deaths: {},
  recovered: {}
});

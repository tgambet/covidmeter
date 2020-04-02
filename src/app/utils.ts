
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

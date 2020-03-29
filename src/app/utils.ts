
export function getDataSet(
  cases: number,
  deaths: number,
  critical: number,
  recovered: number,
  normalize: boolean,
  max?: number
): {value: number; color: string}[] {
  const set = [
    {value: deaths, color: 'black'},
    {value: critical, color: '#ff5722'},
    {value: recovered, color: '#4caf50'},
    {value: cases - deaths - critical - recovered, color: '#9e9e9e'},
  ];
  return !normalize ? [...set,
    {value: max - cases, color: 'transparent'}
  ] : set;
}

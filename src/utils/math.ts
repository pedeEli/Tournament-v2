export const random = (min: number, max?: number): number => {
  if (max === undefined)
    return random(0, min)
  return Math.random() * (max - min) + min
}


export const log2 = (n: number) => {
  let target = 0
  while (n >>= 1)
    ++target
  return target
}
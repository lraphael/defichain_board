const DEFAULT_COLORS = [
  'rgba(0, 128, 0)',
  'rgba(255, 0, 0)',
  'rgba(255, 165, 0)',
  'rgba(170, 121, 66)',
  'rgba(0, 0, 255)',
  'rgba(255, 255, 0)',
  'rgba(192, 192, 192)',
  'rgba(128, 0, 0)',
  'rgba(128, 128, 0)',
  'rgba(0, 255, 0)',
  'rgba(0, 255, 255)',
  'rgba(0, 128, 128)',
  'rgba(0, 0, 128)',
  'rgba(255, 0, 255)',
  'rgba(128, 0, 128)',
  'rgba(255, 160, 122)',
  'rgba(178, 34, 34)',
  'rgba(240, 230, 140)',
  'rgba(85, 107, 47)',
  'rgba(175, 238, 238)',
  'rgba(238, 130, 238)',
  'rgba(75, 0, 130)',
  'rgba(139, 69, 19)'
]

export function getColor () {
  let currentIndex = 0
  const colors = DEFAULT_COLORS

  return {
    next: function () {
      if (currentIndex >= colors.length) {
        currentIndex = 0
      }
      const iteration = {
        value: colors[currentIndex]
      }
      currentIndex++
      return iteration
    }
  }
}

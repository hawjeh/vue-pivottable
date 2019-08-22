import { PivotData } from './helper/utils'
import defaultProps from './helper/defaultProps'

function redColorScaleGenerator (values) {
  const min = Math.min.apply(Math, values)
  const max = Math.max.apply(Math, values)
  return x => {
    // eslint-disable-next-line no-magic-numbers
    const nonRed = 255 - Math.round(255 * (x - min) / (max - min))
    return { backgroundColor: `rgb(255,${nonRed},${nonRed})` }
  }
}

export default {
  name: 'table-renderers',
  mixins: [defaultProps],
  props: {
    heatmapMode: String,
    tableColorScaleGenerator: {
      type: Function,
      default: redColorScaleGenerator
    },
    tableOptions: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  methods: {
    spanSize (arr, i, j) {
      // helper function for setting row/col-span in pivotTableRenderer
      let x
      if (i !== 0) {
        let asc, end
        let noDraw = true
        for (
          x = 0, end = j, asc = end >= 0;
          asc ? x <= end : x >= end;
          asc ? x++ : x--
        ) {
          if (arr[i - 1][x] !== arr[i][x]) {
            noDraw = false
          }
        }
        if (noDraw) {
          return -1
        }
      }
      let len = 0
      while (i + len < arr.length) {
        let asc1, end1
        let stop = false
        for (
          x = 0, end1 = j, asc1 = end1 >= 0;
          asc1 ? x <= end1 : x >= end1;
          asc1 ? x++ : x--
        ) {
          if (arr[i][x] !== arr[i + len][x]) {
            stop = true
          }
        }
        if (stop) {
          break
        }
        len++
      }
      return len
    }
  },
  render (h) {
    const pivotData = new PivotData(this.$props)
    const colAttrs = pivotData.props.cols
    const rowAttrs = pivotData.props.rows
    const rowKeys = pivotData.getRowKeys()
    const colKeys = pivotData.getColKeys()
    const grandTotalAggregator = pivotData.getAggregator([], [])

    // eslint-disable-next-line no-unused-vars
    let valueCellColors = () => { }
    // eslint-disable-next-line no-unused-vars
    let rowTotalColors = () => { }
    // eslint-disable-next-line no-unused-vars
    let colTotalColors = () => { }
    if (this.heatmapMode) {
      const colorScaleGenerator = this.tableColorScaleGenerator
      const rowTotalValues = colKeys.map(x =>
        pivotData.getAggregator([], x).value()
      )
      rowTotalColors = colorScaleGenerator(rowTotalValues)
      const colTotalValues = rowKeys.map(x =>
        pivotData.getAggregator(x, []).value()
      )
      colTotalColors = colorScaleGenerator(colTotalValues)

      if (this.heatmapMode === 'full') {
        const allValues = []
        rowKeys.map(r =>
          colKeys.map(c =>
            allValues.push(pivotData.getAggregator(r, c).value())
          )
        )
        const colorScale = colorScaleGenerator(allValues)
        valueCellColors = (r, c, v) => colorScale(v)
      } else if (this.heatmapMode === 'row') {
        const rowColorScales = {}
        rowKeys.map(r => {
          const rowValues = colKeys.map(x =>
            pivotData.getAggregator(r, x).value()
          )
          rowColorScales[r] = colorScaleGenerator(rowValues)
        })
        valueCellColors = (r, c, v) => rowColorScales[r](v)
      } else if (this.heatmapMode === 'col') {
        const colColorScales = {}
        colKeys.map(c => {
          const colValues = rowKeys.map(x =>
            pivotData.getAggregator(x, c).value()
          )
          colColorScales[c] = colorScaleGenerator(colValues)
        })
        valueCellColors = (r, c, v) => colColorScales[c](v)
      }
    }
    const getClickHandler =
      this.tableOptions && this.tableOptions.clickCallback
        ? (value, rowValues, colValues) => {
          const filters = {}
          for (const i of Object.keys(colAttrs || {})) {
            const attr = colAttrs[i]
            if (colValues[i] !== null) {
              filters[attr] = colValues[i]
            }
          }
          for (const i of Object.keys(rowAttrs || {})) {
            const attr = rowAttrs[i]
            if (rowValues[i] !== null) {
              filters[attr] = rowValues[i]
            }
          }
          return e =>
            this.tableOptions.clickCallback(
              e,
              value,
              filters,
              pivotData
            )
        }
        : null
    return h('table', {
      staticClass: ['pvtTable']
    }, [
      h('thead',
        [
          ...colAttrs.map((c, j) => {
            return h('tr', {
              attrs: {
                key: `colAttrs${j}`
              }
            },
            [
              j === 0 && rowAttrs.length !== 0 ? h('th', {
                attrs: {
                  colSpan: rowAttrs.length,
                  rowSpan: colAttrs.length
                }
              }) : undefined,

              h('th', {
                staticClass: ['pvtAxisLabel']
              }, c),

              ...colKeys.map((colKey, i) => {
                const x = this.spanSize(colKeys, i, j)
                if (x === -1) {
                  return null
                }
                return h('th', {
                  staticClass: ['pvtColLabel'],
                  attrs: {
                    key: `colKey${i}`,
                    colSpan: x,
                    rowSpan: j === colAttrs.length - 1 && rowAttrs.length !== 0 ? 2 : 1
                  }
                }, colKey[j])
              }),

              j === 0 ? h('th', {
                staticClass: ['pvtTotalLabel'],
                attrs: {
                  rowSpan: colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                }
              }, 'Totals') : undefined
            ])
          }),

          rowAttrs.length !== 0 ? h('tr',
            [
              ...rowAttrs.map((r, i) => {
                return h('th', {
                  staticClass: ['pvtAxisLabel'],
                  attrs: {
                    key: `rowAttr${i}`
                  }
                }, r)
              }),

              h('th', {
                staticClass: ['pvtTotalLabel']
              }, colAttrs.length === 0 ? 'Totals' : null)
            ]
          ) : undefined

        ]
      ),

      h('tbody',
        [
          ...rowKeys.map((rowKey, i) => {
            const totalAggregator = pivotData.getAggregator(rowKey, [])
            return h('tr', {
              attrs: {
                key: `rowKeyRow${i}`
              }
            },
            [
              ...rowKey.map((txt, j) => {
                const x = this.spanSize(rowKeys, i, j)
                if (x === -1) {
                  return null
                }
                return h('th', {
                  staticClass: ['pvtRowLabel'],
                  attrs: {
                    key: `rowKeyLabel${i}-${j}`,
                    rowSpan: x,
                    colSpan: j === rowAttrs.length - 1 && colAttrs.length !== 0 ? 2 : 1
                  }
                }, txt)
              }),

              ...colKeys.map((colKey, j) => {
                const aggregator = pivotData.getAggregator(rowKey, colKey)
                return h('td', {
                  staticClass: ['pvVal'],
                  style: valueCellColors(rowKey, colKey, aggregator.value()),
                  attrs: {
                    key: `pvtVal${i}-${j}`
                  },
                  on: getClickHandler ? {
                    click: getClickHandler(aggregator.value(), rowKey, colKey)
                  } : {}
                }, aggregator.format(aggregator.value()))
              }),

              h('td', {
                staticClass: ['pvtTotal'],
                style: colTotalColors(totalAggregator.value()),
                on: getClickHandler ? {
                  click: getClickHandler(totalAggregator.value(), rowKey, [null])
                } : {}
              }, totalAggregator.format(totalAggregator.value()))
            ])
          }),

          h('tr',
            [
              h('th', {
                staticClass: ['pvtTotalLabel'],
                attrs: {
                  colSpan: rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)
                }
              }, 'Totals'),

              ...colKeys.map((colKey, i) => {
                const totalAggregator = pivotData.getAggregator([], colKey)
                return h('td', {
                  staticClass: ['pvtTotal'],
                  style: rowTotalColors(totalAggregator.value()),
                  attrs: {
                    key: `total${i}`
                  },
                  on: getClickHandler ? {
                    click: getClickHandler(totalAggregator.value(), [null], colKey)
                  } : {}
                }, totalAggregator.format(totalAggregator.value()))
              }),

              h('td', {
                staticClass: ['pvtGrandTotal'],
                on: getClickHandler ? {
                  click: getClickHandler(grandTotalAggregator.value(), [null], [null])
                } : {}
              }, grandTotalAggregator.format(grandTotalAggregator.value()))
            ]
          )
        ])

    ])
  }
}
